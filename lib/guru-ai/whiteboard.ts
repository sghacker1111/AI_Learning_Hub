import { z } from "zod";
import { parseMixedMathContent } from "@/lib/math/mixed-content";
export const whiteboardEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("title"), content: z.string().max(200) }),
  z.object({ type: z.literal("step"), content: z.string().max(16000) }),
  z.object({ type: z.literal("equation"), content: z.string().max(4000) }),
  z.object({ type: z.literal("question"), content: z.string().max(4000) }),
  z.object({ type: z.literal("bullet_list"), items: z.array(z.string().max(2000)).max(20) }),
]);
export const whiteboardSchema = z.array(whiteboardEventSchema).max(32);
export type WhiteboardEvent = z.infer<typeof whiteboardEventSchema>;
// The controller emits a bounded, data-only contract. No model HTML, URLs or scripts are executed.
export function answerToWhiteboard(answer: string): WhiteboardEvent[] {
  const events: WhiteboardEvent[] = [];
  let text = "";
  const flush = () => { if (text.trim()) events.push({ type: "step", content: text.trim() }); text = ""; };
  for (const part of parseMixedMathContent(answer)) {
    if (part.type === "display-math") { flush(); events.push({ type: "equation", content: part.value }); }
    else text += part.type === "inline-math" ? `\\(${part.value}\\)` : part.value;
  }
  flush();
  const parsed = whiteboardSchema.safeParse(events);
  return parsed.success ? parsed.data : [{ type: "step", content: answer.slice(0,16000) }];
}
