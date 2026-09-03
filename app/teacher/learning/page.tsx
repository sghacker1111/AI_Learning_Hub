import { LearningOverview } from "@/components/learning/learning-overview";
import { TeacherReport } from "@/components/learning/teacher-report";
import { DocumentLibrary } from "@/components/curriculum/document-library";
import { SavedLearning } from "@/components/learning/saved-learning";
export default function TeacherLearning() { return <div className="space-y-6"><TeacherReport /><details className="rounded-2xl border p-5"><summary className="cursor-pointer font-bold">My own learning</summary><div className="mt-5 space-y-5"><SavedLearning role="teacher" /><LearningOverview /></div></details><DocumentLibrary /></div>; }
