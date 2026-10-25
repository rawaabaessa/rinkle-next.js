import { createHmac } from "node:crypto";
import type { Pool } from "pg";

export type QueryDatabase = Pick<Pool, "query">;
export async function consumeLimit(database: QueryDatabase, secret: string, bucket: string, identifier: string, limit: number, windowSeconds: number) {
  const key = createHmac("sha256", secret).update(`${bucket}\0${identifier}`).digest("hex");
  // A single statement serializes concurrent attempts, including across server instances.
  const result = await database.query<{ count: number }>(`
    INSERT INTO auth_rate_limits (key, count, expires_at)
    VALUES ($1, 1, now() + $2 * interval '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN auth_rate_limits.expires_at <= now() THEN 1 ELSE LEAST(auth_rate_limits.count + 1, $3 + 1) END,
      expires_at = CASE WHEN auth_rate_limits.expires_at <= now() THEN EXCLUDED.expires_at ELSE auth_rate_limits.expires_at END
    RETURNING count`, [key, windowSeconds, limit]);
  return result.rows[0].count <= limit;
}

export function clientBucket(request: Request, env: Partial<NodeJS.ProcessEnv>) {
  // Only trust the header overwritten by Vercel on its own runtime. Other hosting
  // needs an explicitly reviewed proxy policy; until then use a shared limit.
  return env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "shared" : "shared";
}
