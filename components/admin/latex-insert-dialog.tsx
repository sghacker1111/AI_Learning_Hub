"use client";

import * as React from "react";
import { Calculator, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MixedMathText } from "@/components/ui/mixed-math-text";

export function LatexInsertDialog({ open, onClose, onInsert }: { open: boolean; onClose: () => void; onInsert: (value: string) => void }) {
  const [latex, setLatex] = React.useState("");
  const [display, setDisplay] = React.useState(false);
  if (!open) return null;

  const wrapped = latex.trim() ? (display ? `\\[${latex.trim()}\\]` : `\\(${latex.trim()}\\)`) : "";
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="latex-dialog-title">
      <div className="w-full max-w-xl rounded-2xl border bg-background p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div><h2 id="latex-dialog-title" className="flex items-center gap-2 text-lg font-bold"><Calculator className="h-5 w-5 text-primary" /> Insert mathematical form</h2><p className="mt-1 text-sm text-muted-foreground">Enter only the LaTeX expression. The editor adds safe delimiters.</p></div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close LaTeX editor"><X className="h-4 w-4" /></Button>
        </div>
        <div className="mt-5 space-y-4">
          <label className="block space-y-1 text-sm font-semibold">LaTeX expression
            <Input autoFocus value={latex} onChange={(event) => setLatex(event.target.value)} className="font-mono" placeholder={'Example: x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}'} />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={display} onChange={(event) => setDisplay(event.target.checked)} /> Display on a separate centered line</label>
          <div className="min-h-24 rounded-xl border bg-muted/20 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>{wrapped ? <MixedMathText content={wrapped} className="text-base" /> : <p className="text-sm text-muted-foreground">The rendered formula appears here.</p>}</div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="button" disabled={!latex.trim()} onClick={() => { onInsert(wrapped); setLatex(""); setDisplay(false); onClose(); }} className="gap-2"><Check className="h-4 w-4" /> Insert formula</Button></div>
        </div>
      </div>
    </div>
  );
}

