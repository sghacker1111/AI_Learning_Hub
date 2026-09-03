import type { NextConfig } from "next";

const integrationTest = process.env.GURU_INTEGRATION_TEST === "true";

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  output: "standalone",
  // The disposable test app must not acquire the user's running dev-server lock.
  distDir: integrationTest ? ".test-data/next-integration" : ".next",
  serverExternalPackages: ["unpdf"],
  outputFileTracingIncludes: { "/api/documents": ["./services/pdf/extract.mjs", "./node_modules/unpdf/**/*"] },
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: integrationTest ? "tsconfig.integration.json" : "tsconfig.json",
  },
};

export default nextConfig;
