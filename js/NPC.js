// ============================================================================
// City Dude - NPC Pedestrian System
// ============================================================================
// Pedestrians walk around sidewalks. The player can pick them up in a vehicle
// and drop them off at the Skate Park for a fare. They can also be talked to,
// and they occasionally wander into buildings.
//
// NPC States:
//   'walking'        - Moving along sidewalks
//   'idle'           - Standing still briefly
//   'riding'         - Picked up, riding in the player's vehicle (invisible)
//   'dropped_off'    - Just dropped off at destination, will respawn at spawn
//   'going_inside'   - Walking toward a building to enter
//   'inside_building' - Inside a building (invisible)

import { TILE_SIZE, TILES, SOLID_TILES, DIR } from './constants.js';

// ---- NPC Appearance Variants ----

const NPC_STYLES = [
    { name: 'Business', shirt: '#2c3e50', pants: '#1a1a2e', skin: '#f0c27a', hair: '#4a3520', hat: null },
    { name: 'Casual',   shirt: '#e74c3c', pants: '#2c6fbb', skin: '#d4a574', hair: '#2c1810', hat: null },
    { name: 'Jogger',   shirt: '#2ecc71', pants: '#333',    skin: '#f0c27a', hair: '#8b6040', hat: null },
    { name: 'Tourist',  shirt: '#f39c12', pants: '#c4956a', skin: '#e8b88a', hair: '#6b4423', hat: '#3498db' },
    { name: 'Student',  shirt: '#9b59b6', pants: '#2c6fbb', skin: '#f0c27a', hair: '#1a1a1a', hat: null },
    { name: 'Worker',   shirt: '#f39c12', pants: '#555',    skin: '#d4a574', hair: '#4a3520', hat: '#f1c40f' },
    { name: 'Lady',     shirt: '#e91e8c', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b3a2a', hat: null },
    { name: 'Old Man',  shirt: '#85929e', pants: '#4a4a4a', skin: '#e8c8a0', hair: '#cccccc', hat: '#7f8c8d' },
];

// Stadium-specific NPC styles
const STADIUM_STYLES = {
    football_player: { name: 'Football Player', shirt: '#1a5276', pants: '#ecf0f1', skin: '#d4a574', hair: null, hat: '#1a5276', helmet: true },
    security: { name: 'Security', shirt: '#1a1a2e', pants: '#1a1a2e', skin: '#f0c27a', hair: '#222', hat: null },
    coach: { name: 'Coach Rex', shirt: '#c0392b', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b4423', hat: '#c0392b' },
};

// Garbage center NPC styles
const GARBAGE_STYLES = {
    foreman: { name: 'Garbage Foreman', shirt: '#dfff00', pants: '#555', skin: '#d4a574', hair: '#4a3520', hat: '#3498db' },
};

// Basketball NPC styles
const BASKETBALL_STYLES = {
    // Dynamic Dudes - orange/blue
    home_player: { name: 'Dude', shirt: '#e67e22', pants: '#e67e22', skin: '#d4a574', hair: '#222', hat: null, jersey: true, teamColor: '#e67e22', trimColor: '#2980b9' },
    // Nuggets - dark blue/gold
    away_player: { name: 'Nugget', shirt: '#1b2a4a', pants: '#1b2a4a', skin: '#d4a574', hair: '#222', hat: null, jersey: true, teamColor: '#1b2a4a', trimColor: '#f1c40f' },
    // Coaches
    home_coach: { name: 'Coach Blaze', shirt: '#e67e22', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b4423', hat: null },
    away_coach: { name: 'Coach Malone', shirt: '#1b2a4a', pants: '#2c3e50', skin: '#f0c27a', hair: '#4a3520', hat: null },
    // Assistant coaches
    home_asst: { name: 'Asst. Coach', shirt: '#e67e22', pants: '#333', skin: '#e8b88a', hair: '#2c1810', hat: null },
    away_asst: { name: 'Asst. Coach', shirt: '#1b2a4a', pants: '#333', skin: '#e8b88a', hair: '#6b4423', hat: null },
    // Referee
    referee: { name: 'Referee', shirt: '#111', pants: '#111', skin: '#f0c27a', hair: '#222', hat: null, stripes: true },
    // Security (bright yellow vest)
    bball_security: { name: 'Security', shirt: '#dfff00', pants: '#2c3e50', skin: '#d4a574', hair: '#222', hat: null, vest: true },
    // Towel collector
    towel: { name: 'Towel Staff', shirt: '#ecf0f1', pants: '#555', skin: '#c68642', hair: '#1a1a1a', hat: null },
};

// Construction site NPC styles
const CONSTRUCTION_STYLES = [
    { name: 'Worker Joe', shirt: '#f39c12', pants: '#555', skin: '#d4a574', hair: '#4a3520', hat: '#f1c40f' },
    { name: 'Worker Mike', shirt: '#f39c12', pants: '#555', skin: '#f0c27a', hair: '#2c1810', hat: '#f1c40f' },
    { name: 'Worker Carlos', shirt: '#f39c12', pants: '#555', skin: '#c68642', hair: '#1a1a1a', hat: '#f1c40f' },
    { name: 'Foreman Dave', shirt: '#e67e22', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b4423', hat: '#ecf0f1' },
];

// Prisoner NPC styles
const PRISONER_STYLES = [
    { name: 'Inmate', shirt: '#f39c12', pants: '#f39c12', skin: '#d4a574', hair: '#222', hat: null },
    { name: 'Inmate', shirt: '#f39c12', pants: '#f39c12', skin: '#f0c27a', hair: '#4a3520', hat: null },
    { name: 'Inmate', shirt: '#f39c12', pants: '#f39c12', skin: '#c68642', hair: '#1a1a1a', hat: null },
];

// ---- NPC Dialogue Lines ----

const STYLE_DIALOGUES = {
    'Business': [
        "Can't talk, running late for a meeting!",
        "The market is volatile today...",
        "My boss needs those reports by 5!",
    ],
    'Casual': [
        "Yo what's up, dude!",
        "This city is pretty chill.",
        "Heard there's great pizza nearby.",
    ],
    'Jogger': [
        "Can't stop, gotta keep my heart rate up!",
        "Running keeps the mind sharp!",
        "Almost hit my 10k steps today!",
    ],
    'Tourist': [
        "This city is amazing! So much to see!",
        "Do you know where the beach is?",
        "I'm taking so many photos!",
    ],
    'Student': [
        "Ugh, finals are coming up...",
        "The library has free wifi!",
        "I should be studying right now...",
    ],
    'Worker': [
        "Another day, another dollar.",
        "Break time is the best time!",
        "The warehouse is so hot today.",
    ],
    'Lady': [
        "Excuse me, do you know the time?",
        "The flower beds are so pretty!",
        "Love the weather today!",
    ],
    'Old Man': [
        "Back in my day, this was all fields!",
        "Young people these days...",
        "I remember when gas was a dollar!",
    ],
};

const GENERIC_DIALOGUES = [
    "Hey there!",
    "Nice day, isn't it?",
    "Have a good one!",
    "Dude Angeles is the best city!",
    "Watch out for crazy drivers!",
    "There's some cool shops around here.",
    "I love this neighborhood.",
    "Stay safe out there!",
    "Have you been to the skate park?",
    "The food district has the best eats!",
];

const PICKUP_LINES = [
    "To the skate park, please!",
    "Thanks for stopping!",
    "Let's go, dude!",
    "Hit it!",
    "Step on it!",
    "Skate park, and make it snappy!",
    "Finally, a ride!",
    "Rad! Let's roll!",
    "Awesome, I need a lift!",
];

const DROPOFF_LINES = [
    "Thanks for the ride, dude!",
    "Here's your fare!",
    "That was a gnarly ride!",
    "Later, dude!",
    "You're the best driver!",
    "Sick ride, bro!",
    "That was rad!",
];

const FOOTBALL_DIALOGUES = [
    "We're gonna crush it this season! ROAR!",
    "Dude Dinosaurs, baby!",
    "Coach has us running drills all day!",
    "Did you see last week's game? Epic!",
    "Gotta stay focused. Big game Saturday.",
    "You play football? You should try out!",
    "Defense wins championships!",
    "I bench 350, bro. No cap.",
];

const SECURITY_DIALOGUES = [
    "Move along, nothing to see here.",
    "Authorized personnel only past this point.",
    "Sir, I'm gonna need to see your ticket.",
    "Stay behind the sidelines, please.",
    "Keep the area clear, folks.",
    "No flash photography during practice.",
    "This area is restricted.",
];

const COACH_DIALOGUES = [
    "Alright, let's HUSTLE! Run it again!",
    "Dude Dinosaurs are going ALL the way!",
    "These kids have real talent, I tell ya.",
    "DEFENSE! DEFENSE! DEFENSE!",
    "We need more water out here! HYDRATE!",
    "You want on the team? Show me what you got!",
];

const CONSTRUCTION_DIALOGUES = [
    "Watch your step, hard hat area!",
    "We're building condos here. Fancy ones!",
    "Hey, hand me that wrench!",
    "Break time isn't for another hour...",
    "This foundation is solid, trust me.",
    "The foreman's been on our case all day.",
    "Safety first, always!",
];

const GARBAGE_DIALOGUES = [
    "The city's trash won't pick itself up!",
    "Four cans per run, then dump at the center.",
    "Those garbage trucks are heavy, be careful!",
    "We keep Dude Angeles clean!",
    "Always wear your vest on duty!",
    "The dump is right here when you're full.",
];

const JOSH_DALLAN_DIALOGUES = [
    "Want my signature?",
];

const LOCKER_ROOM_DIALOGUES = [
    "Welcome to the locker room!",
    "Players only past this point... just kidding!",
    "Need a towel? Help yourself!",
    "Game day is always exciting around here.",
];

const BASKETBALL_DIALOGUES = [
    "Dynamic Dudes all the way!",
    "Did you see that crossover? Nasty!",
    "Nothing but net, baby!",
    "We're going to the championship!",
    "Ball don't lie!",
    "Get that weak stuff outta here!",
    "Swish! That's how we do it!",
    "Time to dunk on these fools!",
];

const BBALL_COACH_DIALOGUES = [
    "Run the play! Run the play!",
    "Defense! Get back on D!",
    "Box out! Grab the rebound!",
    "Time out! Huddle up!",
    "Great hustle out there!",
    "We need to pick up the pace!",
];

const BBALL_REFEREE_DIALOGUES = [
    "Keep it clean, players!",
    "That's a foul! Two shots!",
    "Play on!",
    "Technical foul warning!",
    "Watch the travel!",
];

const BBALL_SECURITY_DIALOGUES = [
    "Stay in your seats, folks.",
    "No flash photography during the game.",
    "Sir, I need to see your ticket.",
    "Clear the aisle, please.",
    "Enjoy the game, but stay behind the line.",
];

const BBALL_TOWEL_DIALOGUES = [
    "Fresh towel here!",
    "Need a wipe-down? Here you go!",
    "Keeping the court dry!",
    "Towel? Towel? Anyone?",
];

const PRISONER_DIALOGUES = [
    "They only give cold beans and tortilla!",
    "I didn't do it, I swear!",
    "How long have I been in here?",
    "Tell my lawyer I want out!",
    "The food here is terrible...",
    "I was framed, dude!",
    "Cold beans and tortilla again today...",
    "At least I got a roof over my head.",
];

// ---- Constants ----

const NPC_SPEED = 40;
const IDLE_TIME_MIN = 1;
const IDLE_TIME_MAX = 4;
const WALK_TIME_MIN = 3;
const WALK_TIME_MAX = 8;
const TALK_DISTANCE = 50;
const INSIDE_TIME_MIN = 8;
const INSIDE_TIME_MAX = 20;
const DROPOFF_RESPAWN_TIME = 8; // seconds before dropped-off NPC respawns at origin

// Taxi mechanic
const RIDE_FARE = 50;            // dollars per passenger delivered
const PICKUP_RADIUS = 18;       // pixels - how close the vehicle must be
const MAX_PASSENGERS = 4;

// Dropoff zone: Skate Park (cols 28-34, rows 29-36 in tiles)
const DROPOFF_ZONE = {
    x: 28 * TILE_SIZE,
    y: 29 * TILE_SIZE,
    w: 7 * TILE_SIZE,
    h: 7 * TILE_SIZE,
};

// ---- NPC Class ----

class NPC {
    constructor(x, y, styleIndex) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 28;
        this.style = NPC_STYLES[styleIndex % NPC_STYLES.length];

        this.state = 'walking';
        this.direction = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT][Math.floor(Math.random() * 4)];
        this.speed = NPC_SPEED * (0.7 + Math.random() * 0.6);

        // Timers
        this.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
        this.animTimer = 0;
        this.animFrame = 0;

        // Spawn point (for respawning)
        this.spawnX = x;
        this.spawnY = y;

        // Building entry
        this.targetDoor = null;

        // Role and movement zone
        this.role = 'pedestrian'; // 'pedestrian', 'football_player', 'security', 'coach', 'basketball_*'
        this.zone = null; // { x1, y1, x2, y2 } pixel bounds

        // Basketball-specific
        this.team = null;         // 'home' or 'away'
        this.jerseyNum = 0;
        this.hasBall = false;
        this.onCourt = true;      // false = bench
        this.benchTarget = null;  // {x,y} bench seat position
        this.drinkTimer = 0;      // countdown to go get drink
        this.drinkTarget = null;  // {x,y} drink station position
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    getSortY() {
        return this.y + this.height;
    }
}

// ---- NPC Manager ----

export class NPCManager {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.tiles = tileMap.tiles;
        this.mapWidth = tileMap.width;
        this.mapHeight = tileMap.height;
        this.npcs = [];

        // Taxi system
        this.passengers = [];       // NPCs currently riding
        this.deliveryCount = 0;     // total passengers delivered
        this.pendingReward = 0;     // money to claim (from dropoffs)
        this.pendingPickups = [];   // NPCs picked up this frame (for messages)

        // Door positions for NPC building-enter behavior (set by Game.js)
        this.doorPositions = [];

        // Construction zone (set by Game.js)
        this.constructionZone = null;

        // Schedule system: lunch breaks and work/rest
        this.restaurantDoors = []; // { x, y } positions near restaurant doors
        this._scheduleState = 'normal'; // 'normal', 'lunch', 'returning'
        this._lastScheduleMinute = -1;

        this._spawnNPCs(20);

        // Stadium NPCs (spawned later by Game.js via spawnStadiumNPCs)
    }

    get maxPassengers() { return MAX_PASSENGERS; }

    /** Set building door positions for NPC building-enter behavior */
    setDoorPositions(doors) {
        this.doorPositions = doors;
    }

    /** Set restaurant door positions for lunch break system */
    setRestaurantDoors(doors) {
        this.restaurantDoors = doors;
    }

    /** Update NPC schedules based on game time */
    updateSchedule(gameMinutes) {
        const T = TILE_SIZE;
        const hour = Math.floor(gameMinutes / 60);
        const minute = Math.floor(gameMinutes % 60);

        // 12:00 PM — lunch break starts
        if (hour === 12 && minute === 0 && this._scheduleState === 'normal') {
            this._scheduleState = 'lunch';
            for (const npc of this.npcs) {
                if (this._isLunchNPC(npc) && this.restaurantDoors.length > 0) {
                    npc._savedX = npc.x;
                    npc._savedY = npc.y;
                    npc._savedState = npc.state;
                    npc._savedZone = npc.zone;
                    const door = this.restaurantDoors[Math.floor(Math.random() * this.restaurantDoors.length)];
                    npc._lunchTarget = { x: door.x + (Math.random() - 0.5) * T, y: door.y + T };
                    npc.state = 'lunch_going';
                    npc.zone = null; // free to roam
                }
            }
        }

        // 12:45 PM — lunch over, return to posts
        if (hour === 12 && minute >= 45 && this._scheduleState === 'lunch') {
            this._scheduleState = 'returning';
            for (const npc of this.npcs) {
                if (npc.state === 'lunch_going' || npc.state === 'lunch_eating') {
                    npc.state = 'lunch_returning';
                }
            }
        }

        // Update lunch NPC movement
        for (const npc of this.npcs) {
            if (npc.state === 'lunch_going' && npc._lunchTarget) {
                const dx = npc._lunchTarget.x - npc.x;
                const dy = npc._lunchTarget.y - npc.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 4) {
                    const speed = 60;
                    npc.x += (dx / dist) * speed * (1 / 60);
                    npc.y += (dy / dist) * speed * (1 / 60);
                    if (Math.abs(dx) >= Math.abs(dy)) npc.direction = dx > 0 ? DIR.RIGHT : DIR.LEFT;
                    else npc.direction = dy > 0 ? DIR.DOWN : DIR.UP;
                } else {
                    npc.state = 'lunch_eating';
                    npc.direction = DIR.DOWN;
                }
            }
            if (npc.state === 'lunch_returning' && npc._savedX != null) {
                const dx = npc._savedX - npc.x;
                const dy = npc._savedY - npc.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 4) {
                    const speed = 60;
                    npc.x += (dx / dist) * speed * (1 / 60);
                    npc.y += (dy / dist) * speed * (1 / 60);
                    if (Math.abs(dx) >= Math.abs(dy)) npc.direction = dx > 0 ? DIR.RIGHT : DIR.LEFT;
                    else npc.direction = dy > 0 ? DIR.DOWN : DIR.UP;
                } else {
                    npc.x = npc._savedX;
                    npc.y = npc._savedY;
                    npc.state = npc._savedState || 'walking';
                    npc.zone = npc._savedZone || null;
                    npc._savedX = null;
                    npc._savedY = null;
                    npc._lunchTarget = null;
                }
            }
        }

        // Check if all returned
        if (this._scheduleState === 'returning') {
            const anyLunch = this.npcs.some(n => n.state === 'lunch_returning');
            if (!anyLunch) this._scheduleState = 'normal';
        }

        // Reset schedule at 1 PM in case it's stuck
        if (hour === 13 && this._scheduleState !== 'normal') {
            for (const npc of this.npcs) {
                if (npc.state === 'lunch_going' || npc.state === 'lunch_eating' || npc.state === 'lunch_returning') {
                    if (npc._savedX != null) {
                        npc.x = npc._savedX;
                        npc.y = npc._savedY;
                        npc.state = npc._savedState || 'walking';
                        npc.zone = npc._savedZone || null;
                    } else {
                        npc.state = 'walking';
                    }
                }
            }
            this._scheduleState = 'normal';
        }
    }

    _isLunchNPC(npc) {
        // Construction workers and business-style pedestrians go to lunch
        if (npc.role === 'construction') return true;
        if (npc.role === 'pedestrian' && npc.style && (npc.style.name === 'Business' || npc.style.name === 'Worker')) return true;
        return false;
    }

    /** Set construction zone bounds to keep regular NPCs out */
    setConstructionZone(zone) {
        if (zone) {
            const T = TILE_SIZE;
            this.constructionZone = {
                x1: zone.zoneCols[0] * T - T,
                y1: zone.zoneRows[0] * T - T,
                x2: (zone.zoneCols[1] + 1) * T + T,
                y2: (zone.zoneRows[1] + 1) * T + T,
            };
        }
    }

    /** Claim accumulated reward money. Returns amount and resets. */
    claimReward() {
        const reward = this.pendingReward;
        this.pendingReward = 0;
        return reward;
    }

    /** Claim NPCs picked up this frame (for showing messages). */
    claimPickups() {
        const pickups = this.pendingPickups.slice();
        this.pendingPickups = [];
        return pickups;
    }

    /** Get a random pickup line */
    getPickupLine() {
        return PICKUP_LINES[Math.floor(Math.random() * PICKUP_LINES.length)];
    }

    /** Get a random dropoff line */
    getDropoffLine() {
        return DROPOFF_LINES[Math.floor(Math.random() * DROPOFF_LINES.length)];
    }

    /**
     * Check if the player vehicle is in the dropoff zone.
     * If so, drop off all passengers and return the reward amount.
     */
    checkDropoff(playerX, playerY) {
        if (this.passengers.length === 0) return 0;

        const z = DROPOFF_ZONE;
        if (playerX >= z.x && playerX <= z.x + z.w &&
            playerY >= z.y && playerY <= z.y + z.h) {

            const count = this.passengers.length;
            const reward = count * RIDE_FARE;

            // NPCs hop out and walk around the skate park briefly, then respawn
            for (const npc of this.passengers) {
                npc.state = 'dropped_off';
                npc.x = playerX - 20 + Math.random() * 40;
                npc.y = playerY + 10 + Math.random() * 30;
                npc.stateTimer = DROPOFF_RESPAWN_TIME;
                npc.animFrame = 0;
            }

            this.passengers = [];
            this.deliveryCount += count;
            this.pendingReward += reward;
            return reward;
        }

        return 0;
    }

    /**
     * Release all passengers (e.g. when player exits vehicle).
     * NPCs hop out at the given position. No fare earned.
     * Returns number of passengers released.
     */
    releasePassengers(x, y) {
        const count = this.passengers.length;
        if (count === 0) return 0;

        for (const npc of this.passengers) {
            npc.state = 'idle';
            npc.x = x - 15 + Math.random() * 30;
            npc.y = y + 5 + Math.random() * 20;
            npc.stateTimer = 2 + Math.random() * 3;
            npc.animFrame = 0;
        }

        this.passengers = [];
        return count;
    }

    _spawnNPCs(count) {
        const T = TILE_SIZE;
        const spawnTiles = [];
        for (let r = 2; r < this.mapHeight - 2; r++) {
            for (let c = 2; c < this.mapWidth - 2; c++) {
                if (this.tiles[r][c] === TILES.SIDEWALK) {
                    spawnTiles.push({ col: c, row: r });
                }
            }
        }

        for (let i = 0; i < count && spawnTiles.length > 0; i++) {
            const idx = Math.floor(Math.random() * spawnTiles.length);
            const tile = spawnTiles[idx];
            const x = tile.col * T + T / 2 - 10 + Math.random() * 4;
            const y = tile.row * T + T / 2 - 14 + Math.random() * 4;
            this.npcs.push(new NPC(x, y, i));
        }
    }

    /** Spawn football players, security guards, and coach at the stadium */
    spawnStadiumNPCs(stadiumField) {
        const T = TILE_SIZE;
        const fLeft = stadiumField.fieldCols[0] * T;
        const fRight = (stadiumField.fieldCols[1] + 1) * T;
        const fTop = stadiumField.fieldRows[0] * T;
        const fBot = (stadiumField.fieldRows[1] + 1) * T;
        const fieldZone = { x1: fLeft + 8, y1: fTop + 8, x2: fRight - 8, y2: fBot - 8 };

        // Football players (6 + Josh Dallan) on the field
        const jerseyNums = [7, 12, 24, 55, 80, 99];
        for (let i = 0; i < 6; i++) {
            const x = fLeft + 16 + Math.random() * (fRight - fLeft - 40);
            const y = fTop + 16 + Math.random() * (fBot - fTop - 40);
            const npc = new NPC(x, y, i);
            npc.style = { ...STADIUM_STYLES.football_player, name: `Player #${jerseyNums[i]}`, helmet: true };
            npc.role = 'football_player';
            npc.zone = fieldZone;
            npc.speed = 60 + Math.random() * 30;
            this.npcs.push(npc);
        }

        // Josh Dallan #17 - star player
        const jdX = fLeft + (fRight - fLeft) / 2;
        const jdY = fTop + (fBot - fTop) / 2;
        const jd = new NPC(jdX, jdY, 17);
        jd.style = { ...STADIUM_STYLES.football_player, name: 'Josh Dallan #17', helmet: true };
        jd.role = 'josh_dallan';
        jd.zone = fieldZone;
        jd.speed = 50 + Math.random() * 20;
        this.npcs.push(jd);

        // Security guards (4) around perimeter (on concrete sidelines)
        const guardZone = {
            x1: (stadiumField.fieldCols[0] - 1) * T,
            y1: (stadiumField.fieldRows[0] - 1) * T,
            x2: (stadiumField.fieldCols[1] + 2) * T,
            y2: (stadiumField.fieldRows[1] + 2) * T,
        };
        const guardPositions = [
            { x: (stadiumField.fieldCols[0] - 1) * T + 8, y: stadiumField.sidelineRow * T + 8 },
            { x: (stadiumField.fieldCols[1] + 1) * T + 8, y: stadiumField.sidelineRow * T + 8 },
            { x: (stadiumField.fieldCols[0] - 1) * T + 8, y: (stadiumField.fieldRows[1] + 1) * T + 8 },
            { x: (stadiumField.fieldCols[1] + 1) * T + 8, y: (stadiumField.fieldRows[1] + 1) * T + 8 },
        ];
        for (let i = 0; i < 4; i++) {
            const pos = guardPositions[i];
            const npc = new NPC(pos.x, pos.y, i + 10);
            npc.style = { ...STADIUM_STYLES.security, name: 'Security' };
            npc.role = 'security';
            npc.zone = guardZone;
            npc.speed = 30 + Math.random() * 10;
            this.npcs.push(npc);
        }

        // Coach (1) on the west sideline (out of the way)
        const coachX = (stadiumField.fieldCols[0] - 1) * T + 8;
        const coachY = ((stadiumField.fieldRows[0] + stadiumField.fieldRows[1]) / 2) * T;
        const coach = new NPC(coachX, coachY, 20);
        coach.style = { ...STADIUM_STYLES.coach };
        coach.role = 'coach';
        coach.state = 'idle';
        coach.stateTimer = 999999;
        coach.direction = DIR.RIGHT; // facing the field
        this.npcs.push(coach);
    }

    /** Spawn construction workers at the construction site */
    spawnConstructionWorkers(constructionSite) {
        const T = TILE_SIZE;
        const left = constructionSite.zoneCols[0] * T;
        const right = (constructionSite.zoneCols[1] + 1) * T;
        const top = constructionSite.zoneRows[0] * T;
        const bot = (constructionSite.zoneRows[1] + 1) * T;
        const zone = { x1: left + 8, y1: top + 8, x2: right - 8, y2: bot - 8 };

        // Break Room building area to avoid (cols 53-55, rows 32-33 → pixel exclusion)
        const brExclLeft = 53 * T - 8;
        const brExclRight = 56 * T + 8;
        const brExclTop = 32 * T - 16;
        const brExclBot = 34 * T + 16;

        for (let i = 0; i < CONSTRUCTION_STYLES.length; i++) {
            let x, y, attempts = 0;
            do {
                x = left + 20 + Math.random() * (right - left - 50);
                y = top + 20 + Math.random() * (bot - top - 50);
                attempts++;
            } while (attempts < 20 && x > brExclLeft && x < brExclRight && y > brExclTop && y < brExclBot);
            const npc = new NPC(x, y, i + 30);
            npc.style = { ...CONSTRUCTION_STYLES[i] };
            npc.role = 'construction';
            npc.zone = zone;
            npc.speed = 25 + Math.random() * 15;
            this.npcs.push(npc);
        }
    }

    /** Spawn garbage foreman at the garbage center */
    spawnGarbageWorkers(garbageCenter, foremanSpawn) {
        const T = TILE_SIZE;
        const left = garbageCenter.zoneCols[0] * T;
        const right = (garbageCenter.zoneCols[1] + 1) * T;
        const top = garbageCenter.zoneRows[0] * T;
        const bot = (garbageCenter.zoneRows[1] + 1) * T;
        const zone = { x1: left + 8, y1: top + 8, x2: right - 8, y2: bot - 8 };

        // Garbage Foreman
        const fx = foremanSpawn.col * T + T / 2;
        const fy = foremanSpawn.row * T + T / 2;
        const foreman = new NPC(fx, fy, 50);
        foreman.style = { ...GARBAGE_STYLES.foreman };
        foreman.role = 'garbage_worker';
        foreman.state = 'idle';
        foreman.stateTimer = 999999;
        foreman.direction = 0; // facing down
        foreman.zone = zone;
        this.npcs.push(foreman);
    }

    /** Spawn road workers at a road work zone */
    spawnRoadWorkers(roadWork) {
        const T = TILE_SIZE;
        const left = roadWork.zoneCols[0] * T;
        const right = (roadWork.zoneCols[1] + 1) * T;
        const top = roadWork.zoneRows[0] * T;
        const bot = (roadWork.zoneRows[1] + 1) * T;
        const zone = { x1: left + 8, y1: top + 4, x2: right - 8, y2: bot - 4 };

        // Spawn 3 road workers
        const roadWorkerStyles = [
            { name: 'Road Worker', shirt: '#f39c12', pants: '#555', skin: '#d4a574', hair: '#4a3520', hat: '#f1c40f' },
            { name: 'Road Worker', shirt: '#f39c12', pants: '#555', skin: '#f0c27a', hair: '#2c1810', hat: '#f1c40f' },
            { name: 'Road Worker', shirt: '#f39c12', pants: '#555', skin: '#c68642', hair: '#1a1a1a', hat: '#f1c40f' },
        ];

        for (let i = 0; i < 3; i++) {
            const x = left + 16 + Math.random() * (right - left - 40);
            const y = top + 8 + Math.random() * (bot - top - 20);
            const npc = new NPC(x, y, i + 40);
            npc.style = { ...roadWorkerStyles[i] };
            npc.role = 'construction'; // reuse construction role for dialogue
            npc.zone = zone;
            npc.speed = 15 + Math.random() * 10;
            this.npcs.push(npc);
        }
    }

    /** Spawn 2 referees on the football field */
    spawnFootballReferees(stadiumField) {
        const T = TILE_SIZE;
        const fLeft = stadiumField.fieldCols[0] * T;
        const fRight = (stadiumField.fieldCols[1] + 1) * T;
        const fTop = stadiumField.fieldRows[0] * T;
        const fBot = (stadiumField.fieldRows[1] + 1) * T;
        const fieldZone = { x1: fLeft + 8, y1: fTop + 8, x2: fRight - 8, y2: fBot - 8 };

        for (let i = 0; i < 2; i++) {
            const x = fLeft + 30 + i * ((fRight - fLeft) / 2 - 40);
            const y = fTop + 30 + i * ((fBot - fTop) / 2 - 40);
            const ref = new NPC(x, y, 60 + i);
            ref.style = { ...BASKETBALL_STYLES.referee, name: `Referee` };
            ref.role = 'fb_referee';
            ref.zone = fieldZone;
            ref.speed = 40 + Math.random() * 15;
            this.npcs.push(ref);
        }
    }

    /** Spawn all basketball arena NPCs */
    spawnBasketballNPCs(court) {
        const T = TILE_SIZE;
        const cLeft = court.courtCols[0] * T;
        const cRight = (court.courtCols[1] + 1) * T;
        const cTop = court.courtRows[0] * T;
        const cBot = (court.courtRows[1] + 1) * T;
        const courtZone = { x1: cLeft + 4, y1: cTop + 4, x2: cRight - 4, y2: cBot - 4 };

        // Sideline zone (includes court + sidelines)
        const sLeft = court.sidelineCols[0] * T;
        const sRight = (court.sidelineCols[1] + 1) * T;
        const sTop = court.sidelineRows[0] * T;
        const sBot = (court.sidelineRows[1] + 1) * T;
        const sideZone = { x1: sLeft + 4, y1: sTop + 4, x2: sRight - 4, y2: sBot - 4 };

        // Bench positions — home team on west sideline, away on east sideline
        const homeBenchX = court.benchCol * T + T / 2;
        const awayBenchX = court.sidelineCols[1] * T + T / 2;
        const benchStartY = court.benchRows[0] * T;
        const benchSpacing = T * 0.8; // ~26px between bench seats
        const drinkX = court.drinkCol * T + T / 2;
        const drinkY = court.drinkRow * T + T / 2;

        // --- Home team jersey numbers ---
        const homeNums = [1, 3, 5, 11, 23, 30, 42, 8];
        const awaySkinVariants = ['#d4a574', '#f0c27a', '#c68642', '#e8b88a', '#8d5524'];
        const homeSkinVariants = ['#f0c27a', '#d4a574', '#e8b88a', '#c68642', '#8d5524'];

        this.basketballNPCs = { home: [], away: [], ball: null, score: [0, 0], shotClock: 0, subTimer: 0 };

        // --- 8 Home team players (5 on court, 3 on bench) ---
        let homeBenchIdx = 0;
        for (let i = 0; i < 8; i++) {
            const onCourt = i < 5;
            const bIdx = onCourt ? 0 : homeBenchIdx++;
            const x = onCourt
                ? cLeft + 10 + Math.random() * (cRight - cLeft - 30)
                : homeBenchX - 4;
            const y = onCourt
                ? cTop + 10 + Math.random() * (cBot - cTop - 30)
                : benchStartY + bIdx * benchSpacing;
            const npc = new NPC(x, y, 70 + i);
            npc.style = {
                ...BASKETBALL_STYLES.home_player,
                name: `Dude #${homeNums[i]}`,
                skin: homeSkinVariants[i % homeSkinVariants.length],
            };
            npc.role = 'basketball_player';
            npc.team = 'home';
            npc.jerseyNum = homeNums[i];
            npc.onCourt = onCourt;
            npc.zone = onCourt ? courtZone : sideZone;
            npc.speed = onCourt ? (70 + Math.random() * 30) : 30;
            npc.benchTarget = { x: homeBenchX - 4, y: benchStartY + bIdx * benchSpacing };
            npc.drinkTarget = { x: drinkX, y: drinkY };
            npc.drinkTimer = 8 + Math.random() * 12;
            if (!onCourt) {
                npc.state = 'idle';
                npc.stateTimer = 999999;
            }
            this.npcs.push(npc);
            this.basketballNPCs.home.push(npc);
        }

        // --- 8 Away team players (5 on court, 3 on bench) ---
        const awayNums = [2, 7, 15, 21, 34, 44, 50, 10];
        let awayBenchIdx = 0;
        for (let i = 0; i < 8; i++) {
            const onCourt = i < 5;
            const bIdx = onCourt ? 0 : awayBenchIdx++;
            const x = onCourt
                ? cLeft + 10 + Math.random() * (cRight - cLeft - 30)
                : awayBenchX - 4;
            const y = onCourt
                ? cTop + 10 + Math.random() * (cBot - cTop - 30)
                : benchStartY + bIdx * benchSpacing;
            const npc = new NPC(x, y, 80 + i);
            npc.style = {
                ...BASKETBALL_STYLES.away_player,
                name: `Nugget #${awayNums[i]}`,
                skin: awaySkinVariants[i % awaySkinVariants.length],
            };
            npc.role = 'basketball_player';
            npc.team = 'away';
            npc.jerseyNum = awayNums[i];
            npc.onCourt = onCourt;
            npc.zone = onCourt ? courtZone : sideZone;
            npc.speed = onCourt ? (65 + Math.random() * 30) : 30;
            npc.benchTarget = { x: awayBenchX - 4, y: benchStartY + bIdx * benchSpacing };
            npc.drinkTarget = { x: drinkX, y: drinkY };
            npc.drinkTimer = 10 + Math.random() * 15;
            if (!onCourt) {
                npc.state = 'idle';
                npc.stateTimer = 999999;
            }
            this.npcs.push(npc);
            this.basketballNPCs.away.push(npc);
        }

        // Give ball to a random home player on court
        const homeCourt = this.basketballNPCs.home.filter(n => n.onCourt);
        if (homeCourt.length > 0) {
            const handler = homeCourt[Math.floor(Math.random() * homeCourt.length)];
            handler.hasBall = true;
            this.basketballNPCs.ball = handler;
        }

        // --- Coaches ---
        // Home head coach (east sideline, mid-court)
        const hcX = (court.sidelineCols[1]) * T + T / 2;
        const hcY = ((court.courtRows[0] + court.courtRows[1]) / 2) * T;
        const homeCoach = new NPC(hcX, hcY, 90);
        homeCoach.style = { ...BASKETBALL_STYLES.home_coach };
        homeCoach.role = 'bball_coach';
        homeCoach.state = 'idle';
        homeCoach.stateTimer = 999999;
        homeCoach.direction = DIR.LEFT;
        this.npcs.push(homeCoach);

        // Away head coach (east sideline, near south)
        const acX = (court.sidelineCols[1]) * T + T / 2;
        const acY = ((court.courtRows[0] + court.courtRows[1]) / 2 + 2) * T;
        const awayCoach = new NPC(acX, acY, 91);
        awayCoach.style = { ...BASKETBALL_STYLES.away_coach };
        awayCoach.role = 'bball_coach';
        awayCoach.state = 'idle';
        awayCoach.stateTimer = 999999;
        awayCoach.direction = DIR.LEFT;
        this.npcs.push(awayCoach);

        // --- Assistant coaches ---
        const haX = hcX;
        const haY = hcY - T;
        const homeAsst = new NPC(haX, haY, 92);
        homeAsst.style = { ...BASKETBALL_STYLES.home_asst };
        homeAsst.role = 'bball_coach';
        homeAsst.state = 'idle';
        homeAsst.stateTimer = 999999;
        homeAsst.direction = DIR.LEFT;
        this.npcs.push(homeAsst);

        const aaX = acX;
        const aaY = acY + T;
        const awayAsst = new NPC(aaX, aaY, 93);
        awayAsst.style = { ...BASKETBALL_STYLES.away_asst };
        awayAsst.role = 'bball_coach';
        awayAsst.state = 'idle';
        awayAsst.stateTimer = 999999;
        awayAsst.direction = DIR.LEFT;
        this.npcs.push(awayAsst);

        // --- 2 Referees ---
        for (let i = 0; i < 2; i++) {
            const rx = cLeft + 20 + i * ((cRight - cLeft) - 40);
            const ry = cTop + (cBot - cTop) / 2 + (i === 0 ? -20 : 20);
            const ref = new NPC(rx, ry, 94 + i);
            ref.style = { ...BASKETBALL_STYLES.referee, name: 'Referee' };
            ref.role = 'bball_referee';
            ref.zone = courtZone;
            ref.speed = 45 + Math.random() * 15;
            this.npcs.push(ref);
        }

        // --- 2 Security guards (bright yellow vests) ---
        const secPositions = [
            { x: (court.fenceCols[0] + 1) * T, y: (court.fenceRows[1]) * T },
            { x: (court.fenceCols[1]) * T, y: (court.fenceRows[1]) * T },
        ];
        for (let i = 0; i < 2; i++) {
            const sec = new NPC(secPositions[i].x, secPositions[i].y, 96 + i);
            sec.style = { ...BASKETBALL_STYLES.bball_security, name: 'Security' };
            sec.role = 'bball_security';
            sec.zone = sideZone;
            sec.speed = 25 + Math.random() * 10;
            this.npcs.push(sec);
        }

        // --- 2 Towel collectors ---
        for (let i = 0; i < 2; i++) {
            const tx = sLeft + 10 + i * (sRight - sLeft - 30);
            const ty = sBot - 12;
            const towel = new NPC(tx, ty, 98 + i);
            towel.style = { ...BASKETBALL_STYLES.towel, name: 'Towel Staff' };
            towel.role = 'bball_towel';
            towel.zone = sideZone;
            towel.speed = 30 + Math.random() * 10;
            this.npcs.push(towel);
        }

        this.basketballNPCs.shotClock = 3 + Math.random() * 4;
        this.basketballNPCs.subTimer = 100; // ~5 game-minutes at 20x speed (8 min day = gameSpeed ~3)
    }

    /** Update basketball game simulation */
    updateBasketball(dt) {
        if (!this.basketballNPCs) return;

        const bb = this.basketballNPCs;
        const allPlayers = [...bb.home, ...bb.away];

        // --- Shot clock / play timer ---
        bb.shotClock -= dt;
        if (bb.shotClock <= 0) {
            this._basketballPlay(bb);
            bb.shotClock = 2.5 + Math.random() * 4;
        }

        // --- Substitution timer ---
        bb.subTimer -= dt;
        if (bb.subTimer <= 0) {
            this._basketballSubstitution(bb);
            bb.subTimer = 80 + Math.random() * 40; // roughly every 5 game-min
        }

        // --- Bench players: drinking behavior ---
        for (const npc of allPlayers) {
            if (npc.onCourt) continue;

            if (npc.state === 'bball_drinking') {
                npc.stateTimer -= dt;
                if (npc.stateTimer <= 0) {
                    // Return to bench
                    npc.state = 'bball_return_bench';
                    npc.stateTimer = 5;
                }
                continue;
            }

            if (npc.state === 'bball_going_drink') {
                // Move toward drink station
                const dx = npc.drinkTarget.x - npc.x;
                const dy = npc.drinkTarget.y - npc.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 8) {
                    npc.state = 'bball_drinking';
                    npc.stateTimer = 2; // drink for 2 seconds
                    npc.animFrame = 0;
                } else {
                    npc.x += (dx / dist) * npc.speed * dt;
                    npc.y += (dy / dist) * npc.speed * dt;
                    npc.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIR.RIGHT : DIR.LEFT) : (dy > 0 ? DIR.DOWN : DIR.UP);
                    npc.animTimer += dt;
                    if (npc.animTimer >= 0.2) { npc.animTimer -= 0.2; npc.animFrame = npc.animFrame === 1 ? 2 : 1; }
                }
                continue;
            }

            if (npc.state === 'bball_return_bench') {
                const dx = npc.benchTarget.x - npc.x;
                const dy = npc.benchTarget.y - npc.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 8) {
                    npc.state = 'idle';
                    npc.stateTimer = 999999;
                    npc.animFrame = 0;
                    npc.drinkTimer = 8 + Math.random() * 15;
                } else {
                    npc.x += (dx / dist) * npc.speed * dt;
                    npc.y += (dy / dist) * npc.speed * dt;
                    npc.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? DIR.RIGHT : DIR.LEFT) : (dy > 0 ? DIR.DOWN : DIR.UP);
                    npc.animTimer += dt;
                    if (npc.animTimer >= 0.2) { npc.animTimer -= 0.2; npc.animFrame = npc.animFrame === 1 ? 2 : 1; }
                }
                continue;
            }

            // Countdown to go get a drink
            npc.drinkTimer -= dt;
            if (npc.drinkTimer <= 0) {
                npc.state = 'bball_going_drink';
                npc.speed = 35;
            }
        }

        // --- Ball follows handler ---
        if (bb.ball && bb.ball.onCourt) {
            // Already handled by normal NPC walking
        }
    }

    _basketballPlay(bb) {
        const handler = bb.ball;
        if (!handler || !handler.onCourt) {
            // Pick a new handler from whichever team
            const courtPlayers = [...bb.home, ...bb.away].filter(n => n.onCourt);
            if (courtPlayers.length === 0) return;
            const newH = courtPlayers[Math.floor(Math.random() * courtPlayers.length)];
            if (handler) handler.hasBall = false;
            newH.hasBall = true;
            bb.ball = newH;
            return;
        }

        const roll = Math.random();
        const handlerTeam = handler.team === 'home' ? bb.home : bb.away;
        const otherTeam = handler.team === 'home' ? bb.away : bb.home;

        if (roll < 0.40) {
            // Pass to teammate
            const teammates = handlerTeam.filter(n => n.onCourt && n !== handler);
            if (teammates.length > 0) {
                const target = teammates[Math.floor(Math.random() * teammates.length)];
                handler.hasBall = false;
                target.hasBall = true;
                bb.ball = target;
            }
        } else if (roll < 0.65) {
            // Shoot - score attempt
            const made = Math.random() < 0.45;
            if (made) {
                if (handler.team === 'home') bb.score[0] += (Math.random() < 0.2 ? 3 : 2);
                else bb.score[1] += (Math.random() < 0.2 ? 3 : 2);
            }
            // Ball goes to other team after shot
            handler.hasBall = false;
            const otherCourt = otherTeam.filter(n => n.onCourt);
            if (otherCourt.length > 0) {
                const newH = otherCourt[Math.floor(Math.random() * otherCourt.length)];
                newH.hasBall = true;
                bb.ball = newH;
            }
        } else if (roll < 0.80) {
            // Steal by other team
            handler.hasBall = false;
            const otherCourt = otherTeam.filter(n => n.onCourt);
            if (otherCourt.length > 0) {
                const stealer = otherCourt[Math.floor(Math.random() * otherCourt.length)];
                stealer.hasBall = true;
                bb.ball = stealer;
            }
        }
        // else: dribble / hold - no change
    }

    _basketballSubstitution(bb) {
        // Sub one player from each team
        for (const team of [bb.home, bb.away]) {
            const onCourt = team.filter(n => n.onCourt);
            const onBench = team.filter(n => !n.onCourt);
            if (onCourt.length === 0 || onBench.length === 0) continue;

            // Pick random court player (not the ball handler) and random bench player
            const subOut = onCourt.filter(n => !n.hasBall);
            if (subOut.length === 0) continue;
            const playerOut = subOut[Math.floor(Math.random() * subOut.length)];
            const playerIn = onBench[Math.floor(Math.random() * onBench.length)];

            // Swap bench positions
            const tempBench = playerOut.benchTarget;
            playerOut.benchTarget = playerIn.benchTarget;
            playerIn.benchTarget = tempBench;

            // Player goes to bench
            playerOut.onCourt = false;
            playerOut.state = 'bball_return_bench';
            playerOut.stateTimer = 5;
            playerOut.speed = 30;
            playerOut.drinkTimer = 6 + Math.random() * 10;

            // Player enters court
            playerIn.onCourt = true;
            playerIn.state = 'walking';
            playerIn.stateTimer = 3 + Math.random() * 4;
            playerIn.zone = { ...onCourt[0].zone }; // copy court zone
            playerIn.speed = 65 + Math.random() * 30;
            // Move to court center-ish
            const cz = playerIn.zone;
            playerIn.x = (cz.x1 + cz.x2) / 2 + (Math.random() - 0.5) * 40;
            playerIn.y = (cz.y1 + cz.y2) / 2 + (Math.random() - 0.5) * 40;
        }
    }

    // ---- Find Nearest Talkable NPC ----

    findNearestTalkable(px, py) {
        let nearest = null;
        let nearestDist = TALK_DISTANCE;

        const talkableStates = ['walking', 'idle', 'bball_drinking', 'bball_return_bench', 'bball_going_drink', 'lunch_eating', 'siren_dodge'];
        for (const npc of this.npcs) {
            if (!talkableStates.includes(npc.state)) continue;
            const c = npc.getCenter();
            const dist = Math.hypot(px - c.x, py - c.y);
            if (dist < nearestDist) {
                nearest = npc;
                nearestDist = dist;
            }
        }

        return nearest;
    }

    /** Get a random dialogue line for an NPC */
    getDialogue(npc) {
        if (npc.role === 'josh_dallan') {
            return JOSH_DALLAN_DIALOGUES[0];
        }
        if (npc.role === 'football_player') {
            return FOOTBALL_DIALOGUES[Math.floor(Math.random() * FOOTBALL_DIALOGUES.length)];
        }
        if (npc.role === 'security') {
            return SECURITY_DIALOGUES[Math.floor(Math.random() * SECURITY_DIALOGUES.length)];
        }
        if (npc.role === 'coach') {
            return COACH_DIALOGUES[Math.floor(Math.random() * COACH_DIALOGUES.length)];
        }
        if (npc.role === 'construction') {
            return CONSTRUCTION_DIALOGUES[Math.floor(Math.random() * CONSTRUCTION_DIALOGUES.length)];
        }
        if (npc.role === 'prisoner') {
            return PRISONER_DIALOGUES[Math.floor(Math.random() * PRISONER_DIALOGUES.length)];
        }
        if (npc.role === 'garbage_worker') {
            return GARBAGE_DIALOGUES[Math.floor(Math.random() * GARBAGE_DIALOGUES.length)];
        }
        if (npc.role === 'locker_worker') {
            return LOCKER_ROOM_DIALOGUES[Math.floor(Math.random() * LOCKER_ROOM_DIALOGUES.length)];
        }
        if (npc.role === 'basketball_player') {
            return BASKETBALL_DIALOGUES[Math.floor(Math.random() * BASKETBALL_DIALOGUES.length)];
        }
        if (npc.role === 'bball_coach') {
            return BBALL_COACH_DIALOGUES[Math.floor(Math.random() * BBALL_COACH_DIALOGUES.length)];
        }
        if (npc.role === 'bball_referee' || npc.role === 'fb_referee') {
            return BBALL_REFEREE_DIALOGUES[Math.floor(Math.random() * BBALL_REFEREE_DIALOGUES.length)];
        }
        if (npc.role === 'bball_security') {
            return BBALL_SECURITY_DIALOGUES[Math.floor(Math.random() * BBALL_SECURITY_DIALOGUES.length)];
        }
        if (npc.role === 'bball_towel') {
            return BBALL_TOWEL_DIALOGUES[Math.floor(Math.random() * BBALL_TOWEL_DIALOGUES.length)];
        }
        const specific = STYLE_DIALOGUES[npc.style.name] || [];
        const all = [...specific, ...GENERIC_DIALOGUES];
        return all[Math.floor(Math.random() * all.length)];
    }

    // ---- Update ----

    update(dt, vehicles, sirenVehicle) {
        for (const npc of this.npcs) {
            // Siren dodge: pedestrians step 1 tile to the side when siren is nearby
            if (sirenVehicle && npc.role === 'pedestrian' &&
                (npc.state === 'walking' || npc.state === 'idle' || npc.state === 'siren_dodge')) {
                const cx = npc.x + npc.width / 2;
                const cy = npc.y + npc.height / 2;
                const dist = Math.hypot(cx - sirenVehicle.x, cy - sirenVehicle.y);
                if (dist < TILE_SIZE * 6) {
                    if (npc.state !== 'siren_dodge') {
                        // Start dodge: pick a perpendicular direction (1 tile away)
                        npc._sirenOrigX = npc.x;
                        npc._sirenOrigY = npc.y;
                        // Move perpendicular to siren vehicle direction
                        const svAngle = sirenVehicle.angle || 0;
                        const perpX = Math.cos(svAngle);
                        const perpY = Math.sin(svAngle);
                        // Choose side: move to whichever side is further from siren
                        const side = (cx - sirenVehicle.x) * perpX + (cy - sirenVehicle.y) * perpY > 0 ? 1 : -1;
                        npc._sirenTargetX = npc.x + perpX * TILE_SIZE * side;
                        npc._sirenTargetY = npc.y + perpY * TILE_SIZE * side;
                        npc.state = 'siren_dodge';
                    }
                    // Move toward target (1 tile to side)
                    const tdx = npc._sirenTargetX - npc.x;
                    const tdy = npc._sirenTargetY - npc.y;
                    const tLen = Math.hypot(tdx, tdy);
                    if (tLen > 2) {
                        const moveSpeed = 120 * dt;
                        npc.x += (tdx / tLen) * Math.min(moveSpeed, tLen);
                        npc.y += (tdy / tLen) * Math.min(moveSpeed, tLen);
                    }
                    npc.animTimer += dt;
                    if (npc.animTimer >= 0.15) {
                        npc.animTimer -= 0.15;
                        npc.animFrame = npc.animFrame === 1 ? 2 : 1;
                    }
                    continue;
                } else if (npc.state === 'siren_dodge') {
                    // Siren passed, return to normal
                    npc.state = 'walking';
                    npc.stateTimer = 2 + Math.random() * 3;
                }
            } else if (!sirenVehicle && npc.state === 'siren_dodge') {
                npc.state = 'walking';
                npc.stateTimer = 2 + Math.random() * 3;
            }

            switch (npc.state) {
                case 'walking':
                    this._updateWalking(npc, dt);
                    this._checkPickup(npc, vehicles);
                    break;
                case 'idle':
                    this._updateIdle(npc, dt);
                    this._checkPickup(npc, vehicles);
                    break;
                case 'riding':
                    // NPC is in the vehicle - nothing to update
                    break;
                case 'dropped_off':
                    this._updateDroppedOff(npc, dt);
                    break;
                case 'going_inside':
                    this._updateGoingInside(npc, dt);
                    break;
                case 'inside_building':
                    this._updateInsideBuilding(npc, dt);
                    break;
            }
        }
    }

    _updateWalking(npc, dt) {
        let dx = 0, dy = 0;
        switch (npc.direction) {
            case DIR.UP:    dy = -1; break;
            case DIR.DOWN:  dy = 1; break;
            case DIR.LEFT:  dx = -1; break;
            case DIR.RIGHT: dx = 1; break;
        }

        const newX = npc.x + dx * npc.speed * dt;
        const newY = npc.y + dy * npc.speed * dt;

        const centerX = newX + npc.width / 2;
        const centerY = newY + npc.height / 2;
        const tileCol = Math.floor(centerX / TILE_SIZE);
        const tileRow = Math.floor(centerY / TILE_SIZE);

        if (tileCol >= 0 && tileCol < this.mapWidth &&
            tileRow >= 0 && tileRow < this.mapHeight &&
            !SOLID_TILES.has(this.tiles[tileRow][tileCol])) {
            // Zone restriction check
            if (npc.zone) {
                if (centerX < npc.zone.x1 || centerX > npc.zone.x2 ||
                    centerY < npc.zone.y1 || centerY > npc.zone.y2) {
                    this._pickNewDirection(npc);
                } else {
                    npc.x = newX;
                    npc.y = newY;
                }
            } else {
                // Regular pedestrians should avoid the construction zone
                if (npc.role === 'pedestrian' && this.constructionZone) {
                    const cz = this.constructionZone;
                    if (centerX > cz.x1 && centerX < cz.x2 &&
                        centerY > cz.y1 && centerY < cz.y2) {
                        this._pickNewDirection(npc);
                    } else {
                        npc.x = newX;
                        npc.y = newY;
                    }
                } else {
                    npc.x = newX;
                    npc.y = newY;
                }
            }
        } else {
            this._pickNewDirection(npc);
        }

        // Walk animation
        npc.animTimer += dt;
        if (npc.animTimer >= 0.2) {
            npc.animTimer -= 0.2;
            npc.animFrame = npc.animFrame === 1 ? 2 : 1;
        }

        // Timer to switch to idle
        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
            if (npc.role === 'pedestrian' && Math.random() < 0.3 && this.doorPositions.length > 0) {
                this._startGoingInside(npc);
            } else {
                npc.state = 'idle';
                npc.stateTimer = IDLE_TIME_MIN + Math.random() * (IDLE_TIME_MAX - IDLE_TIME_MIN);
                npc.animFrame = 0;
            }
        }
    }

    _updateIdle(npc, dt) {
        npc.animFrame = 0;
        // Stationary NPCs
        if (npc.role === 'coach' || npc.role === 'bball_coach') return;
        // Basketball bench players are managed by updateBasketball
        if (npc.role === 'basketball_player' && !npc.onCourt) return;
        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
            npc.state = 'walking';
            npc.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
            this._pickNewDirection(npc);
        }
    }

    _updateDroppedOff(npc, dt) {
        // After being dropped off, NPC stands around, then respawns at origin
        npc.animFrame = 0;
        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
            npc.x = npc.spawnX;
            npc.y = npc.spawnY;
            npc.state = 'walking';
            npc.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
            this._pickNewDirection(npc);
        }
    }

    _startGoingInside(npc) {
        const door = this.doorPositions[Math.floor(Math.random() * this.doorPositions.length)];
        npc.targetDoor = door;
        npc.state = 'going_inside';
        npc.stateTimer = 15;
    }

    _updateGoingInside(npc, dt) {
        if (!npc.targetDoor) {
            npc.state = 'walking';
            npc.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
            return;
        }

        const c = npc.getCenter();
        const dx = npc.targetDoor.x - c.x;
        const dy = npc.targetDoor.y - c.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 16) {
            npc.state = 'inside_building';
            npc.stateTimer = INSIDE_TIME_MIN + Math.random() * (INSIDE_TIME_MAX - INSIDE_TIME_MIN);
            npc.animFrame = 0;
            return;
        }

        const speed = npc.speed * 1.2;
        const ndx = dx / dist;
        const ndy = dy / dist;
        npc.x += ndx * speed * dt;
        npc.y += ndy * speed * dt;

        if (Math.abs(ndx) > Math.abs(ndy)) {
            npc.direction = ndx > 0 ? DIR.RIGHT : DIR.LEFT;
        } else {
            npc.direction = ndy > 0 ? DIR.DOWN : DIR.UP;
        }

        npc.animTimer += dt;
        if (npc.animTimer >= 0.2) {
            npc.animTimer -= 0.2;
            npc.animFrame = npc.animFrame === 1 ? 2 : 1;
        }

        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
            npc.state = 'walking';
            npc.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
            this._pickNewDirection(npc);
        }
    }

    _updateInsideBuilding(npc, dt) {
        npc.stateTimer -= dt;
        if (npc.stateTimer <= 0) {
            if (npc.targetDoor) {
                npc.x = npc.targetDoor.x - npc.width / 2;
                npc.y = npc.targetDoor.y - npc.height / 2;
            }
            npc.state = 'walking';
            npc.stateTimer = WALK_TIME_MIN + Math.random() * (WALK_TIME_MAX - WALK_TIME_MIN);
            npc.targetDoor = null;
            this._pickNewDirection(npc);
        }
    }

    _pickNewDirection(npc) {
        const dirs = [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT];
        const filtered = dirs.filter(d => d !== npc.direction);
        npc.direction = filtered[Math.floor(Math.random() * filtered.length)];
    }

    // ---- Pickup Logic ----

    _checkPickup(npc, vehicles) {
        if (npc.role !== 'pedestrian') return; // only pedestrians can be passengers
        if (this.passengers.length >= MAX_PASSENGERS) return;

        const cx = npc.x + npc.width / 2;
        const cy = npc.y + npc.height / 2;

        for (const v of vehicles) {
            if (v.state !== 'player_driven') continue;
            if (v.typeName !== 'taxi') continue; // only taxi picks up passengers
            if (Math.abs(v.velocity) < 15) continue; // must be moving a bit

            const dist = Math.hypot(v.x - cx, v.y - cy);
            const pickupDist = PICKUP_RADIUS + Math.max(v.type.width, v.type.length) / 2;

            if (dist < pickupDist) {
                this._pickupNPC(npc);
                break;
            }
        }
    }

    _pickupNPC(npc) {
        npc.state = 'riding';
        this.passengers.push(npc);
        this.pendingPickups.push(npc);
    }

    // ---- Rendering ----

    getRenderEntries(ctx, camera, time) {
        const entries = [];
        for (const npc of this.npcs) {
            // Don't render NPCs that are invisible
            if (npc.state === 'riding' || npc.state === 'inside_building') continue;
            entries.push({
                sortY: npc.getSortY(),
                render: () => this._renderNPC(ctx, camera, npc, time),
            });
        }
        return entries;
    }

    _renderNPC(ctx, camera, npc, time) {
        const screen = camera.worldToScreen(npc.x, npc.y);

        const margin = 40;
        if (screen.x < -margin || screen.x > ctx.canvas.width + margin ||
            screen.y < -margin || screen.y > ctx.canvas.height + margin) {
            return;
        }

        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(screen.x + npc.width / 2, screen.y + npc.height - 1, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        this._drawNPCSprite(ctx, npc, screen.x, screen.y);

        // Stadium NPC labels
        if (npc.role === 'security') {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SECURITY', screen.x + npc.width / 2, screen.y + 16);
            ctx.textAlign = 'left';
        } else if (npc.role === 'josh_dallan') {
            // Josh Dallan - name + jersey number
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('JOSH DALLAN', screen.x + npc.width / 2, screen.y - 6);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 6px "Press Start 2P", monospace';
            ctx.fillText('17', screen.x + npc.width / 2, screen.y + 18);
            ctx.textAlign = 'left';
        } else if (npc.role === 'football_player' && npc.style.name) {
            // Jersey number
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 6px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            const num = npc.style.name.replace('Player #', '');
            ctx.fillText(num, screen.x + npc.width / 2, screen.y + 18);
            ctx.textAlign = 'left';
        } else if (npc.role === 'coach') {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('COACH', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        } else if (npc.role === 'construction') {
            // Hard hat glow
            ctx.fillStyle = '#f1c40f';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('\u26A0', screen.x + npc.width / 2, screen.y - 2);
            ctx.textAlign = 'left';
        } else if (npc.role === 'prisoner') {
            ctx.fillStyle = '#e74c3c';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('INMATE', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        } else if (npc.role === 'garbage_worker') {
            ctx.fillStyle = '#dfff00';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GARBAGE', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        } else if (npc.role === 'basketball_player') {
            // Jersey number on body
            const teamColor = npc.team === 'home' ? '#fff' : '#f1c40f';
            ctx.fillStyle = teamColor;
            ctx.font = 'bold 5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(npc.jerseyNum), screen.x + npc.width / 2, screen.y + 18);
            // Ball indicator
            if (npc.hasBall) {
                ctx.fillStyle = '#e67e22';
                ctx.beginPath();
                ctx.arc(screen.x + npc.width / 2 + 8, screen.y + 14, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
            ctx.textAlign = 'left';
        } else if (npc.role === 'bball_coach') {
            ctx.fillStyle = '#f1c40f';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('COACH', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        } else if (npc.role === 'bball_referee' || npc.role === 'fb_referee') {
            ctx.fillStyle = '#fff';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('REF', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        } else if (npc.role === 'bball_security') {
            ctx.fillStyle = '#dfff00';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SECURITY', screen.x + npc.width / 2, screen.y + 16);
            ctx.textAlign = 'left';
        } else if (npc.role === 'bball_towel') {
            ctx.fillStyle = '#ecf0f1';
            ctx.font = '5px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('TOWEL', screen.x + npc.width / 2, screen.y - 4);
            ctx.textAlign = 'left';
        }

        // Dropped off NPCs get a little "happy" indicator
        if (npc.state === 'dropped_off') {
            ctx.fillStyle = '#2ecc71';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            const bob = Math.sin(time * 4 + npc.spawnX) * 2;
            ctx.fillText('$', screen.x + npc.width / 2, screen.y - 4 + bob);
            ctx.textAlign = 'left';
        }

        ctx.restore();
    }

    _drawNPCSprite(ctx, npc, x, y) {
        const s = npc.style;
        const cx = npc.width / 2;
        const frame = npc.animFrame;
        const movingStates = ['walking', 'going_inside', 'bball_going_drink', 'bball_return_bench'];
        const isWalking = movingStates.includes(npc.state) && frame > 0;

        const footL = isWalking ? (frame === 1 ? 2 : -1) : 0;
        const footR = isWalking ? (frame === 2 ? 2 : -1) : 0;
        const bob = isWalking ? -1 : 0;

        // Basketball players wear sneakers
        const isBasketball = s.jersey;
        const shoeColor = isBasketball ? (npc.team === 'home' ? '#e67e22' : '#1b2a4a') : '#333';

        // Shoes
        ctx.fillStyle = shoeColor;
        ctx.fillRect(x + cx - 6, y + 24 + footL, 5, 3);
        ctx.fillRect(x + cx + 1, y + 24 + footR, 5, 3);

        // Pants / Basketball shorts
        ctx.fillStyle = s.pants;
        if (isBasketball) {
            // Longer basketball shorts
            ctx.fillRect(x + cx - 6, y + 17 + bob, 5, 8);
            ctx.fillRect(x + cx + 1, y + 17 + bob, 5, 8);
            // Trim stripe on shorts
            ctx.fillStyle = s.trimColor || '#fff';
            ctx.fillRect(x + cx - 6, y + 17 + bob, 1, 8);
            ctx.fillRect(x + cx + 5, y + 17 + bob, 1, 8);
        } else {
            ctx.fillRect(x + cx - 6, y + 19 + bob, 5, 6);
            ctx.fillRect(x + cx + 1, y + 19 + bob, 5, 6);
        }

        // Shirt / body / Jersey
        ctx.fillStyle = s.shirt;
        ctx.fillRect(x + cx - 7, y + 10 + bob, 14, 10);

        // Basketball jersey trim
        if (isBasketball) {
            ctx.fillStyle = s.trimColor || '#fff';
            ctx.fillRect(x + cx - 7, y + 10 + bob, 1, 10); // left trim
            ctx.fillRect(x + cx + 6, y + 10 + bob, 1, 10); // right trim
            ctx.fillRect(x + cx - 7, y + 10 + bob, 14, 1); // collar trim
        }

        // Referee stripes
        if (s.stripes) {
            ctx.fillStyle = '#fff';
            for (let sy = 0; sy < 8; sy += 3) {
                ctx.fillRect(x + cx - 7, y + 11 + sy + bob, 14, 1);
            }
        }

        // Security vest (bright yellow with SECURITY-ish look)
        if (s.vest) {
            ctx.fillStyle = '#dfff00';
            ctx.fillRect(x + cx - 7, y + 10 + bob, 14, 10);
            // Reflective stripes
            ctx.fillStyle = '#ccc';
            ctx.fillRect(x + cx - 6, y + 14 + bob, 12, 1);
            ctx.fillRect(x + cx - 6, y + 17 + bob, 12, 1);
        }

        // Head
        ctx.fillStyle = s.skin;
        ctx.fillRect(x + cx - 5, y + 3 + bob, 10, 8);

        // Hair
        ctx.fillStyle = s.hair;
        ctx.fillRect(x + cx - 5, y + 2 + bob, 10, 3);

        // Eyes
        const idleStates = ['idle', 'dropped_off', 'bball_drinking'];
        if (npc.direction === DIR.DOWN || idleStates.includes(npc.state)) {
            ctx.fillStyle = '#222';
            ctx.fillRect(x + cx - 3, y + 7 + bob, 2, 2);
            ctx.fillRect(x + cx + 2, y + 7 + bob, 2, 2);
        }

        // Hat or Helmet
        if (s.helmet) {
            // Football helmet - larger, with face guard
            ctx.fillStyle = s.hat || '#1a5276';
            ctx.fillRect(x + cx - 7, y + 0 + bob, 14, 4); // top dome
            ctx.fillRect(x + cx - 6, y + 3 + bob, 12, 6); // helmet body
            // Face guard
            ctx.fillStyle = '#ccc';
            ctx.fillRect(x + cx - 4, y + 7 + bob, 8, 2);
            // Ear hole
            ctx.fillStyle = '#333';
            ctx.fillRect(x + cx - 7, y + 4 + bob, 2, 3);
            ctx.fillRect(x + cx + 5, y + 4 + bob, 2, 3);
        } else if (s.hat) {
            ctx.fillStyle = s.hat;
            ctx.fillRect(x + cx - 6, y + 1 + bob, 12, 3);
        }

        // Basketball headband
        if (isBasketball) {
            ctx.fillStyle = s.trimColor || '#fff';
            ctx.fillRect(x + cx - 5, y + 3 + bob, 10, 1);
        }
    }
}
