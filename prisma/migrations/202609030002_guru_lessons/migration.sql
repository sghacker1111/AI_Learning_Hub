-- CreateTable
CREATE TABLE "GuruLesson" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "objective" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "persona" TEXT NOT NULL DEFAULT 'ram_sir',
    "curriculumOnly" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "pendingQuestion" TEXT,
    "activeTurnId" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "masteryBefore" INTEGER NOT NULL DEFAULT 0,
    "masteryAfter" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "GuruLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuruTurn" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'MESSAGE',
    "input" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "interrupted" BOOLEAN NOT NULL DEFAULT false,
    "assessment" JSONB,
    "sources" JSONB,
    "whiteboard" JSONB,
    "provider" TEXT,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GuruTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuruLessonEvent" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuruLessonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuruMastery" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "partial" INTEGER NOT NULL DEFAULT 0,
    "incorrect" INTEGER NOT NULL DEFAULT 0,
    "hints" INTEGER NOT NULL DEFAULT 0,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuruMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAssignment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumDocument" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'en',
    "documentType" TEXT NOT NULL DEFAULT 'LESSON_NOTE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sha256" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "embeddingModel" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[] DEFAULT ARRAY[]::DOUBLE PRECISION[],
    "embeddingModel" TEXT,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingSettings" (
    "id" TEXT NOT NULL DEFAULT 'platform',
    "value" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuruLesson_studentId_schoolId_updatedAt_idx" ON "GuruLesson"("studentId", "schoolId", "updatedAt");

-- CreateIndex
CREATE INDEX "GuruLesson_schoolId_grade_subject_updatedAt_idx" ON "GuruLesson"("schoolId", "grade", "subject", "updatedAt");

-- CreateIndex
CREATE INDEX "GuruTurn_lessonId_createdAt_idx" ON "GuruTurn"("lessonId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuruTurn_lessonId_requestId_key" ON "GuruTurn"("lessonId", "requestId");

-- CreateIndex
CREATE INDEX "GuruLessonEvent_lessonId_createdAt_idx" ON "GuruLessonEvent"("lessonId", "createdAt");

-- CreateIndex
CREATE INDEX "GuruMastery_schoolId_grade_subject_updatedAt_idx" ON "GuruMastery"("schoolId", "grade", "subject", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuruMastery_studentId_schoolId_grade_subject_chapterId_topi_key" ON "GuruMastery"("studentId", "schoolId", "grade", "subject", "chapterId", "topic", "objective");

-- CreateIndex
CREATE INDEX "TeacherAssignment_teacherId_schoolId_idx" ON "TeacherAssignment"("teacherId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_schoolId_teacherId_grade_subject_sectionI_key" ON "TeacherAssignment"("schoolId", "teacherId", "grade", "subject", "sectionId");

-- CreateIndex
CREATE INDEX "CurriculumDocument_schoolId_grade_subject_chapter_status_idx" ON "CurriculumDocument"("schoolId", "grade", "subject", "chapter", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_ordinal_key" ON "DocumentChunk"("documentId", "ordinal");

-- AddForeignKey
ALTER TABLE "GuruLesson" ADD CONSTRAINT "GuruLesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruTurn" ADD CONSTRAINT "GuruTurn_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GuruLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruLessonEvent" ADD CONSTRAINT "GuruLessonEvent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "GuruLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuruMastery" ADD CONSTRAINT "GuruMastery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CurriculumDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
