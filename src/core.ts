import { Notice, Plugin } from "obsidian";
import { getThrowbackNotes } from "./utils";

const REFRESH_THROWBACK_INTERVAL = 60_000 * 60;
const RIBBON_BADGE_CLASS = "shahor-throwback-plugin-display-badge";

export class ThrowbackPlugin extends Plugin {
	#hasThrowbacks = false;
	#ribbon: HTMLElement | undefined;
	#abortController: AbortController | undefined;

	async onload() {
		this.#abortController = new AbortController();

		this.setupRibbon();
		this.refreshThrowbacks();
		/**
		 Poll every hour for new throwbacks.
		 Most users won't need this but we don't want to have a badge telling
		 lies if the user keep their obsidian instance constantly open.
		 */
		this.registerInterval(
			window.setInterval(
				this.refreshThrowbacks.bind(this),
				REFRESH_THROWBACK_INTERVAL
			)
		);
	}

	setupRibbon() {
		if (!this.#ribbon) {
			this.#ribbon = this.addRibbonIcon(
				"dice",
				"Throwback plugin",
				() => {
					// Called when the user clicks the icon.
					if (!this.#hasThrowbacks) {
						new Notice(`No throwbacks today 😢.
Try again tomorrow?`);
						return;
					}

					this.openThrowbacks();
				}
			);
		}
	}

	async refreshThrowbacks() {
		const throwbacks = getThrowbackNotes(this.app.vault);
		this.#hasThrowbacks = Boolean(throwbacks.length);

		if (!this.#hasThrowbacks) {
			return;
		}

		if (this.#ribbon) {
			this.#ribbon.classList.add(RIBBON_BADGE_CLASS);
			this.#ribbon.dataset.badge = `${throwbacks.length}`;
		}

		const fragment = document.createDocumentFragment();
		const div = fragment.createEl("div", {
			text: `You have ${throwbacks.length} throwbacks today! Click me to open them all.`,
		});

		div.addEventListener("click", this.openThrowbacks.bind(this), {
			once: true,
			signal: this.#abortController?.signal,
		});

		new Notice(fragment, 5_000);
	}

	async openThrowbacks() {
		const throwbacks = getThrowbackNotes(this.app.vault);

		/**
		 * Simple first version opens all the throwback notes at once.
		 * One tab per throwback.
		 */
		await Promise.all(
			throwbacks.map((throwback) => {
				return this.app.workspace.openLinkText(
					throwback.basename,
					"",
					true
				);
			})
		);
	}

	onunload() {
		/**
		 * Make sure all event listeners are removed,
		 * just in case they were still dangling around.
		 */
		this.#abortController?.abort();
	}
}
