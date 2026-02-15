// ============================================================================
// City Dude - Goal / Quest Manager
// ============================================================================
// Extensible goal system that supports different goal types.
// Goals can be chained (completing one activates the next).
//
// Supported goal types:
//   - 'reach_spot'   : Player must reach a target location
//   - 'collect_item' : Player must collect an item (future)
//   - 'talk_npc'     : Player must talk to an NPC (future)
//   - 'timer'        : Complete within a time limit (future)
//
// To add a new goal type:
//   1. Define the goal data in your map file
//   2. Add a checker function in _checkGoalCondition()
//   3. Goals auto-chain via the nextGoalId field

import { TILE_SIZE, COLORS } from './constants.js';

export class GoalManager {
    constructor() {
        /** @type {Map<string, Object>} All registered goals */
        this.goals = new Map();

        /** @type {Object|null} Currently active goal */
        this.activeGoal = null;

        /** @type {string[]} IDs of completed goals */
        this.completedGoals = [];

        /** @type {Function[]} Listeners for goal events */
        this.onCompleteCallbacks = [];

        /** @type {boolean} Whether all goals are done */
        this.allComplete = false;
    }

    /**
     * Register a goal.
     * @param {Object} goal - Goal definition
     * @param {string} goal.id - Unique identifier
     * @param {string} goal.title - Display title
     * @param {string} goal.description - Longer description
     * @param {string} goal.type - Goal type ('reach_spot', etc.)
     * @param {number} goal.targetCol - Target tile column (for reach_spot)
     * @param {number} goal.targetRow - Target tile row (for reach_spot)
     * @param {number} goal.radius - Completion radius in tiles (for reach_spot)
     * @param {string} goal.completeMessage - Message shown on completion
     * @param {string|null} goal.nextGoalId - ID of next goal to activate
     */
    addGoal(goal) {
        this.goals.set(goal.id, { ...goal, isComplete: false });
    }

    /**
     * Register multiple goals from a map's goal list.
     * @param {Object[]} goals - Array of goal definitions
     */
    addGoals(goals) {
        for (const goal of goals) {
            this.addGoal(goal);
        }
    }

    /**
     * Set the active goal by ID.
     * @param {string} id - Goal ID
     */
    setActiveGoal(id) {
        this.activeGoal = this.goals.get(id) || null;
    }

    /**
     * Register a callback for goal completion.
     * @param {Function} callback - Called with (goal) when a goal completes
     */
    onComplete(callback) {
        this.onCompleteCallbacks.push(callback);
    }

    /**
     * Check if the active goal's conditions are met.
     * Call this every frame.
     * @param {Player} player - The player entity
     * @returns {Object|null} The completed goal, or null
     */
    checkCompletion(player) {
        if (!this.activeGoal || this.activeGoal.isComplete) return null;

        const isComplete = this._checkGoalCondition(this.activeGoal, player);

        if (isComplete) {
            this.activeGoal.isComplete = true;
            this.completedGoals.push(this.activeGoal.id);

            // Notify listeners
            for (const cb of this.onCompleteCallbacks) {
                cb(this.activeGoal);
            }

            const completed = this.activeGoal;

            // Chain to next goal
            if (this.activeGoal.nextGoalId) {
                this.setActiveGoal(this.activeGoal.nextGoalId);
            } else {
                this.activeGoal = null;
                this.allComplete = true;
            }

            return completed;
        }

        return null;
    }

    /**
     * Check a specific goal's condition based on its type.
     * Extend this method to add new goal types.
     */
    _checkGoalCondition(goal, player) {
        switch (goal.type) {
            case 'reach_spot': {
                const pos = player.getTilePos();
                const dist = Math.hypot(pos.col - goal.targetCol, pos.row - goal.targetRow);
                return dist <= goal.radius;
            }

            // Future goal types:
            // case 'collect_item': { ... }
            // case 'talk_npc':    { ... }
            // case 'timer':       { ... }

            default:
                console.warn(`Unknown goal type: ${goal.type}`);
                return false;
        }
    }

    /**
     * Get goal target in world pixel coordinates (for rendering markers).
     * @returns {{ x: number, y: number } | null}
     */
    getActiveGoalWorldPos() {
        if (!this.activeGoal) return null;
        return {
            x: this.activeGoal.targetCol * TILE_SIZE + TILE_SIZE / 2,
            y: this.activeGoal.targetRow * TILE_SIZE + TILE_SIZE / 2,
        };
    }

    /**
     * Render the goal marker at the target location.
     * Draws a pulsing circle and floating arrow.
     */
    renderGoalMarker(ctx, camera, time) {
        if (!this.activeGoal) return;

        const goalWorld = this.getActiveGoalWorldPos();
        const screen = camera.worldToScreen(goalWorld.x, goalWorld.y);

        // Check if goal is on screen
        const margin = 40;
        const onScreen = screen.x > -margin && screen.x < ctx.canvas.width + margin
            && screen.y > -margin && screen.y < ctx.canvas.height + margin;

        if (onScreen) {
            // Pulsing circle at goal location
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;
            const radius = 20 + Math.sin(time * 2) * 5;

            ctx.save();
            ctx.globalAlpha = pulse * 0.4;
            ctx.fillStyle = COLORS.UI_GOAL;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = pulse * 0.8;
            ctx.strokeStyle = COLORS.UI_GOAL;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Star/diamond shape in center
            ctx.globalAlpha = pulse;
            ctx.fillStyle = COLORS.UI_ACCENT;
            const starSize = 6 + Math.sin(time * 4) * 2;
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - starSize);
            ctx.lineTo(screen.x + starSize * 0.6, screen.y);
            ctx.lineTo(screen.x, screen.y + starSize);
            ctx.lineTo(screen.x - starSize * 0.6, screen.y);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else {
            // Off-screen: draw directional arrow at screen edge
            this._renderOffScreenArrow(ctx, screen, time);
        }
    }

    _renderOffScreenArrow(ctx, goalScreen, time) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        const padding = 30;

        // Clamp to screen edge
        const arrowX = Math.max(padding, Math.min(goalScreen.x, cw - padding));
        const arrowY = Math.max(padding, Math.min(goalScreen.y, ch - padding));

        // Direction to goal
        const angle = Math.atan2(goalScreen.y - ch / 2, goalScreen.x - cw / 2);

        const bob = Math.sin(time * 5) * 3;

        ctx.save();
        ctx.translate(arrowX + Math.cos(angle) * bob, arrowY + Math.sin(angle) * bob);
        ctx.rotate(angle);

        // Arrow shape
        ctx.fillStyle = COLORS.UI_GOAL_ARROW;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-6, -8);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();

        // White outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Get distance from player to active goal in tiles.
     * @param {Player} player
     * @returns {number|null}
     */
    getDistanceToGoal(player) {
        if (!this.activeGoal) return null;
        const pos = player.getTilePos();
        return Math.hypot(pos.col - this.activeGoal.targetCol, pos.row - this.activeGoal.targetRow);
    }
}
