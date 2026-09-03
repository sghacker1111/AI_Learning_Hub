import { NextResponse } from "next/server";
import { simulateDRFailover } from "@/lib/backup/dr-replication";

export async function POST() {
  try {
    const result = simulateDRFailover();
    return NextResponse.json({
      success: false,
      simulated: true,
      result,
    });
  } catch (error) {
    console.error("Backup failover POST error:", error);
    return NextResponse.json({ error: "Failed to simulate DR failover" }, { status: 500 });
  }
}
