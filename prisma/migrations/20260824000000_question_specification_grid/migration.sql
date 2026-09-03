ALTER TABLE "Question"
ADD COLUMN "specificationGridCode" TEXT;

CREATE INDEX "Question_specificationGridCode_idx" ON "Question"("specificationGridCode");
