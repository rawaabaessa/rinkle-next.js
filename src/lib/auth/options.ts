import { randomUUID } from "node:crypto";
import type { BetterAuthOptions } from "better-auth";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { APIError } from "better-auth/api";
import { customerPhone } from "./policy";

export type Realm = "staff" | "customer";
export type AuthSettings = {
  origin: string;
  staffSecret: string;
  customerSecret: string;
  secure: boolean;
};

export function authSettings(env: Partial<NodeJS.ProcessEnv>): AuthSettings {
  const origin = new URL(env.AUTH_ORIGIN ?? "http://localhost:3000");
  if (
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    origin.username ||
    origin.password
  )
    throw new Error("AUTH_ORIGIN must contain only a trusted origin");
  if (
    origin.protocol !== "https:" &&
    (env.NODE_ENV === "production" ||
      !["localhost", "127.0.0.1"].includes(origin.hostname))
  )
    throw new Error("Authentication requires HTTPS outside local development");
  const staffSecret = env.STAFF_AUTH_SECRET ?? "";
  const customerSecret = env.CUSTOMER_AUTH_SECRET ?? "";
  if (
    staffSecret.length < 32 ||
    customerSecret.length < 32 ||
    staffSecret === customerSecret
  )
    throw new Error(
      "Configure two distinct random authentication secrets (at least 32 characters)",
    );
  return {
    origin: origin.origin,
    staffSecret,
    customerSecret,
    secure: origin.protocol === "https:",
  };
}

// Pure configuration factory also used by the isolated security tests.
export function authOptions(
  realm: Realm,
  settings: AuthSettings,
  database: BetterAuthOptions["database"],
  isActive: (id: string) => Promise<boolean>,
): BetterAuthOptions {
  const staff = realm === "staff";
  const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };
  return {
    appName: staff ? "Rinkle Staff" : "Rinkle Customers",
    baseURL: settings.origin,
    basePath: `/api/auth/${realm}`,
    secret: staff ? settings.staffSecret : settings.customerSecret,
    trustedOrigins: [settings.origin],
    database,
    logger: { level: "error", log: () => console.error("Authentication operation failed") },
    emailAndPassword: {
      enabled: staff,
      disableSignUp: true,
      minPasswordLength: 16,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    user: {
      modelName: staff ? "staff_members" : "users",
      fields: {
        ...timestamps,
        email: staff ? "email" : "auth_email",
        emailVerified: "email_verified",
      },
      additionalFields: staff
        ? {
            roleCode: {
              type: "string",
              required: true,
              input: false,
              returned: false,
              fieldName: "role_code",
            },
            status: {
              type: "string",
              required: true,
              input: false,
              returned: false,
              defaultValue: "invited",
            },
          }
        : {},
      changeEmail: { enabled: false },
      deleteUser: { enabled: false },
    },
    session: {
      modelName: `${realm}_sessions`,
      fields: {
        ...timestamps,
        userId: "user_id",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
      },
      expiresIn: staff ? 8 * 60 * 60 : 7 * 24 * 60 * 60,
      updateAge: 15 * 60,
      freshAge: 30 * 60,
      cookieCache: { enabled: false },
    },
    account: {
      modelName: `${realm}_accounts`,
      fields: {
        ...timestamps,
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
      },
      accountLinking: { enabled: false },
    },
    verification: {
      modelName: `${realm}_verifications`,
      fields: { ...timestamps, expiresAt: "expires_at" },
    },
    // The HTTP boundary uses an atomic PostgreSQL limiter, including per-email limits.
    rateLimit: { enabled: false },
    advanced: {
      database: { generateId: "uuid" },
      cookiePrefix: `rinkle-${realm}`,
      useSecureCookies: settings.secure,
      defaultCookieAttributes: {
        httpOnly: true,
        secure: settings.secure,
        sameSite: "lax",
        path: "/",
      },
      ipAddress: { ipAddressHeaders: [] },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            if (!(await isActive(session.userId))) return false;
          },
        },
      },
    },
    disabledPaths: [
      "/sign-up/email",
      "/update-user",
      "/change-email",
      "/delete-user",
      "/link-social",
      "/sign-in/social",
    ],
    plugins: staff
      ? []
      : [
          phoneNumber({
            otpLength: 6,
            expiresIn: 300,
            allowedAttempts: 5,
            requireVerification: true,
            phoneNumberValidator: (phone) =>
              customerPhone.safeParse(phone).success &&
              customerPhone.parse(phone) === phone,
            schema: {
              user: {
                fields: {
                  phoneNumber: "phone",
                  phoneNumberVerified: "phone_verified",
                },
              },
            },
            signUpOnVerification: {
              getTempEmail: () => `${randomUUID()}@customer.rinkle.invalid`,
              getTempName: () => "عميل رينكل",
            },
            // Deliberately no provider or verification override. HTTP endpoints are also closed.
            sendOTP: async () => {
              throw new APIError("SERVICE_UNAVAILABLE", {
                message: "SMS_PROVIDER_NOT_CONFIGURED",
              });
            },
            callbackOnVerification: async () => {
              throw new APIError("SERVICE_UNAVAILABLE", {
                message: "SMS_PROVIDER_NOT_CONFIGURED",
              });
            },
          }),
        ],
  };
}
