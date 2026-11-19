import type { Kysely } from "kysely";
import { sql } from "kysely";

// Better Auth schema (Discord OAuth only).
// The user table keeps the name `auth_user` so the data/articles migrations can keep
// referencing auth_user.id. Column names are snake_case and mapped in src/server/auth/auth.ts.
// If `pnpm auth:schema` generates something different, the generated schema wins.

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("auth_user")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull().defaultTo(""))
		.addColumn("email", "text", (col) => col.notNull().unique()) // synthetic, never a real address
		.addColumn("email_verified", "boolean", (col) => col.notNull().defaultTo(false))
		.addColumn("image", "text")
		.addColumn("role", "text", (col) =>
			col.notNull().defaultTo("user").check(sql`role in ('user', 'admin')`),
		)
		.addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await db.schema
		.createTable("session")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("expires_at", "timestamptz", (col) => col.notNull())
		.addColumn("token", "text", (col) => col.notNull().unique())
		.addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("ip_address", "text") // stays NULL: IP tracking is disabled
		.addColumn("user_agent", "text") // stays NULL: stripped in a database hook
		.addColumn("user_id", "text", (col) =>
			col.notNull().references("auth_user.id").onDelete("cascade"),
		)
		.execute();

	await db.schema
		.createTable("account")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("account_id", "text", (col) => col.notNull())
		.addColumn("provider_id", "text", (col) => col.notNull())
		.addColumn("user_id", "text", (col) =>
			col.notNull().references("auth_user.id").onDelete("cascade"),
		)
		.addColumn("access_token", "text")
		.addColumn("refresh_token", "text")
		.addColumn("id_token", "text")
		.addColumn("access_token_expires_at", "timestamptz")
		.addColumn("refresh_token_expires_at", "timestamptz")
		.addColumn("scope", "text")
		.addColumn("password", "text") // unused: no email/password sign-in
		.addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addUniqueConstraint("account_provider_account_unique", ["provider_id", "account_id"])
		.execute();

	await db.schema
		.createTable("verification")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("identifier", "text", (col) => col.notNull())
		.addColumn("value", "text", (col) => col.notNull())
		.addColumn("expires_at", "timestamptz", (col) => col.notNull())
		.addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
		.execute();

	await db.schema.createIndex("session_user_id_idx").on("session").column("user_id").execute();
	await db.schema.createIndex("account_user_id_idx").on("account").column("user_id").execute();
	await db.schema
		.createIndex("verification_identifier_idx")
		.on("verification")
		.column("identifier")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("verification").ifExists().execute();
	await db.schema.dropTable("account").ifExists().execute();
	await db.schema.dropTable("session").ifExists().execute();
	await db.schema.dropTable("auth_user").ifExists().execute();
}
