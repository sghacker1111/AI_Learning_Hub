import { LivePoll } from "./types";

export function getDefaultLivePoll(): LivePoll {
  return {
    id: "poll-vat-01",
    question: "If Marked Price = Rs. 2,000 and Discount = 10%, what is the 13% Nepal VAT amount?",
    questionNepali: "अंकित मूल्य रु. २,००० मा १०% छुट दिँदा १३% भ्याट रकम कति हुन्छ?",
    options: [
      { id: "opt-1", text: "Rs. 260 (Calculated on MP)", votesCount: 6, isCorrect: false },
      { id: "opt-2", text: "Rs. 234 (Calculated on SP = Rs. 1800)", votesCount: 28, isCorrect: true },
      { id: "opt-3", text: "Rs. 200 (Flat estimate)", votesCount: 2, isCorrect: false },
    ],
    totalVotes: 36,
    isActive: true,
    durationSeconds: 30,
  };
}
