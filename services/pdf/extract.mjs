import { parentPort, workerData } from "node:worker_threads";
import { getDocumentProxy, extractText } from "unpdf";
try {
  const pdf = await getDocumentProxy(new Uint8Array(workerData), { isEvalSupported: false, useSystemFonts: false });
  if (pdf.numPages > 80) throw new Error("Upload one chapter at a time (maximum 80 pages).");
  try {
    const result = await extractText(pdf, { mergePages: false });
    if (result.text.join("").length > 300000) throw new Error("This chapter is too large. Split it into smaller PDFs.");
    parentPort.postMessage({ pages: result.text });
  } finally { await pdf.destroy(); }
} catch (error) { parentPort.postMessage({ error: error instanceof Error ? error.message : "PDF extraction failed." }); }
