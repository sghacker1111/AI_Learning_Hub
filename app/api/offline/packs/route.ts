import { NextResponse } from "next/server";
import { getOfflinePacks } from "@/lib/offline/packs";

export async function GET() {
  try {
    const packs = getOfflinePacks();
    return NextResponse.json({ success: true, demo: true, downloaded: false, packs });
  } catch (error) {
    console.error("Offline packs API error:", error);
    return NextResponse.json({ error: "Failed to fetch offline packs" }, { status: 500 });
  }
}
