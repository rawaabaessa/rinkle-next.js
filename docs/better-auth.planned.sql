-- REVIEW ONLY. Not applied. Prisma Contract owns execution.
-- From applied 20261018T1328_init_authentication to 20261018T1518_add_better_auth.

CREATE TABLE "public"."auth_rate_limits" (
  "count" int4 NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "key" text NOT NULL,
  PRIMARY KEY ("key"),
  CONSTRAINT "auth_rate_limits_positive_2202e1ab" CHECK (count > 0)
);

CREATE TABLE "public"."customer_accounts" (
  "access_token" text,
  "access_token_expires_at" timestamptz,
  "account_id" text NOT NULL,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "id_token" text,
  "password" text,
  "provider_id" text NOT NULL,
  "refresh_token" text,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "user_id" uuid NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."customer_sessions" (
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "ip_address" text,
  "token" text NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "user_agent" text,
  "user_id" uuid NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."customer_verifications" (
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "identifier" text NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "value" text NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."staff_accounts" (
  "access_token" text,
  "access_token_expires_at" timestamptz,
  "account_id" text NOT NULL,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "id_token" text,
  "password" text,
  "provider_id" text NOT NULL,
  "refresh_token" text,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "user_id" uuid NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."staff_sessions" (
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "ip_address" text,
  "token" text NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "user_agent" text,
  "user_id" uuid NOT NULL,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."staff_verifications" (
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "identifier" text NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  "value" text NOT NULL,
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."staff_members" ADD COLUMN "email_verified" bool DEFAULT false NOT NULL;

ALTER TABLE "public"."staff_members" ADD COLUMN "image" text;

ALTER TABLE "public"."users" ADD COLUMN "auth_email" text;

ALTER TABLE "public"."users" ADD COLUMN "email_verified" bool DEFAULT false NOT NULL;

ALTER TABLE "public"."users" ADD COLUMN "image" text;

ALTER TABLE "public"."users" ADD COLUMN "phone_verified" bool DEFAULT false NOT NULL;

ALTER TABLE "public"."customer_accounts" ADD CONSTRAINT "customer_accounts_provider_id_account_id_key" UNIQUE ("provider_id", "account_id");

ALTER TABLE "public"."customer_accounts" ADD CONSTRAINT "customer_accounts_user_id_provider_id_key" UNIQUE ("user_id", "provider_id");

ALTER TABLE "public"."customer_sessions" ADD CONSTRAINT "customer_sessions_token_key" UNIQUE ("token");

ALTER TABLE "public"."staff_accounts" ADD CONSTRAINT "staff_accounts_provider_id_account_id_key" UNIQUE ("provider_id", "account_id");

ALTER TABLE "public"."staff_accounts" ADD CONSTRAINT "staff_accounts_user_id_provider_id_key" UNIQUE ("user_id", "provider_id");

ALTER TABLE "public"."staff_sessions" ADD CONSTRAINT "staff_sessions_token_key" UNIQUE ("token");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_auth_email_key" UNIQUE ("auth_email");

CREATE INDEX "auth_rate_limits_expires_at_idx_35365ada" ON "public"."auth_rate_limits" ("expires_at");

CREATE INDEX "customer_accounts_user_id_idx_6c952402" ON "public"."customer_accounts" ("user_id");

CREATE INDEX "customer_sessions_expires_at_idx_35365ada" ON "public"."customer_sessions" ("expires_at");

CREATE INDEX "customer_sessions_user_id_idx_6c952402" ON "public"."customer_sessions" ("user_id");

CREATE INDEX "customer_verifications_expires_at_idx_35365ada" ON "public"."customer_verifications" ("expires_at");

CREATE INDEX "customer_verifications_identifier_idx_79a0dbb3" ON "public"."customer_verifications" ("identifier");

CREATE INDEX "staff_accounts_user_id_idx_6c952402" ON "public"."staff_accounts" ("user_id");

CREATE INDEX "staff_sessions_expires_at_idx_35365ada" ON "public"."staff_sessions" ("expires_at");

CREATE INDEX "staff_sessions_user_id_idx_6c952402" ON "public"."staff_sessions" ("user_id");

CREATE INDEX "staff_verifications_expires_at_idx_35365ada" ON "public"."staff_verifications" ("expires_at");

CREATE INDEX "staff_verifications_identifier_idx_79a0dbb3" ON "public"."staff_verifications" ("identifier");

ALTER TABLE "public"."customer_accounts"
ADD CONSTRAINT "customer_accounts_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."users" ("id")
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE "public"."customer_sessions"
ADD CONSTRAINT "customer_sessions_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."users" ("id")
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE "public"."staff_accounts"
ADD CONSTRAINT "staff_accounts_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."staff_members" ("id")
ON DELETE CASCADE
ON UPDATE RESTRICT;

ALTER TABLE "public"."staff_sessions"
ADD CONSTRAINT "staff_sessions_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."staff_members" ("id")
ON DELETE CASCADE
ON UPDATE RESTRICT;
