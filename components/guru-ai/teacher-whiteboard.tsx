import { MixedMathText } from "@/components/ui/mixed-math-text";
import { whiteboardSchema } from "@/lib/guru-ai/whiteboard";
export function TeacherWhiteboard({ events, fallback }: { events: unknown; fallback: string }) {
  const parsed = whiteboardSchema.safeParse(events);
  if (!parsed.success) return <MixedMathText content={fallback} className="leading-7" />;
  return <div className="space-y-4">{parsed.data.map((event, index) => {
    if (event.type === "equation") return <div key={index} className="overflow-x-auto rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-lg dark:border-indigo-900 dark:bg-indigo-950/40"><MixedMathText content={`\\[${event.content}\\]`} /></div>;
    if (event.type === "bullet_list") return <ul key={index} className="list-disc space-y-2 pl-5">{event.items.map((item, i) => <li key={i}><MixedMathText content={item} /></li>)}</ul>;
    if (event.type === "title") return <h3 key={index} className="text-lg font-bold">{event.content}</h3>;
    return <MixedMathText key={index} content={event.content} className="leading-7" />;
  })}</div>;
}
