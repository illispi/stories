import { z } from "zod";
import { BACKUP_NOTICE_KEY, type BackupNotice } from "~/data/backupNotice";
import { adminProcedure, publicProcedure } from "../../utils";

/** The current backup notice, or null. Public: the header shows it to everyone. */
export const siteNotice = publicProcedure.query(async ({ ctx }) => {
	const row = await ctx.db
		.selectFrom("site_settings")
		.select("value")
		.where("key", "=", BACKUP_NOTICE_KEY)
		.executeTakeFirst();
	return (row?.value as BackupNotice | undefined) ?? null;
});

const isoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
	.refine((d) => !Number.isNaN(new Date(`${d}T00:00:00Z`).getTime()), "Not a valid date")
	.refine((d) => new Date(`${d}T00:00:00Z`).getTime() <= Date.now(), "The backup date can't be in the future");

/** Post (or update) the notice that data was restored from a backup taken on `backupDate`. */
export const setBackupNotice = adminProcedure
	.input(z.object({ backupDate: isoDate }))
	.mutation(async ({ ctx, input }) => {
		const value: BackupNotice = { backupDate: input.backupDate, postedAt: new Date().toISOString() };
		await ctx.db
			.insertInto("site_settings")
			.values({ key: BACKUP_NOTICE_KEY, value: JSON.stringify(value), updated_at: new Date() })
			.onConflict((oc) => oc.column("key").doUpdateSet({ value: JSON.stringify(value), updated_at: new Date() }))
			.execute();
		return value;
	});

export const clearBackupNotice = adminProcedure.mutation(async ({ ctx }) => {
	await ctx.db.deleteFrom("site_settings").where("key", "=", BACKUP_NOTICE_KEY).execute();
	return true;
});
