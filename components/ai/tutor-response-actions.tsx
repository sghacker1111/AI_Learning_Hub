"use client";

import * as React from "react";
import Image from "next/image";
import {
  BookOpenCheck,
  Clipboard,
  Download,
  ImageIcon,
  Layers3,
  Lightbulb,
  Loader2,
  RefreshCcw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { chunkTextForSpeech } from "@/lib/voice/browser-speech";

interface TutorResponseActionsProps {
  answer: string;
  question?: string;
  grade: string;
  subject: string;
  topic?: string;
  onFollowUp: (prompt: string) => void;
  onRegenerate?: () => void;
  autoCreate?: "visual" | "image";
}

interface VisualResult {
  source: string;
  alt: string;
  kind: "visual" | "image";
  provider?: string;
  model?: string;
}

type ActiveAction = "visual" | "image" | null;

export function TutorResponseActions({
  answer,
  question,
  grade,
  subject,
  topic,
  onFollowUp,
  onRegenerate,
  autoCreate,
}: TutorResponseActionsProps) {
  const [copied, setCopied] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);
  const [activeAction, setActiveAction] = React.useState<ActiveAction>(null);
  const [visual, setVisual] = React.useState<VisualResult | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const speechRunRef = React.useRef(0);
  const objectUrlRef = React.useRef<string | null>(null);
  const autoCreatedRef = React.useRef<"visual" | "image" | null>(null);

  React.useEffect(() => {
    return () => {
      speechRunRef.current += 1;
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const stopSpeaking = React.useCallback(() => {
    speechRunRef.current += 1;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speakAnswer = React.useCallback(() => {
    if (!("speechSynthesis" in window)) {
      setActionError("Speech playback is not supported in this browser.");
      return;
    }

    stopSpeaking();
    const chunks = chunkTextForSpeech(answer);
    if (chunks.length === 0) return;

    const runId = speechRunRef.current;
    const language = /[ऀ-ॿ]/.test(answer) ? "ne-NP" : "en-US";
    setSpeaking(true);
    setActionError(null);

    const speakChunk = (index: number) => {
      if (speechRunRef.current !== runId || index >= chunks.length) {
        if (speechRunRef.current === runId) setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = language;
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.onend = () => speakChunk(index + 1);
      utterance.onerror = () => {
        if (speechRunRef.current === runId) {
          setSpeaking(false);
          setActionError("Speech playback stopped before the answer finished.");
        }
      };
      window.speechSynthesis.speak(utterance);
    };

    speakChunk(0);
  }, [answer, stopSpeaking]);

  const copyAnswer = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setActionError(null);
    } catch {
      setActionError("The browser did not allow clipboard access.");
    }
  }, [answer]);

  const replaceObjectUrl = React.useCallback((nextUrl: string | null) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = nextUrl;
  }, []);

  const showFreeVisual = React.useCallback(async () => {
    setActiveAction("visual");
    setActionError(null);
    try {
      const response = await fetch("/api/ai/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question || answer, grade, subject, topic }),
      });
      const data = await response.json();
      if (!response.ok || !data.visual?.imageDataUrl) {
        throw new Error(data.error || "The visual could not be created.");
      }

      replaceObjectUrl(null);
      setVisual({
        source: data.visual.imageDataUrl,
        alt: data.visual.alt || "Educational visual",
        kind: "visual",
        provider: "Free visual engine",
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The visual could not be created.");
    } finally {
      setActiveAction(null);
    }
  }, [answer, grade, question, replaceObjectUrl, subject, topic]);

  const createHostedImage = React.useCallback(async () => {
    setActiveAction("image");
    setActionError(null);
    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: question || answer,
          grade,
          subject,
          topic,
          style: "illustration",
          width: 768,
          height: 512,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Image generation failed.");
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("The provider returned an invalid image.");
      const source = URL.createObjectURL(blob);
      replaceObjectUrl(source);
      setVisual({
        source,
        alt: `Generated educational illustration for ${question || topic || subject}`,
        kind: "image",
        provider: response.headers.get("X-AI-Image-Provider") || "Hugging Face",
        model: response.headers.get("X-AI-Image-Model") || undefined,
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Image generation failed.");
    } finally {
      setActiveAction(null);
    }
  }, [answer, grade, question, replaceObjectUrl, subject, topic]);

  React.useEffect(() => {
    if (!autoCreate || autoCreatedRef.current === autoCreate) return;
    autoCreatedRef.current = autoCreate;
    const timer = window.setTimeout(() => {
      if (autoCreate === "image") {
        void createHostedImage();
      } else {
        void showFreeVisual();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoCreate, createHostedImage, showFreeVisual]);

  const downloadVisual = React.useCallback(() => {
    if (!visual) return;
    const link = document.createElement("a");
    link.href = visual.source;
    link.download = visual.kind === "image" ? "ai-learning-generated-image.png" : "ai-learning-visual.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [visual]);

  return (
    <div className="space-y-2 pt-1">
      <div className="flex flex-wrap items-center gap-1" aria-label="AI response actions">
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => void copyAnswer()}>
          <Clipboard className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={speaking ? stopSpeaking : speakAnswer}>
          {speaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />} {speaking ? "Stop" : "Speak"}
        </Button>
        {onRegenerate ? (
          <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={onRegenerate}>
            <RefreshCcw className="h-3 w-3" /> Regenerate
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => onFollowUp("Explain your previous answer more simply for my class level.")}>
          <Lightbulb className="h-3 w-3" /> Simpler
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => onFollowUp("Explain your previous answer in more depth and verify each important step.")}>
          <Layers3 className="h-3 w-3" /> Deeper
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => onFollowUp("Give one clear real-world example of your previous answer.")}>
          <BookOpenCheck className="h-3 w-3" /> Example
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => void showFreeVisual()} disabled={activeAction !== null}>
          {activeAction === "visual" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />} Show Visual
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={() => void createHostedImage()} disabled={activeAction !== null}>
          {activeAction === "image" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Create Image
        </Button>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-[10px] text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200" role="status">
          {actionError}
        </p>
      ) : null}

      {visual ? (
        <div className="space-y-2 rounded-xl border bg-background p-2.5">
          <Image
            src={visual.source}
            alt={visual.alt}
            width={960}
            height={600}
            sizes="(max-width: 768px) 78vw, 620px"
            unoptimized
            className="h-auto w-full rounded-lg border object-contain"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>{visual.provider}{visual.model ? ` • ${visual.model}` : ""}</span>
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-[10px]" onClick={downloadVisual}>
              <Download className="h-3 w-3" /> Download
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
