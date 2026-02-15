// ============================================================================
// City Dude - Player Character
// ============================================================================
// "The Dude" - wears a cap, hoodie, shorts, and rubber shoes.
// Drawn programmatically with canvas primitives.
// Supports 4-direction movement with walk animation.

import { TILE_SIZE, DIR, COLORS } from './constants.js';

const PLAYER_SPEED = 120; // pixels per second
const ANIM_FRAME_TIME = 0.15; // seconds per animation frame

// Collision box (relative to sprite position)
// Smaller than visual for forgiving collision
const HITBOX = {
    offsetX: 6,
    offsetY: 24,
    width: 16,
    height: 12,
};

// Uniform color overrides per job
const UNIFORMS = {
    default: {
        cap: '#c0392b', capBrim: '#a02020',
        shirt: '#555555', shirtLight: '#666666',
        shorts: '#2c6fbb', waistband: '#245ba0',
        shoes: '#ecf0f1',
    },
    'Construction Worker': {
        cap: '#f1c40f', capBrim: '#d4ac0d',
        shirt: '#f39c12', shirtLight: '#e8a030',
        shorts: '#555555', waistband: '#444444',
        shoes: '#6b4423',
    },
    'Police Officer': {
        cap: '#2c3e50', capBrim: '#1a252f',
        shirt: '#2c3e50', shirtLight: '#3d566e',
        shorts: '#1a1a2e', waistband: '#111122',
        shoes: '#111111',
    },
    'Firefighter': {
        cap: '#c0392b', capBrim: '#962d22',
        shirt: '#c0392b', shirtLight: '#d04438',
        shorts: '#333333', waistband: '#222222',
        shoes: '#111111',
    },
    'Garbage Truck Driver': {
        cap: '#3498db', capBrim: '#2980b9',
        shirt: '#dfff00', shirtLight: '#e8ff33',
        shorts: '#555555', waistband: '#444444',
        shoes: '#6b4423',
    },
};

export class Player {
    constructor(col, row) {
        // World position (top-left of sprite area)
        this.x = col * TILE_SIZE;
        this.y = row * TILE_SIZE - 8; // offset up slightly so feet align with tile
        this.width = 28;
        this.height = 38;

        // Movement
        this.direction = DIR.DOWN;
        this.isMoving = false;
        this.speed = PLAYER_SPEED;

        // Animation
        this.animTimer = 0;
        this.animFrame = 0; // 0 = idle, 1 = walk1, 2 = walk2

        // Driving state
        this.isDriving = false;
        this.currentVehicle = null;

        // Uniform/costume
        this.uniform = 'default';

        // Pre-render sprites
        this.sprites = this._createSprites();
    }

    /** Enter a vehicle - hide the player and switch to driving mode */
    enterVehicle(vehicle) {
        this.isDriving = true;
        this.currentVehicle = vehicle;
        this.isMoving = false;
    }

    /** Exit a vehicle - show the player at the given position */
    exitVehicle(exitX, exitY) {
        this.isDriving = false;
        this.currentVehicle = null;
        // Place player at exit position (adjust for sprite offset)
        this.x = exitX - this.width / 2;
        this.y = exitY - this.height / 2;
        this.isMoving = false;
        this.animFrame = 0;
    }

    /** Set the player's uniform based on job title */
    setUniform(job) {
        const key = (job && UNIFORMS[job]) ? job : 'default';
        if (this.uniform !== key) {
            this.uniform = key;
            this.sprites = this._createSprites(); // regenerate sprites
        }
    }

    /** Get collision box in world coordinates */
    getHitbox() {
        return {
            x: this.x + HITBOX.offsetX,
            y: this.y + HITBOX.offsetY,
            w: HITBOX.width,
            h: HITBOX.height,
        };
    }

    /** Get center position in world coordinates */
    getCenter() {
        if (this.isDriving && this.currentVehicle) {
            return { x: this.currentVehicle.x, y: this.currentVehicle.y };
        }
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
        };
    }

    /** Get tile position */
    getTilePos() {
        const center = this.getCenter();
        return {
            col: center.x / TILE_SIZE,
            row: center.y / TILE_SIZE,
        };
    }

    /**
     * Update player position based on input.
     * @param {number} dt - Delta time in seconds
     * @param {Input} input - Input handler
     * @param {TileMap} tileMap - For collision checking
     */
    update(dt, input, tileMap) {
        // When driving, position tracks the vehicle (handled in Game.js)
        if (this.isDriving) return;

        const { dx, dy } = input.getMovement();
        this.isMoving = dx !== 0 || dy !== 0;

        // Update direction
        if (this.isMoving) {
            if (Math.abs(dx) >= Math.abs(dy)) {
                this.direction = dx > 0 ? DIR.RIGHT : DIR.LEFT;
            } else {
                this.direction = dy > 0 ? DIR.DOWN : DIR.UP;
            }
        }

        // Calculate movement (normalize diagonal)
        let moveX = dx * this.speed * dt;
        let moveY = dy * this.speed * dt;
        if (dx !== 0 && dy !== 0) {
            const diag = 1 / Math.SQRT2;
            moveX *= diag;
            moveY *= diag;
        }

        // Collision detection (try each axis separately for sliding)
        const hb = this.getHitbox();

        // Try X movement
        if (moveX !== 0) {
            if (!tileMap.isSolidAt(hb.x + moveX, hb.y, hb.w, hb.h)) {
                this.x += moveX;
            }
        }

        // Try Y movement (recalculate hitbox after X move)
        if (moveY !== 0) {
            const hb2 = this.getHitbox();
            if (!tileMap.isSolidAt(hb2.x, hb2.y + moveY, hb2.w, hb2.h)) {
                this.y += moveY;
            }
        }

        // Update animation
        if (this.isMoving) {
            this.animTimer += dt;
            if (this.animTimer >= ANIM_FRAME_TIME) {
                this.animTimer -= ANIM_FRAME_TIME;
                this.animFrame = this.animFrame === 1 ? 2 : 1;
            }
        } else {
            this.animTimer = 0;
            this.animFrame = 0;
        }
    }

    /**
     * Render the player.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    render(ctx, camera) {
        const screen = camera.worldToScreen(this.x, this.y);
        const spriteKey = `${this.direction}_${this.animFrame}`;
        const sprite = this.sprites[spriteKey];
        if (sprite) {
            // Small shadow under player
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(
                screen.x + this.width / 2,
                screen.y + this.height - 2,
                10, 4, 0, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.drawImage(sprite, screen.x, screen.y);
        }
    }

    // ---- Sprite Generation ----

    _createSprites() {
        const sprites = {};
        for (const dir of [DIR.DOWN, DIR.UP, DIR.LEFT, DIR.RIGHT]) {
            for (const frame of [0, 1, 2]) {
                const canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext('2d');
                this._drawSprite(ctx, dir, frame);
                sprites[`${dir}_${frame}`] = canvas;
            }
        }
        return sprites;
    }

    _drawSprite(ctx, direction, frame) {
        const w = this.width;
        const h = this.height;
        const cx = w / 2;

        switch (direction) {
            case DIR.DOWN:
                this._drawFront(ctx, cx, frame);
                break;
            case DIR.UP:
                this._drawBack(ctx, cx, frame);
                break;
            case DIR.LEFT:
                this._drawSide(ctx, cx, frame, false);
                break;
            case DIR.RIGHT:
                this._drawSide(ctx, cx, frame, true);
                break;
        }
    }

    _drawFront(ctx, cx, frame) {
        // Walk offset
        const leftFootOff = frame === 1 ? 3 : frame === 2 ? -1 : 0;
        const rightFootOff = frame === 2 ? 3 : frame === 1 ? -1 : 0;
        const bodyBob = frame === 0 ? 0 : -1;

        // Shoes (white rubber shoes)
        ctx.fillStyle = this._uc().shoes;
        ctx.fillRect(cx - 9, 34 + leftFootOff, 7, 4);
        ctx.fillRect(cx + 2, 34 + rightFootOff, 7, 4);

        // Legs / Shorts (blue)
        ctx.fillStyle = this._uc().shorts;
        ctx.fillRect(cx - 9, 26 + bodyBob, 8, 9);
        ctx.fillRect(cx + 1, 26 + bodyBob, 8, 9);
        // Shorts waistband
        ctx.fillStyle = this._uc().waistband;
        ctx.fillRect(cx - 10, 25 + bodyBob, 20, 3);

        // Hoodie body (dark gray)
        ctx.fillStyle = this._uc().shirt;
        ctx.fillRect(cx - 11, 14 + bodyBob, 22, 13);

        // Hoodie pocket
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(cx - 6, 21 + bodyBob, 12, 4);

        // Hood strings
        ctx.fillStyle = '#ddd';
        ctx.fillRect(cx - 2, 15 + bodyBob, 1, 5);
        ctx.fillRect(cx + 1, 15 + bodyBob, 1, 5);

        // Head / Face
        ctx.fillStyle = COLORS.SKIN;
        ctx.fillRect(cx - 7, 6 + bodyBob, 14, 10);

        // Eyes
        ctx.fillStyle = COLORS.EYES;
        ctx.fillRect(cx - 5, 10 + bodyBob, 3, 3);
        ctx.fillRect(cx + 2, 10 + bodyBob, 3, 3);

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx - 4, 10 + bodyBob, 1, 1);
        ctx.fillRect(cx + 3, 10 + bodyBob, 1, 1);

        // Mouth
        ctx.fillStyle = '#c47a4a';
        ctx.fillRect(cx - 2, 14 + bodyBob, 4, 1);

        // Cap / Hard hat
        if (this.uniform === 'Construction Worker') {
            // Hard hat - taller, rounded top
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx - 9, 1 + bodyBob, 18, 3);  // top dome
            ctx.fillRect(cx - 10, 4 + bodyBob, 20, 4);  // main hat
            ctx.fillStyle = '#d4ac0d';
            ctx.fillRect(cx - 10, 7 + bodyBob, 20, 2);  // brim
            // Reflective vest stripes
            ctx.fillStyle = '#ffff44';
            ctx.fillRect(cx - 10, 18 + bodyBob, 20, 2); // upper stripe
            ctx.fillRect(cx - 10, 23 + bodyBob, 20, 2); // lower stripe
        } else if (this.uniform === 'Police Officer') {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 5);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx - 9, 7 + bodyBob, 18, 3);
            // Badge
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx - 3, 17 + bodyBob, 5, 4);
            ctx.fillStyle = '#c8a415';
            ctx.fillRect(cx - 2, 18 + bodyBob, 3, 2);
        } else if (this.uniform === 'Firefighter') {
            // Fire helmet - wider, with brim
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(cx - 9, 2 + bodyBob, 18, 4);
            ctx.fillStyle = '#962d22';
            ctx.fillRect(cx - 10, 5 + bodyBob, 20, 4);
            // Helmet badge
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx - 2, 3 + bodyBob, 4, 3);
            // Reflective stripes on coat
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(cx - 10, 24 + bodyBob, 20, 2);
        } else if (this.uniform === 'Garbage Truck Driver') {
            // Blue cap
            ctx.fillStyle = '#3498db';
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 5);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(cx - 9, 7 + bodyBob, 18, 3);
            // Reflective silver vest stripes
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(cx - 10, 18 + bodyBob, 20, 2);
            ctx.fillRect(cx - 10, 23 + bodyBob, 20, 2);
        } else {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 5);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx - 9, 7 + bodyBob, 18, 3);
        }
    }

    _drawBack(ctx, cx, frame) {
        const leftFootOff = frame === 1 ? 3 : frame === 2 ? -1 : 0;
        const rightFootOff = frame === 2 ? 3 : frame === 1 ? -1 : 0;
        const bodyBob = frame === 0 ? 0 : -1;

        // Shoes
        ctx.fillStyle = this._uc().shoes;
        ctx.fillRect(cx - 9, 34 + leftFootOff, 7, 4);
        ctx.fillRect(cx + 2, 34 + rightFootOff, 7, 4);

        // Shorts
        ctx.fillStyle = this._uc().shorts;
        ctx.fillRect(cx - 9, 26 + bodyBob, 8, 9);
        ctx.fillRect(cx + 1, 26 + bodyBob, 8, 9);
        ctx.fillStyle = this._uc().waistband;
        ctx.fillRect(cx - 10, 25 + bodyBob, 20, 3);

        // Hoodie body
        ctx.fillStyle = this._uc().shirt;
        ctx.fillRect(cx - 11, 14 + bodyBob, 22, 13);

        // Hood (visible from back)
        ctx.fillStyle = this._uc().shirtLight;
        ctx.fillRect(cx - 7, 8 + bodyBob, 14, 8);
        ctx.fillStyle = this._uc().shirt;
        ctx.fillRect(cx - 5, 10 + bodyBob, 10, 4);

        // Head (back of head, skin shows at sides)
        ctx.fillStyle = COLORS.SKIN;
        ctx.fillRect(cx - 7, 6 + bodyBob, 14, 6);

        // Hair/back of head
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(cx - 6, 8 + bodyBob, 12, 3);

        // Cap / Hard hat (back)
        if (this.uniform === 'Construction Worker') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx - 9, 1 + bodyBob, 18, 3);
            ctx.fillRect(cx - 10, 4 + bodyBob, 20, 4);
            ctx.fillStyle = '#d4ac0d';
            ctx.fillRect(cx - 10, 7 + bodyBob, 20, 2);
            // Reflective vest stripes (back)
            ctx.fillStyle = '#ffff44';
            ctx.fillRect(cx - 10, 18 + bodyBob, 20, 2);
            ctx.fillRect(cx - 10, 23 + bodyBob, 20, 2);
        } else if (this.uniform === 'Police Officer') {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 6);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx - 2, 7 + bodyBob, 4, 3);
        } else if (this.uniform === 'Firefighter') {
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(cx - 9, 2 + bodyBob, 18, 4);
            ctx.fillStyle = '#962d22';
            ctx.fillRect(cx - 10, 5 + bodyBob, 20, 4);
            // Reflective stripes on coat (back)
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(cx - 10, 24 + bodyBob, 20, 2);
        } else if (this.uniform === 'Garbage Truck Driver') {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 6);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(cx - 2, 7 + bodyBob, 4, 3);
            // Reflective silver vest stripes (back)
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(cx - 10, 18 + bodyBob, 20, 2);
            ctx.fillRect(cx - 10, 23 + bodyBob, 20, 2);
        } else {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 8, 3 + bodyBob, 16, 6);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx - 2, 7 + bodyBob, 4, 3);
        }
    }

    _drawSide(ctx, cx, frame, facingRight) {
        const footOff1 = frame === 1 ? 3 : frame === 2 ? -2 : 0;
        const footOff2 = frame === 2 ? 3 : frame === 1 ? -2 : 0;
        const bodyBob = frame === 0 ? 0 : -1;

        ctx.save();
        if (!facingRight) {
            ctx.translate(this.width, 0);
            ctx.scale(-1, 1);
        }

        // Back foot
        ctx.fillStyle = this._uc().shoes;
        ctx.fillRect(cx - 2, 34 + footOff2, 8, 4);

        // Back leg
        ctx.fillStyle = this._uc().shorts;
        ctx.fillRect(cx - 1, 26 + bodyBob, 7, 9);

        // Hoodie body
        ctx.fillStyle = this._uc().shirt;
        ctx.fillRect(cx - 6, 14 + bodyBob, 16, 13);

        // Arm
        ctx.fillStyle = this._uc().shirtLight;
        ctx.fillRect(cx + 5, 16 + bodyBob, 5, 10);

        // Front leg
        ctx.fillStyle = this._uc().shorts;
        ctx.fillRect(cx + 1, 26 + bodyBob, 7, 9);

        // Front foot
        ctx.fillStyle = this._uc().shoes;
        ctx.fillRect(cx, 34 + footOff1, 8, 4);

        // Head
        ctx.fillStyle = COLORS.SKIN;
        ctx.fillRect(cx - 3, 6 + bodyBob, 12, 10);

        // Eye (side view - one eye visible)
        ctx.fillStyle = COLORS.EYES;
        ctx.fillRect(cx + 4, 10 + bodyBob, 3, 3);
        ctx.fillStyle = '#fff';
        ctx.fillRect(cx + 5, 10 + bodyBob, 1, 1);

        // Cap / Hard hat (side view)
        if (this.uniform === 'Construction Worker') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx - 5, 1 + bodyBob, 16, 3);
            ctx.fillRect(cx - 6, 4 + bodyBob, 18, 4);
            ctx.fillStyle = '#d4ac0d';
            ctx.fillRect(cx - 6, 7 + bodyBob, 18, 2);
            // Reflective vest stripes (side)
            ctx.fillStyle = '#ffff44';
            ctx.fillRect(cx - 5, 18 + bodyBob, 15, 2);
            ctx.fillRect(cx - 5, 23 + bodyBob, 15, 2);
        } else if (this.uniform === 'Police Officer') {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 4, 3 + bodyBob, 14, 5);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx + 4, 7 + bodyBob, 10, 3);
            // Badge (side)
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx + 2, 17 + bodyBob, 4, 3);
        } else if (this.uniform === 'Firefighter') {
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(cx - 5, 2 + bodyBob, 16, 4);
            ctx.fillStyle = '#962d22';
            ctx.fillRect(cx - 6, 5 + bodyBob, 18, 4);
            // Helmet badge (side)
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(cx + 3, 3 + bodyBob, 3, 3);
            // Reflective stripe on coat (side)
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(cx - 5, 24 + bodyBob, 15, 2);
        } else if (this.uniform === 'Garbage Truck Driver') {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(cx - 4, 3 + bodyBob, 14, 5);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(cx + 4, 7 + bodyBob, 10, 3);
            // Reflective silver vest stripes (side)
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(cx - 5, 18 + bodyBob, 15, 2);
            ctx.fillRect(cx - 5, 23 + bodyBob, 15, 2);
        } else {
            ctx.fillStyle = this._uc().cap;
            ctx.fillRect(cx - 4, 3 + bodyBob, 14, 5);
            ctx.fillStyle = this._uc().capBrim;
            ctx.fillRect(cx + 4, 7 + bodyBob, 10, 3);
        }

        ctx.restore();
    }

    /** Get current uniform colors */
    _uc() {
        return UNIFORMS[this.uniform] || UNIFORMS['default'];
    }
}
