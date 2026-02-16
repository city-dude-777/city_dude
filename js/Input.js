// ============================================================================
// City Dude - Input Handler
// ============================================================================
// Tracks keyboard state for smooth game input.
// Supports both "is held down" and "was just pressed this frame" queries.
// On mobile/touch devices, provides a virtual joystick and action buttons.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class Input {
    #keys = {};
    #justPressed = {};

    constructor(canvas) {
        this.canvas = canvas;
        this.isMobile = this._detectMobile();

        // Touch state
        this.touchDx = 0;
        this.touchDy = 0;
        this.joystickActive = false;
        this.joystickOrigin = null;  // { x, y } in canvas coords
        this.joystickCurrent = null; // { x, y } in canvas coords
        this.joystickTouchId = null;
        // For discrete press simulation from joystick (menus)
        this._joystickHeldDir = null; // 'up','down','left','right'
        this._joystickRepeatTimer = 0;

        // Touch action buttons
        this.touchButtons = [];
        this._setupButtons();

        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            if (!this.#keys[e.code]) {
                this.#justPressed[e.code] = true;
            }
            this.#keys[e.code] = true;

            // Prevent scrolling for game keys
            const gameKeys = [
                'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                'Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
                'KeyE', 'KeyF', 'KeyC', 'KeyQ', 'KeyH', 'Tab', 'Escape',
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

        // Touch listeners (always add, for tablets that might have keyboard too)
        if (this.isMobile) {
            this._setupTouch();
        }
    }

    _detectMobile() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        );
    }

    _setupButtons() {
        // Action buttons positioned in bottom-right area (in canvas pixel coords)
        // These are rendered by the HUD, but hit-testing happens here
        const btnSize = 48;
        const padding = 12;
        const rightX = CANVAS_WIDTH - padding - btnSize;
        const bottomY = CANVAS_HEIGHT - padding - btnSize;

        this.touchButtons = [
            // Primary action (E key) - big button
            { id: 'action', key: 'KeyE', x: rightX, y: bottomY - 60, w: btnSize, h: btnSize,
              label: 'E', color: '#27ae60', active: false, touchId: null, visible: true },
            // Secondary action (R key) - siren / dismiss
            { id: 'secondary', key: 'KeyR', x: rightX - 56, y: bottomY - 60, w: btnSize, h: btnSize,
              label: 'R', color: '#e74c3c', active: false, touchId: null, visible: true },
            // Start / confirm (Enter/Space)
            { id: 'start', key: 'Enter', x: rightX, y: bottomY, w: btnSize, h: btnSize,
              label: 'OK', color: '#f39c12', active: false, touchId: null, visible: true },
            // Clothes (C key)
            { id: 'clothes', key: 'KeyC', x: rightX - 56, y: bottomY, w: btnSize, h: btnSize,
              label: 'C', color: '#8e44ad', active: false, touchId: null, visible: true },
            // Eat (Q key)
            { id: 'eat', key: 'KeyQ', x: rightX - 112, y: bottomY, w: btnSize, h: btnSize,
              label: 'Q', color: '#e67e22', active: false, touchId: null, visible: true },
            // Escape / Back
            { id: 'back', key: 'Escape', x: rightX - 112, y: bottomY - 60, w: btnSize, h: btnSize,
              label: 'ESC', color: '#95a5a6', active: false, touchId: null, visible: true },
            // Open pack (H key)
            { id: 'pack', key: 'KeyH', x: rightX - 168, y: bottomY, w: btnSize, h: btnSize,
              label: 'H', color: '#ffd700', active: false, touchId: null, visible: true },
        ];
    }

    _setupTouch() {
        const canvas = this.canvas;

        // Prevent default touch behavior (scrolling, zooming)
        canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });

        canvas.addEventListener('touchstart', (e) => this._onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this._onTouchMove(e));
        canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));
        canvas.addEventListener('touchcancel', (e) => this._onTouchEnd(e));
    }

    _canvasCoords(touch) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY,
        };
    }

    _onTouchStart(e) {
        for (const touch of e.changedTouches) {
            const pos = this._canvasCoords(touch);

            // Check action buttons first (right side of screen)
            let hitButton = false;
            for (const btn of this.touchButtons) {
                if (!btn.visible) continue;
                if (pos.x >= btn.x && pos.x <= btn.x + btn.w &&
                    pos.y >= btn.y && pos.y <= btn.y + btn.h) {
                    btn.active = true;
                    btn.touchId = touch.identifier;
                    // Simulate key press
                    if (!this.#keys[btn.key]) {
                        this.#justPressed[btn.key] = true;
                    }
                    this.#keys[btn.key] = true;
                    hitButton = true;
                    break;
                }
            }

            // Left half of screen = joystick
            if (!hitButton && pos.x < CANVAS_WIDTH * 0.5 && !this.joystickActive) {
                this.joystickActive = true;
                this.joystickTouchId = touch.identifier;
                this.joystickOrigin = { x: pos.x, y: pos.y };
                this.joystickCurrent = { x: pos.x, y: pos.y };
                this.touchDx = 0;
                this.touchDy = 0;
            }
        }
    }

    _onTouchMove(e) {
        for (const touch of e.changedTouches) {
            const pos = this._canvasCoords(touch);

            // Joystick movement
            if (this.joystickActive && touch.identifier === this.joystickTouchId) {
                this.joystickCurrent = { x: pos.x, y: pos.y };
                const dx = pos.x - this.joystickOrigin.x;
                const dy = pos.y - this.joystickOrigin.y;
                const maxRadius = 40;
                const dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    const clampedDist = Math.min(dist, maxRadius);
                    this.touchDx = (dx / dist) * (clampedDist / maxRadius);
                    this.touchDy = (dy / dist) * (clampedDist / maxRadius);
                    // Update clamped joystick position for rendering
                    this.joystickCurrent = {
                        x: this.joystickOrigin.x + (dx / dist) * clampedDist,
                        y: this.joystickOrigin.y + (dy / dist) * clampedDist,
                    };
                }
            }
        }
    }

    _onTouchEnd(e) {
        for (const touch of e.changedTouches) {
            // Release joystick
            if (touch.identifier === this.joystickTouchId) {
                this.joystickActive = false;
                this.joystickTouchId = null;
                this.joystickOrigin = null;
                this.joystickCurrent = null;
                this.touchDx = 0;
                this.touchDy = 0;
            }

            // Release buttons
            for (const btn of this.touchButtons) {
                if (btn.touchId === touch.identifier) {
                    btn.active = false;
                    btn.touchId = null;
                    this.#keys[btn.key] = false;
                }
            }
        }
    }

    /** Check if a key is currently held down */
    isDown(code) {
        return !!this.#keys[code];
    }

    /** Check if a key was just pressed this frame */
    isPressed(code) {
        return !!this.#justPressed[code];
    }

    /** Check movement input (arrow keys + WASD + touch joystick) */
    getMovement() {
        let dx = 0, dy = 0;
        if (this.isDown('ArrowUp') || this.isDown('KeyW')) dy -= 1;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) dy += 1;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) dx -= 1;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) dx += 1;

        // Merge touch joystick input
        if (this.joystickActive) {
            dx += this.touchDx;
            dy += this.touchDy;
            // Clamp
            dx = Math.max(-1, Math.min(1, dx));
            dy = Math.max(-1, Math.min(1, dy));
        }

        return { dx, dy };
    }

    /** Generate discrete key presses from joystick deflection (for menus) */
    updateJoystickMenuPresses(dt) {
        if (!this.joystickActive) {
            this._joystickHeldDir = null;
            this._joystickRepeatTimer = 0;
            return;
        }
        const threshold = 0.5;
        let dir = null;
        if (this.touchDy < -threshold) dir = 'up';
        else if (this.touchDy > threshold) dir = 'down';
        else if (this.touchDx < -threshold) dir = 'left';
        else if (this.touchDx > threshold) dir = 'right';

        if (dir !== this._joystickHeldDir) {
            this._joystickHeldDir = dir;
            this._joystickRepeatTimer = 0;
            if (dir) this._fireJoystickDir(dir);
        } else if (dir) {
            this._joystickRepeatTimer += dt;
            if (this._joystickRepeatTimer > 0.3) {
                this._joystickRepeatTimer -= 0.15;
                this._fireJoystickDir(dir);
            }
        }
    }

    _fireJoystickDir(dir) {
        const map = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
        const code = map[dir];
        if (code) this.#justPressed[code] = true;
    }

    /** Call at end of each frame to clear just-pressed state */
    endFrame() {
        this.#justPressed = {};
    }

    /** Render mobile controls (joystick + buttons) */
    renderTouchControls(ctx) {
        if (!this.isMobile) return;

        ctx.save();

        // ---- Joystick ----
        if (this.joystickActive && this.joystickOrigin) {
            const o = this.joystickOrigin;
            const c = this.joystickCurrent;

            // Outer ring
            ctx.beginPath();
            ctx.arc(o.x, o.y, 44, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner knob
            ctx.beginPath();
            ctx.arc(c.x, c.y, 18, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Show hint area for joystick
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.beginPath();
            ctx.arc(100, CANVAS_HEIGHT - 100, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('MOVE', 100, CANVAS_HEIGHT - 96);
        }

        // ---- Action Buttons ----
        for (const btn of this.touchButtons) {
            if (!btn.visible) continue;

            const pressed = btn.active;
            const alpha = pressed ? 0.85 : 0.5;

            // Button background
            ctx.fillStyle = pressed
                ? btn.color
                : this._hexToRgba(btn.color, alpha);
            this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
            ctx.fill();

            // Button border
            ctx.strokeStyle = pressed
                ? 'rgba(255,255,255,0.8)'
                : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = pressed ? 2 : 1;
            this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
            ctx.stroke();

            // Label
            ctx.fillStyle = pressed ? '#fff' : 'rgba(255,255,255,0.9)';
            ctx.font = 'bold 10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
        }

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
        ctx.restore();
    }

    _hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}
