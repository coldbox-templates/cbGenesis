/**
 * Alpine.js component for the global settings form.
 *
 * Compares the current form values with the server-provided settings so the
 * form can only be submitted when at least one setting has changed.
 *
 * @param {Object} initialSettings Settings loaded from the server.
 * @returns {Object} Alpine settings form state and submit handlers.
 */
export function settingsForm( initialSettings = {} ) {
	return {
		initialSettings,
		dirty   : false,
		loading : false,

		/**
		 * Normalizes values for comparison between JSON and FormData.
		 *
		 * @param {*} value Value to normalize.
		 * @returns {string} Comparable form value.
		 */
		normalize( value ) {
			if ( value === null || value === undefined ) {
				return "";
			}

			return String( value );
		},

		/**
		 * Checks whether any submitted setting differs from its initial value.
		 *
		 * @returns {boolean} Whether the form has unsaved changes.
		 */
		get hasChanges() {
			const formData = new FormData( this.$root );

			for ( const [
				name,
				value
			] of formData.entries() ) {
				if ( this.initialSettings[ name ] !== undefined && this.normalize( value ) !== this.normalize( this.initialSettings[ name ] ) ) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Refreshes the reactive dirty state after a form control changes.
		 *
		 * @returns {void}
		 */
		markDirty() {
			this.dirty = this.hasChanges;
		},

		/**
		 * Prevents no-op submissions and shows the loading state for valid ones.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		onSubmit( event ) {
			if ( !this.hasChanges ) {
				event.preventDefault();
				this.dirty = false;
				return;
			}

			this.loading = true;
		},
	};
}