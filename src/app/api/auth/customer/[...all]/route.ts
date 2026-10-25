import { customerAuthUnavailable } from "@/lib/auth/http";

// Intentionally no environment flag can open OTP verification or signup.
// Selecting and implementing an SMS provider requires a reviewed code change.
export const GET = customerAuthUnavailable;
export const POST = customerAuthUnavailable;
