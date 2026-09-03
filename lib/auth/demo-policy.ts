/** Real installations opt out by default, including when the database is offline. */
export function isDemoAuthEnabled(env: Record<string, string | undefined> = process.env) {
  return env.NODE_ENV !== "production" && env.ALLOW_DEMO_AUTH === "true";
}
