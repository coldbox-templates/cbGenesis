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
 */
export function passwordStrength() {
    return {
        password:     "",
        showPassword: false,

        get score() {
            const p = this.password;
            if ( !p ) return 0;

            const rules = [
                p.length >= 8,
                /[A-Z]/.test( p ),
                /[a-z]/.test( p ),
                /[0-9]/.test( p ),
                /[^A-Za-z0-9]/.test( p ),
            ];
            const passed = rules.filter( Boolean ).length;

            if ( !rules[0] )    return 1;          // < 8 chars → always weak
            if ( passed <= 2 )  return 1;           // weak
            if ( passed === 3 ) return 2;           // fair
            if ( passed === 4 ) return p.length >= 12 ? 4 : 3; // good or strong
            return p.length >= 12 ? 4 : 3;          // strong if long enough
        },

        get label() {
            return [ "", "Weak", "Fair", "Good", "Strong" ][ this.score ] ?? "";
        },

        get labelClass() {
            return [
                "",
                "strength-weak",
                "strength-fair",
                "strength-good",
                "strength-strong",
            ][ this.score ] ?? "";
        },

        get requirements() {
            const p = this.password;
            return {
                length:    p.length >= 8,
                uppercase: /[A-Z]/.test( p ),
                lowercase: /[a-z]/.test( p ),
                number:    /[0-9]/.test( p ),
                special:   /[^A-Za-z0-9]/.test( p ),
            };
        },

        /** True when score >= 3 (good or strong) — use for form validation gates. */
        get isValid() {
            return this.score >= 3;
        },
    };
}
