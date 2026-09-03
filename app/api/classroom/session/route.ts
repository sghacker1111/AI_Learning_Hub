import { NextRequest, NextResponse } from "next/server";
import { getDefaultLivePoll } from "@/lib/classroom/polls";
import { getAICoTeacherSuggestions } from "@/lib/classroom/co-teacher";
import { ClassroomSession } from "@/lib/classroom/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId") || "room-8a-math";
    if (roomId.length > 120) {
      return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
    }

    const session: ClassroomSession = {
      id: roomId,
      title: "Class 8A: 13% Nepal VAT & Commercial Discount Masterclass",
      titleNepali: "कक्षा ८ 'क': १३% भ्याट र छुट प्रत्यक्ष कक्षा",
      subject: "Compulsory Mathematics",
      grade: "Class 8",
      chapter: "Discount & 13% VAT",
      teacherName: "Dr. Ram Prasad Subedi",
      activeParticipantsCount: 38,
      participants: [
        { id: "u-1", name: "Dr. Ram Prasad Subedi", role: "TEACHER", isMuted: false, isVideoOn: true, isHandRaised: false, hasDrawPermission: true },
        { id: "u-2", name: "Aarav Sharma", role: "STUDENT", isMuted: true, isVideoOn: true, isHandRaised: true, hasDrawPermission: false },
        { id: "u-3", name: "Divya Adhikari", role: "STUDENT", isMuted: true, isVideoOn: false, isHandRaised: false, hasDrawPermission: false },
        { id: "u-ai", name: "Socratic AI Assistant", role: "AI_ASSISTANT", isMuted: false, isVideoOn: false, isHandRaised: false, hasDrawPermission: true },
      ],
      currentPoll: getDefaultLivePoll(),
      strokes: [],
      messages: [
        { id: "m-1", senderId: "u-1", senderName: "Dr. Ram Prasad Subedi", senderRole: "TEACHER", content: "Namaste class! Today we will master how 13% VAT is applied strictly after discount.", timestamp: "10:00 AM" },
        { id: "m-2", senderId: "u-2", senderName: "Aarav Sharma", senderRole: "STUDENT", content: "Sir, what happens if the question gives Marked Price directly without discount?", timestamp: "10:02 AM", isQuestion: true },
        { id: "m-3", senderId: "u-ai", senderName: "AI Co-Teacher", senderRole: "AI_ASSISTANT", content: "💡 Great question Aarav! If discount is 0%, then SP equals MP, so VAT is applied directly on MP.", timestamp: "10:02 AM" },
      ],
      aiSuggestions: getAICoTeacherSuggestions("13% VAT"),
    };

    return NextResponse.json({ success: true, demo: true, connected: false, persisted: false, session });
  } catch (error) {
    console.error("Classroom session API error:", error);
    return NextResponse.json({ error: "Failed to fetch classroom session" }, { status: 500 });
  }
}
