-- Additive only: preserve every existing activity and the existing primary key.
-- Do not guess an old record's school from a user's current memberships.
-- Historical NULL records require explicit, reviewed attribution by an operator.
ALTER TABLE "LearningActivity" ADD COLUMN "schoolId" TEXT;
CREATE INDEX "LearningActivity_userId_schoolId_createdAt_idx"
ON "LearningActivity"("userId", "schoolId", "createdAt");
