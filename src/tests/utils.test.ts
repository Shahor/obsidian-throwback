/**
 Importing as type because we don't need more and can avoid introducing
 yet another building step before we can run tests.
 It'll do for now.
 */
import type { TFile, Vault } from "obsidian";

import { it } from "node:test";
import { getThrowbackNotes } from "../utils";
import { faker } from "@faker-js/faker";
import { strict as assert } from "node:assert";

function buildFile(options?: { date: Date; extension?: string }) {
	const createdAt = options?.date ?? faker.date.past(50);
	const basename = faker.system.fileName({ extensionCount: 0 });

	return {
		basename,
		extension: options?.extension ?? "md",
		name: `${basename}.md`,
		stat: {
			ctime: createdAt.getTime(),
			mtime: createdAt.getTime(),
			size: 42,
		},
	} as unknown as TFile; // Lying a bit to the compiler for testing purposes.
}

function buildThrowbackFromNow(options: { yearsBack: number }) {
	const throwbackTo = new Date();

	throwbackTo.setFullYear(throwbackTo.getFullYear() - options.yearsBack);

	return throwbackTo;
}

const vault: Vault = {
	getFiles() {
		return [
			buildFile({
				date: buildThrowbackFromNow({ yearsBack: 10 }),
			}),
			buildFile(),
			buildFile({
				date: buildThrowbackFromNow({ yearsBack: 20 }),
			}),
			buildFile(),
			buildFile({
				date: buildThrowbackFromNow({ yearsBack: 30 }),
			}),
			buildFile({
				date: buildThrowbackFromNow({ yearsBack: 20 }),
				extension: "gif",
			}),
		];
	},
} as unknown as Vault;

it(`Gets all throwbacks from the vault from most recent to oldest`, function () {
	const throwbacks = getThrowbackNotes(vault);

	/**
	Length is as expected when we select only throwbacks of md format
	*/
	assert.equal(throwbacks.length, 3);
	assert.ok(throwbacks[0].stat.ctime > throwbacks[1].stat.ctime);
	assert.ok(throwbacks[1].stat.ctime > throwbacks[2].stat.ctime);
});
