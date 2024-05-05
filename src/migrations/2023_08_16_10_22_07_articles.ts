import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("Articles")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn(
      "user",
      "text",
      (col) => col.references("auth_user.id").onDelete("cascade").notNull() //BUG add .unique() because user can have only one in final iteration
    )
    .addColumn("accepted", "boolean", (col) => col.defaultTo(null))
    .addColumn("decline_reason", "text")
    .addColumn("link", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Articles").ifExists().execute();
}
