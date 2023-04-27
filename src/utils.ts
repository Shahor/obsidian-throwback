import type { TFile, Vault } from "obsidian";

function isThrowbackFile(
	file: TFile,
	/**
	 Optional date to use as reference for throwback matching.
	 Default value: new Date()
	 */
	referenceDate: Date = new Date()
): boolean {
	const creationDate = new Date(file.stat.ctime);
	const isSameMonth = referenceDate.getMonth() === creationDate.getMonth();
	const isSameDay = referenceDate.getDate() === creationDate.getDate();

	// We'll be returning all throwbacks that have occured in the same day,
	// regardless of the year
	return isSameDay && isSameMonth;
}

export function getThrowbackFiles(vault: Vault) {
	const now = new Date();

	return vault
		.getFiles()
		.filter((file) => isThrowbackFile(file, now))
		.sort(function sortThrowbacks(throwbackA, throwbackB) {
			return throwbackB.stat.ctime - throwbackA.stat.ctime;
		});
}
