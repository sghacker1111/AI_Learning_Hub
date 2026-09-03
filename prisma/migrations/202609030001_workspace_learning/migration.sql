CREATE TABLE "LearningActivity" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "kind" TEXT NOT NULL,
  "grade" TEXT NOT NULL, "subject" TEXT NOT NULL, "chapterId" TEXT NOT NULL, "chapter" TEXT NOT NULL,
  "topic" TEXT NOT NULL DEFAULT '', "question" TEXT NOT NULL DEFAULT '', "answer" TEXT NOT NULL DEFAULT '',
  "durationSeconds" INTEGER NOT NULL DEFAULT 0, "score" DOUBLE PRECISION, "maxScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LearningActivity_pkey" PRIMARY KEY ("userId", "id"),
  CONSTRAINT "LearningActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "LearningActivity_userId_createdAt_idx" ON "LearningActivity"("userId", "createdAt");
CREATE TABLE "SpecificationGrid" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "title" TEXT NOT NULL,
  "gradeId" TEXT NOT NULL, "subjectId" TEXT NOT NULL, "fullMarks" INTEGER NOT NULL,
  "durationMinutes" INTEGER NOT NULL, "rows" JSONB NOT NULL, "source" TEXT NOT NULL DEFAULT '',
  "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SpecificationGrid_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SpecificationGrid_code_key" ON "SpecificationGrid"("code");
CREATE INDEX "SpecificationGrid_gradeId_subjectId_idx" ON "SpecificationGrid"("gradeId", "subjectId");
ALTER TABLE "Question" ADD COLUMN "isExamQuestion" BOOLEAN NOT NULL DEFAULT false;
