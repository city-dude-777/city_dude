// ============================================================================
// City Dude - Input Handler
// ============================================================================
// Tracks keyboard state for smooth game input.
// Supports both "is held down" and "was just pressed this frame" queries.

export class Input {
    #keys = {};
    #justPressed = {};

    constructor() {
        window.addEventListener('keydown', (e) => {
            if (!this.#keys[e.code]) {
                this.#justPressed[e.code] = true;
            }
            this.#keys[e.code] = true;

            // Prevent scrolling for game keys
            const gameKeys = [
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                'Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
                'KeyE', 'KeyF', 'KeyC', 'KeyQ', 'Tab', 'Escape',
            ];
            if (gameKeys.includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.#keys[e.code] = false;
        });

        // Reset keys when window loses focus
        window.addEventListener('blur', () => {
            this.#keys = {};
            this.#justPressed = {};
        });
    }

    /** Check if a key is currently held down */
    isDown(code) {
        return !!this.#keys[code];
    }

    /** Check if a key was just pressed this frame */
    isPressed(code) {
        return !!this.#justPressed[code];
    }

    /** Check movement input (arrow keys + WASD) */
    getMovement() {
        let dx = 0, dy = 0;
        if (this.isDown('ArrowUp') || this.isDown('KeyW')) dy -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) dy += 1;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) dx -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) dx += 1;
        return { dx, dy };
    }

    /** Call at end of each frame to clear just-pressed state */
    endFrame() {
        this.#justPressed = {};
    }
}
