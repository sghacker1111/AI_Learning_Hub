import asyncio
import os
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineWorker, PipelineParams
from pipecat.workers.runner import WorkerRunner
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair, LLMUserAggregatorParams
from pipecat.turns.user_turn_strategies import UserTurnStrategies
from pipecat.turns.user_stop.speech_timeout_user_turn_stop_strategy import SpeechTimeoutUserTurnStopStrategy
from pipecat.services.groq.stt import GroqSTTService
from pipecat.services.openai.tts import OpenAITTSService
from pipecat.transcriptions.language import Language
from pipecat.transports.livekit.transport import LiveKitTransport, LiveKitParams
from contracts import VoiceSession
from bridge import TeacherBridge


def speech_recognition(config: VoiceSession):
    language = Language.NE if config.language == "ne" else Language.EN
    if config.stt_provider == "whisper":
        from pipecat.services.whisper.stt import WhisperSTTService
        return WhisperSTTService(model=os.environ.get("STT_MODEL", "small"), device="cpu", compute_type="int8", language=language)
    return GroqSTTService(api_key=os.environ["GROQ_API_KEY"], settings=GroqSTTService.Settings(model=os.environ.get("STT_MODEL", "whisper-large-v3-turbo"), language=language))


async def run_voice_session(config: VoiceSession):
    transport = LiveKitTransport(url=os.environ["LIVEKIT_URL"], token=config.room_token.get_secret_value(), room_name=config.room, params=LiveKitParams(audio_in_enabled=True, audio_out_enabled=config.tts_provider != "browser"))
    bridge = TeacherBridge(config, transport)
    user, assistant = LLMContextAggregatorPair(LLMContext(), user_params=LLMUserAggregatorParams(
        vad_analyzer=SileroVADAnalyzer(params=VADParams(start_secs=0.15, stop_secs=config.silence_seconds)),
        user_turn_strategies=UserTurnStrategies(stop=[SpeechTimeoutUserTurnStopStrategy()]),
    ))
    processors = [transport.input(), speech_recognition(config), user, bridge]
    if config.tts_provider == "openai":
        processors.append(OpenAITTSService(api_key=os.environ["TTS_API_KEY"], base_url=os.environ["TTS_BASE_URL"], settings=OpenAITTSService.Settings(model=os.environ["TTS_MODEL"], voice=config.voice, speed=config.speed)))
    processors.extend([transport.output(), assistant])
    worker = PipelineWorker(Pipeline(processors), params=PipelineParams(enable_metrics=True, enable_usage_metrics=False), idle_timeout_secs=120)
    runner = WorkerRunner(handle_sigint=False, handle_sigterm=False)
    await runner.add_workers(worker)

    @transport.event_handler("on_first_participant_joined")
    async def on_joined(_transport, participant_id):
        if participant_id == config.participant:
            await bridge.send_event({"type": "state", "state": "listening"})
            bridge.response_task = bridge.create_task(bridge.respond("Greet me briefly and continue the selected lesson. Ask one check question.", "START"))

    @transport.event_handler("on_participant_left")
    async def on_left(_transport, participant_id, _reason):
        if participant_id == config.participant:
            await worker.cancel(reason="Student disconnected")

    try:
        await asyncio.wait_for(runner.run(), timeout=config.duration_seconds)
    finally:
        await runner.cancel(reason="Voice session ended")
        await bridge.http.aclose()
