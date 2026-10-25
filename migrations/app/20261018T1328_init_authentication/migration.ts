#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1171234352a30708b71e2eebeb0087c884c3799ab06f64d65b0e6d82e2a83b5d/contract';
import endContract from '../../snapshots/1171234352a30708b71e2eebeb0087c884c3799ab06f64d65b0e6d82e2a83b5d/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'permissions',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['code'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'role_permissions',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('permission_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['role_code', 'permission_code'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'roles',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'character varying(80)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 80 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['code'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'staff_members',
        columns: [
          col('auth_provider', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('auth_subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('gen_random_uuid()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('last_login_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('name', 'character varying(80)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 80 } },
          }),
          col('role_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('invited'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'staff_members_auth_identity_pair_1317e15e',
            '(auth_provider IS NULL) = (auth_subject IS NULL)',
          ),
          checkExpression('staff_members_email_lowercase_9b410a78', 'email = lower(email)'),
          checkExpression(
            'staff_members_owner_active_d2f51121',
            "role_code <> 'owner' OR status = 'active'",
          ),
          checkExpression(
            'staff_members_status_8e0d6579',
            "status IN ('invited', 'active', 'paused')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('auth_provider', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('auth_subject', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('deleted_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn('gen_random_uuid()'),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('last_login_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('name', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('phone', 'character varying(16)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 16 } },
          }),
          col('phone_verified_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'users_auth_identity_pair_1317e15e',
            '(auth_provider IS NULL) = (auth_subject IS NULL)',
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'staff_members',
        constraint: 'staff_members_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'staff_members',
        constraint: 'staff_members_auth_provider_auth_subject_key',
        columns: ['auth_provider', 'auth_subject'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_phone_key',
        columns: ['phone'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_auth_provider_auth_subject_key',
        columns: ['auth_provider', 'auth_subject'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permissions',
        index: 'role_permissions_permission_code_idx_8904843b',
        columns: ['permission_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permissions',
        index: 'role_permissions_permission_role_9eb168b8',
        columns: ['permission_code', 'role_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permissions',
        index: 'role_permissions_role_code_idx_60d65c2f',
        columns: ['role_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'staff_members',
        index: 'staff_members_role_code_idx_60d65c2f',
        columns: ['role_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'staff_members',
        index: 'staff_members_role_status_01d327e0',
        columns: ['role_code', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'staff_members',
        index: 'staff_members_single_owner_833f137c',
        columns: ['role_code'],
        extras: { where: "role_code = 'owner'", unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'role_permissions',
        foreignKey: {
          name: 'role_permissions_role_code_fkey',
          columns: ['role_code'],
          references: { schema: 'public', table: 'roles', columns: ['code'] },
          onDelete: 'restrict',
          onUpdate: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'role_permissions',
        foreignKey: {
          name: 'role_permissions_permission_code_fkey',
          columns: ['permission_code'],
          references: { schema: 'public', table: 'permissions', columns: ['code'] },
          onDelete: 'restrict',
          onUpdate: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'staff_members',
        foreignKey: {
          name: 'staff_members_role_code_fkey',
          columns: ['role_code'],
          references: { schema: 'public', table: 'roles', columns: ['code'] },
          onDelete: 'restrict',
          onUpdate: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
