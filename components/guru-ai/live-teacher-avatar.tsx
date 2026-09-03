"use client";

import { Atom, Calculator, Mic, Sparkles, Volume2 } from "lucide-react";
import type { GuruSubject } from "@/lib/guru-ai/catalog";
import type { LiveTeacherState } from "@/lib/voice/two-way-browser-voice";
import { cn } from "@/lib/utils";

const STATE_LABELS: Record<LiveTeacherState, string> = {
  idle: "Ready to teach",
  listening: "Listening to you",
  thinking: "Preparing the answer",
  writing: "Writing the answer",
  speaking: "Speaking now",
};

export function LiveTeacherAvatar({ subject, state, compact = false }: { subject: GuruSubject; state: LiveTeacherState; compact?: boolean }) {
  const isMath = subject === "math";
  const active = state !== "idle";
  return (
    <div className={cn("flex items-center gap-4", compact && "gap-3")}>
      <div className={cn("relative shrink-0", compact ? "h-14 w-14" : "h-36 w-36")} aria-label={`${isMath ? "Ram Sir AI" : "Sita Ma'am AI"} avatar: ${STATE_LABELS[state]}`} role="img">
        {active ? <div className={cn("absolute inset-0 rounded-full opacity-20 blur-xl", isMath ? "bg-indigo-500" : "bg-emerald-500", state === "speaking" && "animate-pulse")} /> : null}
        <div className={cn("absolute inset-[4%] overflow-hidden rounded-[42%_42%_48%_48%] border-4 border-white bg-gradient-to-br shadow-xl transition-transform duration-500 dark:border-slate-800", isMath ? "from-indigo-100 via-amber-50 to-violet-200" : "from-emerald-100 via-amber-50 to-cyan-200", state === "speaking" && "animate-[pulse_0.9s_ease-in-out_infinite]", state === "listening" && "-rotate-2")}>
          <div className={cn("absolute left-[20%] top-[9%] h-[31%] w-[60%] rounded-[55%_55%_35%_35%]", isMath ? "bg-slate-700" : "bg-slate-800")} />
          <div className="absolute left-[19%] top-[27%] h-[60%] w-[62%] rounded-[45%_45%_50%_50%] bg-[#c9825d] shadow-inner">
            <div className="absolute left-[18%] top-[30%] h-[8%] w-[18%] rounded-full bg-slate-900" />
            <div className={cn("absolute right-[18%] top-[30%] h-[8%] w-[18%] rounded-full bg-slate-900", active && "animate-[pulse_2.5s_ease-in-out_infinite]")} />
            <div className="absolute left-1/2 top-[36%] h-[22%] w-[7%] -translate-x-1/2 rounded-full border-r-2 border-amber-950/20" />
            <div className={cn("absolute left-1/2 top-[68%] -translate-x-1/2 rounded-full bg-rose-950 transition-all duration-150", state === "speaking" ? "h-[15%] w-[27%] animate-[bounce_0.38s_ease-in-out_infinite]" : state === "listening" ? "h-[6%] w-[24%]" : "h-[4%] w-[28%]")}>
              {state === "speaking" ? <span className="absolute inset-x-[16%] top-[18%] h-[25%] rounded-full bg-white/90" /> : null}
            </div>
          </div>
          <div className={cn("absolute inset-x-[8%] bottom-[-18%] h-[38%] rounded-[50%_50%_0_0]", isMath ? "bg-indigo-700" : "bg-teal-700")} />
          <div className="absolute bottom-[3%] left-1/2 grid h-[22%] w-[22%] -translate-x-1/2 place-items-center rounded-full bg-white/95 text-slate-800 shadow">
            {isMath ? <Calculator className="h-1/2 w-1/2" /> : <Atom className="h-1/2 w-1/2" />}
          </div>
        </div>
        <span className={cn("absolute bottom-[3%] right-[3%] grid rounded-full border-4 border-white text-white shadow-lg dark:border-slate-800", compact ? "h-6 w-6" : "h-10 w-10", state === "listening" ? "bg-rose-500" : state === "speaking" ? "bg-emerald-500" : active ? "bg-indigo-500" : "bg-slate-400")}>
          {state === "listening" ? <Mic className="m-auto h-1/2 w-1/2" /> : state === "speaking" ? <Volume2 className="m-auto h-1/2 w-1/2" /> : <Sparkles className={cn("m-auto h-1/2 w-1/2", active && "animate-spin")} />}
        </span>
      </div>
      {compact ? <div><p className="text-sm font-extrabold text-slate-900 dark:text-white">{isMath ? "Ram Sir AI" : "Sita Ma'am AI"}</p><p className={cn("text-xs font-semibold", state === "listening" ? "text-rose-600" : state === "speaking" ? "text-emerald-600" : "text-slate-500")}>{STATE_LABELS[state]}</p></div> : null}
    </div>
  );
}
