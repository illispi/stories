/** The "backup restored" notice: set by an admin, shown to everyone under the header. */
export type BackupNotice = {
	/** Day the restored backup was taken (YYYY-MM-DD) */
	backupDate: string;
	/** When the notice was posted (ISO time) */
	postedAt: string;
};

export const BACKUP_NOTICE_KEY = "backup_notice";

/** "15 November 2026" */
export const formatBackupDate = (isoDate: string) =>
	new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
