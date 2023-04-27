import { Notice, Plugin } from "obsidian";

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export class MyPlugin extends Plugin {
	settings: MyPluginSettings = {} as MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon("dice", "Sample Plugin", () => {
			// Called when the user clicks the icon.
			new Notice("This is a notice! YO");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// const throwbacks = getThrowbackNotes(this.app.vault);

		// console.log(throwbacks);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
