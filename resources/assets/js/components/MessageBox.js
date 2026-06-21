/**
 * MessageBox Alpine Component
 *
 * Manages visibility and optional auto-dismiss for .messagebox elements.
 * Registered in App.js as Alpine.data("messageBox", messageBox).
 *
 * Usage in BXM:
 *   x-data="messageBox({ autoDismiss: 5000 })"
 */
export function messageBox({ autoDismiss = 0 } = {}) {
    return {
        visible: true,
        _timer:  null,

        init() {
            if ( autoDismiss > 0 ) {
                this._timer = setTimeout( () => { this.visible = false; }, autoDismiss );
            }
        },

        destroy() {
            if ( this._timer ) clearTimeout( this._timer );
        },

        dismiss() {
            this.visible = false;
        },
    };
}
