import { withStaffPermission } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const GET = withStaffPermission("dashboard.view", async (_request, staff) => Response.json({ staff }));
