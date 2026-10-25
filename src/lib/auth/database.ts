import "server-only";
import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & { rinkleAuthPool?: Pool };
export function authPool() {
  if (!globalDatabase.rinkleAuthPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is required");
    globalDatabase.rinkleAuthPool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 20_000, connectionTimeoutMillis: 10_000 });
    // Never log connection configuration, credentials, query values or session tokens.
    globalDatabase.rinkleAuthPool.on("error", () => console.error("Authentication database connection failed"));
  }
  return globalDatabase.rinkleAuthPool;
}
