import { defineConfig } from "vite";
import coldbox from "coldbox-vite-plugin";

export default defineConfig({
	plugins: [
		coldbox({
			input: [ "resources/assets/css/app.css", "resources/assets/js/app.js" ],
			refresh: true,
			publicDirectory: "public/includes"
		})
	],
});