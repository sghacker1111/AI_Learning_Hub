import { GuruAIApp } from "@/components/guru-ai/guru-ai-app";
import { selectionFromSearch } from "@/lib/guru-ai/classroom";
export default async function GuruPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const selection = selectionFromSearch(await searchParams);
  return <GuruAIApp key={JSON.stringify(selection)} initialSelection={selection} />;
}
