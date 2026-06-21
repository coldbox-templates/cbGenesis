import { defineConfig } from "vite";
import coldbox from "coldbox-vite-plugin";

export default defineConfig({
	plugins: [
		coldbox({
			input: [ "resources/assets/scss/app.scss", "resources/assets/js/App.js" ],
			refresh: true,
			publicDirectory: "public/includes"
		})
	],
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: [ "import", "global-builtin", "color-functions", "if-function" ]
			}
		}
	}
});