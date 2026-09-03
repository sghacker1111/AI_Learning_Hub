"use client";

import * as React from "react";
import { chunkTextForSpeech } from "./browser-speech";

export type LiveTeacherState = "idle" | "listening" | "thinking" | "writing" | "speaking";

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error?: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const voiceWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition || null;
}

export function useTwoWayBrowserVoice() {
  const [teacherState, setTeacherState] = React.useState<LiveTeacherState>("idle");
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<BrowserSpeechRecognition | null>(null);
  const speechRunRef = React.useRef(0);

  const stopSpeaking = React.useCallback(() => {
    speechRunRef.current += 1;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setTeacherState("idle");
  }, []);

  const stopListening = React.useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) { recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.abort(); }
    setInterimTranscript("");
    setTeacherState("idle");
  }, []);

  const startListening = React.useCallback((
    language: "en" | "ne" | "bilingual",
    onFinalTranscript: (transcript: string) => void
  ) => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setError("Live microphone transcription is not supported in this browser. Use Chrome, Edge, or the text box.");
      return false;
    }

    stopSpeaking();
    stopListening();
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "ne" ? "ne-NP" : "en-US";
    recognitionRef.current = recognition;
    setError(null);
    setInterimTranscript("");
    setTeacherState("listening");

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
      let interim = "";
      let finalText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalText += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimTranscript(interim || finalText);
      if (finalText.trim()) {
        recognitionRef.current = null;
        recognition.onresult = null; recognition.onerror = null; recognition.onend = null; recognition.stop();
        setInterimTranscript("");
        setTeacherState("thinking");
        onFinalTranscript(finalText.trim());
      }
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setTeacherState("idle");
      setInterimTranscript("");
      setError(event.error === "not-allowed" ? "Microphone permission was not granted." : "The microphone could not understand that turn. Please try again.");
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setTeacherState((current) => current === "listening" ? "idle" : current);
    };

    try { recognition.start(); }
    catch { recognitionRef.current = null; setTeacherState("idle"); setError("The microphone could not start. Please use text or try again."); return false; }
    return true;
  }, [stopSpeaking, stopListening]);

  const speak = React.useCallback((text: string, language: "en" | "ne" | "bilingual", onComplete?: () => void, speed = 0.92) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Teacher voice playback is not supported in this browser.");
      onComplete?.();
      return;
    }

    stopSpeaking();
    stopListening();
    const chunks = chunkTextForSpeech(text, 220);
    if (!chunks.length) {
      onComplete?.();
      return;
    }

    const runId = speechRunRef.current;
    const detectedNepali = /[ऀ-ॿ]/.test(text);
    const speechLanguage = language === "ne" || (language === "bilingual" && detectedNepali) ? "ne-NP" : "en-US";
    setError(null);
    setTeacherState("speaking");

    const speakChunk = (index: number) => {
      if (speechRunRef.current !== runId) return;
      if (index >= chunks.length) {
        setTeacherState("idle");
        onComplete?.();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = speechLanguage;
      utterance.rate = Math.min(1.2, Math.max(0.6, speed));
      utterance.pitch = 1.02;
      utterance.onend = () => speakChunk(index + 1);
      utterance.onerror = () => {
        if (speechRunRef.current === runId) {
          setTeacherState("idle");
          setError("Teacher voice playback stopped before the answer finished.");
          onComplete?.();
        }
      };
      window.speechSynthesis.speak(utterance);
    };

    speakChunk(0);
  }, [stopSpeaking, stopListening]);

  React.useEffect(() => () => {
    recognitionRef.current?.abort();
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
  }, []);

  return {
    teacherState,
    setTeacherState,
    interimTranscript,
    error,
    microphoneSupported: typeof window === "undefined" ? true : Boolean(getSpeechRecognitionConstructor()),
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
