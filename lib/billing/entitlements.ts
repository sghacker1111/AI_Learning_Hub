import { RoleCode, SchoolSubscriptionStatus } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { bundleHasFeature, SchoolFeature } from "./school-bundles";
import { isDemoAuthEnabled } from "@/lib/auth/demo-policy";

export type EntitlementResult = {
  allowed: boolean;
  bundleCode?: string;
  reason?: string;
};

export async function checkSchoolFeature(
  session: SessionPayload,
  feature: SchoolFeature
): Promise<EntitlementResult> {
  if (session.role === RoleCode.SUPER_ADMIN) return { allowed: true, bundleCode: "PLATFORM_ADMIN" };

  if (!session.schoolId) {
    if (isDemoAuthEnabled() && session.userId.startsWith("dev-")) {
      return { allowed: true, bundleCode: "DEVELOPMENT_DEMO" };
    }
    return { allowed: false, reason: "This account is not assigned to a school subscription." };
  }

  try {
    const school = await prisma.school.findUnique({ where: { id: session.schoolId }, select: { status: true } });
    if (!school || school.status !== "ACTIVE") return { allowed: false, reason: "The school account is not active." };
    const subscription = await prisma.schoolSubscription.findUnique({ where: { schoolId: session.schoolId } });
    if (!subscription) return { allowed: false, reason: "No school bundle is assigned." };
    const active =
      subscription.status === SchoolSubscriptionStatus.ACTIVE ||
      subscription.status === SchoolSubscriptionStatus.TRIALING;
    const unexpired = !subscription.endsAt || subscription.endsAt > new Date();
    if (!active || !unexpired) return { allowed: false, bundleCode: subscription.bundleCode, reason: "The school subscription is not active." };
    if (!bundleHasFeature(subscription.bundleCode, feature)) {
      return { allowed: false, bundleCode: subscription.bundleCode, reason: "The selected school bundle does not include this feature." };
    }
    return { allowed: true, bundleCode: subscription.bundleCode };
  } catch (error) {
    console.error("School entitlement lookup failed:", error);
    return { allowed: false, reason: "Subscription access could not be verified." };
  }
}
