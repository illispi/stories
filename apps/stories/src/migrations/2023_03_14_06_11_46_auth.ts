import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("auth_user")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .execute();

  await db.schema
    .createTable("user_key")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("user_id", "uuid", (col) =>
      col.references("auth_user.id").onDelete("cascade").notNull()
    )
    .addColumn("hashed_password", "text")
    .execute();

  await db.schema
    .createTable("user_session")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("user_id", "uuid", (col) =>
      col.references("auth_user.id").onDelete("cascade").notNull()
    )
    .addColumn("active_expires", "bigint", (col) => col.notNull())
    .addColumn("idle_expires", "bigint", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("auth_user").ifExists().execute();
  await db.schema.dropTable("user_key").ifExists().execute();
  await db.schema.dropTable("user_session").ifExists().execute();
}
