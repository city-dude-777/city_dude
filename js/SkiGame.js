// ============================================================================
// City Dude - Ski / Snowboard Minigame
// ============================================================================
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const SLOPE_W = CANVAS_WIDTH;
const SLOPE_H = CANVAS_HEIGHT;
const PLAYER_W = 16;
const PLAYER_H = 24;
const TREE_W = 24;
const TREE_H = 32;
const SKIER_W = 14;
const SKIER_H = 22;

const SLOPE_LENGTH = 6000;
const FINISH_Y = SLOPE_LENGTH - 200;

export class SkiGame {
    constructor() {
        this.active = false;
        this.equipment = 'snowboard'; // 'snowboard' or 'skis'

        // Player state
        this.px = SLOPE_W / 2;
        this.py = 80;
        this.scrollY = 0;
        this.speed = 0;
        this.maxSpeed = 320;
        this.accel = 80;
        this.lateralSpeed = 220;
        this.falling = false;
        this.fallTimer = 0;
        this.finished = false;
        this.finishChoice = 0; // 0 = go back up, 1 = leave

        // Mouse control
        this.mouseX = SLOPE_W / 2;
        this.mouseActive = false;

        // Obstacles (trees)
        this.trees = [];

        // AI skiers
        this.aiSkiers = [];

        // Summit NPCs (talkable people at the top)
        this.summitNPCs = [];

        // State: 'summit' (at top, can talk/look around), 'skiing' (going down), 'finish' (at bottom)
        this.phase = 'summit';
        this.summitTimer = 0;

        // Lift animation
        this.liftAnim = 0;
        this.liftActive = false;

        // Track time for scoring
        this.runTime = 0;
    }

    start(equipment) {
        this.active = true;
        this.equipment = equipment || 'snowboard';
        this.px = SLOPE_W / 2;
        this.py = 80;
        this.scrollY = 0;
        this.speed = 0;
        this.falling = false;
        this.fallTimer = 0;
        this.finished = false;
        this.finishChoice = 0;
        this.mouseActive = false;
        this.runTime = 0;
        this.phase = 'lift';
        this.liftAnim = 0;
        this.liftActive = true;

        this._generateSlope();
        this._spawnAISkiers();
        this._spawnSummitNPCs();
    }

    _generateSlope() {
        this.trees = [];
        const cols = Math.floor(SLOPE_W / 40);
        for (let y = 200; y < SLOPE_LENGTH - 300; y += 60) {
            const count = 1 + Math.floor(Math.random() * 3);
            for (let i = 0; i < count; i++) {
                const tx = 30 + Math.random() * (SLOPE_W - 60);
                // Avoid placing trees in a tight center corridor for fairness
                if (Math.abs(tx - SLOPE_W / 2) < 30 && Math.random() < 0.5) continue;
                this.trees.push({
                    x: tx,
                    y: y + Math.random() * 40,
                    w: TREE_W,
                    h: TREE_H,
                    hit: false,
                });
            }
        }
    }

    _spawnAISkiers() {
        this.aiSkiers = [];
        const types = ['ski', 'snowboard'];
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        for (let i = 0; i < 12; i++) {
            this.aiSkiers.push({
                x: 60 + Math.random() * (SLOPE_W - 120),
                y: 300 + Math.random() * (SLOPE_LENGTH - 600),
                speed: 120 + Math.random() * 100,
                lateralDir: Math.random() < 0.5 ? -1 : 1,
                lateralTimer: 1 + Math.random() * 2,
                type: types[Math.floor(Math.random() * 2)],
                color: colors[Math.floor(Math.random() * colors.length)],
                falling: false,
                fallTimer: 0,
                w: SKIER_W,
                h: SKIER_H,
            });
        }
    }

    _spawnSummitNPCs() {
        this.summitNPCs = [
            { x: SLOPE_W / 2 - 80, y: 40, name: 'Skier Bro', dialogue: 'Dude, the powder is gnarly today!', color: '#e74c3c' },
            { x: SLOPE_W / 2 + 80, y: 50, name: 'Snowboarder Girl', dialogue: 'Last one down buys hot cocoa!', color: '#9b59b6' },
            { x: SLOPE_W / 2 - 40, y: 30, name: 'Ski Patrol', dialogue: 'Stay safe out there! Watch for trees.', color: '#f39c12' },
        ];
    }

    stop() {
        this.active = false;
        this.phase = 'summit';
    }

    update(dt, input, canvas) {
        if (!this.active) return;

        if (this.phase === 'lift') {
            this.liftAnim += dt;
            if (this.liftAnim >= 2.5) {
                this.phase = 'summit';
                this.liftActive = false;
            }
            return;
        }

        if (this.phase === 'summit') {
            this.summitTimer += dt;
            // E/F to talk to NPCs
            if (input.isPressed('KeyE') || input.isPressed('KeyF')) {
                // Check if near any summit NPC
                for (const npc of this.summitNPCs) {
                    const dx = Math.abs(this.px - npc.x);
                    const dy = Math.abs(this.py - npc.y);
                    if (dx < 40 && dy < 40) {
                        this._talkingTo = npc;
                        this._talkTimer = 2.5;
                        return;
                    }
                }
            }
            if (this._talkTimer > 0) {
                this._talkTimer -= dt;
                if (this._talkTimer <= 0) this._talkingTo = null;
            }

            // Move around at summit with arrow keys
            const { dx, dy } = input.getMovement();
            this.px += dx * 100 * dt;
            this.py += dy * 100 * dt;
            this.px = Math.max(20, Math.min(SLOPE_W - 20, this.px));
            this.py = Math.max(10, Math.min(SLOPE_H - 40, this.py));

            // Space/Enter to start skiing down
            if (input.isPressed('Space') || input.isPressed('Enter')) {
                this.phase = 'skiing';
                this.scrollY = 0;
                this.speed = 0;
                this.px = SLOPE_W / 2;
                this.runTime = 0;
            }
            return;
        }

        if (this.phase === 'finish') {
            // Choose: go back up or leave
            if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) this.finishChoice = 0;
            if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) this.finishChoice = 1;
            if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
                if (this.finishChoice === 0) {
                    // Go back up — restart
                    this.phase = 'lift';
                    this.liftAnim = 0;
                    this.liftActive = true;
                    this._generateSlope();
                    this._spawnAISkiers();
                    this.px = SLOPE_W / 2;
                    this.py = 80;
                    this.scrollY = 0;
                    this.speed = 0;
                    this.falling = false;
                } else {
                    // Leave
                    this.active = false;
                }
            }
            return;
        }

        // ---- SKIING phase ----

        if (this.falling) {
            this.fallTimer -= dt;
            if (this.fallTimer <= 0) {
                this.falling = false;
                this.speed = 40;
            }
            return;
        }

        // Accelerate downhill
        this.speed = Math.min(this.maxSpeed, this.speed + this.accel * dt);
        this.scrollY += this.speed * dt;
        this.runTime += dt;

        // Lateral movement (keyboard)
        const { dx: mdx } = input.getMovement();
        if (mdx !== 0) {
            this.px += mdx * this.lateralSpeed * dt;
            this.mouseActive = false;
        }

        // Mouse control
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            canvas.onmousemove = (e) => {
                this.mouseX = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
                this.mouseActive = true;
            };
        }
        if (this.mouseActive) {
            const diff = this.mouseX - this.px;
            const moveAmt = Math.min(Math.abs(diff), this.lateralSpeed * dt * 1.2);
            this.px += Math.sign(diff) * moveAmt;
        }

        this.px = Math.max(20, Math.min(SLOPE_W - 20, this.px));

        // Check tree collisions
        for (const tree of this.trees) {
            if (tree.hit) continue;
            const ty = tree.y - this.scrollY;
            if (ty > -50 && ty < SLOPE_H + 50) {
                if (this._collides(this.px - PLAYER_W / 2, this.scrollY + SLOPE_H / 2 - PLAYER_H / 2, PLAYER_W, PLAYER_H,
                    tree.x - tree.w / 2, tree.y, tree.w, tree.h)) {
                    this.falling = true;
                    this.fallTimer = 0.5;
                    this.speed = 0;
                    tree.hit = true;
                    break;
                }
            }
        }

        // Update AI skiers
        for (const s of this.aiSkiers) {
            if (s.falling) {
                s.fallTimer -= dt;
                if (s.fallTimer <= 0) { s.falling = false; s.speed = 80 + Math.random() * 60; }
                continue;
            }

            s.y += s.speed * dt;
            s.lateralTimer -= dt;
            if (s.lateralTimer <= 0) {
                s.lateralDir *= -1;
                s.lateralTimer = 1 + Math.random() * 2;
            }
            s.x += s.lateralDir * 40 * dt;
            s.x = Math.max(30, Math.min(SLOPE_W - 30, s.x));

            // AI tree collision
            for (const tree of this.trees) {
                const ty = tree.y;
                if (Math.abs(ty - s.y) < 30 && Math.abs(tree.x - s.x) < 18) {
                    s.falling = true;
                    s.fallTimer = 0.5;
                    s.speed = 0;
                    break;
                }
            }

            // If AI skier goes past finish, send them back to lift (reset to top)
            if (s.y > SLOPE_LENGTH) {
                s.y = -100 - Math.random() * 300;
                s.x = 60 + Math.random() * (SLOPE_W - 120);
                s.speed = 120 + Math.random() * 100;
            }
        }

        // Check if reached finish
        if (this.scrollY >= FINISH_Y) {
            this.phase = 'finish';
            this.finished = true;
        }
    }

    _collides(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    render(ctx) {
        if (!this.active) return;

        if (this.phase === 'lift') {
            this._renderLift(ctx);
            return;
        }

        if (this.phase === 'summit') {
            this._renderSummit(ctx);
            return;
        }

        if (this.phase === 'finish') {
            this._renderFinish(ctx);
            return;
        }

        // ---- Render skiing ----
        // Snow background
        const gradient = ctx.createLinearGradient(0, 0, 0, SLOPE_H);
        gradient.addColorStop(0, '#e8f0f8');
        gradient.addColorStop(1, '#d0dfe8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, SLOPE_W, SLOPE_H);

        // Snow texture dots
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let i = 0; i < 40; i++) {
            const sx = ((i * 137 + Math.floor(this.scrollY * 0.3)) * 97) % SLOPE_W;
            const sy = ((i * 223 + Math.floor(this.scrollY * 0.7)) * 61) % SLOPE_H;
            ctx.fillRect(sx, sy, 2, 2);
        }

        // Ski tracks behind player
        ctx.strokeStyle = 'rgba(180,200,220,0.3)';
        ctx.lineWidth = 2;
        const trackY = SLOPE_H / 2;
        if (this.equipment === 'skis') {
            ctx.beginPath();
            ctx.moveTo(this.px - 4, trackY + 20);
            ctx.lineTo(this.px - 4, SLOPE_H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.px + 4, trackY + 20);
            ctx.lineTo(this.px + 4, SLOPE_H);
            ctx.stroke();
        } else {
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(this.px, trackY + 20);
            ctx.lineTo(this.px, SLOPE_H);
            ctx.stroke();
        }

        // Render trees
        for (const tree of this.trees) {
            const screenY = tree.y - this.scrollY;
            if (screenY < -50 || screenY > SLOPE_H + 50) continue;
            this._renderTree(ctx, tree.x, screenY, tree.hit);
        }

        // Render AI skiers
        for (const s of this.aiSkiers) {
            const screenY = s.y - this.scrollY;
            if (screenY < -50 || screenY > SLOPE_H + 50) continue;
            this._renderAISkier(ctx, s, screenY);
        }

        // Render player
        const playerScreenY = SLOPE_H / 2;
        this._renderPlayer(ctx, this.px, playerScreenY);

        // HUD
        this._renderSkiHUD(ctx);
    }

    _renderLift(ctx) {
        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, SLOPE_H);
        grad.addColorStop(0, '#87CEEB');
        grad.addColorStop(1, '#e8f0f8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, SLOPE_W, SLOPE_H);

        // Mountain silhouette
        ctx.fillStyle = '#a8c0d0';
        ctx.beginPath();
        ctx.moveTo(0, SLOPE_H);
        ctx.lineTo(0, SLOPE_H * 0.5);
        ctx.lineTo(SLOPE_W * 0.3, SLOPE_H * 0.2);
        ctx.lineTo(SLOPE_W * 0.5, SLOPE_H * 0.35);
        ctx.lineTo(SLOPE_W * 0.7, SLOPE_H * 0.15);
        ctx.lineTo(SLOPE_W, SLOPE_H * 0.4);
        ctx.lineTo(SLOPE_W, SLOPE_H);
        ctx.closePath();
        ctx.fill();

        // Snow caps
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(SLOPE_W * 0.25, SLOPE_H * 0.25);
        ctx.lineTo(SLOPE_W * 0.3, SLOPE_H * 0.2);
        ctx.lineTo(SLOPE_W * 0.35, SLOPE_H * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(SLOPE_W * 0.65, SLOPE_H * 0.2);
        ctx.lineTo(SLOPE_W * 0.7, SLOPE_H * 0.15);
        ctx.lineTo(SLOPE_W * 0.75, SLOPE_H * 0.2);
        ctx.closePath();
        ctx.fill();

        // Lift cable
        const t = this.liftAnim / 2.5;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(SLOPE_W * 0.3, SLOPE_H * 0.8);
        ctx.lineTo(SLOPE_W * 0.7, SLOPE_H * 0.2);
        ctx.stroke();

        // Lift chair moving up
        const chairX = SLOPE_W * 0.3 + (SLOPE_W * 0.4) * t;
        const chairY = SLOPE_H * 0.8 - (SLOPE_H * 0.6) * t;
        ctx.fillStyle = '#444';
        ctx.fillRect(chairX - 12, chairY, 24, 4);
        ctx.fillRect(chairX - 1, chairY - 10, 2, 10);
        // Player sitting on chair
        ctx.fillStyle = '#f0c27a'; // skin
        ctx.fillRect(chairX - 4, chairY - 20, 8, 8);
        ctx.fillStyle = '#c0392b'; // hat
        ctx.fillRect(chairX - 5, chairY - 22, 10, 4);
        ctx.fillStyle = '#555'; // body
        ctx.fillRect(chairX - 5, chairY - 12, 10, 12);

        // Text
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Heading to the summit...', SLOPE_W / 2, SLOPE_H - 40);
        ctx.textAlign = 'left';
    }

    _renderSummit(ctx) {
        // Snow ground
        ctx.fillStyle = '#e0eaf0';
        ctx.fillRect(0, 0, SLOPE_W, SLOPE_H);

        // Mountain scenery in background
        ctx.fillStyle = '#c8d8e8';
        ctx.beginPath();
        ctx.moveTo(0, 100);
        ctx.lineTo(200, 30);
        ctx.lineTo(400, 80);
        ctx.lineTo(600, 20);
        ctx.lineTo(800, 60);
        ctx.lineTo(SLOPE_W, 90);
        ctx.lineTo(SLOPE_W, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Snow-covered trees around edges
        for (let i = 0; i < 8; i++) {
            const tx = 30 + i * 120;
            this._renderTree(ctx, tx, SLOPE_H - 60, false);
        }

        // Summit sign
        ctx.fillStyle = '#5b3a1a';
        ctx.fillRect(SLOPE_W / 2 - 40, 10, 80, 50);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SUMMIT', SLOPE_W / 2, 30);
        ctx.fillText(`${Math.floor(SLOPE_LENGTH / 100)}00 ft`, SLOPE_W / 2, 45);
        ctx.textAlign = 'left';

        // Render summit NPCs
        for (const npc of this.summitNPCs) {
            this._renderSummitNPC(ctx, npc);
        }

        // Render player
        this._renderPlayer(ctx, this.px, this.py);

        // Dialogue bubble
        if (this._talkingTo && this._talkTimer > 0) {
            const npc = this._talkingTo;
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            const tw = ctx.measureText(npc.dialogue).width;
            ctx.fillRect(npc.x - tw / 2 - 8, npc.y - 40, tw + 16, 24);
            ctx.fillStyle = '#fff';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(npc.dialogue, npc.x, npc.y - 22);
            ctx.textAlign = 'left';
        }

        // Instructions
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow keys to move | E to talk | SPACE to ski down', SLOPE_W / 2, SLOPE_H - 15);
        ctx.textAlign = 'left';
    }

    _renderFinish(ctx) {
        ctx.fillStyle = '#d0dfe8';
        ctx.fillRect(0, 0, SLOPE_W, SLOPE_H);

        ctx.fillStyle = '#333';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Run Complete!', SLOPE_W / 2, SLOPE_H / 2 - 60);

        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillText(`Time: ${this.runTime.toFixed(1)}s`, SLOPE_W / 2, SLOPE_H / 2 - 20);
        ctx.fillText(`Equipment: ${this.equipment}`, SLOPE_W / 2, SLOPE_H / 2 + 10);

        // Options
        const opts = ['Go Back Up', 'Leave Mountain'];
        for (let i = 0; i < opts.length; i++) {
            const isSelected = i === this.finishChoice;
            ctx.fillStyle = isSelected ? '#2980b9' : 'rgba(0,0,0,0.3)';
            ctx.fillRect(SLOPE_W / 2 - 120 + i * 150, SLOPE_H / 2 + 50, 120, 40);
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(opts[i], SLOPE_W / 2 - 60 + i * 150, SLOPE_H / 2 + 75);
        }

        ctx.fillStyle = '#555';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('← → to choose | ENTER to confirm', SLOPE_W / 2, SLOPE_H / 2 + 120);
        ctx.textAlign = 'left';
    }

    _renderTree(ctx, x, y, hit) {
        // Trunk
        ctx.fillStyle = hit ? '#8b4513' : '#6b4423';
        ctx.fillRect(x - 3, y + 14, 6, 10);
        // Canopy layers (snow-covered)
        const green = hit ? '#5a8a3a' : '#2d6b1e';
        ctx.fillStyle = green;
        ctx.beginPath();
        ctx.moveTo(x - 14, y + 16);
        ctx.lineTo(x, y - 6);
        ctx.lineTo(x + 14, y + 16);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 6);
        ctx.lineTo(x, y - 14);
        ctx.lineTo(x + 10, y + 6);
        ctx.closePath();
        ctx.fill();
        // Snow on top
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 2);
        ctx.lineTo(x, y - 14);
        ctx.lineTo(x + 8, y + 2);
        ctx.closePath();
        ctx.fill();
    }

    _renderPlayer(ctx, x, y) {
        if (this.falling) {
            // Fallen player
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#f0c27a';
            ctx.fillRect(-4, -10, 8, 8);
            ctx.fillStyle = '#555';
            ctx.fillRect(-5, -2, 10, 14);
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(-5, -12, 10, 4);
            // Stars
            const st = Date.now() / 200;
            ctx.fillStyle = '#f1c40f';
            ctx.font = '8px sans-serif';
            ctx.fillText('*', Math.cos(st) * 10, Math.sin(st) * 10 - 15);
            ctx.fillText('*', Math.cos(st + 2) * 12, Math.sin(st + 2) * 8 - 18);
            ctx.restore();
            return;
        }

        // Standing player on equipment
        ctx.fillStyle = '#f0c27a'; // skin
        ctx.fillRect(x - 4, y - 12, 8, 8);
        // Hat
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x - 5, y - 14, 10, 4);
        // Goggles
        ctx.fillStyle = '#222';
        ctx.fillRect(x - 4, y - 8, 3, 2);
        ctx.fillRect(x + 1, y - 8, 3, 2);
        // Body (jacket)
        ctx.fillStyle = '#555';
        ctx.fillRect(x - 5, y - 4, 10, 12);
        // Arms
        ctx.fillRect(x - 8, y - 2, 3, 8);
        ctx.fillRect(x + 5, y - 2, 3, 8);
        // Legs
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x - 4, y + 8, 3, 6);
        ctx.fillRect(x + 1, y + 8, 3, 6);

        // Equipment
        if (this.equipment === 'snowboard') {
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(x - 10, y + 14, 20, 4);
            // Board edge highlight
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - 10, y + 14, 20, 1);
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x - 5, y + 10, 2, 8);
            ctx.fillRect(x + 3, y + 10, 2, 8);
            // Ski tips
            ctx.fillRect(x - 6, y + 10, 4, 2);
            ctx.fillRect(x + 2, y + 10, 4, 2);
            // Poles
            ctx.fillStyle = '#aaa';
            ctx.fillRect(x - 9, y - 2, 1, 18);
            ctx.fillRect(x + 8, y - 2, 1, 18);
        }
    }

    _renderAISkier(ctx, s, screenY) {
        const x = s.x;
        const y = screenY;

        if (s.falling) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 3);
            ctx.fillStyle = '#f0c27a';
            ctx.fillRect(-3, -8, 6, 6);
            ctx.fillStyle = s.color;
            ctx.fillRect(-4, -2, 8, 10);
            ctx.fillStyle = '#f1c40f';
            ctx.font = '6px sans-serif';
            ctx.fillText('*', 5, -10);
            ctx.restore();
            return;
        }

        // Head
        ctx.fillStyle = '#f0c27a';
        ctx.fillRect(x - 3, y - 10, 6, 6);
        // Hat
        ctx.fillStyle = s.color;
        ctx.fillRect(x - 4, y - 12, 8, 3);
        // Body
        ctx.fillStyle = s.color;
        ctx.fillRect(x - 4, y - 4, 8, 10);
        // Legs
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x - 3, y + 6, 2, 4);
        ctx.fillRect(x + 1, y + 6, 2, 4);

        // Equipment
        if (s.type === 'snowboard') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(x - 8, y + 10, 16, 3);
        } else {
            ctx.fillStyle = '#ddd';
            ctx.fillRect(x - 4, y + 8, 2, 6);
            ctx.fillRect(x + 2, y + 8, 2, 6);
        }
    }

    _renderSummitNPC(ctx, npc) {
        const x = npc.x;
        const y = npc.y;
        ctx.fillStyle = '#f0c27a';
        ctx.fillRect(x - 4, y - 12, 8, 8);
        ctx.fillStyle = npc.color;
        ctx.fillRect(x - 5, y - 14, 10, 4);
        ctx.fillStyle = npc.color;
        ctx.fillRect(x - 5, y - 4, 10, 14);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x - 4, y + 10, 3, 5);
        ctx.fillRect(x + 1, y + 10, 3, 5);

        // Name label
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        const tw = ctx.measureText(npc.name).width;
        ctx.fillRect(x - tw / 2 - 2, y - 24, tw + 4, 10);
        ctx.fillStyle = '#fff';
        ctx.fillText(npc.name, x, y - 16);
        ctx.textAlign = 'left';
    }

    _renderSkiHUD(ctx) {
        // Speed gauge
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(10, 10, 140, 50);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(`Speed: ${Math.floor(this.speed)} mph`, 18, 28);
        ctx.fillText(`Time: ${this.runTime.toFixed(1)}s`, 18, 44);

        // Progress bar
        const progress = Math.min(1, this.scrollY / FINISH_Y);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(SLOPE_W - 30, 10, 20, SLOPE_H - 20);
        ctx.fillStyle = '#2ecc71';
        const barH = (SLOPE_H - 24) * progress;
        ctx.fillRect(SLOPE_W - 28, 12, 16, barH);
        ctx.fillStyle = '#fff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TOP', SLOPE_W - 20, 10);
        ctx.fillText('BOT', SLOPE_W - 20, SLOPE_H - 2);
        ctx.textAlign = 'left';

        // Equipment label
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(SLOPE_W / 2 - 60, 10, 120, 20);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.equipment === 'snowboard' ? 'SNOWBOARD' : 'SKIS', SLOPE_W / 2, 25);
        ctx.textAlign = 'left';

        // Controls hint
        if (this.runTime < 3) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('← → or MOUSE to steer', SLOPE_W / 2, SLOPE_H - 15);
            ctx.textAlign = 'left';
        }
    }
}
