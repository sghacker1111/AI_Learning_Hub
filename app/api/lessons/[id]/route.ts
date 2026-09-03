import { NextResponse } from "next/server";
import { lessonUser, lessonError } from "@/lib/lessons/http";
import { getLesson, changeLesson } from "@/lib/lessons/service";
import { lessonActionSchema } from "@/lib/lessons/contracts";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try { return NextResponse.json(await getLesson((await context.params).id, await lessonUser(request))); } catch (error) { return lessonError(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const user = await lessonUser(request, true), parsed = lessonActionSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid lesson action." }, { status: 400 });
    return NextResponse.json({ lesson: await changeLesson((await context.params).id, user, parsed.data.action) });
  } catch (error) { return lessonError(error); }
}
