"use client";
import * as React from "react";
import type { Room } from "livekit-client";
export function useLiveVoice(lessonId: string | null, onEvent: (event: Record<string, unknown>) => void) {
  const room = React.useRef<Room | null>(null), eventRef = React.useRef(onEvent), audio = React.useRef<HTMLDivElement | null>(null);
  const [connected, setConnected] = React.useState(false), [connecting, setConnecting] = React.useState(false), [notice, setNotice] = React.useState("");
  const [state, setState] = React.useState<"idle" | "listening" | "thinking" | "speaking" | "writing">("idle");
  const [needsAudio, setNeedsAudio] = React.useState(false), [interim, setInterim] = React.useState("");
  const generation = React.useRef(0);
  React.useEffect(() => { eventRef.current = onEvent; }, [onEvent]);
  const disconnect = React.useCallback(async () => {
    generation.current++;
    const current = room.current; room.current = null;
    if (current) await current.disconnect(true);
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    audio.current?.replaceChildren(); setConnected(false); setConnecting(false); setState("idle"); setInterim("");
    if (lessonId && current) await fetch(`/api/voice/livekit-token?lessonId=${lessonId}`, { method: "DELETE" }).catch(() => {});
  }, [lessonId]);
  React.useEffect(() => () => { void disconnect(); }, [disconnect]);
  async function connect(language: string) {
    if (!lessonId || room.current || connecting) return;
    const version = ++generation.current; setConnecting(true); setNotice("");
    try {
      const response = await fetch("/api/voice/livekit-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, language }) }), data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (generation.current !== version) return;
      const { Room, RoomEvent, Track } = await import("livekit-client");
      if (generation.current !== version) return;
      const current = new Room({ adaptiveStream: true, dynacast: true });
      room.current = current;
      const fragments = new Map<string, { parts: string[]; total: number; at: number }>();
      function receive(event: Record<string, unknown>) {
        if (generation.current !== version || room.current !== current) return;
        if (event.type === "fragment") {
          const id = String(event.id), total = Number(event.total), index = Number(event.index);
          if (!Number.isInteger(total) || total < 1 || total > 32 || !Number.isInteger(index) || index < 0 || index >= total || typeof event.data !== "string" || event.data.length > 3000) return;
          for (const [key, item] of fragments) if (Date.now() - item.at > 10000) fragments.delete(key);
          if (fragments.size > 8) fragments.clear();
          const packet = fragments.get(id) || { parts: [], total, at: Date.now() }; packet.parts[index] = event.data; fragments.set(id, packet);
          if (packet.total === total && Array.from({ length: total }, (_, n) => packet.parts[n]).every((part) => typeof part === "string")) { fragments.delete(id); receive(JSON.parse(packet.parts.join(""))); }
          return;
        }
        if (event.type === "interim") setInterim(String(event.text || ""));
        if (event.type === "transcript") setInterim("");
        if (event.type === "state" && ["listening", "thinking", "speaking", "writing"].includes(String(event.state))) setState(event.state as "listening");
        if (event.type === "text") setState("writing");
        if (event.type === "interrupted") { window.speechSynthesis?.cancel(); setState("listening"); }
        if (event.type === "error") { setNotice(String(event.error)); setState("idle"); }
        if (event.type === "speak" && data.browserTts && typeof event.text === "string") {
          if (!("speechSynthesis" in window)) { setNotice("Browser speech is unavailable. Text remains available."); return; }
          const utterance = new SpeechSynthesisUtterance(event.text); utterance.lang = event.language === "ne" ? "ne-NP" : "en-US"; utterance.rate = Number(event.speed) || 0.92;
          utterance.onstart = () => { if (generation.current === version) setState("speaking"); }; utterance.onend = () => { if (generation.current === version && !speechSynthesis.pending) setState("listening"); }; utterance.onerror = () => { if (generation.current === version) setNotice("Speech playback stopped. Continue with text or reconnect voice."); };
          speechSynthesis.speak(utterance);
        }
        eventRef.current(event);
      }
      current.on(RoomEvent.DataReceived, (bytes, participant) => { if (participant?.identity !== data.agentIdentity || bytes.length > 16000) return; try { receive(JSON.parse(new TextDecoder().decode(bytes))); } catch { /* Invalid packets cannot affect lesson state. */ } });
      current.on(RoomEvent.TrackSubscribed, (track) => { if (track.kind === Track.Kind.Audio) { const element = track.attach(); element.autoplay = true; audio.current?.append(element); } });
      current.on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((element) => element.remove()));
      current.on(RoomEvent.ActiveSpeakersChanged, (speakers) => { if (!data.browserTts) setState(speakers.some((speaker) => speaker.identity === data.agentIdentity) ? "speaking" : "listening"); });
      current.on(RoomEvent.AudioPlaybackStatusChanged, () => setNeedsAudio(!current.canPlaybackAudio));
      current.on(RoomEvent.Reconnecting, () => setNotice("Voice connection interrupted. Reconnecting…"));
      current.on(RoomEvent.Reconnected, () => setNotice("Voice reconnected."));
      current.on(RoomEvent.Disconnected, () => { if (room.current === current) { room.current = null; setConnected(false); setState("idle"); window.speechSynthesis?.cancel(); setNotice("Voice disconnected. Text mode is available; reconnect when ready."); } });
      await current.connect(data.url, data.token);
      if (generation.current !== version) { await current.disconnect(); return; }
      await current.localParticipant.setMicrophoneEnabled(true, { echoCancellation: true, noiseSuppression: true, autoGainControl: true });
      if (generation.current !== version || room.current !== current) { await current.disconnect(); return; }
      setConnected(true); setState("listening"); setNotice(data.browserTts ? "Live microphone · browser teacher voice. Speak to interrupt. Audio is not recorded." : "Live voice connected. Speak to interrupt. Audio is not recorded.");
    } catch (error) { if (generation.current === version) { const message = error instanceof Error ? error.message : "Microphone unavailable. Continue with text."; await disconnect(); setNotice(message); } }
    finally { if (generation.current === version) setConnecting(false); }
  }
  return { connect, disconnect, connected, connecting, notice, state, interim, audio, needsAudio, enableAudio: () => room.current?.startAudio() };
}
