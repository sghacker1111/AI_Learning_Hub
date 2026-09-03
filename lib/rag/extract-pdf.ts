import { Worker } from "node:worker_threads";
import path from "node:path";
import { LessonError } from "@/lib/lessons/http";
let running = 0;
export async function extractPdf(bytes: Uint8Array): Promise<string[]> {
  if (bytes.length > 5_000_000 || Buffer.from(bytes.subarray(0, 5)).toString() !== "%PDF-") throw new LessonError("Upload a valid PDF smaller than 5 MB.");
  if (running >= 2) throw new LessonError("Other documents are processing. Please retry shortly.", 429);
  running++;
  try {
    return await new Promise((resolve, reject) => {
      const worker = new Worker(path.join(process.cwd(), "services/pdf/extract.mjs"), { workerData: bytes, resourceLimits: { maxOldGenerationSizeMb: 256 } });
      const timer = setTimeout(() => { void worker.terminate(); reject(new LessonError("PDF extraction timed out. Try a smaller chapter.")); }, 30000);
      worker.once("message", (result: { pages?: string[]; error?: string }) => {
        clearTimeout(timer); void worker.terminate();
        if (result.error || !result.pages?.some((page) => page.trim().length > 20)) reject(new LessonError(result.error || "No readable text was found. OCR scanned pages before uploading."));
        else resolve(result.pages);
      });
      worker.once("error", () => { clearTimeout(timer); reject(new LessonError("This PDF could not be processed safely.")); });
      worker.once("exit", (code) => { clearTimeout(timer); if (code !== 0) reject(new LessonError("PDF processing stopped. Try a smaller document.")); });
    });
  } finally { running--; }
}
export async function boundedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new LessonError("Choose a PDF to upload.");
  let size = 0; const parts: Uint8Array[] = [];
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 5_100_000) throw new LessonError("Upload limit is 5 MB.", 413); parts.push(value); }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  return new Response(Buffer.concat(parts), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
}
