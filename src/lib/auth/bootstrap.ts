import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import type { Pool } from "pg";
import { newPassword } from "./policy";

const ownerInput = z.object({ name: z.string().trim().min(1).max(80), email: z.email().max(150).transform((email) => email.toLowerCase()), password: newPassword });
export function validateBootstrapTarget(env: Partial<NodeJS.ProcessEnv>) {
  if (env.AUTH_ENVIRONMENT !== "development" || env.NODE_ENV === "production" || env.VERCEL) throw new Error("Bootstrap is restricted to a local Development operation");
  const target = new URL(env.DATABASE_URL ?? "");
  if (!target.hostname.endsWith(".neon.tech") || target.hostname !== env.NEON_DEVELOPMENT_HOST || !target.searchParams.get("sslmode") || target.searchParams.get("sslmode") === "disable") throw new Error("The database must match the explicitly confirmed NEON_DEVELOPMENT_HOST with TLS");
}

export async function bootstrapOwner(pool: Pool, input: unknown) {
  const owner = ownerInput.parse(input);
  const passwordHash = await hashPassword(owner.password);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(742691038)");
    const existing = await client.query("SELECT 1 FROM staff_members WHERE role_code = 'owner'");
    if (existing.rowCount) throw new Error("An owner already exists; bootstrap cannot be repeated");
    const role = await client.query("SELECT 1 FROM roles WHERE code = 'owner'");
    if (role.rowCount !== 1) throw new Error("The approved owner role must exist before bootstrap");
    const id = randomUUID();
    await client.query(`INSERT INTO staff_members (id, name, email, role_code, status, auth_provider, auth_subject, email_verified)
      VALUES ($1, $2, $3, 'owner', 'active', 'better-auth', $1::text, false)`, [id, owner.name, owner.email]);
    await client.query(`INSERT INTO staff_accounts (id, user_id, account_id, provider_id, password)
      VALUES ($1, $2, $2::text, 'credential', $3)`, [randomUUID(), id, passwordHash]);
    await client.query("COMMIT");
    return id;
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
