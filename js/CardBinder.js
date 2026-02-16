// ============================================================================
// City Dude - Card Binder
// ============================================================================
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const PAGE_SLOTS = 6; // cards per page (2 rows x 3 cols)
const CARD_W = 80;
const CARD_H = 110;
const MARGIN = 16;

export class CardBinder {
    constructor() {
        this.active = false;
        this.page = 0;
        this.addMode = false; // when true, player is picking a card to add
        this.addCursor = 0;
    }

    open() {
        this.active = true;
        this.page = 0;
        this.addMode = false;
        this.addCursor = 0;
    }

    close() {
        this.active = false;
        this.addMode = false;
    }

    getTotalPages(inventory) {
        return Math.max(1, Math.ceil(inventory.binderCards.length / PAGE_SLOTS));
    }

    update(dt, input, inventory) {
        if (!this.active) return null;

        if (this.addMode) {
            const unboundCards = inventory.collectedCards.filter(c => !c.inBinder);
            if (unboundCards.length === 0) {
                this.addMode = false;
                return null;
            }
            if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) {
                this.addCursor = Math.max(0, this.addCursor - 1);
            }
            if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) {
                this.addCursor = Math.min(unboundCards.length - 1, this.addCursor + 1);
            }
            if (input.isPressed('KeyP') || input.isPressed('Enter') || input.isPressed('Space')) {
                const card = unboundCards[this.addCursor];
                if (card) {
                    card.inBinder = true;
                    inventory.binderCards.push({ ...card });
                    if (this.addCursor >= unboundCards.length - 1) {
                        this.addCursor = Math.max(0, this.addCursor - 1);
                    }
                }
                // Stay in add mode so they can add more
                return null;
            }
            if (input.isPressed('Escape') || input.isPressed('KeyB')) {
                this.addMode = false;
                return null;
            }
            return null;
        }

        // Normal binder browsing
        if (input.isPressed('KeyL') || input.isPressed('ArrowRight') || input.isPressed('KeyD')) {
            const totalPages = this.getTotalPages(inventory);
            if (this.page < totalPages - 1) this.page++;
        }
        if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) {
            if (this.page > 0) this.page--;
        }
        if (input.isPressed('KeyP')) {
            const unboundCards = inventory.collectedCards.filter(c => !c.inBinder);
            if (unboundCards.length > 0) {
                this.addMode = true;
                this.addCursor = 0;
            }
            return null;
        }
        if (input.isPressed('Escape') || input.isPressed('KeyB')) {
            return 'close';
        }
        return null;
    }

    render(ctx, inventory) {
        if (!this.active) return;

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.addMode) {
            this._renderAddMode(ctx, inventory);
            return;
        }

        this._renderBinder(ctx, inventory);
    }

    _renderBinder(ctx, inventory) {
        const binderW = 560;
        const binderH = 400;
        const bx = (CANVAS_WIDTH - binderW) / 2;
        const by = (CANVAS_HEIGHT - binderH) / 2 - 10;

        // Binder cover
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(bx, by, binderW, binderH);
        ctx.strokeStyle = '#5a0000';
        ctx.lineWidth = 4;
        ctx.strokeRect(bx, by, binderW, binderH);

        // Binder spine
        ctx.fillStyle = '#6b0000';
        ctx.fillRect(bx + binderW / 2 - 4, by, 8, binderH);

        // Inner pages
        ctx.fillStyle = '#f5f0e0';
        ctx.fillRect(bx + 12, by + 12, binderW - 24, binderH - 24);

        // Page slots
        const pageCards = inventory.binderCards.slice(this.page * PAGE_SLOTS, (this.page + 1) * PAGE_SLOTS);
        const cols = 3;
        const rows = 2;
        const slotW = CARD_W + MARGIN;
        const slotH = CARD_H + MARGIN;
        const gridW = cols * slotW;
        const gridH = rows * slotH;
        const startX = bx + (binderW - gridW) / 2 + MARGIN / 2;
        const startY = by + (binderH - gridH) / 2 + MARGIN / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const idx = r * cols + c;
                const sx = startX + c * slotW;
                const sy = startY + r * slotH;

                // Slot border
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.strokeRect(sx, sy, CARD_W, CARD_H);

                if (idx < pageCards.length) {
                    this._renderMiniCard(ctx, sx, sy, pageCards[idx]);
                } else {
                    // Empty slot
                    ctx.fillStyle = 'rgba(0,0,0,0.05)';
                    ctx.fillRect(sx, sy, CARD_W, CARD_H);
                    ctx.fillStyle = '#ccc';
                    ctx.font = '20px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('+', sx + CARD_W / 2, sy + CARD_H / 2 + 8);
                    ctx.textAlign = 'left';
                }
            }
        }

        // Title
        ctx.fillStyle = '#8b0000';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CARD BINDER', CANVAS_WIDTH / 2, by - 8);

        // Page number
        const totalPages = this.getTotalPages(inventory);
        ctx.fillStyle = '#555';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText(`Page ${this.page + 1} / ${totalPages}`, CANVAS_WIDTH / 2, by + binderH + 20);

        // Total cards count
        ctx.fillStyle = '#888';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(`${inventory.binderCards.length} cards collected`, CANVAS_WIDTH / 2, by + binderH + 36);

        // Controls
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('L / \u2192 = next page | \u2190 = prev | P = add card | B = close', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
        ctx.textAlign = 'left';
    }

    _renderAddMode(ctx, inventory) {
        const unboundCards = inventory.collectedCards.filter(c => !c.inBinder);

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(100, 50, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 100);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 50, CANVAS_WIDTH - 200, CANVAS_HEIGHT - 100);

        ctx.fillStyle = '#ffd700';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ADD CARD TO BINDER', CANVAS_WIDTH / 2, 78);

        if (unboundCards.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillText('No cards to add! Open more packs.', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.textAlign = 'left';
            return;
        }

        // Scrollable list
        const listX = 140;
        const listY = 100;
        const itemH = 28;
        const visibleCount = Math.min(unboundCards.length, 16);
        const scrollOffset = Math.max(0, this.addCursor - 12);

        for (let i = 0; i < visibleCount; i++) {
            const ci = i + scrollOffset;
            if (ci >= unboundCards.length) break;
            const card = unboundCards[ci];
            const y = listY + i * itemH;
            const isSelected = ci === this.addCursor;

            if (isSelected) {
                ctx.fillStyle = 'rgba(255,215,0,0.2)';
                ctx.fillRect(listX - 4, y - 2, CANVAS_WIDTH - 280, itemH);
            }

            // Color dot
            const dotColor = card.type === 'ultra_rare' ? '#ff69b4' : card.type === 'special' ? '#ffd700' : '#3498db';
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(listX + 6, y + 10, 5, 0, Math.PI * 2);
            ctx.fill();

            // Card name
            ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(card.name, listX + 20, y + 14);

            // Type label
            ctx.fillStyle = card.type === 'ultra_rare' ? '#ff69b4' : card.type === 'special' ? '#ffd700' : '#666';
            ctx.font = '6px "Press Start 2P", monospace';
            const typeLabel = card.type === 'ultra_rare' ? 'ULTRA' : card.type === 'special' ? 'SPECIAL' : 'COMMON';
            ctx.fillText(typeLabel, CANVAS_WIDTH - 220, y + 14);
        }

        // Cursor indicator
        ctx.fillStyle = '#ffd700';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        const cursorY = listY + (this.addCursor - scrollOffset) * itemH;
        ctx.fillText('\u25B6', listX - 16, cursorY + 14);

        // Controls
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2191\u2193 select | P/ENTER = add | ESC = back', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 65);
        ctx.textAlign = 'left';
    }

    _renderMiniCard(ctx, x, y, card) {
        const isSpecial = card.type === 'special';
        const isUltra = card.type === 'ultra_rare';
        const isBball = card.packType === 'basketball_pack';

        // Card background
        if (isUltra) {
            const grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
            grad.addColorStop(0, isBball ? '#c0392b' : '#ff69b4');
            grad.addColorStop(0.5, '#ffd700');
            grad.addColorStop(1, isBball ? '#e74c3c' : '#da70d6');
            ctx.fillStyle = grad;
        } else if (isSpecial) {
            const grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
            grad.addColorStop(0, '#ffd700');
            grad.addColorStop(1, '#cc9900');
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = isBball ? '#e67e22' : '#2980b9';
        }
        ctx.fillRect(x, y, CARD_W, CARD_H);

        // Border
        ctx.strokeStyle = isUltra ? '#ff1493' : isSpecial ? '#b8860b' : '#1a5276';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, CARD_W, CARD_H);

        // Name (wrapped)
        ctx.fillStyle = isSpecial ? '#4a2800' : '#fff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        const words = card.name.split(' ');
        if (card.name.length > 14) {
            const mid = Math.ceil(words.length / 2);
            ctx.fillText(words.slice(0, mid).join(' '), x + CARD_W / 2, y + 16);
            ctx.fillText(words.slice(mid).join(' '), x + CARD_W / 2, y + 26);
        } else {
            ctx.fillText(card.name, x + CARD_W / 2, y + 18);
        }

        // Small type badge
        const badgeColor = isUltra ? '#ff1493' : isSpecial ? '#8b0000' : 'rgba(0,0,0,0.3)';
        ctx.fillStyle = badgeColor;
        ctx.fillRect(x + 10, y + CARD_H - 22, CARD_W - 20, 14);
        ctx.fillStyle = '#fff';
        ctx.font = '5px "Press Start 2P", monospace';
        const badge = isUltra ? (isBball ? 'LEGEND' : 'ULTRA RARE') : isSpecial ? (isBball ? 'GOLD' : 'SPECIAL') : (isBball ? 'NBA' : 'COMMON');
        ctx.fillText(badge, x + CARD_W / 2, y + CARD_H - 12);
        ctx.textAlign = 'left';
    }
}
