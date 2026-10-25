import { authSettings } from "@/lib/auth/options";
import { getAuth } from "@/lib/auth/server";
import { authPool } from "@/lib/auth/database";
import { clientBucket, consumeLimit } from "@/lib/auth/rate-limit";
import { requireStaff } from "@/lib/auth/guards";
import { staffAuthRequest } from "@/lib/auth/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handler(request: Request) {
  try {
    const settings = authSettings(process.env);
    return await staffAuthRequest(request, {
      origin: settings.origin,
      authenticate: requireStaff,
      handle: async (forwarded) => {
        const auth = getAuth("staff");
        if (new URL(forwarded.url).pathname.endsWith("/sign-out")) {
          // Better Auth clears cookies even when its deletion fails. Require the
          // database revocation to succeed before reporting logout success.
          const session = await auth.api.getSession({ headers: forwarded.headers });
          if (session) await authPool().query("DELETE FROM staff_sessions WHERE token = $1", [session.session.token]);
        }
        return auth.handler(forwarded);
      },
      limit: async (incoming, path, email) => {
        const ipAllowed = await consumeLimit(authPool(), settings.staffSecret, `staff:${path}:ip`, clientBucket(incoming, process.env), email ? 30 : 120, email ? 900 : 60);
        if (!ipAllowed) return false;
        return !email || consumeLimit(authPool(), settings.staffSecret, "staff:sign-in:email", email, 10, 900);
      },
    });
  } catch { return Response.json({ error: "AUTH_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
export { handler as GET, handler as POST };
