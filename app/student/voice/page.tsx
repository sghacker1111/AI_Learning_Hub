"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  Volume2,
  Sparkles,
  ArrowLeft,
  Headphones,
  Globe,
  Radio,
  BookOpen,
} from "lucide-react";
import { StudentDashboardShell } from "@/components/layout/student-dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathView } from "@/components/ui/math-view";
import {
  INITIAL_VOICE_TRANSCRIPT,
  VOICE_PRACTICE_PROMPTS,
  generateVoiceSocraticTurn,
} from "@/lib/voice/tutor-voice";
import { parseVoiceCommand, VOICE_NAVIGATION_COMMANDS } from "@/lib/voice/commands";
import { VoiceTutorState, VoiceTranscriptItem, TTSConfig } from "@/lib/voice/types";

export default function StudentVoiceTutorPage() {
  const router = useRouter();
  const [tutorState, setTutorState] = React.useState<VoiceTutorState>("IDLE");
  const [transcript, setTranscript] = React.useState<VoiceTranscriptItem[]>(INITIAL_VOICE_TRANSCRIPT);
  const [ttsConfig, setTtsConfig] = React.useState<TTSConfig>({
    voiceAccent: "NEPALI_NATURAL",
    playbackRate: 1.0,
    pitch: 1.0,
    handsFreeMode: true,
  });
  const [activePromptIndex] = React.useState(0);
  const [commandFeedback, setCommandFeedback] = React.useState<string | null>(null);

  const currentTutorTurn = transcript[transcript.length - 1];

  const handleSimulateStudentVoice = (spokenText: string) => {
    // 1. Enter listening state
    setTutorState("LISTENING");

    setTimeout(() => {
      // Check if it matches a voice command
      const cmdMatch = parseVoiceCommand(spokenText);
      if (cmdMatch) {
        setCommandFeedback(`Recognized Voice Command: "${cmdMatch.labelNepali}" → Navigating...`);
        setTimeout(() => {
          router.push(cmdMatch.targetRoute);
        }, 1200);
        return;
      }

      // 2. Add student message
      const studentTurn: VoiceTranscriptItem = {
        id: `turn-${Date.now()}`,
        speaker: "STUDENT",
        text: spokenText,
        timestamp: "Just now",
      };

      setTranscript((prev) => [...prev, studentTurn]);
      setTutorState("THINKING");

      // 3. AI Generates response
      setTimeout(() => {
        const aiTurn = generateVoiceSocraticTurn(spokenText);
        setTranscript((prev) => [...prev, aiTurn]);
        setTutorState("SPEAKING");

        // 4. Return to idle or listening if hands-free
        setTimeout(() => {
          setTutorState(ttsConfig.handsFreeMode ? "IDLE" : "IDLE");
        }, 4000);
      }, 1000);
    }, 1200);
  };

  return (
    <StudentDashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href="/student/dashboard"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Bilingual Socratic Voice AI Tutor</h1>
            <p className="text-xs text-muted-foreground">
              Speak naturally in Nepali or English with continuous hands-free Socratic dialogue and mathematical formula vocalization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="nepal" className="text-[10px]">
              Voice AI Engine • Bilingual STT & TTS
            </Badge>
          </div>
        </div>

        {/* Command Navigation Banner */}
        {commandFeedback && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-bold flex items-center gap-2 animate-in fade-in">
            <Radio className="h-4 w-4 animate-pulse shrink-0" />
            <span>{commandFeedback}</span>
          </div>
        )}

        {/* MAIN HERO: Animated AI Voice Orb Stage */}
        <Card className="p-8 border-2 border-primary/30 bg-card space-y-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center">
          {/* Top Status & Controls */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  tutorState === "LISTENING"
                    ? "bg-amber-500 animate-ping"
                    : tutorState === "SPEAKING"
                    ? "bg-emerald-500 animate-pulse"
                    : tutorState === "THINKING"
                    ? "bg-purple-500 animate-pulse"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                {tutorState === "LISTENING"
                  ? "Listening to your voice... (सुन्दैछ)"
                  : tutorState === "SPEAKING"
                  ? "AI Speaking in Devanagari... (बोल्दैछ)"
                  : tutorState === "THINKING"
                  ? "Socratic Reasoning... (सोच्दैछ)"
                  : "Voice Tutor Ready (सम्पर्कमा)"}
              </span>
            </div>

            {/* Accent & Speed Selector */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() =>
                  setTtsConfig({
                    ...ttsConfig,
                    voiceAccent:
                      ttsConfig.voiceAccent === "NEPALI_NATURAL"
                        ? "ENGLISH_STANDARD"
                        : "NEPALI_NATURAL",
                  })
                }
                className="px-2.5 py-1 rounded-xl bg-muted/40 border font-semibold text-[11px] flex items-center gap-1 hover:bg-muted/60"
              >
                <Globe className="h-3 w-3 text-primary" />
                <span>{ttsConfig.voiceAccent === "NEPALI_NATURAL" ? "नेपाली उच्चारण" : "English Voice"}</span>
              </button>

              <select
                value={ttsConfig.playbackRate}
                onChange={(e) =>
                  setTtsConfig({ ...ttsConfig, playbackRate: parseFloat(e.target.value) })
                }
                className="h-7 rounded-xl border bg-background px-2 text-[11px] font-semibold"
              >
                <option value={0.75}>0.75x Slow</option>
                <option value={1.0}>1.0x Normal</option>
                <option value={1.25}>1.25x Fast</option>
              </select>
            </div>
          </div>

          {/* Animated Pulsing Voice Orb */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer Ripple Wave */}
            <div
              className={`absolute w-44 h-44 rounded-full transition-all duration-700 ${
                tutorState === "SPEAKING"
                  ? "bg-emerald-500/20 scale-125 animate-pulse"
                  : tutorState === "LISTENING"
                  ? "bg-amber-500/25 scale-110 animate-ping"
                  : tutorState === "THINKING"
                  ? "bg-purple-500/20 scale-115 animate-spin"
                  : "bg-primary/10 scale-100"
              }`}
            />

            {/* Glowing Orb Center */}
            <div
              className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-500 ${
                tutorState === "SPEAKING"
                  ? "bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 scale-110 shadow-emerald-500/50"
                  : tutorState === "LISTENING"
                  ? "bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 scale-105 shadow-amber-500/50"
                  : tutorState === "THINKING"
                  ? "bg-gradient-to-tr from-purple-700 via-indigo-600 to-pink-500 scale-100 shadow-purple-500/50"
                  : "bg-gradient-to-tr from-crimson-700 via-red-600 to-rose-500 shadow-primary/30"
              }`}
            >
              {tutorState === "SPEAKING" ? (
                <Volume2 className="h-10 w-10 animate-bounce" />
              ) : tutorState === "LISTENING" ? (
                <Mic className="h-10 w-10 animate-pulse" />
              ) : tutorState === "THINKING" ? (
                <Sparkles className="h-10 w-10 animate-spin" />
              ) : (
                <Headphones className="h-10 w-10" />
              )}
            </div>
          </div>

          {/* Spoken Turn Subtitles */}
          <div className="max-w-2xl w-full space-y-2">
            <div className="p-4 rounded-2xl bg-muted/30 border space-y-1.5 shadow-inner">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                Live Subtitles (प्रत्यक्ष संवाद):
              </span>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {currentTutorTurn.textNepali || currentTutorTurn.text}
              </p>

              {currentTutorTurn.mathLatex && (
                <div className="pt-2 border-t mt-2 flex flex-col items-center justify-center">
                  <div className="font-mono text-base font-bold text-primary py-1">
                    <MathView math={currentTutorTurn.mathLatex} displayMode={true} />
                  </div>
                  {currentTutorTurn.spokenMath && (
                    <span className="text-[11px] text-muted-foreground italic">
                      🎙️ Spoken Phonetics: &ldquo;{currentTutorTurn.spokenMath}&rdquo;
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Voice Trigger Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="nepal"
              size="lg"
              onClick={() =>
                handleSimulateStudentVoice(
                  "Sir, Marked Price मा १० प्रतिशत छुट घटाएपछि १३ प्रतिशत भ्याट कसरी जोड्ने?"
                )
              }
              className="text-xs font-bold gap-2 h-11 shadow-md"
            >
              <Mic className="h-4 w-4" />
              <span>Ask in Nepali: &ldquo;छुट पछिको १३% भ्याट कसरी निकाल्ने?&rdquo;</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                handleSimulateStudentVoice(
                  "Explain Archimedes principle with liquid pressure formula"
                )
              }
              className="text-xs font-semibold gap-2 h-11"
            >
              <Volume2 className="h-4 w-4 text-emerald-600" />
              <span>Ask in English: &ldquo;Explain Archimedes Principle&rdquo;</span>
            </Button>
          </div>
        </Card>

        {/* Lower Grid: Voice Navigation Shortcuts & Oral Practice Prompts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Voice Navigation Commands List */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Radio className="h-4 w-4 text-primary" />
                  <span>Hands-Free Voice Navigation Commands</span>
                </div>
                <Badge variant="subtle" className="text-[10px]">Accessibility</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOICE_NAVIGATION_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateStudentVoice(cmd.keywords[0])}
                    className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 text-left transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{cmd.labelNepali}</span>
                      <Mic className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Say: &ldquo;<strong>{cmd.keywords[0]}</strong>&rdquo;
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Quick Oral Practice Drills */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Oral Viva & Conceptual Voice Drills</span>
                </div>
                <Badge variant="outline" className="text-[10px]">BLE Viva Practice</Badge>
              </div>

              <div className="space-y-3">
                {VOICE_PRACTICE_PROMPTS.map((prompt, idx) => (
                  <div
                    key={prompt.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                      activePromptIndex === idx ? "border-primary bg-primary/5 shadow-sm" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground">{prompt.title}</h4>
                      <Badge variant="nepal" className="text-[9px]">Class 8</Badge>
                    </div>

                    <p className="text-foreground font-nepali font-medium leading-relaxed">
                      {prompt.verbalQuestionNepali}
                    </p>

                    <div className="pt-2 border-t flex justify-end">
                      <Button
                        variant="nepal"
                        size="sm"
                        onClick={() => handleSimulateStudentVoice(prompt.verbalQuestionNepali)}
                        className="text-xs h-8 gap-1.5 font-semibold"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        <span>Start Oral Answer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentDashboardShell>
  );
}
