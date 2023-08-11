import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("auth_user")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("role", "text")
    .execute();

  await db.schema
    .createTable("user_key")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("user_id", "text", (col) =>
      col.references("auth_user.id").onDelete("cascade").notNull()
    )
    .addColumn("hashed_password", "text")
    .execute();

  await db.schema
    .createTable("user_session")
    .addColumn("id", "text", (col) => col.notNull().primaryKey())
    .addColumn("user_id", "text", (col) =>
      col.references("auth_user.id").onDelete("cascade").notNull()
    )
    .addColumn("active_expires", "bigint", (col) => col.notNull())
    .addColumn("idle_expires", "bigint", (col) => col.notNull())
    .addColumn("role", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user_key").ifExists().execute();
  await db.schema.dropTable("user_session").ifExists().execute();
  await db.schema.dropTable("auth_user").ifExists().execute();
}
