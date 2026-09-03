import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { RoleCode, UserStatus } from "@prisma/client";

export const SESSION_COOKIE_NAME = "ai_nepal_session";
const JWT_ISSUER = "ai-learning-nepal";
const JWT_AUDIENCE = "ai-learning-nepal-web";

function getJwtSecret(): Uint8Array {
  const configuredSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
  const secret =
    configuredSecret ||
    (process.env.NODE_ENV !== "production"
      ? "development_secret_key_change_in_production_min_32_chars"
      : "");

  if (secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be configured with at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: RoleCode;
  status: UserStatus;
  schoolId?: string | null;
  preferredLanguage?: string;
  [key: string]: unknown;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !Object.values(RoleCode).includes(payload.role as RoleCode) ||
      !Object.values(UserStatus).includes(payload.status as UserStatus)
    ) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
