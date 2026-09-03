import { NextResponse } from "next/server";
import { lessonUser, lessonError } from "@/lib/lessons/http";
import { lessonMessageSchema } from "@/lib/lessons/contracts";
import { reserveTurn, runLessonTurn } from "@/lib/lessons/service";
import { lessonStreamResponse } from "@/lib/lessons/stream-protocol";
export const maxDuration = 180;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await lessonUser(request, true), parsed = lessonMessageSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid lesson message." }, { status: 400 });
    const reserved = await reserveTurn((await context.params).id, user, parsed.data);
    return lessonStreamResponse((send, signal) => runLessonTurn(reserved, user.role, send, signal), request.signal);
  } catch (error) { return lessonError(error); }
}
