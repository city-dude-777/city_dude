// ============================================================================
// City Dude - Camera System
// ============================================================================
// Smooth-follow camera that tracks the player and clamps to world bounds.

import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './constants.js';

export class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.smoothing = 0.08;
    }

    /**
     * Smoothly follow a target position, clamping to world bounds.
     * @param {number} targetX - World X to center on
     * @param {number} targetY - World Y to center on
     * @param {number} mapWidth - Map width in tiles
     * @param {number} mapHeight - Map height in tiles
     */
    follow(targetX, targetY, mapWidth, mapHeight) {
        const idealX = targetX - CANVAS_WIDTH / 2;
        const idealY = targetY - CANVAS_HEIGHT / 2;

        this.x += (idealX - this.x) * this.smoothing;
        this.y += (idealY - this.y) * this.smoothing;

        // Clamp to world bounds
        const maxX = mapWidth * TILE_SIZE - CANVAS_WIDTH;
        const maxY = mapHeight * TILE_SIZE - CANVAS_HEIGHT;
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    }

    /** Snap camera to target immediately (no smoothing) */
    snapTo(targetX, targetY, mapWidth, mapHeight) {
        this.x = targetX - CANVAS_WIDTH / 2;
        this.y = targetY - CANVAS_HEIGHT / 2;
        const maxX = mapWidth * TILE_SIZE - CANVAS_WIDTH;
        const maxY = mapHeight * TILE_SIZE - CANVAS_HEIGHT;
        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));
    }

    /** Convert world coordinates to screen coordinates */
    worldToScreen(wx, wy) {
        return {
            x: Math.round(wx - this.x),
            y: Math.round(wy - this.y),
        };
    }

    /** Get the visible area in world coordinates */
    getVisibleBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + CANVAS_WIDTH,
            bottom: this.y + CANVAS_HEIGHT,
        };
    }
}
