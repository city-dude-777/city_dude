// ============================================================================
// City Dude - Card Pack Opener (Shiny Treasure, Full Art, Basketball)
// ============================================================================
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

// ---- Shiny Treasure Pack pool ----
const SHINY_COMMON = [
    { name: 'Pikachu', type: 'common' },
    { name: 'Charmander', type: 'common' },
    { name: 'Squirtle', type: 'common' },
    { name: 'Bulbasaur', type: 'common' },
    { name: 'Eevee', type: 'common' },
    { name: 'Jigglypuff', type: 'common' },
    { name: 'Snorlax', type: 'common' },
    { name: 'Gengar', type: 'common' },
    { name: 'Mewtwo', type: 'common' },
    { name: 'Dragonite', type: 'common' },
    { name: 'Lucario', type: 'common' },
    { name: 'Garchomp', type: 'common' },
    { name: 'Greninja', type: 'common' },
    { name: 'Rayquaza', type: 'common' },
    { name: 'Charizard', type: 'common' },
];
const SHINY_SPECIAL = [
    { name: 'Charizard V-STAR', type: 'special' },
    { name: 'Mewtwo V-STAR', type: 'special' },
    { name: 'Rayquaza V-STAR', type: 'special' },
    { name: 'Pikachu V-STAR', type: 'special' },
    { name: 'Arceus V-STAR', type: 'special' },
    { name: 'Charizard EX EVOLUTION', type: 'special' },
    { name: 'Mewtwo EX EVOLUTION', type: 'special' },
    { name: 'Lugia EX EVOLUTION', type: 'special' },
    { name: 'Umbreon EX EVOLUTION', type: 'special' },
    { name: 'Giratina EX EVOLUTION', type: 'special' },
];
const BUBBLE_MEW = { name: 'Japanese Bubble Mew', type: 'ultra_rare' };

// ---- Full Art Pack pool ----
const FULL_ART_COMMON = [
    { name: 'Pikachu Full Art', type: 'common' },
    { name: 'Eevee Full Art', type: 'common' },
    { name: 'Gengar Full Art', type: 'common' },
    { name: 'Snorlax Full Art', type: 'common' },
    { name: 'Dragonite Full Art', type: 'common' },
    { name: 'Gardevoir Full Art', type: 'common' },
    { name: 'Mimikyu Full Art', type: 'common' },
    { name: 'Sylveon Full Art', type: 'common' },
    { name: 'Absol Full Art', type: 'common' },
    { name: 'Zoroark Full Art', type: 'common' },
];
const FULL_ART_SPECIAL = [
    { name: 'Charizard Full Art', type: 'special' },
    { name: 'Mewtwo Full Art', type: 'special' },
    { name: 'Rayquaza Full Art', type: 'special' },
    { name: 'Umbreon Full Art', type: 'special' },
    { name: 'Giratina Full Art', type: 'special' },
    { name: 'Lugia Full Art', type: 'special' },
    { name: 'Arceus Full Art', type: 'special' },
    { name: 'Palkia Full Art', type: 'special' },
];
const FULL_ART_ULTRA = { name: 'Moonbreon Full Art', type: 'ultra_rare' };

// ---- Basketball Card Pack pool ----
const BBALL_COMMON = [
    { name: 'LeBron James', type: 'common' },
    { name: 'Stephen Curry', type: 'common' },
    { name: 'Kevin Durant', type: 'common' },
    { name: 'Giannis', type: 'common' },
    { name: 'Jayson Tatum', type: 'common' },
    { name: 'Luka Doncic', type: 'common' },
    { name: 'Anthony Edwards', type: 'common' },
    { name: 'Ja Morant', type: 'common' },
    { name: 'Devin Booker', type: 'common' },
    { name: 'Nikola Jokic', type: 'common' },
    { name: 'Joel Embiid', type: 'common' },
    { name: 'Damian Lillard', type: 'common' },
    { name: 'Jimmy Butler', type: 'common' },
    { name: 'Shai Gilgeous', type: 'common' },
    { name: 'Tyrese Haliburton', type: 'common' },
];
const BBALL_SPECIAL = [
    { name: 'LeBron James Gold', type: 'special' },
    { name: 'Stephen Curry Gold', type: 'special' },
    { name: 'Kevin Durant Gold', type: 'special' },
    { name: 'Giannis Gold', type: 'special' },
    { name: 'Luka Doncic Gold', type: 'special' },
    { name: 'Nikola Jokic Gold', type: 'special' },
    { name: 'Victor Wembanyama Gold', type: 'special' },
];
const BBALL_ULTRA = { name: 'Michael Jordan Legacy', type: 'ultra_rare' };

// Pack type definitions
const PACK_DEFS = {
    shiny_treasure_pack: {
        label: 'SHINY TREASURE',
        color1: '#ffd700', color2: '#cc9900', accent: '#8b0000',
        common: SHINY_COMMON, special: SHINY_SPECIAL, ultra: BUBBLE_MEW, ultraChance: 0.15,
    },
    full_art_pack: {
        label: 'FULL ART',
        color1: '#e74c3c', color2: '#962d22', accent: '#1a1a2e',
        common: FULL_ART_COMMON, special: FULL_ART_SPECIAL, ultra: FULL_ART_ULTRA, ultraChance: 0.12,
    },
    basketball_pack: {
        label: 'NBA BASKETBALL',
        color1: '#e67e22', color2: '#a85c10', accent: '#1a3a6a',
        common: BBALL_COMMON, special: BBALL_SPECIAL, ultra: BBALL_ULTRA, ultraChance: 0.10,
    },
};

const CARD_W = 90;
const CARD_H = 130;
const PACK_W = 120;
const PACK_H = 180;

export class PackOpener {
    constructor() {
        this.active = false;
        this.packsOpened = 0;
        this.packType = 'shiny_treasure_pack'; // current pack being opened
        this.packDef = PACK_DEFS.shiny_treasure_pack;

        // Phase: 'pack_display', 'slicing', 'revealing', 'done'
        this.phase = 'pack_display';

        // Slice state
        this.sliceProgress = 0; // 0 to 1
        this.sliceStarted = false;
        this.sliceY = 0;
        this.mouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;

        // Cards
        this.cards = [];
        this.revealIndex = 0;
        this.revealTimer = 0;
        this.allRevealed = false;

        // Pack animation
        this.packShake = 0;
        this.sparkleTimer = 0;

        // Listeners
        this._onMouseDown = null;
        this._onMouseMove = null;
        this._onMouseUp = null;
        this._onTouchStart = null;
        this._onTouchMove = null;
        this._onTouchEnd = null;
    }

    open(canvas, packType) {
        this.active = true;
        this.packType = packType || 'shiny_treasure_pack';
        this.packDef = PACK_DEFS[this.packType] || PACK_DEFS.shiny_treasure_pack;
        this.phase = 'pack_display';
        this.sliceProgress = 0;
        this.sliceStarted = false;
        this.mouseDown = false;
        this.cards = [];
        this.revealIndex = 0;
        this.revealTimer = 0;
        this.allRevealed = false;
        this.packShake = 0;
        this.sparkleTimer = 0;
        this.packsOpened++;

        this._generateCards();
        this._attachListeners(canvas);
    }

    close(canvas) {
        this.active = false;
        this._detachListeners(canvas);
    }

    _generateCards() {
        this.cards = [];
        const def = this.packDef;
        const hasUltra = Math.random() < def.ultraChance;
        const special = def.special[Math.floor(Math.random() * def.special.length)];

        if (hasUltra) {
            for (let i = 0; i < 3; i++) {
                this.cards.push({ ...def.common[Math.floor(Math.random() * def.common.length)], packType: this.packType, revealed: false });
            }
            this.cards.push({ ...special, packType: this.packType, revealed: false });
            this.cards.push({ ...def.ultra, packType: this.packType, revealed: false });
        } else {
            for (let i = 0; i < 4; i++) {
                this.cards.push({ ...def.common[Math.floor(Math.random() * def.common.length)], packType: this.packType, revealed: false });
            }
            this.cards.push({ ...special, packType: this.packType, revealed: false });
        }

        // Shuffle
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    _attachListeners(canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;

        this._onMouseDown = (e) => {
            this.mouseDown = true;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        };
        this._onMouseMove = (e) => {
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        };
        this._onMouseUp = () => { this.mouseDown = false; };

        this._onTouchStart = (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.mouseDown = true;
            this.mouseX = (t.clientX - rect.left) * scaleX;
            this.mouseY = (t.clientY - rect.top) * scaleY;
        };
        this._onTouchMove = (e) => {
            e.preventDefault();
            const t = e.touches[0];
            this.mouseX = (t.clientX - rect.left) * scaleX;
            this.mouseY = (t.clientY - rect.top) * scaleY;
        };
        this._onTouchEnd = (e) => {
            e.preventDefault();
            this.mouseDown = false;
        };

        canvas.addEventListener('mousedown', this._onMouseDown);
        canvas.addEventListener('mousemove', this._onMouseMove);
        canvas.addEventListener('mouseup', this._onMouseUp);
        canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
        canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }

    _detachListeners(canvas) {
        if (this._onMouseDown) canvas.removeEventListener('mousedown', this._onMouseDown);
        if (this._onMouseMove) canvas.removeEventListener('mousemove', this._onMouseMove);
        if (this._onMouseUp) canvas.removeEventListener('mouseup', this._onMouseUp);
        if (this._onTouchStart) canvas.removeEventListener('touchstart', this._onTouchStart);
        if (this._onTouchMove) canvas.removeEventListener('touchmove', this._onTouchMove);
        if (this._onTouchEnd) canvas.removeEventListener('touchend', this._onTouchEnd);
    }

    update(dt, input) {
        if (!this.active) return;

        this.sparkleTimer += dt;

        if (this.phase === 'pack_display') {
            this.packShake = Math.sin(this.sparkleTimer * 6) * 2;

            // Press Space to slice open the pack
            if (input.isPressed('Space')) {
                this.sliceStarted = true;
                this.sliceProgress = 0;
            }

            // Animate the slice after Space is pressed
            if (this.sliceStarted) {
                this.sliceProgress = Math.min(1, this.sliceProgress + dt * 2.5);
            }

            if (this.sliceProgress >= 1) {
                this.phase = 'revealing';
                this.revealIndex = 0;
                this.revealTimer = 0;
            }
        }

        if (this.phase === 'revealing') {
            this.revealTimer += dt;
            if (this.revealTimer >= 0.5) {
                this.revealTimer = 0;
                if (this.revealIndex < this.cards.length) {
                    this.cards[this.revealIndex].revealed = true;
                    this.revealIndex++;
                }
                if (this.revealIndex >= this.cards.length) {
                    this.allRevealed = true;
                    this.phase = 'done';
                }
            }
        }

        if (this.phase === 'done') {
            // Press Escape or H or E to close
            if (input.isPressed('Escape') || input.isPressed('KeyH') ||
                input.isPressed('KeyE') || input.isPressed('Space')) {
                return 'close';
            }
        }

        return null;
    }

    render(ctx) {
        if (!this.active) return;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (this.phase === 'pack_display') {
            this._renderPack(ctx);
            this._renderSliceHint(ctx);
        } else if (this.phase === 'revealing' || this.phase === 'done') {
            this._renderCards(ctx);
        }

        // Sparkles
        this._renderSparkles(ctx);
    }

    _renderPack(ctx) {
        const cx = CANVAS_WIDTH / 2;
        const cy = CANVAS_HEIGHT / 2 - 20;
        const def = this.packDef;

        ctx.save();
        ctx.translate(cx + this.packShake, cy);

        // Pack shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-PACK_W / 2 + 4, -PACK_H / 2 + 4, PACK_W, PACK_H);

        // Pack body
        const grad = ctx.createLinearGradient(-PACK_W / 2, -PACK_H / 2, PACK_W / 2, PACK_H / 2);
        grad.addColorStop(0, def.color1);
        grad.addColorStop(0.5, def.color1);
        grad.addColorStop(1, def.color2);
        ctx.fillStyle = grad;
        ctx.fillRect(-PACK_W / 2, -PACK_H / 2, PACK_W, PACK_H);

        // Holographic shimmer
        const shimmer = Math.sin(this.sparkleTimer * 3) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + shimmer})`;
        ctx.fillRect(-PACK_W / 2, -PACK_H / 2, PACK_W, PACK_H / 3);

        // Pack border
        ctx.strokeStyle = def.color2;
        ctx.lineWidth = 3;
        ctx.strokeRect(-PACK_W / 2, -PACK_H / 2, PACK_W, PACK_H);

        // Pack label background
        ctx.fillStyle = def.accent;
        ctx.fillRect(-PACK_W / 2 + 10, -PACK_H / 2 + 20, PACK_W - 20, 50);

        // Pack label text (split into lines)
        const words = def.label.split(' ');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        if (words.length === 1) {
            ctx.fillText(words[0], 0, -PACK_H / 2 + 50);
        } else {
            ctx.fillText(words[0], 0, -PACK_H / 2 + 42);
            ctx.fillText(words.slice(1).join(' '), 0, -PACK_H / 2 + 58);
        }

        // Star emblem
        ctx.fillStyle = def.color1;
        ctx.font = '20px monospace';
        ctx.fillText('\u2605', 0, 20);

        // Card count label
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('5 CARDS', 0, PACK_H / 2 - 15);

        // Slice line (progress)
        if (this.sliceStarted && this.sliceProgress > 0) {
            const sliceLen = PACK_H * this.sliceProgress;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, -PACK_H / 2);
            ctx.lineTo(0, -PACK_H / 2 + sliceLen);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.shadowColor = def.color1;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = def.color1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -PACK_H / 2);
            ctx.lineTo(0, -PACK_H / 2 + sliceLen);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // Title
        ctx.fillStyle = def.color1;
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(def.label + ' PACK', CANVAS_WIDTH / 2, 60);
        ctx.textAlign = 'left';
    }

    _renderSliceHint(ctx) {
        const pulse = 0.5 + Math.sin(this.sparkleTimer * 3) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        if (!this.sliceStarted) {
            ctx.fillText('Press SPACE to slice open the pack!', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
        } else {
            ctx.fillText('Slicing...', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);
        }
        ctx.textAlign = 'left';
    }

    _renderCards(ctx) {
        const totalCards = this.cards.length;
        const spacing = 12;
        const totalW = totalCards * CARD_W + (totalCards - 1) * spacing;
        const startX = (CANVAS_WIDTH - totalW) / 2;
        const cardY = CANVAS_HEIGHT / 2 - CARD_H / 2;

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOUR CARDS', CANVAS_WIDTH / 2, 50);
        ctx.textAlign = 'left';

        for (let i = 0; i < totalCards; i++) {
            const card = this.cards[i];
            const cx = startX + i * (CARD_W + spacing);
            const cy = cardY;

            if (card.revealed) {
                this._renderCard(ctx, cx, cy, card, i);
            } else if (i === this.revealIndex) {
                // Currently revealing — show flipping animation
                const flipProgress = this.revealTimer / 0.5;
                this._renderCardFlip(ctx, cx, cy, card, flipProgress);
            } else {
                // Face down
                this._renderCardBack(ctx, cx, cy);
            }
        }

        if (this.phase === 'done') {
            const pulse = 0.5 + Math.sin(this.sparkleTimer * 3) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Press H or SPACE to close', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
            ctx.textAlign = 'left';
        }
    }

    _renderCardBack(ctx, x, y) {
        // Card back
        ctx.fillStyle = '#1a3a6a';
        ctx.fillRect(x, y, CARD_W, CARD_H);
        ctx.strokeStyle = '#4a7aba';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, CARD_W - 2, CARD_H - 2);

        // Pattern
        ctx.fillStyle = 'rgba(74, 122, 186, 0.3)';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 4; c++) {
                ctx.beginPath();
                ctx.arc(x + 12 + c * 22, y + 14 + r * 26, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Center star
        ctx.fillStyle = '#4a7aba';
        ctx.font = '20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2605', x + CARD_W / 2, y + CARD_H / 2 + 8);
        ctx.textAlign = 'left';
    }

    _renderCardFlip(ctx, x, y, card, progress) {
        // Scale card horizontally during flip
        const scaleX = Math.abs(Math.cos(progress * Math.PI));
        ctx.save();
        ctx.translate(x + CARD_W / 2, y + CARD_H / 2);
        ctx.scale(scaleX, 1);

        if (progress < 0.5) {
            // Show back
            ctx.fillStyle = '#1a3a6a';
            ctx.fillRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H);
            ctx.strokeStyle = '#4a7aba';
            ctx.lineWidth = 2;
            ctx.strokeRect(-CARD_W / 2 + 1, -CARD_H / 2 + 1, CARD_W - 2, CARD_H - 2);
        } else {
            // Show front (preview)
            this._renderCardFront(ctx, -CARD_W / 2, -CARD_H / 2, card);
        }

        ctx.restore();
    }

    _renderCard(ctx, x, y, card, index) {
        // Pop-in animation
        ctx.save();
        const scale = 1 + Math.max(0, 0.2 - (this.sparkleTimer - index * 0.5) * 0.4);
        ctx.translate(x + CARD_W / 2, y + CARD_H / 2);
        ctx.scale(Math.min(1.05, scale), Math.min(1.05, scale));
        this._renderCardFront(ctx, -CARD_W / 2, -CARD_H / 2, card);
        ctx.restore();
    }

    _renderCardFront(ctx, x, y, card) {
        const isSpecial = card.type === 'special';
        const isUltraRare = card.type === 'ultra_rare';

        // Card background
        if (isUltraRare) {
            // Rainbow/holographic for Bubble Mew
            const grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
            grad.addColorStop(0, '#ff69b4');
            grad.addColorStop(0.25, '#ffb6c1');
            grad.addColorStop(0.5, '#ffd700');
            grad.addColorStop(0.75, '#ff69b4');
            grad.addColorStop(1, '#da70d6');
            ctx.fillStyle = grad;
        } else if (isSpecial) {
            // Gold for specials
            const grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
            grad.addColorStop(0, '#ffd700');
            grad.addColorStop(0.3, '#ffec80');
            grad.addColorStop(0.6, '#ffd700');
            grad.addColorStop(1, '#cc9900');
            ctx.fillStyle = grad;
        } else {
            // Blue for commons
            const grad = ctx.createLinearGradient(x, y, x + CARD_W, y + CARD_H);
            grad.addColorStop(0, '#2980b9');
            grad.addColorStop(0.5, '#3498db');
            grad.addColorStop(1, '#1a6da0');
            ctx.fillStyle = grad;
        }
        ctx.fillRect(x, y, CARD_W, CARD_H);

        // Card border
        ctx.strokeStyle = isUltraRare ? '#ff1493' : isSpecial ? '#b8860b' : '#1a5276';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1, y + 1, CARD_W - 2, CARD_H - 2);

        // Inner frame
        ctx.strokeStyle = isUltraRare ? 'rgba(255,255,255,0.6)' : isSpecial ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 6, y + 6, CARD_W - 12, CARD_H - 12);

        // Art area (illustration placeholder)
        const artX = x + 10;
        const artY = y + 28;
        const artW = CARD_W - 20;
        const artH = 55;

        ctx.fillStyle = isUltraRare ? 'rgba(255,255,255,0.3)' : isSpecial ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        ctx.fillRect(artX, artY, artW, artH);
        ctx.strokeStyle = isUltraRare ? '#ff69b4' : isSpecial ? '#b8860b' : '#1a5276';
        ctx.lineWidth = 1;
        ctx.strokeRect(artX, artY, artW, artH);

        // Character silhouette in art area
        const charCX = artX + artW / 2;
        const charCY = artY + artH / 2;
        const isBball = card.packType === 'basketball_pack';
        ctx.fillStyle = isUltraRare ? '#ff69b4' : isSpecial ? '#b8860b' : isBball ? '#e67e22' : '#4a90d0';

        if (isUltraRare && isBball) {
            // Michael Jordan silhouette (jumping)
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(charCX - 6, charCY - 8, 12, 18); // body
            ctx.fillStyle = '#f0c27a';
            ctx.beginPath(); ctx.arc(charCX, charCY - 14, 7, 0, Math.PI * 2); ctx.fill(); // head
            // Arms up (dunking)
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(charCX - 12, charCY - 18, 6, 3);
            ctx.fillRect(charCX + 6, charCY - 18, 6, 3);
            // Ball above
            ctx.fillStyle = '#e67e22';
            ctx.beginPath(); ctx.arc(charCX + 8, charCY - 22, 5, 0, Math.PI * 2); ctx.fill();
            // #23
            ctx.fillStyle = '#fff'; ctx.font = '6px monospace'; ctx.textAlign = 'center';
            ctx.fillText('#23', charCX, charCY + 2); ctx.textAlign = 'left';
        } else if (isUltraRare) {
            // Mew silhouette (cat-like)
            ctx.beginPath(); ctx.ellipse(charCX, charCY, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(charCX + 10, charCY);
            ctx.quadraticCurveTo(charCX + 22, charCY - 16, charCX + 16, charCY - 20);
            ctx.lineWidth = 3; ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(charCX - 8, charCY - 8); ctx.lineTo(charCX - 12, charCY - 18);
            ctx.lineTo(charCX - 4, charCY - 10); ctx.fill();
            ctx.beginPath(); ctx.moveTo(charCX + 8, charCY - 8); ctx.lineTo(charCX + 12, charCY - 18);
            ctx.lineTo(charCX + 4, charCY - 10); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(charCX - 6, charCY - 3, 4, 4); ctx.fillRect(charCX + 2, charCY - 3, 4, 4);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(charCX + 18, charCY - 6, 6, 0, Math.PI * 2); ctx.stroke();
        } else if (isBball) {
            // Basketball player silhouette
            ctx.fillStyle = isSpecial ? '#b8860b' : '#e67e22';
            ctx.fillRect(charCX - 5, charCY - 6, 10, 16); // jersey
            ctx.fillStyle = '#f0c27a';
            ctx.beginPath(); ctx.arc(charCX, charCY - 12, 6, 0, Math.PI * 2); ctx.fill(); // head
            ctx.fillStyle = '#333';
            ctx.fillRect(charCX - 4, charCY + 10, 3, 10); // left leg
            ctx.fillRect(charCX + 1, charCY + 10, 3, 10); // right leg
            // Ball
            ctx.fillStyle = '#e67e22';
            ctx.beginPath(); ctx.arc(charCX + 12, charCY - 4, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.arc(charCX + 12, charCY - 4, 5, 0, Math.PI * 2); ctx.stroke();
        } else {
            // Generic creature shape
            ctx.beginPath(); ctx.ellipse(charCX, charCY + 4, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(charCX, charCY - 14, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(charCX - 6, charCY - 18, 4, 4); ctx.fillRect(charCX + 2, charCY - 18, 4, 4);
        }

        // Card name
        const nameSize = card.name.length > 16 ? 6 : card.name.length > 12 ? 7 : 8;
        ctx.fillStyle = isUltraRare ? '#fff' : isSpecial ? '#4a2800' : '#fff';
        ctx.font = `${nameSize}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';

        // Name at top
        ctx.fillText(card.name, x + CARD_W / 2, y + 20);

        // Type badge at bottom
        if (isUltraRare) {
            ctx.fillStyle = isBball ? '#c0392b' : '#ff1493';
            ctx.fillRect(x + 10, y + CARD_H - 30, CARD_W - 20, 18);
            ctx.fillStyle = '#fff';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText(isBball ? 'LEGEND' : 'ULTRA RARE', x + CARD_W / 2, y + CARD_H - 17);
        } else if (isSpecial) {
            ctx.fillStyle = isBball ? '#1a3a6a' : '#8b0000';
            ctx.fillRect(x + 15, y + CARD_H - 30, CARD_W - 30, 18);
            ctx.fillStyle = '#ffd700';
            ctx.font = '6px "Press Start 2P", monospace';
            const typeLabel = isBball ? 'GOLD' : card.name.includes('V-STAR') ? 'V-STAR' : card.name.includes('Full Art') ? 'FULL ART' : 'EX';
            ctx.fillText(typeLabel, x + CARD_W / 2, y + CARD_H - 17);
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(x + 15, y + CARD_H - 28, CARD_W - 30, 16);
            ctx.fillStyle = '#ddd';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText(isBball ? 'NBA' : 'COMMON', x + CARD_W / 2, y + CARD_H - 17);
        }

        ctx.textAlign = 'left';

        // Shimmer effect for special/ultra cards
        if (isSpecial || isUltraRare) {
            const shimX = ((this.sparkleTimer * 80) % (CARD_W + 40)) - 20;
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(x + shimX, y);
            ctx.lineTo(x + shimX + 15, y);
            ctx.lineTo(x + shimX + 5, y + CARD_H);
            ctx.lineTo(x + shimX - 10, y + CARD_H);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    _renderSparkles(ctx) {
        const t = this.sparkleTimer;
        const count = this.phase === 'done' ? 20 : 8;
        ctx.save();
        for (let i = 0; i < count; i++) {
            const sx = ((i * 137 + Math.floor(t * 60)) * 97) % CANVAS_WIDTH;
            const sy = ((i * 223 + Math.floor(t * 40)) * 61) % CANVAS_HEIGHT;
            const alpha = 0.3 + Math.sin(t * 4 + i) * 0.3;
            const size = 2 + Math.sin(t * 3 + i * 2) * 1.5;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = i % 3 === 0 ? '#ffd700' : '#fff';
            ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
        }
        ctx.restore();
    }
}
