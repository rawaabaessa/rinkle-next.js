import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { emitKeypressEvents } from "node:readline";
import { Pool } from "pg";
import { ZodError } from "zod";
import { bootstrapOwner, validateBootstrapTarget } from "../src/lib/auth/bootstrap";

let stage = "environment validation";

async function hiddenPassword(prompt: string): Promise<string> {
  const input = process.stdin;
  process.stdout.write(prompt);
  emitKeypressEvents(input);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => { input.setRawMode(false); input.removeListener("keypress", onKey); input.pause(); process.stdout.write("\n"); };
    const onKey = (text: string, key: { ctrl?: boolean; name?: string }) => {
      if (key.ctrl && key.name === "c") { finish(); reject(new Error("Cancelled")); }
      else if (key.name === "return") { finish(); resolve(value); }
      else if (key.name === "backspace") value = value.slice(0, -1);
      else if (text && !key.ctrl && !/[\x00-\x1f\x7f]/.test(text)) value += text;
    };
    input.on("keypress", onKey);
  });
}

async function main() {
  if (!process.argv.includes("--execute")) {
    console.log("Prepared only. After reviewing/applying the migration, run npm run auth:bootstrap -- --execute from an interactive local terminal. Requires AUTH_ENVIRONMENT=development and NEON_DEVELOPMENT_HOST matching DATABASE_URL. No database was contacted.");
    return;
  }
  validateBootstrapTarget(process.env);
  stage = "interactive terminal check";
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Use an interactive terminal; credentials are never accepted as command arguments");
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  stage = "credential input";
  const name = await terminal.question("Owner name: ");
  const email = (await terminal.question("Owner email: ")).trim();
  terminal.close();
  const password = await hiddenPassword("Password (16–128 characters, hidden): ");
  const confirmation = await hiddenPassword("Repeat password (hidden): ");
  if (password !== confirmation) throw new Error("Passwords do not match");
  stage = "input validation and database transaction";
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10_000 });
  try { await bootstrapOwner(pool, { name, email, password }); console.log("Owner created. No session was created; sign in through /admin/login."); }
  finally { await pool.end(); }
}
main().catch((error: unknown) => {
  // Only fixed, allowlisted messages: database errors can contain credentials or row values.
  let reason = "Unexpected failure. No raw error details were logged.";
  if (error instanceof ZodError) {
    const fields = new Set(error.issues.map((issue) => issue.path[0]));
    const hints = [
      fields.has("name") ? "Name must contain 1–80 characters." : "",
      fields.has("email") ? "Enter a valid email, no longer than 150 characters." : "",
      fields.has("password") ? "Password must contain 16–128 characters." : "",
    ].filter(Boolean);
    reason = hints.join(" ") || "Invalid account input.";
  } else if (error instanceof Error) {
    const knownMessages = [
      "Passwords do not match", "Cancelled",
      "An owner already exists; bootstrap cannot be repeated",
      "The approved owner role must exist before bootstrap",
      "Bootstrap is restricted to a local Development operation",
      "The database must match the explicitly confirmed NEON_DEVELOPMENT_HOST with TLS",
      "Use an interactive terminal; credentials are never accepted as command arguments",
    ];
    const code = "code" in error ? error.code : undefined;
    const databaseHints: Record<string, string> = {
      "42P01": "A required database table is missing. Check the authentication migrations on Development.",
      "42703": "A required database column is missing. Check the Better Auth migration on Development.",
      "23505": "A unique value already exists (owner, email, or account). No existing account was replaced.",
      "23503": "A required database relationship is missing. Check the owner role and authentication schema.",
      "23502": "The database requires a value not supplied by bootstrap. Check schema/migration compatibility.",
      "23514": "A database constraint rejected the account. Check schema/migration compatibility.",
      "28P01": "Database login failed. Check the Development connection credentials locally.",
      "42501": "The database connection role lacks permission for this operation.",
      "3D000": "The configured database does not exist.",
      ENOTFOUND: "Database hostname could not be resolved. Check the Development hostname and network.",
      ECONNREFUSED: "The database connection was refused.",
      ETIMEDOUT: "The database connection timed out.",
      ECONNRESET: "The database connection was interrupted. Verify account state before retrying.",
    };
    if (knownMessages.includes(error.message)) reason = error.message;
    else if (typeof code === "string" && Object.hasOwn(databaseHints, code)) reason = `[${code}] ${databaseHints[code]}`;
    else if (code === "ERR_INVALID_URL") reason = "DATABASE_URL is not a valid connection URL.";
  }
  console.error(`Bootstrap stopped during ${stage}. ${reason} No credentials were logged.`);
  process.exitCode = 1;
});
