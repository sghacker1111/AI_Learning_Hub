"use client";
import * as React from "react";
import { getGuruChapter, GURU_SUBJECTS } from "@/lib/guru-ai/catalog";
import { getCDCGradeCatalog } from "@/lib/constants/cdc-compulsory-catalog";
import { boundedTutorHistory, type LessonSelection } from "@/lib/guru-ai/classroom";
import type { TutorChatResponse } from "@/lib/ai/tutor/types";
import { useLearning } from "@/components/learning/learning-provider";
import { useTwoWayBrowserVoice } from "@/lib/voice/two-way-browser-voice";
import { readLessonStream } from "@/lib/lessons/stream-protocol";
import { masteryBand } from "@/lib/lessons/contracts";
export interface ClassroomMessage { id: string; role: "user" | "assistant"; content: string; error?: boolean; writing?: boolean; interrupted?: boolean; whiteboard?: TutorChatResponse["message"]["whiteboard"]; citations?: TutorChatResponse["message"]["citations"] }
type SavedLesson = { id: string; grade: string; subjectKey: string; chapterId: string; topic: string; status: string; masteryAfter: number };
type SavedTurn = { id: string; input: string; answer: string; status: string; whiteboard?: ClassroomMessage["whiteboard"]; sources?: ClassroomMessage["citations"] };

export function useGuruLesson(selection: LessonSelection) {
  const { record, events } = useLearning();
  const [messages, setMessages] = React.useState<ClassroomMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(true);
  const [speechSpeed, setSpeechSpeed] = React.useState(0.92);
  const [curriculumOnly, setCurriculumOnly] = React.useState(true);
  const [elapsed, setElapsed] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const [savedLessons, setSavedLessons] = React.useState<SavedLesson[]>([]);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [persistence, setPersistence] = React.useState("");
  const [mastery, setMastery] = React.useState<number | null>(null);
  const request = React.useRef<AbortController | null>(null), inFlight = React.useRef(false), timer = React.useRef(0), session = React.useRef<string | null>(null);
  const { teacherState, setTeacherState, interimTranscript, error: voiceError, startListening, stopListening, speak, stopSpeaking } = useTwoWayBrowserVoice();
  const chapter = getGuruChapter(selection.grade, selection.subject, selection.chapterId);
  const curriculumSubject = getCDCGradeCatalog(selection.grade).subjects.find((item) => item.key === selection.subject)?.name || GURU_SUBJECTS[selection.subject].curriculumName;
  const context = { grade: selection.grade, subject: selection.subject, chapterId: selection.chapterId, chapter: chapter.title, topic: selection.topic };
  const previous = events.filter((item) => item.kind === "QUESTION" && item.grade === selection.grade && item.subject === selection.subject && item.chapterId === selection.chapterId && item.topic === selection.topic);
  const resumable = savedLessons.find((item) => item.grade === selection.grade && item.subjectKey === selection.subject && item.chapterId === selection.chapterId && item.topic === selection.topic && ["ACTIVE", "PAUSED"].includes(item.status));
  const latestAnswer = [...messages].reverse().find((message) => message.role === "assistant" && !message.error && !message.writing && !message.interrupted);
  React.useEffect(() => { let active = true; fetch("/api/lessons").then((response) => response.json()).then((data) => { if (active) setSavedLessons(data.lessons || []); }).catch(() => {}); return () => { active = false; }; }, []);
  const cancel = React.useCallback(() => {
    request.current?.abort(); request.current = null; inFlight.current = false;
    setBusy(false); stopSpeaking(); stopListening();
    setMessages((items) => items.map((item) => item.writing ? { ...item, content: item.content || "Response interrupted.", writing: false, interrupted: true } : item));
  }, [stopSpeaking, stopListening]);
  React.useEffect(() => () => { request.current?.abort(); }, []);
  React.useEffect(() => { if (!started || paused) return; const interval = window.setInterval(() => { timer.current++; setElapsed((value) => value + 1); }, 1000); return () => window.clearInterval(interval); }, [started, paused]);
  async function control(action: string) {
    if (!session.current) return true;
    try {
      const response = await fetch(`/api/lessons/${session.current}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      return true;
    } catch (error) { setPersistence(error instanceof Error ? error.message : "Lesson state could not be saved."); return false; }
  }
  async function send(text: string = input, historyOverride?: ClassroomMessage[], kind: "MESSAGE" | "START" | "HINT" | "EXPLAIN" | "PRACTICE" = "MESSAGE") {
    text = text.trim(); if (!text || inFlight.current || paused || text.length > 4000) return;
    const controller = new AbortController(); request.current = controller; inFlight.current = true;
    const historyMessages = historyOverride || messages, id = crypto.randomUUID();
    setMessages([...historyMessages, { id: crypto.randomUUID(), role: "user", content: text }, { id, role: "assistant", content: "", writing: true }]);
    setInput(""); setBusy(true); stopSpeaking(); setTeacherState("thinking");
    try {
      const saved = session.current;
      const response = await fetch(saved ? `/api/lessons/${saved}/messages` : "/api/tutor/chat", { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(saved ? { requestId: crypto.randomUUID(), message: text, kind, language: selection.language, curriculumOnly } : { stream: true, message: text, grade: selection.grade, subject: curriculumSubject, chapter: chapter.title, language: selection.language, persona: selection.persona, tutorMode: "teach_me", curriculumOnly, history: boundedTutorHistory(historyMessages.filter((item) => !item.error && !item.writing && !item.interrupted)) }) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Your teacher could not answer."); }
      let answer = "";
      await readLessonStream(response, (event) => {
        if (controller.signal.aborted) return;
        if (event.type === "text") { answer = String(event.text); setTeacherState("writing"); setMessages((items) => items.map((item) => item.id === id ? { ...item, content: answer } : item)); }
        if (event.type === "done") {
          const turn = event.turn as SavedTurn | undefined, result = event.response as TutorChatResponse | undefined;
          answer = turn?.answer || result?.message.content || answer;
          setMessages((items) => items.map((item) => item.id === id ? { ...item, content: answer, writing: false, whiteboard: turn?.whiteboard || result?.message.whiteboard, citations: turn?.sources || result?.message.citations } : item));
          if (typeof event.mastery === "number") setMastery(event.mastery);
        }
      });
      if (controller.signal.aborted) return;
      record({ ...context, kind: "QUESTION", question: text, answer, durationSeconds: timer.current }); timer.current = 0;
      if (saved) setPersistence("Conversation saved to your school account.");
      if (autoSpeak) speak(answer, selection.language, undefined, speechSpeed); else setTeacherState("idle");
    } catch (error) {
      if (!controller.signal.aborted) { setMessages((items) => items.map((item) => item.id === id ? { ...item, writing: false, error: true, content: error instanceof Error ? error.message : "AI connection failed. Please retry." } : item)); setTeacherState("idle"); }
    } finally { if (request.current === controller) { request.current = null; inFlight.current = false; setBusy(false); } }
  }
  async function start(resume: boolean) {
    if (inFlight.current) return;
    cancel(); inFlight.current = true; setBusy(true); setPaused(false); timer.current = 0; setElapsed(0);
    let history: ClassroomMessage[] = [];
    session.current = null; setSessionId(null); setMastery(null);
    try {
      if (resume && resumable) {
        const response = await fetch(`/api/lessons/${resumable.id}`), data = await response.json();
        if (!response.ok) throw new Error(data.error);
        session.current = resumable.id; setSessionId(resumable.id);
        if (!(await control("resume"))) throw new Error("Could not resume this lesson.");
        history = (data.turns as SavedTurn[]).filter((turn) => turn.status === "COMPLETE").flatMap((turn) => [{ id: turn.id + "-q", role: "user", content: turn.input }, { id: turn.id, role: "assistant", content: turn.answer, whiteboard: turn.whiteboard, citations: turn.sources }]);
        setMastery(data.mastery?.score ?? null);
      } else {
        const response = await fetch("/api/lessons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...selection, curriculumOnly }) }), data = await response.json();
        if (!response.ok) throw new Error(data.error);
        session.current = data.lesson.id; setSessionId(data.lesson.id); setSavedLessons((items) => [data.lesson, ...items]);
      }
      setPersistence("Lesson is saved to your school account.");
    } catch (error) {
      if (resume && resumable) { setPersistence(error instanceof Error ? error.message : "Resume failed."); inFlight.current = false; setBusy(false); return; }
      setPersistence(`Browser-only lesson · ${error instanceof Error ? error.message : "Database unavailable."}`);
      history = resume ? previous.slice(0, 5).reverse().flatMap((event) => [{ id: event.id + "-q", role: "user" as const, content: event.question }, { id: event.id + "-a", role: "assistant" as const, content: event.answer }]) : [];
    }
    setStarted(true); setMessages(history); inFlight.current = false; setBusy(false); record({ ...context, kind: "STARTED" });
    await send(resume ? `Continue our lesson on ${selection.topic || chapter.title}. Recap briefly and ask one check question.` : `Start teaching ${selection.topic || chapter.title}. Greet me, state the objective, explain one concept and ask one prior-knowledge question.`, history, "START");
  }
  async function finish(completed: boolean) {
    cancel(); if (!(await control(completed ? "complete" : "pause"))) return;
    setStarted(false); setPaused(false);
    record({ ...context, kind: completed ? "COMPLETED" : "STARTED", durationSeconds: timer.current }); timer.current = 0;
    setSavedLessons((items) => items.map((item) => item.id === session.current ? { ...item, status: completed ? "COMPLETED" : "PAUSED" } : item));
  }
  async function microphone() { if (teacherState === "listening") { stopListening(); return; } cancel(); if (!(await control("interrupt"))) return; setPaused(false); startListening(selection.language, (transcript) => { void send(transcript); }); }
  async function setPause(value: boolean) { cancel(); if (await control(value ? "pause" : "resume")) setPaused(value); }
  function acceptVoiceEvent(event: Record<string, unknown>) {
    if (event.type === "transcript" && typeof event.text === "string") setMessages((items) => [...items, { id: crypto.randomUUID(), role: "user", content: event.text as string }]);
    if (event.type === "text" && typeof event.text === "string") { const id = "voice-" + String(event.requestId); setMessages((items) => items.some((item) => item.id === id) ? items.map((item) => item.id === id ? { ...item, content: event.text as string, writing: true } : item) : [...items, { id, role: "assistant", content: event.text as string, writing: true }]); }
    if (event.type === "done") { const turn = event.turn as SavedTurn; setMessages((items) => items.map((item) => item.id === "voice-" + String(event.requestId) ? { ...item, content: turn.answer, writing: false, whiteboard: turn.whiteboard, citations: turn.sources } : item)); if (typeof event.mastery === "number") setMastery(event.mastery); }
    if (event.type === "interrupted") setMessages((items) => items.map((item) => item.writing ? { ...item, writing: false, interrupted: true } : item));
  }
  return { messages, input, setInput, busy, paused, setPaused: (value: boolean) => void setPause(value), autoSpeak, setAutoSpeak, speechSpeed, setSpeechSpeed, curriculumOnly, setCurriculumOnly, elapsed, started, previous, canContinue: !!resumable || previous.length > 0, latestAnswer, teacherState, interimTranscript, voiceError, start, send, finish, cancel, microphone, sessionId, persistence, masteryLabel: mastery === null ? "Not yet assessed" : `${mastery}/100 · ${masteryBand(mastery)} (AI estimate)`, acceptVoiceEvent, repeat: () => latestAnswer && speak(latestAnswer.content, selection.language, undefined, speechSpeed), pause: () => void setPause(true), stopSpeaking };
}
