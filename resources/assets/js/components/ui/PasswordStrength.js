import { passwordRequirements } from "../../utils/passwordPolicy.js";

/**
 * Alpine.js component: passwordStrength
 *
 * Wraps a password <input> and computes real-time strength feedback.
 *
 * Usage:
 *   <div x-data="passwordStrength">
 *     <input name="password" type="password" x-model="password"
 *            :type="showPassword ? 'text' : 'password'">
 *     <!-- Strength bars / requirements rendered inside this scope -->
 *   </div>
 *
 * Strength scoring (0–4):
 *   0 — empty
 *   1 — weak   (length < 8 or only 1 rule met)
 *   2 — fair   (2–3 rules met)
 *   3 — good   (4 rules met or length >= 12)
 *   4 — strong (all 5 rules met AND length >= 12)
 *
 * @returns {Object} Alpine state with password visibility and strength data.
 */
export function passwordStrength() {
	return {
		password     : "",
		showPassword : false,

		/**
		 * Returns the password strength score from zero through four.
		 *
		 * @returns {number} Current password strength score.
		 */
		get score() {
			const p = this.password;
			if ( !p ) return 0;

			const rules = Object.values( passwordRequirements( p ) );
			const passed = rules.filter( Boolean ).length;

			if ( !rules[0] )    return 1;          // < 8 chars → always weak
			if ( passed <= 2 )  return 1;           // weak
			if ( passed === 3 ) return 2;           // fair
			if ( passed === 4 ) return p.length >= 12 ? 4 : 3; // good or strong
			return p.length >= 12 ? 4 : 3;          // strong if long enough
		},

		/**
		 * Returns the human-readable label for the current strength score.
		 *
		 * @returns {string} Current strength label.
		 */
		get label() {
			return [
				"",
				"Weak",
				"Fair",
				"Good",
				"Strong"
			][ this.score ] ?? "";
		},

		/**
		 * Returns the CSS class for the current strength score.
		 *
		 * @returns {string} CSS class for the current strength.
		 */
		get labelClass() {
			return [
				"",
				"cb-strength-weak",
				"cb-strength-fair",
				"cb-strength-good",
				"cb-strength-strong",
			][ this.score ] ?? "";
		},

		/**
		 * Returns the status of each password composition requirement.
		 *
		 * @returns {Object} Requirement names mapped to completion states.
		 */
		get requirements() {
			return passwordRequirements( this.password );
		},

		/**
		 * Returns true when the password score is good or strong.
		 *
		 * @returns {boolean} Whether the password passes the strength threshold.
		 */
		get isValid() {
			return this.score >= 3;
		},
	};
}
