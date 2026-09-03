CREATE TYPE "SchoolBundleCode" AS ENUM ('FULL_SCHOOL_AI', 'AI_TUTOR_ONLY', 'EXAM_GENERATOR_ONLY', 'ASSESSMENT_SUITE', 'CORE_SCHOOL_PLATFORM');
CREATE TYPE "SchoolSubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');
CREATE TYPE "SubscriptionBillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

CREATE TABLE "SchoolSubscription" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "bundleCode" "SchoolBundleCode" NOT NULL,
    "status" "SchoolSubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billingCycle" "SubscriptionBillingCycle" NOT NULL DEFAULT 'ANNUAL',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'MANUAL_ADMIN',
    "providerCustomerId" TEXT,
    "providerSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SchoolSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolSubscription_schoolId_key" ON "SchoolSubscription"("schoolId");
CREATE INDEX "SchoolSubscription_status_idx" ON "SchoolSubscription"("status");
CREATE INDEX "SchoolSubscription_bundleCode_idx" ON "SchoolSubscription"("bundleCode");

ALTER TABLE "SchoolSubscription" ADD CONSTRAINT "SchoolSubscription_schoolId_fkey"
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
