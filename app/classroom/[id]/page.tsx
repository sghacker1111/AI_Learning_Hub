"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Share2,
  PhoneOff,
  MessageSquare,
  Bot,
  PieChart,
  Edit3,
  Circle,
  Square,
  Minus,
  Trash2,
  Send,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MathView } from "@/components/ui/math-view";
import { PRESET_FORMULA_STAMPS, WHITEBOARD_COLORS } from "@/lib/classroom/whiteboard";
import { getDefaultLivePoll } from "@/lib/classroom/polls";
import { getAICoTeacherSuggestions } from "@/lib/classroom/co-teacher";
import { WhiteboardTool, ChatMessage } from "@/lib/classroom/types";

export default function LiveClassroomWorkspace() {
  const [selectedTool, setSelectedTool] = React.useState<WhiteboardTool>("PEN");
  const [selectedColor, setSelectedColor] = React.useState(WHITEBOARD_COLORS[0]);
  const [stampedFormulas, setStampedFormulas] = React.useState<string[]>([
    "\\text{SP} = \\text{MP} - \\text{Discount}",
    "\\text{VAT Amount} = \\text{SP} \\times 0.13",
  ]);
  const [selectedFormulaIndex, setSelectedFormulaIndex] = React.useState(0);

  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isHandRaised, setIsHandRaised] = React.useState(false);

  const [activeSideTab, setActiveSideTab] = React.useState<"chat" | "ai" | "poll">("chat");

  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    {
      id: "m-1",
      senderId: "u-1",
      senderName: "Dr. Ram Prasad Subedi",
      senderRole: "TEACHER",
      content: "Namaste class! Today we will master how 13% VAT is applied strictly after discount.",
      timestamp: "10:00 AM",
    },
    {
      id: "m-2",
      senderId: "u-2",
      senderName: "Aarav Sharma",
      senderRole: "STUDENT",
      content: "Sir, what happens if the question gives Marked Price directly without discount?",
      timestamp: "10:02 AM",
      isQuestion: true,
    },
    {
      id: "m-3",
      senderId: "u-ai",
      senderName: "AI Co-Teacher",
      senderRole: "AI_ASSISTANT",
      content: "💡 Great question Aarav! If discount is 0%, then SP equals MP, so VAT is applied directly on MP.",
      timestamp: "10:02 AM",
    },
  ]);
  const [newMessage, setNewMessage] = React.useState("");

  const [poll, setPoll] = React.useState(() => getDefaultLivePoll());
  const [userVotedOption, setUserVotedOption] = React.useState<string | null>(null);

  const aiSuggestions = getAICoTeacherSuggestions("13% VAT");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "u-2",
      senderName: "Aarav Sharma (You)",
      senderRole: "STUDENT",
      content: newMessage,
      timestamp: "Just now",
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleVote = (optId: string) => {
    setUserVotedOption(optId);
    setPoll((prev) => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map((o) =>
        o.id === optId ? { ...o, votesCount: o.votesCount + 1 } : o
      ),
    }));
  };

  const handleStampFormula = () => {
    const formula = PRESET_FORMULA_STAMPS[selectedFormulaIndex].latex;
    setStampedFormulas((prev) => [...prev, formula]);
  };

  const handleClearWhiteboard = () => {
    setStampedFormulas([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="nepal" className="text-[10px] animate-pulse">
            LOCAL INTERFACE DEMO
          </Badge>
          <div>
            <h1 className="font-bold text-sm text-foreground">
              Class 8A: 13% Nepal VAT & Commercial Discount Masterclass
            </h1>
            <span className="text-[11px] text-muted-foreground">Teacher: Dr. Ram Prasad Subedi</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/40 text-xs font-semibold text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>38 sample profiles • not connected</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* CENTER: Mathematical Whiteboard Stage */}
        <div className="flex-1 flex flex-col bg-muted/30 p-4 relative overflow-hidden">
          {/* Whiteboard Floating Toolbar */}
          <div className="p-2 rounded-2xl bg-card border shadow-lg flex items-center justify-between gap-3 shrink-0 mb-3">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant={selectedTool === "PEN" ? "nepal" : "ghost"}
                size="sm"
                onClick={() => setSelectedTool("PEN")}
                className="h-8 w-8 p-0"
                title="Pen"
              >
                <Edit3 className="h-4 w-4" />
              </Button>

              <Button
                variant={selectedTool === "CIRCLE_VENN" ? "nepal" : "ghost"}
                size="sm"
                onClick={() => setSelectedTool("CIRCLE_VENN")}
                className="h-8 w-8 p-0"
                title="Venn Circle"
              >
                <Circle className="h-4 w-4" />
              </Button>

              <Button
                variant={selectedTool === "RECTANGLE" ? "nepal" : "ghost"}
                size="sm"
                onClick={() => setSelectedTool("RECTANGLE")}
                className="h-8 w-8 p-0"
                title="Rectangle"
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                variant={selectedTool === "LINE" ? "nepal" : "ghost"}
                size="sm"
                onClick={() => setSelectedTool("LINE")}
                className="h-8 w-8 p-0"
                title="Line"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1.5 px-2 border-x">
              {WHITEBOARD_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`h-5 w-5 rounded-full transition-all ${
                    selectedColor === c ? "ring-2 ring-primary scale-110" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* LaTeX Formula Stamp Inserter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedFormulaIndex}
                onChange={(e) => setSelectedFormulaIndex(parseInt(e.target.value, 10))}
                className="h-8 rounded-xl border border-input bg-background px-2 text-xs font-semibold focus:ring-1 focus:ring-primary"
              >
                {PRESET_FORMULA_STAMPS.map((f, idx) => (
                  <option key={f.id} value={idx}>
                    {f.label}
                  </option>
                ))}
              </select>

              <Button variant="outline" size="sm" onClick={handleStampFormula} className="h-8 text-xs font-semibold">
                <span>Stamp Formula</span>
              </Button>
            </div>

            {/* Clear Board */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWhiteboard}
              className="h-8 text-xs text-destructive hover:bg-destructive/10"
              title="Clear Canvas"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Clear</span>
            </Button>
          </div>

          {/* Whiteboard Interactive Canvas Viewport */}
          <div className="flex-1 rounded-2xl bg-card border shadow-inner p-6 overflow-auto relative space-y-4">
            <div className="absolute top-4 right-4 text-[10px] font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded-lg">
              Local state only • no network sync
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Teacher&apos;s Whiteboard Notes (शिक्षकको डिजिटल पाटी):
                </span>
              </div>

              {/* Rendered Stamped Formulas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stampedFormulas.map((latex, idx) => (
                  <Card
                    key={idx}
                    className="p-5 border-2 border-primary/30 bg-primary/5 shadow-sm space-y-2 flex flex-col justify-center items-center text-center animate-in fade-in"
                  >
                    <Badge variant="nepal" className="text-[10px]">
                      Step #{idx + 1}
                    </Badge>
                    <div className="font-mono text-base font-bold text-foreground py-2">
                      <MathView math={latex} displayMode={true} />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Sample Teacher Drawing Note */}
              <div className="p-4 rounded-xl border bg-muted/20 text-xs space-y-1 text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground">
                  Teacher Dr. Ram Prasad Subedi wrote:
                </p>
                <p>
                  1. Marked Price (MP) = Rs. 2,000 | Discount = 10%
                </p>
                <p>
                  2. Selling Price (SP) = 2000 - (10% of 2000) = Rs. 1,800
                </p>
                <p>
                  3. 13% Nepal VAT = 13% of Rs. 1,800 = <strong>Rs. 234</strong>
                </p>
                <p className="font-bold text-emerald-600">
                  Grand Total Paid by Customer = Rs. 1,800 + Rs. 234 = Rs. 2,034
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Collaboration & AI Co-Teacher */}
        <div className="w-80 lg:w-96 border-l bg-card flex flex-col shrink-0">
          {/* Sidebar Tabs Header */}
          <div className="flex items-center border-b p-1.5 gap-1 shrink-0 bg-muted/20">
            <button
              onClick={() => setActiveSideTab("chat")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeSideTab === "chat" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </button>

            <button
              onClick={() => setActiveSideTab("ai")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeSideTab === "ai" ? "bg-card shadow-sm text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span>AI Co-Teacher</span>
            </button>

            <button
              onClick={() => setActiveSideTab("poll")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeSideTab === "poll" ? "bg-card shadow-sm text-emerald-600" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PieChart className="h-3.5 w-3.5" />
              <span>Live Poll</span>
            </button>
          </div>

          {/* TAB 1: CHAT FEED */}
          {activeSideTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      msg.senderRole === "TEACHER"
                        ? "bg-primary/10 border-primary/20"
                        : msg.senderRole === "AI_ASSISTANT"
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-foreground">{msg.senderName}</span>
                      <span className="text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-foreground leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t flex items-center gap-2 bg-card">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="text-xs h-9"
                />
                <Button variant="nepal" size="sm" onClick={handleSendMessage} className="h-9 w-9 p-0 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: AI CO-TEACHER ASSISTANT */}
          {activeSideTab === "ai" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Bot className="h-4 w-4 text-primary" />
                  <span>Bundled Pedagogical Suggestions</span>
                </span>
                <Badge variant="subtle" className="text-[10px]">Static Sample</Badge>
              </div>

              {aiSuggestions.map((sug, idx) => (
                <Card key={idx} className="p-3.5 border bg-primary/5 space-y-1.5 shadow-sm">
                  <p className="text-xs text-foreground leading-relaxed">{sug}</p>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 3: LIVE POLL */}
          {activeSideTab === "poll" && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="space-y-1 border-b pb-3">
                <Badge variant="nepal" className="text-[10px]">
                  30-Second Rapid Check
                </Badge>
                <h4 className="font-bold text-sm text-foreground">{poll.question}</h4>
                <p className="text-xs text-primary font-nepali font-semibold">{poll.questionNepali}</p>
              </div>

              <div className="space-y-2.5">
                {poll.options.map((opt) => {
                  const percent = Math.round((opt.votesCount / poll.totalVotes) * 100);
                  const isSelected = userVotedOption === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !userVotedOption && handleVote(opt.id)}
                      disabled={!!userVotedOption}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "bg-muted/20 border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{opt.text}</span>
                        {userVotedOption && <span className="font-bold text-primary">{percent}%</span>}
                      </div>

                      {userVotedOption && <Progress value={percent} className="h-1.5" />}
                    </button>
                  );
                })}
              </div>

              {userVotedOption && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  ✓ Local preview updated; nothing was sent or persisted. Sample answer: <strong>Rs. 234</strong>.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="h-16 border-t bg-card px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="text-xs gap-1.5 h-9"
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-600" />}
            <span>{isMuted ? "Unmute" : "Mute"}</span>
          </Button>

          <Button
            variant={isVideoOn ? "outline" : "destructive"}
            size="sm"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="text-xs gap-1.5 h-9"
          >
            {isVideoOn ? <Video className="h-4 w-4 text-emerald-600" /> : <VideoOff className="h-4 w-4" />}
            <span>{isVideoOn ? "Stop Video" : "Start Video"}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isHandRaised ? "nepal" : "outline"}
            size="sm"
            onClick={() => setIsHandRaised(!isHandRaised)}
            className="text-xs gap-1.5 h-9"
          >
            <Hand className="h-4 w-4" />
            <span>{isHandRaised ? "Hand Raised" : "Raise Hand"}</span>
          </Button>

          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-9" disabled>
            <Share2 className="h-4 w-4" />
            <span>Share Unavailable</span>
          </Button>
        </div>

        <div>
          <Link href="/classroom">
            <Button variant="destructive" size="sm" className="text-xs gap-1.5 h-9 font-semibold">
              <PhoneOff className="h-4 w-4" />
              <span>Leave Class</span>
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
