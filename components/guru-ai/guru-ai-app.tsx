"use client";
import * as React from "react";
import { BookOpen, Check, Mic, Pause, Play, RotateCcw, Send, Square, Radio } from "lucide-react";
import { GURU_SUBJECTS, getGuruChapter } from "@/lib/guru-ai/catalog";
import { TEACHING_ACTIONS, type LessonSelection } from "@/lib/guru-ai/classroom";
import { MixedMathText } from "@/components/ui/mixed-math-text";
import { TutorResponseActions } from "@/components/ai/tutor-response-actions";
import { LiveTeacherAvatar } from "./live-teacher-avatar";
import { LessonSetup } from "./lesson-setup";
import { TeacherWhiteboard } from "./teacher-whiteboard";
import { useGuruLesson } from "./use-guru-lesson";
import { useLiveVoice } from "./use-live-voice";

export function GuruAIApp({ initialSelection }: { initialSelection?: LessonSelection }) {
  const [selection, setSelection] = React.useState<LessonSelection>(initialSelection || { grade: "Class 8", subject: "math", chapterId: "factorization", topic: "", persona: "ram_sir", language: "en" });
  const lesson = useGuruLesson(selection);
  const { audio: liveAudioRef, ...live } = useLiveVoice(lesson.started ? lesson.sessionId : null, lesson.acceptVoiceEvent);
  const end = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [lesson.messages.length]);
  const chapter = getGuruChapter(selection.grade, selection.subject, selection.chapterId);
  const teacherName = selection.persona === "ram_sir" ? "Ram Sir AI" : "Sita Ma’am AI";
  const state = live.connected ? live.state : lesson.teacherState;
  const teacherStatus = lesson.paused ? "Lesson paused" : ({ idle: "Ready for your question", thinking: "Thinking…", speaking: "Speaking…", writing: "Writing on the board…", listening: "Listening to you…" })[state];
  const disabled = lesson.busy || lesson.paused || live.connected || live.connecting;
  async function finish(complete: boolean) { await live.disconnect(); await lesson.finish(complete); }
  async function pause() { await live.disconnect(); if (lesson.paused) lesson.setPaused(false); else lesson.pause(); }
  if (!lesson.started) return <><LessonSetup value={selection} onChange={setSelection} onStart={lesson.start} canContinue={lesson.canContinue} />{lesson.busy && <p role="status" className="mt-4 text-sm">Opening your lesson…</p>}{lesson.persistence && <p role="status" className="mt-4 text-sm text-muted-foreground">{lesson.persistence}</p>}</>;
  return <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-semibold text-indigo-600">{selection.grade} · {GURU_SUBJECTS[selection.subject].name}</p><h1 className="mt-1 text-2xl font-extrabold">{chapter.title}</h1><p className="mt-1 text-sm text-muted-foreground">{selection.topic || "Whole chapter"} · {teacherName}</p></div>
      <button onClick={() => void finish(false)} className="rounded-xl border bg-background px-4 py-2 text-sm font-semibold">Change lesson</button>
    </div>
    <div className="grid items-start gap-4 xl:grid-cols-[190px_minmax(0,1fr)_220px]">
      <aside className="space-y-4 rounded-2xl border bg-background p-4 xl:sticky xl:top-24">
        <div className="flex justify-center overflow-hidden"><LiveTeacherAvatar subject={selection.persona === "ram_sir" ? "math" : "science"} state={state} /></div>
        <h2 className="text-center font-bold">{teacherName}</h2><p role="status" className="text-center text-sm text-indigo-600">{teacherStatus}</p>
        <div className="flex items-center justify-between border-t pt-4 text-sm"><span>Lesson time</span><span className="font-mono">{Math.floor(lesson.elapsed / 60)}:{String(lesson.elapsed % 60).padStart(2, "0")}</span></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={live.connected} checked={lesson.autoSpeak} onChange={(event) => { lesson.setAutoSpeak(event.target.checked); if (!event.target.checked) lesson.stopSpeaking(); }} />Browser teacher voice</label>
        <label className="block text-sm">Speech speed<select value={lesson.speechSpeed} onChange={(event) => lesson.setSpeechSpeed(Number(event.target.value))} className="mt-2 w-full rounded-lg border bg-background p-2"><option value={0.72}>Slower</option><option value={0.92}>Normal</option><option value={1.1}>Faster</option></select></label>
        <button disabled={!lesson.sessionId || lesson.paused || lesson.busy || live.connecting} onClick={() => { if (live.connected) void live.disconnect(); else { lesson.cancel(); lesson.setAutoSpeak(false); void live.connect(selection.language); } }} className="flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold disabled:opacity-40"><Radio className="h-4 w-4" />{live.connected ? "Disconnect live voice" : live.connecting ? "Connecting…" : "Connect live voice"}</button>
        <p className="text-xs leading-5 text-muted-foreground">{lesson.sessionId ? "Live voice needs the configured LiveKit and speech service. Text is always available." : "Live voice requires a saved school lesson. Browser microphone works in demo lessons."}</p>
        {live.notice && <p role="status" className="text-xs leading-5 text-indigo-600">{live.notice}</p>}
        {live.needsAudio && <button onClick={() => void live.enableAudio()} className="rounded-lg border p-2 text-sm">Enable teacher audio</button>}
        <div ref={liveAudioRef} />
      </aside>
      <section className="min-w-0 overflow-hidden rounded-2xl border bg-background">
        <div className="flex items-center justify-between gap-2 border-b px-5 py-4"><h2 className="flex items-center gap-2 font-bold"><BookOpen className="h-5 w-5 text-indigo-600" />Lesson whiteboard</h2><span className="text-xs text-muted-foreground">Live text + mathematics</span></div>
        <div role="log" aria-label="Lesson conversation" className="max-h-[620px] min-h-[300px] space-y-5 overflow-y-auto p-4 sm:p-5">
          {lesson.messages.map((message) => <article key={message.id} className={message.role === "user" ? "ml-4 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950" : "rounded-2xl border p-4"}>
            <p className="mb-2 text-xs font-bold text-muted-foreground">{message.role === "user" ? "You" : teacherName}</p>
            {message.role === "assistant" && !message.writing && !message.error && !message.interrupted ? <TeacherWhiteboard events={message.whiteboard} fallback={message.content} /> : <MixedMathText content={message.content} className={message.error ? "leading-7 text-destructive" : "break-words leading-7"} />}
            {message.writing && <span className="inline-block h-4 w-1 animate-pulse bg-indigo-600" />}
            {message.interrupted && <p className="mt-2 text-xs text-amber-700">Interrupted · not assessed</p>}
            {!!message.citations?.length && <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Curriculum sources</summary>{message.citations.map((source, index) => <p key={index} className="mt-2">{source.grade} · {source.chapter}{source.page ? " · p. " + source.page : ""}</p>)}</details>}
          </article>)}
          {lesson.busy && <p className="animate-pulse text-sm text-muted-foreground">Your teacher is preparing the next step…</p>}<div ref={end} />
        </div>
        {lesson.latestAnswer && !disabled && <div className="border-t p-4"><TutorResponseActions answer={lesson.latestAnswer.content} question={[...lesson.messages].reverse().find((item) => item.role === "user")?.content} grade={selection.grade} subject={GURU_SUBJECTS[selection.subject].curriculumName} topic={chapter.title} onFollowUp={(text) => void lesson.send(text)} /></div>}
        <div className="border-t bg-muted/20 p-4">
          <div className="mb-3 flex flex-wrap gap-2">{TEACHING_ACTIONS.map((action) => <button key={action.label} disabled={disabled} onClick={() => void lesson.send(action.prompt, undefined, /MCQ|Practice/.test(action.label) ? "PRACTICE" : "EXPLAIN")} className="rounded-lg border bg-background px-3 py-2 text-xs font-semibold hover:border-indigo-400 disabled:opacity-40">{action.label}</button>)}</div>
          {(lesson.interimTranscript || live.interim) && <p className="mb-3 text-sm text-indigo-600">You are saying: {live.interim || lesson.interimTranscript}</p>}
          {lesson.voiceError && <p role="alert" className="mb-3 text-sm text-amber-700">{lesson.voiceError} You can continue typing.</p>}
          {live.connected && <p className="mb-3 text-sm text-muted-foreground">Live microphone is on. Disconnect live voice to type or use a lesson shortcut.</p>}
          <form onSubmit={(event) => { event.preventDefault(); void lesson.send(); }} className="flex items-end gap-2">
            <label className="flex-1"><span className="sr-only">Your question or answer</span><textarea value={lesson.input} maxLength={4000} rows={2} onChange={(event) => lesson.setInput(event.target.value)} placeholder={lesson.paused ? "Resume the lesson to continue." : "Ask a question or type your answer…"} disabled={lesson.paused || live.connected} className="w-full resize-y rounded-xl border bg-background p-3 text-sm" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!disabled) void lesson.send(); } }} /></label>
            <button type="submit" aria-label="Send question" disabled={disabled || !lesson.input.trim()} className="mb-1 rounded-xl bg-indigo-600 p-3 text-white disabled:opacity-40"><Send className="h-5 w-5" /></button>
          </form>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border bg-background p-4"><h2 className="font-bold">Lesson details</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-muted-foreground">Objective</dt><dd className="mt-1">Explain and apply {selection.topic || chapter.title}.</dd></div><div><dt className="text-muted-foreground">Questions explored</dt><dd className="mt-1 font-semibold">{lesson.messages.filter((item) => item.role === "user").length}</dd></div><div><dt className="text-muted-foreground">Understanding</dt><dd className="mt-1">{lesson.masteryLabel}</dd></div></dl></div>
        <div className="space-y-4 rounded-2xl border bg-background p-4"><label className="block text-sm font-semibold">Language<select aria-label="Lesson language" value={selection.language} onChange={(event) => { void live.disconnect(); lesson.cancel(); setSelection({ ...selection, language: event.target.value as LessonSelection["language"] }); }} className="mt-2 h-11 w-full rounded-xl border bg-background px-3"><option value="en">English</option><option value="ne">नेपाली</option><option value="bilingual">Both languages</option></select></label><label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={lesson.curriculumOnly} onChange={(event) => { void live.disconnect(); lesson.cancel(); lesson.setCurriculumOnly(event.target.checked); }} />Approved content only</label><p className="text-xs leading-5 text-muted-foreground">Only approved-content answers can contribute to an AI mastery estimate. General explanations are not assessed.</p></div>
        <p role="status" className="px-1 text-xs leading-5 text-muted-foreground">{lesson.persistence}</p>
      </aside>
    </div>
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-3">
      <button onClick={() => void lesson.microphone()} disabled={lesson.paused || live.connected || live.connecting} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"><Mic className="h-4 w-4" />{state === "listening" ? "Stop listening" : state === "speaking" || lesson.busy ? "Interrupt & ask" : "Browser microphone"}</button>
      <button onClick={() => void pause()} className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm">{lesson.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}{lesson.paused ? "Resume" : "Pause"}</button>
      <button onClick={lesson.repeat} disabled={!lesson.latestAnswer || disabled} className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm disabled:opacity-40"><RotateCcw className="h-4 w-4" />Repeat</button>
      <button onClick={() => void lesson.send("Give me a small hint without revealing the answer.", undefined, "HINT")} disabled={disabled} className="rounded-xl border px-3 py-3 text-sm disabled:opacity-40">Hint</button>
      <button onClick={() => void lesson.send("Explain this more simply with one easy example.", undefined, "EXPLAIN")} disabled={disabled} className="rounded-xl border px-3 py-3 text-sm disabled:opacity-40">Explain simpler</button>
      <button onClick={() => void finish(true)} disabled={!lesson.latestAnswer || lesson.busy} className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm disabled:opacity-40"><Check className="h-4 w-4" />{lesson.sessionId ? "Complete objective" : "Mark studied"}</button>
      <button onClick={() => void finish(false)} className="ml-auto flex items-center gap-2 rounded-xl border px-3 py-3 text-sm"><Square className="h-4 w-4" />Save & leave</button>
    </div>
  </div>;
}
