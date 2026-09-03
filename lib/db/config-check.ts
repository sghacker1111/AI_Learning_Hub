/** Validate configuration without returning hosts, usernames, or credentials. */
export function inspectDatabaseConfiguration(env: Record<string, string | undefined>) {
  const errors: string[] = [];
  const urls: Partial<Record<"DATABASE_URL" | "DIRECT_URL", URL>> = {};
  const connections = (["DATABASE_URL", "DIRECT_URL"] as const).map((key) => {
    try {
      const url = new URL(env[key] || "");
      if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error();
      urls[key] = url;
      const neon = url.hostname.endsWith(".neon.tech");
      const pooled = url.hostname.includes("-pooler.");
      if (neon && !["require", "verify-full", "verify-ca"].includes(url.searchParams.get("sslmode") || "")) errors.push(`${key}: Neon requires TLS (sslmode=require).`);
      if (key === "DIRECT_URL" && neon && pooled) errors.push("DIRECT_URL: use the Neon direct endpoint; remove -pooler from its hostname or copy the unpooled URL from Neon.");
      return { key, configured: true, neon, pooled };
    } catch {
      errors.push(`${key}: a valid PostgreSQL connection URL is required.`);
      return { key, configured: false, neon: false, pooled: false };
    }
  });
  const runtime = urls.DATABASE_URL, direct = urls.DIRECT_URL;
  if (runtime && direct) {
    const host = (url: URL) => url.hostname.replace("-pooler.", ".");
    if (host(runtime) !== host(direct) || runtime.pathname !== direct.pathname || (runtime.searchParams.get("schema") || "public") !== (direct.searchParams.get("schema") || "public")) errors.push("DATABASE_URL and DIRECT_URL must identify the same endpoint, database and schema.");
  }
  return { connections, errors };
}
