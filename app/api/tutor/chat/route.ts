import { NextRequest, NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import { generateCompletion } from "@/lib/ai/router";
import { evaluateNextSocraticStage, getStageInstruction } from "@/lib/ai/tutor/stages";
import { TutorChatRequest, TutorChatResponse, SocraticStage } from "@/lib/ai/tutor/types";
import { getSessionUser } from "@/lib/auth/session";
import { buildCDCSocraticSystemPrompt } from "@/lib/ai/prompts";
import { hybridRetrieveCDC } from "@/lib/rag/retriever";
import { classifyAIRequest } from "@/lib/ai/classifier";
import { consumeFixedWindowRateLimit } from "@/lib/ai/rate-limit";
import { checkSchoolFeature } from "@/lib/billing/entitlements";
import { getGuruTutorInstruction } from "@/lib/guru-ai/prompt";
import type { GuruPersona, GuruTutorMode } from "@/lib/guru-ai/catalog";
import { answerToWhiteboard } from "@/lib/guru-ai/whiteboard";
import { streamCompletion } from "@/lib/ai/stream";
import { lessonStreamResponse } from "@/lib/lessons/stream-protocol";
import { assertSameOrigin } from "@/lib/lessons/http";

const SOCRATIC_STAGES: SocraticStage[] = [
  "STAGE_1_DIAGNOSIS",
  "STAGE_2_GUIDED_EXPLORATION",
  "STAGE_3_CONCEPTUAL_BRIDGE",
  "STAGE_4_INDEPENDENT_CALCULATION",
  "STAGE_5_MASTERY_CONFIRMED",
];
const TUTOR_ROLES = new Set<RoleCode>([
  RoleCode.STUDENT,
  RoleCode.TEACHER,
]);
const GURU_PERSONAS = new Set<GuruPersona>(["ram_sir", "sita_maam"]);
const GURU_TUTOR_MODES = new Set<GuruTutorMode>([
  "solve_together",
  "teach_me",
  "hint_only",
  "exam_mode",
  "revision",
]);

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await getSessionUser();
    if (
      !session ||
      !TUTOR_ROLES.has(session.role)
    ) {
      return NextResponse.json({ error: "Student or teacher access is required." }, { status: 403 });
    }
    const entitlement = await checkSchoolFeature(session, "AI_TUTOR");
    if (!entitlement.allowed) {
      return NextResponse.json(
        { error: entitlement.reason || "The school bundle does not include AI Tutor.", upgradeRequired: true },
        { status: 402 }
      );
    }
    const rateLimit = consumeFixedWindowRateLimit(`ai-tutor:${session.userId}`, 120, 60 * 60 * 1_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "The hourly Tutor request limit was reached." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body: TutorChatRequest = await request.json();
    if (body.stream !== undefined && typeof body.stream !== "boolean") return NextResponse.json({ error: "Invalid streaming option." }, { status: 400 });
    const {
      sessionId,
      message,
      grade,
      subject,
      chapter,
      language,
      history = [],
      currentStage = "STAGE_1_DIAGNOSIS",
      persona,
      tutorMode,
      curriculumOnly = false,
    } = body;

    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return NextResponse.json({ error: "Message must contain between 1 and 4000 characters." }, { status: 400 });
    }
    if (!SOCRATIC_STAGES.includes(currentStage)) {
      return NextResponse.json({ error: "Invalid Socratic stage." }, { status: 400 });
    }
    if (persona !== undefined && !GURU_PERSONAS.has(persona)) {
      return NextResponse.json({ error: "Invalid Guru AI teacher persona." }, { status: 400 });
    }
    if (tutorMode !== undefined && !GURU_TUTOR_MODES.has(tutorMode)) {
      return NextResponse.json({ error: "Invalid Guru AI tutor mode." }, { status: 400 });
    }
    if (typeof curriculumOnly !== "boolean") {
      return NextResponse.json({ error: "Invalid curriculum grounding mode." }, { status: 400 });
    }
    if (
      [sessionId, grade, subject, chapter].some(
        (value) => value !== undefined && (typeof value !== "string" || value.length > 120)
      )
    ) {
      return NextResponse.json({ error: "Invalid tutor context." }, { status: 400 });
    }
    if (
      !Array.isArray(history) ||
      history.length > 12 ||
      history.some(
        (item) =>
          !item ||
          (item.role !== "user" && item.role !== "assistant") ||
          typeof item.content !== "string" ||
          !item.content.trim() ||
          item.content.length > 4000
      ) ||
      history.reduce((total, item) => total + item.content.length, 0) > 16000
    ) {
      return NextResponse.json({ error: "Invalid tutor conversation history." }, { status: 400 });
    }

    // Coaching state is retained for the UI, but it never blocks a direct answer.
    const nextStage: SocraticStage = evaluateNextSocraticStage(currentStage, message, 2);
    const stageInstruction = getStageInstruction(nextStage);
    const classification = classifyAIRequest(message);
    const toolInstruction = classification.category === "IMAGE_GENERATION"
      ? "The learner can use Generate Image to request an illustration. Explain what to illustrate; do not claim an image has already been generated."
      : classification.category === "VISUAL_CREATION"
        ? "The learner can use Show Visual for a supported diagram. Explain what to notice; do not claim a diagram has already been attached."
        : "Use the direct-answer teaching format defined above.";
    const resolvedGrade = grade || "Class 8";
    const resolvedSubject = subject || "Compulsory Mathematics";
    const resolvedLanguage = language || (/[ऀ-ॿ]/.test(message) ? "ne" : "en");
    if (!["en", "ne", "bilingual"].includes(resolvedLanguage)) return NextResponse.json({ error: "Invalid teaching language." }, { status: 400 });
    const retrieval = await hybridRetrieveCDC({
      query: `${chapter || ""} ${message}`.trim(),
      grade: resolvedGrade,
      subject: resolvedSubject,
      chapter,
      topK: 2,
    });
    const relevantChunks = retrieval.topChunks.filter((result) =>
      result.sparseScore >= 0.125 || Boolean(
        chapter && result.chunk.metadata.chapter.toLowerCase().includes(chapter.toLowerCase())
      )
    );
    const sampleContext = relevantChunks
      .map((result) => result.chunk.content)
      .join("\n\n");
    const groundingSources = relevantChunks.map((result) => ({
      grade: result.chunk.metadata.grade,
      subject: result.chunk.metadata.subject,
      chapter: result.chunk.metadata.chapter,
      section: result.chunk.metadata.sectionTitle,
      edition: result.chunk.metadata.curriculumEdition,
      pages: result.chunk.metadata.pageRange,
    }));
    if (curriculumOnly && !sampleContext) {
      const guardMessage: TutorChatResponse = {
        sessionId: sessionId || `sess-${Date.now()}`,
        currentStage,
        message: {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `I cannot answer this from the approved ${resolvedGrade} ${resolvedSubject} content yet. A Super Admin must import and publish the selected chapter or topic before Curriculum-only mode can use it.`,
          stage: currentStage,
          timestamp: new Date().toISOString(),
          requestCategory: classification.category,
        },
        masteryScoreDelta: 0,
        usedFallback: false,
        provider: "curriculum-guard",
        requestCategory: classification.category,
        grounding: { mode: "curriculum_only", matchedChunks: 0, sources: [] },
      };
      if (body.stream) return lessonStreamResponse(async (send) => { send({ type: "text", text: guardMessage.message.content }); send({ type: "done", response: guardMessage }); }, request.signal);
      return NextResponse.json(guardMessage);
    }
    const guruInstruction = getGuruTutorInstruction(persona, tutorMode);
    const systemPrompt = [
      buildCDCSocraticSystemPrompt({
        grade: resolvedGrade,
        subject: resolvedSubject,
        chapter,
        language: resolvedLanguage,
        socraticMode: false,
      }),
      `Response focus: ${stageInstruction}`,
      `Internal task classification: ${classification.category}. ${classification.reason}`,
      `Tool behavior: ${toolInstruction}`,
      guruInstruction ? `Guru AI classroom behavior: ${guruInstruction}` : null,
      curriculumOnly
        ? "Strict grounding rule: answer only from the school-published or bundled curriculum context below. Do not add facts from model memory. If the context is insufficient, say exactly what curriculum content is missing."
        : "Grounding rule: prefer the school-published or bundled curriculum context below, distinguish it from general knowledge, and never invent a textbook citation.",
      sampleContext
        ? `School-published or bundled curriculum context:\n${sampleContext}`
        : "No relevant curriculum content was found. Answer from general knowledge only because Curriculum-only mode is off, and state that no approved source was matched.",
    ].filter(Boolean).join("\n\n");

    if (body.stream) return lessonStreamResponse(async (send, signal) => {
      let answer = "", provider = "qwen";
      for await (const update of streamCompletion({ signal, temperature: 0.2, maxTokens: 1024, messages: [{ role: "system", content: systemPrompt }, ...history.filter((item) => item.role === "user" || item.role === "assistant").map((item) => ({ role: item.role as "user" | "assistant", content: item.content })), { role: "user", content: message }] })) {
        answer = update.text; provider = update.provider; send({ type: "text", text: answer });
      }
      send({ type: "done", response: { sessionId: sessionId || `sess-${Date.now()}`, currentStage: nextStage, provider, usedFallback: false, isSimulated: false, requestCategory: classification.category, message: { id: crypto.randomUUID(), role: "assistant", content: answer, timestamp: new Date().toISOString(), whiteboard: answerToWhiteboard(answer), citations: groundingSources.map((source) => ({ grade: source.grade, subject: source.subject, chapter: source.chapter, page: source.pages })) } } });
    }, request.signal);
    // Include recent turns so follow-up questions retain their meaning.
    const aiResult = await generateCompletion({
      signal: request.signal,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...history.map((item) => ({ role: item.role, content: item.content } as const)),
        {
          role: "user",
          content: message,
        },
      ],
      grade: resolvedGrade,
      subject: resolvedSubject,
      chapter: chapter || "Sets",
      socraticMode: false,
      language: resolvedLanguage,
      temperature: 0.2,
      maxTokens: 1024,
      userId: session.userId,
    });

    const responsePayload: TutorChatResponse = {
      sessionId: sessionId || `sess-${Date.now()}`,
      currentStage: nextStage,
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: aiResult.text,
        whiteboard: answerToWhiteboard(aiResult.text),
        stage: nextStage,
        timestamp: new Date().toISOString(),
        requestCategory: classification.category,
        citations: groundingSources.map((source) => ({
          grade: source.grade,
          subject: source.subject,
          chapter: source.chapter,
          page: source.pages,
        })),
      },
      // Conversation stages are coaching state, not an assessed mastery result.
      masteryScoreDelta: 0,
      usedFallback: aiResult.usedFallback,
      isSimulated: aiResult.isSimulated,
      provider: aiResult.provider,
      requestCategory: classification.category,
      grounding: {
        mode: curriculumOnly ? "curriculum_only" : "curriculum_preferred",
        matchedChunks: relevantChunks.length,
        sources: groundingSources,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Tutor chat API error:", error);
    return NextResponse.json({ error: "Failed to process the Tutor question." }, { status: 500 });
  }
}
