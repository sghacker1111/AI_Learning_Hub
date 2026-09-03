import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { lessonUser, lessonError } from "@/lib/lessons/http";
import { lessonSelectionSchema, resolveLessonSelection } from "@/lib/lessons/contracts";
import { ownerWhere } from "@/lib/lessons/service";
export async function GET(request: Request) {
  try { const user = await lessonUser(request); return NextResponse.json({ lessons: await prisma.guruLesson.findMany({ where: ownerWhere(user), orderBy: { updatedAt: "desc" }, take: 60 }), mastery: await prisma.guruMastery.findMany({ where: ownerWhere(user), orderBy: { updatedAt: "desc" }, take: 100 }) }); } catch (error) { return lessonError(error); }
}
export async function POST(request: Request) {
  try {
    const user = await lessonUser(request, true);
    const parsed = lessonSelectionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Select a valid class, subject and chapter." }, { status: 400 });
    const selection = resolveLessonSelection(parsed.data);
    const key = { ...ownerWhere(user), grade: selection.grade, subject: selection.subject, chapterId: selection.chapterId, topic: selection.topic, objective: selection.objective };
    const mastery = await prisma.guruMastery.findFirst({ where: key });
    const lesson = await prisma.guruLesson.create({ data: { ...selection, ...ownerWhere(user), masteryBefore: mastery?.score || 0, masteryAfter: mastery?.score || 0, events: { create: { type: "START" } } } });
    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) { return lessonError(error); }
}
