// ============================================================================
// City Dude - Phone
// ============================================================================
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const PW = 260;
const PH = 420;
const PX = (CANVAS_WIDTH - PW) / 2;
const PY = (CANVAS_HEIGHT - PH) / 2 - 10;
const SCREEN_X = PX + 14;
const SCREEN_Y = PY + 50;
const SCREEN_W = PW - 28;
const SCREEN_H = PH - 90;

// Contacts for messaging
const CONTACTS = [
    { id: 'mayor', name: 'Mayor Davis', icon: 'M', color: '#2c3e50',
      greetings: [
          'Hey Dude! How is the city treating you?',
          'We need leaders. Keep it up!',
          'Dude Angeles depends on people like you.',
          'Stop by City Hall sometime!',
      ],
      replies: [
          'Good to hear from you!',
          'The city is getting better every day.',
          'Keep making Dude Angeles proud!',
          'Stay safe out there, Dude!',
      ],
    },
    { id: 'police_chief', name: 'Chief Johnson', icon: 'P', color: '#1a252f',
      greetings: [
          'Officer! Everything quiet out there?',
          'Need any backup? Let me know.',
          'Keep those streets safe!',
      ],
      replies: [
          'Roger that!',
          'Stay sharp, officer.',
          'Good work on the streets!',
          'Report back if anything happens.',
      ],
    },
    { id: 'fire_chief', name: 'Chief Burns', icon: 'F', color: '#c0392b',
      greetings: [
          'Hey! The station is all good.',
          'No fires today, thankfully!',
          'Stay hydrated out there!',
      ],
      replies: [
          'Stay safe, firefighter!',
          'We are always ready to roll!',
          'Come by the station anytime.',
      ],
    },
    { id: 'rick', name: 'Card Rick', icon: 'R', color: '#e67e22',
      greetings: [
          'Yo! Got any new packs?',
          'Dude, I just got a rare pull!',
          'The card market is crazy right now.',
      ],
      replies: [
          'Come check out the new stock!',
          'I got some Shiny Treasure Packs!',
          'Full Art Packs are fire right now!',
          'Basketball packs are selling fast!',
      ],
    },
    { id: 'ski_dan', name: 'Ski Dan', icon: 'S', color: '#3a6b8c',
      greetings: [
          'Fresh powder today!',
          'The slopes are calling!',
          'Come hit the mountain!',
      ],
      replies: [
          'See you on the slopes!',
          'The snow is perfect today!',
          'Grab a lift ticket and lets go!',
      ],
    },
];

// Cars for the online shop
const CAR_SHOP = [
    { id: 'sports_car', name: 'Sports Car', price: 5000, color: '#e74c3c', speed: '260 mph', desc: 'Fast and furious!' },
    { id: 'suv', name: 'SUV', price: 3000, color: '#2c2c2c', speed: '170 mph', desc: 'Big and tough.' },
    { id: 'sedan', name: 'Sedan', price: 1500, color: '#4a86c8', speed: '180 mph', desc: 'Classic ride.' },
    { id: 'pickup_truck', name: 'Pickup Truck', price: 2000, color: '#8b4513', speed: '160 mph', desc: 'Haul anything.' },
    { id: 'van', name: 'Van', price: 1800, color: '#ecf0f1', speed: '140 mph', desc: 'Room for the crew.' },
];

// Card price database
const CARD_PRICES = [
    { name: 'Charizard V-STAR', price: '$450' },
    { name: 'Mewtwo V-STAR', price: '$320' },
    { name: 'Pikachu V-STAR', price: '$280' },
    { name: 'Rayquaza V-STAR', price: '$380' },
    { name: 'Arceus V-STAR', price: '$350' },
    { name: 'Charizard EX EVOLUTION', price: '$520' },
    { name: 'Mewtwo EX EVOLUTION', price: '$400' },
    { name: 'Lugia EX EVOLUTION', price: '$360' },
    { name: 'Umbreon EX EVOLUTION', price: '$480' },
    { name: 'Giratina EX EVOLUTION', price: '$340' },
    { name: 'Japanese Bubble Mew', price: '$2,800' },
    { name: 'Charizard Full Art', price: '$600' },
    { name: 'Mewtwo Full Art', price: '$420' },
    { name: 'Moonbreon Full Art', price: '$1,500' },
    { name: 'LeBron James Gold', price: '$350' },
    { name: 'Stephen Curry Gold', price: '$300' },
    { name: 'Michael Jordan Legacy', price: '$5,000' },
    { name: 'Victor Wembanyama Gold', price: '$400' },
    { name: 'Pikachu', price: '$15' },
    { name: 'Charizard', price: '$80' },
    { name: 'LeBron James', price: '$25' },
    { name: 'Stephen Curry', price: '$20' },
    { name: 'Nikola Jokic', price: '$18' },
];

export class Phone {
    constructor() {
        this.active = false;
        // 'home', 'messages', 'chat', 'car_game', 'car_shop', 'card_prices'
        this.screen = 'home';
        this.cursor = 0;
        this.time = 0;

        // Home apps
        this.apps = [
            { id: 'messages', name: 'Messages', icon: '\u2709', color: '#2ecc71' },
            { id: 'car_game', name: 'Car Game', icon: '\u26A1', color: '#e74c3c' },
            { id: 'car_shop', name: 'Car Shop', icon: '\uD83D\uDE97', color: '#3498db' },
            { id: 'card_prices', name: 'Card Prices', icon: '\u2605', color: '#f1c40f' },
        ];

        // Messages state
        this.chatContact = null;
        this.chatMessages = []; // { from: 'me'|'them', text }
        this.chatReplyTimer = 0;

        // Car game state
        this.carGameActive = false;
        this.carGameX = 0;
        this.carGameY = 0;
        this.carGameSpeed = 0;
        this.carGameScore = 0;
        this.carGameObstacles = [];
        this.carGameOver = false;
        this.carGameLane = 1; // 0,1,2

        // Card search
        this.searchResults = CARD_PRICES;
        this.searchCursor = 0;
    }

    open() {
        this.active = true;
        this.screen = 'home';
        this.cursor = 0;
        this.time = 0;
    }

    close() {
        this.active = false;
        this.carGameActive = false;
    }

    update(dt, input, inventory) {
        if (!this.active) return null;
        this.time += dt;

        if (this.screen === 'home') return this._updateHome(dt, input);
        if (this.screen === 'messages') return this._updateMessages(dt, input);
        if (this.screen === 'chat') return this._updateChat(dt, input);
        if (this.screen === 'car_game') return this._updateCarGame(dt, input);
        if (this.screen === 'car_shop') return this._updateCarShop(dt, input, inventory);
        if (this.screen === 'card_prices') return this._updateCardPrices(dt, input);
        return null;
    }

    _updateHome(dt, input) {
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) this.cursor = Math.max(0, this.cursor - 1);
        if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) this.cursor = Math.min(this.apps.length - 1, this.cursor + 1);
        if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
            const app = this.apps[this.cursor];
            this.screen = app.id;
            this.cursor = 0;
            if (app.id === 'car_game') this._startCarGame();
        }
        if (input.isPressed('Escape') || input.isPressed('KeyV')) return 'close';
        return null;
    }

    _updateMessages(dt, input) {
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) this.cursor = Math.max(0, this.cursor - 1);
        if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) this.cursor = Math.min(CONTACTS.length - 1, this.cursor + 1);
        if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
            this.chatContact = CONTACTS[this.cursor];
            this.chatMessages = [];
            const greeting = this.chatContact.greetings[Math.floor(Math.random() * this.chatContact.greetings.length)];
            this.chatMessages.push({ from: 'them', text: greeting });
            this.chatReplyTimer = 0;
            this.screen = 'chat';
        }
        if (input.isPressed('Escape')) { this.screen = 'home'; this.cursor = 0; }
        return null;
    }

    _updateChat(dt, input) {
        if (this.chatReplyTimer > 0) {
            this.chatReplyTimer -= dt;
            if (this.chatReplyTimer <= 0) {
                const reply = this.chatContact.replies[Math.floor(Math.random() * this.chatContact.replies.length)];
                this.chatMessages.push({ from: 'them', text: reply });
            }
        }
        if (input.isPressed('KeyE') || input.isPressed('Enter') || input.isPressed('Space')) {
            const playerMessages = [
                'Hey! Whats up?', 'How are things?', 'Sounds good!',
                'Cool!', 'Lets go!', 'Nice!', 'For sure!', 'See you later!',
            ];
            const msg = playerMessages[Math.floor(Math.random() * playerMessages.length)];
            this.chatMessages.push({ from: 'me', text: msg });
            this.chatReplyTimer = 1.2 + Math.random() * 0.8;
        }
        if (input.isPressed('Escape')) { this.screen = 'messages'; this.cursor = 0; }
        return null;
    }

    _startCarGame() {
        this.carGameActive = true;
        this.carGameLane = 1;
        this.carGameSpeed = 100;
        this.carGameScore = 0;
        this.carGameObstacles = [];
        this.carGameOver = false;
        this._cgSpawnTimer = 0;
    }

    _updateCarGame(dt, input) {
        if (this.carGameOver) {
            if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
                this._startCarGame();
            }
            if (input.isPressed('Escape')) { this.screen = 'home'; this.cursor = 0; }
            return null;
        }

        if (input.isPressed('ArrowLeft') || input.isPressed('KeyA')) this.carGameLane = Math.max(0, this.carGameLane - 1);
        if (input.isPressed('ArrowRight') || input.isPressed('KeyD')) this.carGameLane = Math.min(2, this.carGameLane + 1);
        if (input.isPressed('Escape')) { this.screen = 'home'; this.cursor = 0; return null; }

        this.carGameSpeed = Math.min(300, this.carGameSpeed + dt * 5);
        this.carGameScore += dt * this.carGameSpeed * 0.1;

        // Spawn obstacles
        this._cgSpawnTimer -= dt;
        if (this._cgSpawnTimer <= 0) {
            this._cgSpawnTimer = 0.6 + Math.random() * 0.6;
            const lane = Math.floor(Math.random() * 3);
            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
            this.carGameObstacles.push({
                lane, y: -20,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        // Move obstacles
        for (const ob of this.carGameObstacles) {
            ob.y += this.carGameSpeed * dt;
        }
        this.carGameObstacles = this.carGameObstacles.filter(o => o.y < SCREEN_H + 30);

        // Collision
        for (const ob of this.carGameObstacles) {
            if (ob.lane === this.carGameLane && ob.y > SCREEN_H - 60 && ob.y < SCREEN_H - 20) {
                this.carGameOver = true;
            }
        }

        return null;
    }

    _updateCarShop(dt, input, inventory) {
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) this.cursor = Math.max(0, this.cursor - 1);
        if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) this.cursor = Math.min(CAR_SHOP.length - 1, this.cursor + 1);
        if (input.isPressed('Enter') || input.isPressed('Space') || input.isPressed('KeyE')) {
            const car = CAR_SHOP[this.cursor];
            if (inventory.canAfford(car.price)) {
                inventory.spend(car.price);
                this._purchasedCar = car;
                this._buyMsg = `Bought ${car.name}! It will be parked nearby.`;
                this._buyTimer = 2;
            } else {
                this._buyMsg = `Can't afford $${car.price}!`;
                this._buyTimer = 2;
            }
        }
        if (this._buyTimer > 0) this._buyTimer -= dt;
        if (input.isPressed('Escape')) { this.screen = 'home'; this.cursor = 0; this._buyMsg = null; }
        return null;
    }

    _updateCardPrices(dt, input) {
        if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) this.searchCursor = Math.max(0, this.searchCursor - 1);
        if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) this.searchCursor = Math.min(CARD_PRICES.length - 1, this.searchCursor + 1);
        if (input.isPressed('Escape')) { this.screen = 'home'; this.cursor = 0; }
        return null;
    }

    getPurchasedCar() {
        if (this._purchasedCar) {
            const car = this._purchasedCar;
            this._purchasedCar = null;
            return car.id;
        }
        return null;
    }

    render(ctx) {
        if (!this.active) return;

        // Dim overlay
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Phone body
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        this._roundRect(ctx, PX, PY, PW, PH, 20);
        ctx.fill();

        // Phone bezel
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this._roundRect(ctx, PX, PY, PW, PH, 20);
        ctx.stroke();

        // Top bar (camera notch)
        ctx.fillStyle = '#111';
        ctx.fillRect(PX + PW / 2 - 30, PY + 8, 60, 6);
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(PX + PW / 2, PY + 11, 3, 0, Math.PI * 2); ctx.fill();

        // Status bar
        ctx.fillStyle = '#888';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        const h = Math.floor((480 + this.time * 3) / 60) % 12 || 12;
        const m = Math.floor((480 + this.time * 3) % 60);
        ctx.fillText(`${h}:${m.toString().padStart(2, '0')}`, PX + 18, PY + 42);
        ctx.textAlign = 'right';
        ctx.fillText('5G \u2588\u2588\u2588', PX + PW - 18, PY + 42);
        ctx.textAlign = 'left';

        // Screen background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);

        // Dispatch to screen renderer
        if (this.screen === 'home') this._renderHome(ctx);
        else if (this.screen === 'messages') this._renderMessages(ctx);
        else if (this.screen === 'chat') this._renderChat(ctx);
        else if (this.screen === 'car_game') this._renderCarGame(ctx);
        else if (this.screen === 'car_shop') this._renderCarShop(ctx);
        else if (this.screen === 'card_prices') this._renderCardPrices(ctx);

        // Home button
        ctx.fillStyle = '#333';
        ctx.beginPath(); ctx.arc(PX + PW / 2, PY + PH - 18, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(PX + PW / 2, PY + PH - 18, 8, 0, Math.PI * 2); ctx.stroke();
    }

    _renderHome(ctx) {
        // App grid
        const appH = 58;
        const startY = SCREEN_Y + 12;

        for (let i = 0; i < this.apps.length; i++) {
            const app = this.apps[i];
            const y = startY + i * appH;
            const selected = i === this.cursor;

            if (selected) {
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(SCREEN_X + 6, y, SCREEN_W - 12, appH - 6);
            }

            // App icon
            ctx.fillStyle = app.color;
            ctx.beginPath();
            this._roundRect(ctx, SCREEN_X + 16, y + 8, 36, 36, 8);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(app.icon, SCREEN_X + 34, y + 32);

            // App name
            ctx.fillStyle = selected ? '#fff' : '#aaa';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(app.name, SCREEN_X + 60, y + 30);
        }

        // Bottom hint
        ctx.fillStyle = '#555';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER = open | V = close', PX + PW / 2, SCREEN_Y + SCREEN_H - 8);
        ctx.textAlign = 'left';
    }

    _renderMessages(ctx) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Messages', PX + PW / 2, SCREEN_Y + 18);

        const startY = SCREEN_Y + 32;
        const itemH = 44;

        for (let i = 0; i < CONTACTS.length; i++) {
            const c = CONTACTS[i];
            const y = startY + i * itemH;
            const selected = i === this.cursor;

            if (selected) {
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(SCREEN_X + 4, y, SCREEN_W - 8, itemH - 4);
            }

            // Avatar circle
            ctx.fillStyle = c.color;
            ctx.beginPath(); ctx.arc(SCREEN_X + 22, y + 18, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(c.icon, SCREEN_X + 22, y + 22);

            // Name
            ctx.fillStyle = selected ? '#fff' : '#aaa';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(c.name, SCREEN_X + 40, y + 16);

            // Preview
            ctx.fillStyle = '#666';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillText('Tap to chat...', SCREEN_X + 40, y + 30);
        }

        ctx.fillStyle = '#555';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ESC = back', PX + PW / 2, SCREEN_Y + SCREEN_H - 8);
        ctx.textAlign = 'left';
    }

    _renderChat(ctx) {
        const c = this.chatContact;
        // Header
        ctx.fillStyle = c.color;
        ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, 28);
        ctx.fillStyle = '#fff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, PX + PW / 2, SCREEN_Y + 18);

        // Messages
        const msgY = SCREEN_Y + 36;
        const maxVisible = 8;
        const startIdx = Math.max(0, this.chatMessages.length - maxVisible);

        for (let i = 0; i < maxVisible; i++) {
            const mi = startIdx + i;
            if (mi >= this.chatMessages.length) break;
            const msg = this.chatMessages[mi];
            const y = msgY + i * 32;
            const isMe = msg.from === 'me';

            // Bubble
            const bubbleW = Math.min(SCREEN_W - 40, msg.text.length * 5.5 + 16);
            const bx = isMe ? SCREEN_X + SCREEN_W - bubbleW - 8 : SCREEN_X + 8;
            ctx.fillStyle = isMe ? '#2980b9' : '#333';
            ctx.beginPath();
            this._roundRect(ctx, bx, y, bubbleW, 24, 6);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(msg.text, bx + 6, y + 15);
        }

        // Typing indicator
        if (this.chatReplyTimer > 0) {
            ctx.fillStyle = '#666';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            const dots = '.'.repeat(1 + Math.floor(this.time * 3) % 3);
            ctx.fillText(`typing${dots}`, SCREEN_X + 10, SCREEN_Y + SCREEN_H - 24);
        }

        // Input hint
        ctx.fillStyle = '#555';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('E = send | ESC = back', PX + PW / 2, SCREEN_Y + SCREEN_H - 8);
        ctx.textAlign = 'left';
    }

    _renderCarGame(ctx) {
        // Road
        ctx.fillStyle = '#444';
        ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);

        // Lane lines
        const laneW = SCREEN_W / 3;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 8]);
        const offset = (this.time * this.carGameSpeed * 0.5) % 16;
        for (let l = 1; l < 3; l++) {
            const lx = SCREEN_X + l * laneW;
            ctx.beginPath();
            for (let y = SCREEN_Y - 16 + offset; y < SCREEN_Y + SCREEN_H; y += 16) {
                ctx.moveTo(lx, y);
                ctx.lineTo(lx, y + 8);
            }
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Road edges
        ctx.fillStyle = '#fff';
        ctx.fillRect(SCREEN_X, SCREEN_Y, 2, SCREEN_H);
        ctx.fillRect(SCREEN_X + SCREEN_W - 2, SCREEN_Y, 2, SCREEN_H);

        if (!this.carGameOver) {
            // Obstacles
            for (const ob of this.carGameObstacles) {
                const ox = SCREEN_X + ob.lane * laneW + laneW / 2;
                const oy = SCREEN_Y + ob.y;
                ctx.fillStyle = ob.color;
                ctx.fillRect(ox - 10, oy - 8, 20, 16);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(ox - 6, oy - 4, 12, 6);
            }

            // Player car
            const px = SCREEN_X + this.carGameLane * laneW + laneW / 2;
            const py = SCREEN_Y + SCREEN_H - 45;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(px - 10, py - 10, 20, 20);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(px - 7, py - 6, 14, 8);
            ctx.fillStyle = '#1a5276';
            ctx.fillRect(px - 5, py - 3, 10, 4);

            // Score
            ctx.fillStyle = '#fff';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${Math.floor(this.carGameScore)}`, SCREEN_X + 6, SCREEN_Y + 14);
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H);
            ctx.fillStyle = '#e74c3c';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('CRASH!', PX + PW / 2, SCREEN_Y + SCREEN_H / 2 - 20);
            ctx.fillStyle = '#fff';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText(`Score: ${Math.floor(this.carGameScore)}`, PX + PW / 2, SCREEN_Y + SCREEN_H / 2 + 10);
            ctx.fillStyle = '#888';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText('ENTER = retry', PX + PW / 2, SCREEN_Y + SCREEN_H / 2 + 35);
            ctx.fillText('ESC = back', PX + PW / 2, SCREEN_Y + SCREEN_H / 2 + 50);
        }

        ctx.textAlign = 'left';
    }

    _renderCarShop(ctx) {
        ctx.fillStyle = '#3498db';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DUDE AUTO', PX + PW / 2, SCREEN_Y + 16);

        const startY = SCREEN_Y + 28;
        const itemH = 52;

        for (let i = 0; i < CAR_SHOP.length; i++) {
            const car = CAR_SHOP[i];
            const y = startY + i * itemH;
            const selected = i === this.cursor;

            if (y + itemH > SCREEN_Y + SCREEN_H - 20) break;

            if (selected) {
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fillRect(SCREEN_X + 4, y, SCREEN_W - 8, itemH - 4);
            }

            // Car color swatch
            ctx.fillStyle = car.color;
            ctx.fillRect(SCREEN_X + 12, y + 8, 28, 18);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(SCREEN_X + 16, y + 12, 20, 6);

            // Name
            ctx.fillStyle = selected ? '#fff' : '#bbb';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(car.name, SCREEN_X + 48, y + 16);

            // Price + speed
            ctx.fillStyle = '#2ecc71';
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText(`$${car.price}`, SCREEN_X + 48, y + 30);
            ctx.fillStyle = '#888';
            ctx.fillText(car.speed, SCREEN_X + 120, y + 30);

            // Desc
            ctx.fillStyle = '#666';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.fillText(car.desc, SCREEN_X + 48, y + 42);
        }

        // Buy message
        if (this._buyMsg && this._buyTimer > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(SCREEN_X + 10, SCREEN_Y + SCREEN_H - 50, SCREEN_W - 20, 24);
            ctx.fillStyle = '#f1c40f';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this._buyMsg, PX + PW / 2, SCREEN_Y + SCREEN_H - 34);
        }

        ctx.fillStyle = '#555';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ENTER = buy | ESC = back', PX + PW / 2, SCREEN_Y + SCREEN_H - 8);
        ctx.textAlign = 'left';
    }

    _renderCardPrices(ctx) {
        ctx.fillStyle = '#f1c40f';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CARD PRICES', PX + PW / 2, SCREEN_Y + 16);

        const startY = SCREEN_Y + 28;
        const itemH = 18;
        const maxVisible = Math.floor((SCREEN_H - 50) / itemH);
        const scrollOff = Math.max(0, this.searchCursor - maxVisible + 3);

        for (let i = 0; i < maxVisible; i++) {
            const ci = i + scrollOff;
            if (ci >= CARD_PRICES.length) break;
            const card = CARD_PRICES[ci];
            const y = startY + i * itemH;
            const selected = ci === this.searchCursor;

            if (selected) {
                ctx.fillStyle = 'rgba(255,215,0,0.1)';
                ctx.fillRect(SCREEN_X + 4, y - 2, SCREEN_W - 8, itemH);
            }

            ctx.fillStyle = selected ? '#fff' : '#aaa';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(card.name, SCREEN_X + 8, y + 10);

            ctx.fillStyle = '#2ecc71';
            ctx.textAlign = 'right';
            ctx.fillText(card.price, SCREEN_X + SCREEN_W - 8, y + 10);
        }

        ctx.fillStyle = '#555';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('\u2191\u2193 scroll | ESC = back', PX + PW / 2, SCREEN_Y + SCREEN_H - 8);
        ctx.textAlign = 'left';
    }

    _roundRect(ctx, x, y, w, h, r) {
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
