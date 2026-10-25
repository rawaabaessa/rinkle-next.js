import "server-only";
import { betterAuth } from "better-auth";
import { authPool } from "./database";
import { authOptions, authSettings, type Realm } from "./options";

const instances: Partial<Record<Realm, ReturnType<typeof betterAuth>>> = {};
export function getAuth(realm: Realm) {
  return instances[realm] ??= betterAuth(authOptions(realm, authSettings(process.env), authPool(), async (id) => {
    // Customers cannot acquire a session until the SMS integration is implemented.
    if (realm === "customer") return false;
    const result = await authPool().query("SELECT 1 FROM staff_members WHERE id = $1 AND status = 'active'", [id]);
    return result.rowCount === 1;
  }));
}
