import { LearningOverview } from "@/components/learning/learning-overview";
import { SavedLearning } from "@/components/learning/saved-learning";
export default function MyLearning() { return <div className="space-y-6"><SavedLearning role="student" /><LearningOverview /></div>; }
