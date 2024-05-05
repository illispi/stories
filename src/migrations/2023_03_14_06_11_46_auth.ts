import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("auth_user")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("role", "text", (col) => col.notNull())
    .addColumn("hashed_password", "text", (col) => col.notNull())
    .addColumn("username", sql`varchar(31)`, (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("user_session")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("user_id", "text", (col) =>
      col.references("auth_user.id").onDelete("cascade").notNull()
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_session").ifExists().execute();
  await db.schema.dropTable("auth_user").ifExists().execute();
}
