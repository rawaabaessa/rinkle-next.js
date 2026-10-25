-- HISTORICAL ONLY: superseded by the user-applied 20261018T1328_init_authentication.
-- Do not run this old User/Post-era plan. See better-auth.planned.sql for the current proposal.
-- REVIEW ONLY. NOT APPLIED. Generated from the named migration ops.json.
-- Use the reviewed Prisma migration workflow after explicit approval; this preview does not track history.
-- Origin: existing User/Post contract, not a verified live Neon schema.

CREATE TABLE "public"."permissions" (
  "code" text NOT NULL,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "description" text,
  "name" character varying(100) NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  PRIMARY KEY ("code")
);

CREATE TABLE "public"."role_permissions" (
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "permission_code" text NOT NULL,
  "role_code" text NOT NULL,
  PRIMARY KEY ("role_code", "permission_code")
);

CREATE TABLE "public"."roles" (
  "code" text NOT NULL,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "description" text,
  "name" character varying(80) NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  PRIMARY KEY ("code")
);

CREATE TABLE "public"."staff_members" (
  "auth_provider" text,
  "auth_subject" text,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "email" character varying(150) NOT NULL,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "last_login_at" timestamptz,
  "name" character varying(80) NOT NULL,
  "role_code" text NOT NULL,
  "status" text DEFAULT 'invited' NOT NULL,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "staff_members_auth_identity_pair_1317e15e" CHECK ((auth_provider IS NULL) = (auth_subject IS NULL)),
  CONSTRAINT "staff_members_email_lowercase_9b410a78" CHECK (email = lower(email)),
  CONSTRAINT "staff_members_owner_active_d2f51121" CHECK (role_code <> 'owner' OR status = 'active'),
  CONSTRAINT "staff_members_status_8e0d6579" CHECK (status IN ('invited', 'active', 'paused'))
);

CREATE TABLE "public"."users" (
  "auth_provider" text,
  "auth_subject" text,
  "created_at" timestamptz DEFAULT (now()) NOT NULL,
  "deleted_at" timestamptz,
  "id" uuid DEFAULT (gen_random_uuid()) NOT NULL,
  "last_login_at" timestamptz,
  "name" character varying(100),
  "phone" character varying(16) NOT NULL,
  "phone_verified_at" timestamptz,
  "updated_at" timestamptz DEFAULT (now()) NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "users_auth_identity_pair_1317e15e" CHECK ((auth_provider IS NULL) = (auth_subject IS NULL))
);

ALTER TABLE "public"."staff_members" ADD CONSTRAINT "staff_members_email_key" UNIQUE ("email");

ALTER TABLE "public"."staff_members" ADD CONSTRAINT "staff_members_auth_provider_auth_subject_key" UNIQUE ("auth_provider", "auth_subject");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");

ALTER TABLE "public"."users" ADD CONSTRAINT "users_auth_provider_auth_subject_key" UNIQUE ("auth_provider", "auth_subject");

CREATE INDEX "role_permissions_permission_code_idx_8904843b" ON "public"."role_permissions" ("permission_code");

CREATE INDEX "role_permissions_permission_role_9eb168b8" ON "public"."role_permissions" ("permission_code", "role_code");

CREATE INDEX "role_permissions_role_code_idx_60d65c2f" ON "public"."role_permissions" ("role_code");

CREATE INDEX "staff_members_role_code_idx_60d65c2f" ON "public"."staff_members" ("role_code");

CREATE INDEX "staff_members_role_status_01d327e0" ON "public"."staff_members" ("role_code", "status");

CREATE UNIQUE INDEX "staff_members_single_owner_833f137c" ON "public"."staff_members" ("role_code") WHERE (role_code = 'owner');

ALTER TABLE "public"."role_permissions"
ADD CONSTRAINT "role_permissions_role_code_fkey"
FOREIGN KEY ("role_code")
REFERENCES "public"."roles" ("code")
ON DELETE RESTRICT
ON UPDATE RESTRICT;

ALTER TABLE "public"."role_permissions"
ADD CONSTRAINT "role_permissions_permission_code_fkey"
FOREIGN KEY ("permission_code")
REFERENCES "public"."permissions" ("code")
ON DELETE RESTRICT
ON UPDATE RESTRICT;

ALTER TABLE "public"."staff_members"
ADD CONSTRAINT "staff_members_role_code_fkey"
FOREIGN KEY ("role_code")
REFERENCES "public"."roles" ("code")
ON DELETE RESTRICT
ON UPDATE RESTRICT;
