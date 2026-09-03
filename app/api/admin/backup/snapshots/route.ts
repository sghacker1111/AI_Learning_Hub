import { NextResponse } from "next/server";
import { getDBSnapshots } from "@/lib/backup/engine";

export async function GET() {
  try {
    const snapshots = getDBSnapshots();
    return NextResponse.json({ success: true, simulated: true, snapshots });
  } catch (error) {
    console.error("Backup snapshots GET error:", error);
    return NextResponse.json({ error: "Failed to fetch snapshots" }, { status: 500 });
  }
}

export async function POST() {
  try {
    return NextResponse.json({
      success: false,
      simulated: true,
      error: "Backup storage is not configured; no snapshot was created.",
    }, { status: 501 });
  } catch (error) {
    console.error("Backup snapshot POST error:", error);
    return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 });
  }
}
