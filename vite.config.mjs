/**
 * Vite configuration file for ColdBox applications.
 *
 * Docs can be found here:
 * - https://github.com/coldbox/coldbox-vite-plugin
 * - https://vitejs.dev/config/
 */
import { defineConfig } from "vite";
import coldbox, { appRefreshPaths } from "coldbox-vite-plugin";

export default defineConfig( {
	plugins : [
		coldbox( {
			input : [
				"resources/assets/scss/app.scss",
				"resources/assets/js/App.js"
			],
			refresh         : appRefreshPaths,
			publicDirectory : "public/includes"
		} )
	],
	css : {
		preprocessorOptions : {
			scss : {
				silenceDeprecations : [
					"import",
					"global-builtin",
					"color-functions",
					"if-function"
				]
			}
		}
	}
} );