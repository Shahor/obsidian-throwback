import type { TFile, Vault } from "obsidian";

/**
 * Verifies if a file is a throwback file.
 * It is when:
 *   - file is of markdown type
 *   - file has the same day and month as the referenceDate (now by default)
 */
function isThrowbackFile(
	file: TFile,
	/**
	 * Optional date to use as reference for throwback matching.
	 * Default value: new Date()
	 */
	referenceDate: Date = new Date()
): boolean {
	const creationDate = new Date(file.stat.ctime);

	if (file.extension !== "md") {
		return false;
	}

	const isSameMonth = referenceDate.getMonth() === creationDate.getMonth();
	const isSameDay = referenceDate.getDate() === creationDate.getDate();
	const isInPastYears =
		referenceDate.getFullYear() > creationDate.getFullYear();

	/**
	 * We'll be returning all throwbacks that have occured in the same day,
	 * regardless of the year
	 */
	return isSameDay && isSameMonth && isInPastYears;
}

/**
 * Retrieve all throwback notes, sorted from most recent to oldest.
 */
export function getThrowbackNotes(vault: Vault) {
	const now = new Date();

	return vault
		.getFiles()
		.filter((file) => isThrowbackFile(file, now))
		.sort(function sortThrowbacks(throwbackA, throwbackB) {
			return throwbackB.stat.ctime - throwbackA.stat.ctime;
		});
}
