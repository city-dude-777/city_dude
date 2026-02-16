// ============================================================================
// City Dude - Vehicle System
// ============================================================================
// Vehicles can be AI-driven, parked, or player-driven.
// Player can enter/exit vehicles with the E key.
// Driving uses acceleration, steering, and friction physics.
//
// Vehicle states:
//   'ai'           - Driven by AI along roads
//   'parked'       - Stationary, can be entered by player
//   'player_driven' - Controlled by the player

import { TILE_SIZE, TILES, DIR, SOLID_TILES } from './constants.js';

// ---- Vehicle Type Definitions ----

const VEHICLE_DEFS = {
    police: {
        name: 'Police Car',
        width: 18,
        length: 30,
        speed: 90,
        maxPlayerSpeed: 200,
        acceleration: 160,
        braking: 250,
        friction: 80,
        turnSpeed: 2.8,
        bodyColor: '#1a1a2e',
        topColor: '#ecf0f1',
        accentColor: '#3498db',
        bumperColor: '#333',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: true,
        lightColor1: '#e74c3c',
        lightColor2: '#3498db',
    },
    firetruck: {
        name: 'Fire Truck',
        width: 20,
        length: 44,
        speed: 70,
        maxPlayerSpeed: 150,
        acceleration: 100,
        braking: 200,
        friction: 70,
        turnSpeed: 2.0,
        bodyColor: '#c0392b',
        topColor: '#e74c3c',
        accentColor: '#f1c40f',
        bumperColor: '#888',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: true,
        lightColor1: '#e74c3c',
        lightColor2: '#f39c12',
    },
    garbage: {
        name: 'Garbage Truck',
        width: 22,
        length: 38,
        speed: 50,
        maxPlayerSpeed: 120,
        acceleration: 80,
        braking: 180,
        friction: 90,
        turnSpeed: 2.2,
        bodyColor: '#27ae60',
        topColor: '#2ecc71',
        accentColor: '#1e8449',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
        lightColor1: '#f39c12',
        lightColor2: '#f39c12',
    },
    ambulance: {
        name: 'Ambulance',
        width: 18,
        length: 34,
        speed: 100,
        maxPlayerSpeed: 220,
        acceleration: 180,
        braking: 280,
        friction: 80,
        turnSpeed: 2.6,
        bodyColor: '#ecf0f1',
        topColor: '#fff',
        accentColor: '#e74c3c',
        bumperColor: '#bbb',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: true,
        lightColor1: '#e74c3c',
        lightColor2: '#ecf0f1',
    },
    sedan: {
        name: 'Sedan',
        width: 16,
        length: 28,
        speed: 80,
        maxPlayerSpeed: 180,
        acceleration: 140,
        braking: 220,
        friction: 80,
        turnSpeed: 3.0,
        bodyColor: '#4a86c8',
        topColor: '#6ba3d6',
        accentColor: '#3a6aa0',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    suv: {
        name: 'SUV',
        width: 20,
        length: 32,
        speed: 75,
        maxPlayerSpeed: 170,
        acceleration: 120,
        braking: 200,
        friction: 85,
        turnSpeed: 2.5,
        bodyColor: '#2c2c2c',
        topColor: '#3a3a3a',
        accentColor: '#555',
        bumperColor: '#444',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    van: {
        name: 'Van',
        width: 20,
        length: 36,
        speed: 65,
        maxPlayerSpeed: 140,
        acceleration: 100,
        braking: 190,
        friction: 90,
        turnSpeed: 2.3,
        bodyColor: '#ecf0f1',
        topColor: '#dde4e6',
        accentColor: '#bdc3c7',
        bumperColor: '#999',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    pickup_truck: {
        name: 'Pickup Truck',
        width: 18,
        length: 32,
        speed: 70,
        maxPlayerSpeed: 160,
        acceleration: 110,
        braking: 200,
        friction: 80,
        turnSpeed: 2.6,
        bodyColor: '#8b4513',
        topColor: '#a0522d',
        accentColor: '#6b3410',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    taxi: {
        name: 'Taxi',
        width: 16,
        length: 28,
        speed: 85,
        maxPlayerSpeed: 190,
        acceleration: 150,
        braking: 230,
        friction: 80,
        turnSpeed: 3.0,
        bodyColor: '#f1c40f',
        topColor: '#f4d03f',
        accentColor: '#d4ac0d',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    sports_car: {
        name: 'Sports Car',
        width: 16,
        length: 26,
        speed: 110,
        maxPlayerSpeed: 260,
        acceleration: 220,
        braking: 300,
        friction: 70,
        turnSpeed: 3.2,
        bodyColor: '#e74c3c',
        topColor: '#c0392b',
        accentColor: '#a93226',
        bumperColor: '#333',
        windowColor: 'rgba(80, 140, 200, 0.9)',
        hasLights: false,
    },
    construction_truck: {
        name: 'Construction Truck',
        width: 20,
        length: 48,
        speed: 55,
        maxPlayerSpeed: 120,
        acceleration: 80,
        braking: 160,
        friction: 70,
        turnSpeed: 1.8,
        bodyColor: '#d4850f',
        topColor: '#c07a0e',
        accentColor: '#a06b0c',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
    excavator: {
        name: 'Excavator',
        width: 24,
        length: 30,
        speed: 30,
        maxPlayerSpeed: 60,
        acceleration: 40,
        braking: 80,
        friction: 60,
        turnSpeed: 1.5,
        bodyColor: '#d4a017',
        topColor: '#c8960f',
        accentColor: '#8b7400',
        bumperColor: '#555',
        windowColor: 'rgba(100, 160, 220, 0.8)',
        hasLights: false,
    },
};

const VEHICLE_TYPE_NAMES = Object.keys(VEHICLE_DEFS);

// Turn mappings for AI
const TURN_LEFT = {
    [DIR.UP]: DIR.LEFT, [DIR.LEFT]: DIR.DOWN,
    [DIR.DOWN]: DIR.RIGHT, [DIR.RIGHT]: DIR.UP,
};
const TURN_RIGHT = {
    [DIR.UP]: DIR.RIGHT, [DIR.RIGHT]: DIR.DOWN,
    [DIR.DOWN]: DIR.LEFT, [DIR.LEFT]: DIR.UP,
};

// Direction to angle mapping (UP = 0, clockwise positive)
const DIR_TO_ANGLE = {
    [DIR.UP]: 0,
    [DIR.RIGHT]: Math.PI / 2,
    [DIR.DOWN]: Math.PI,
    [DIR.LEFT]: -Math.PI / 2,
};

// Random driver names
const DRIVER_NAMES = [
    'Jake', 'Maria', 'Tyler', 'Sophia', 'Derek', 'Nina', 'Carlos', 'Jasmine',
    'Brandon', 'Ashley', 'Marcus', 'Lena', 'Kevin', 'Rosa', 'Travis', 'Kim',
    'Danny', 'Olivia', 'Rick', 'Tanya', 'Pete', 'Angela', 'Ray', 'Megan',
];

// ---- Vehicle Class ----

class Vehicle {
    constructor(typeName, x, y, direction, state = 'ai') {
        this.typeName = typeName;
        this.type = VEHICLE_DEFS[typeName];
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.state = state; // 'ai', 'parked', 'player_driven', 'pulled_over'

        // AI driving
        this.aiSpeed = this.type.speed * (0.9 + Math.random() * 0.2);
        this.currentSpeed = state === 'parked' ? 0 : this.aiSpeed;
        this.lastIntersectionKey = '';

        // Player driving physics
        this.angle = DIR_TO_ANGLE[direction]; // continuous angle for smooth turning
        this.velocity = 0; // current speed (px/s), can be negative for reverse

        // Siren state (emergency vehicles)
        this.sirenOn = false;

        // Driver (for AI vehicles)
        this.driverName = DRIVER_NAMES[Math.floor(Math.random() * DRIVER_NAMES.length)];
        this.pulledOverTimer = 0; // countdown before resuming after pullover
    }

    /** Get the bounding box in world coordinates */
    getBounds() {
        const hw = this.type.width / 2;
        const hl = this.type.length / 2;
        // Use a simple AABB that covers any rotation
        const r = Math.max(hw, hl);
        return { x: this.x - r, y: this.y - r, w: r * 2, h: r * 2 };
    }

    /** Get a tighter bounding box based on current angle */
    getTightBounds() {
        const hw = this.type.width / 2;
        const hl = this.type.length / 2;
        const cosA = Math.abs(Math.cos(this.angle));
        const sinA = Math.abs(Math.sin(this.angle));
        const bw = hl * sinA + hw * cosA;
        const bh = hl * cosA + hw * sinA;
        return { x: this.x - bw, y: this.y - bh, w: bw * 2, h: bh * 2 };
    }

    /** Get the sort Y for depth rendering */
    getSortY() {
        const hl = this.type.length / 2;
        return this.y + Math.abs(Math.cos(this.angle)) * hl + Math.abs(Math.sin(this.angle)) * (this.type.width / 2);
    }

    /** Get the rendering angle */
    getRenderAngle() {
        if (this.state === 'player_driven') {
            return this.angle;
        }
        return DIR_TO_ANGLE[this.direction];
    }

    /** Get collision radius for tile collision */
    getCollisionRadius() {
        return Math.max(this.type.width, this.type.length) / 2 - 2;
    }
}

// ---- Vehicle Manager ----

export class VehicleManager {
    constructor(tileMap) {
        this.tileMap = tileMap;
        this.tiles = tileMap.tiles;
        this.mapWidth = tileMap.width;
        this.mapHeight = tileMap.height;
        this.vehicles = [];

        // Analyze road network
        this.lanes = { right: [], left: [], down: [], up: [] };
        this.intersections = new Set();
        this._analyzeRoadNetwork();

        // Spawn AI vehicles
        this._spawnInitialVehicles(5);

        // Spawn parked vehicles the player can drive
        this._spawnParkedVehicles();
    }

    // ---- Road Network Analysis ----

    _analyzeRoadNetwork() {
        const { tiles, mapWidth, mapHeight } = this;
        const hRoadRows = [];
        for (let r = 0; r < mapHeight; r++) {
            let roadCount = 0;
            for (let c = 0; c < mapWidth; c++) {
                if (tiles[r][c] === TILES.ROAD) roadCount++;
            }
            if (roadCount > mapWidth * 0.6) hRoadRows.push(r);
        }
        const vRoadCols = [];
        for (let c = 0; c < mapWidth; c++) {
            let roadCount = 0;
            for (let r = 0; r < mapHeight; r++) {
                if (tiles[r][c] === TILES.ROAD) roadCount++;
            }
            if (roadCount > mapHeight * 0.6) vRoadCols.push(c);
        }
        const hGroups = this._groupAdjacent(hRoadRows);
        const vGroups = this._groupAdjacent(vRoadCols);
        this.lanes = {
            right: hGroups.map(g => g[g.length - 1]),
            left: hGroups.map(g => g[0]),
            down: vGroups.map(g => g[g.length - 1]),
            up: vGroups.map(g => g[0]),
        };
        for (let r = 1; r < mapHeight - 1; r++) {
            for (let c = 1; c < mapWidth - 1; c++) {
                if (tiles[r][c] === TILES.ROAD &&
                    tiles[r - 1][c] === TILES.ROAD &&
                    tiles[r + 1][c] === TILES.ROAD &&
                    tiles[r][c - 1] === TILES.ROAD &&
                    tiles[r][c + 1] === TILES.ROAD) {
                    this.intersections.add(`${c},${r}`);
                }
            }
        }
    }

    _groupAdjacent(sorted) {
        if (sorted.length === 0) return [];
        const groups = [];
        let current = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                current.push(sorted[i]);
            } else {
                groups.push(current);
                current = [sorted[i]];
            }
        }
        groups.push(current);
        return groups;
    }

    // ---- Spawning ----

    _spawnInitialVehicles(count) {
        const allLanes = [
            ...this.lanes.right.map(r => ({ row: r, dir: DIR.RIGHT })),
            ...this.lanes.left.map(r => ({ row: r, dir: DIR.LEFT })),
            ...this.lanes.down.map(c => ({ col: c, dir: DIR.DOWN })),
            ...this.lanes.up.map(c => ({ col: c, dir: DIR.UP })),
        ];
        for (let i = 0; i < count; i++) {
            // Mix of vehicle types - mostly casual
            const aiTypes = ['sedan', 'suv', 'taxi', 'van', 'pickup_truck'];
            const typeName = aiTypes[i % aiTypes.length];
            const lane = allLanes[Math.floor(Math.random() * allLanes.length)];
            let x, y;
            if (lane.dir === DIR.RIGHT || lane.dir === DIR.LEFT) {
                y = lane.row * TILE_SIZE + TILE_SIZE / 2;
                x = (4 + Math.random() * (this.mapWidth - 8)) * TILE_SIZE;
            } else {
                x = lane.col * TILE_SIZE + TILE_SIZE / 2;
                y = (4 + Math.random() * (this.mapHeight - 8)) * TILE_SIZE;
            }
            this.vehicles.push(new Vehicle(typeName, x, y, lane.dir, 'ai'));
        }
    }

    _spawnParkedVehicles() {
        const T = TILE_SIZE;
        // Parked vehicles at specific locations around the city
        const parkedDefs = [
            // Near player's home
            { type: 'sedan', col: 6, row: 12, dir: DIR.RIGHT },
            // Near office
            { type: 'suv', col: 10, row: 15, dir: DIR.DOWN },
            // Near fire station
            { type: 'firetruck', col: 22, row: 15, dir: DIR.RIGHT },
            // Industrial area
            { type: 'garbage', col: 39, row: 15, dir: DIR.LEFT },
            // Downtown
            { type: 'taxi', col: 15, row: 25, dir: DIR.RIGHT },
            // Near school
            { type: 'van', col: 10, row: 28, dir: DIR.DOWN },
            // Shopping district
            { type: 'pickup_truck', col: 28, row: 12, dir: DIR.LEFT },
            // Near apartments
            { type: 'sedan', col: 42, row: 12, dir: DIR.RIGHT },
            // Police car downtown
            { type: 'police', col: 18, row: 25, dir: DIR.RIGHT },
            // Ambulance on road near school
            { type: 'ambulance', col: 5, row: 27, dir: DIR.RIGHT },
            // Sports car near beach
            { type: 'sports_car', col: 39, row: 28, dir: DIR.LEFT },
            // Near stadium
            { type: 'suv', col: 52, row: 15, dir: DIR.DOWN },
        ];
        for (const def of parkedDefs) {
            const v = new Vehicle(
                def.type,
                def.col * T + T / 2,
                def.row * T + T / 2,
                def.dir,
                'parked'
            );
            v.velocity = 0;
            this.vehicles.push(v);
        }
    }

    /** Find nearest AI vehicle that can be pulled over (for police) */
    findNearestPullover(playerX, playerY, maxDist = TILE_SIZE * 3) {
        let best = null;
        let bestDist = maxDist;
        for (const v of this.vehicles) {
            if (v.state !== 'ai' && v.state !== 'pulled_over') continue;
            const dist = Math.hypot(v.x - playerX, v.y - playerY);
            if (dist < bestDist) {
                bestDist = dist;
                best = v;
            }
        }
        return best ? { vehicle: best, dist: bestDist } : null;
    }

    /** Dismiss a vehicle (make it drive away and eventually respawn elsewhere) */
    dismissVehicle(vehicle) {
        // Speed it up and send it away; it will respawn at edge
        vehicle.state = 'ai';
        vehicle.currentSpeed = vehicle.type.speed * 2;
        vehicle.aiSpeed = vehicle.type.speed * 2;
    }

    /** Find nearest AI/parked vehicle near a point (for dismiss mechanic) */
    findNearestDismissable(playerX, playerY, maxDist = TILE_SIZE * 2.5) {
        let best = null;
        let bestDist = maxDist;
        for (const v of this.vehicles) {
            if (v.state !== 'ai' && v.state !== 'parked') continue;
            // Don't dismiss emergency vehicles
            if (v.typeName === 'police' || v.typeName === 'firetruck' || v.typeName === 'ambulance') continue;
            const dist = Math.hypot(v.x - playerX, v.y - playerY);
            if (dist < bestDist) {
                bestDist = dist;
                best = v;
            }
        }
        return best ? { vehicle: best, dist: bestDist } : null;
    }

    /** Pull over a vehicle */
    pullOverVehicle(vehicle) {
        vehicle.state = 'pulled_over';
        vehicle.currentSpeed = 0;
        vehicle.pulledOverTimer = 30; // resumes driving after 30 seconds
    }

    /** Spawn a parked vehicle at a specific tile position */
    spawnParkedAt(typeName, col, row, dir = DIR.DOWN) {
        const T = TILE_SIZE;
        const v = new Vehicle(typeName, col * T + T / 2, row * T + T / 2, dir, 'parked');
        v.velocity = 0;
        this.vehicles.push(v);
        return v;
    }

    _respawnVehicle(vehicle) {
        const allSpawns = [
            ...this.lanes.right.map(r => ({ x: 1 * TILE_SIZE, y: r * TILE_SIZE + TILE_SIZE / 2, dir: DIR.RIGHT })),
            ...this.lanes.left.map(r => ({ x: (this.mapWidth - 2) * TILE_SIZE, y: r * TILE_SIZE + TILE_SIZE / 2, dir: DIR.LEFT })),
            ...this.lanes.down.map(c => ({ x: c * TILE_SIZE + TILE_SIZE / 2, y: 1 * TILE_SIZE, dir: DIR.DOWN })),
            ...this.lanes.up.map(c => ({ x: c * TILE_SIZE + TILE_SIZE / 2, y: (this.mapHeight - 2) * TILE_SIZE, dir: DIR.UP })),
        ];
        const spawn = allSpawns[Math.floor(Math.random() * allSpawns.length)];
        vehicle.x = spawn.x;
        vehicle.y = spawn.y;
        vehicle.direction = spawn.dir;
        vehicle.angle = DIR_TO_ANGLE[spawn.dir];
        vehicle.lastIntersectionKey = '';
        vehicle.aiSpeed = vehicle.type.speed * (0.9 + Math.random() * 0.2);
    }

    // ---- Enter / Exit ----

    /**
     * Find the nearest vehicle the player can enter.
     * @returns {{ vehicle: Vehicle, dist: number } | null}
     */
    findNearestEnterable(playerX, playerY, maxDist = TILE_SIZE * 2) {
        let best = null;
        let bestDist = maxDist;
        for (const v of this.vehicles) {
            if (v.state === 'player_driven') continue; // already driving
            const dist = Math.hypot(v.x - playerX, v.y - playerY);
            if (dist < bestDist) {
                bestDist = dist;
                best = v;
            }
        }
        return best ? { vehicle: best, dist: bestDist } : null;
    }

    /**
     * Player enters a vehicle.
     */
    enterVehicle(vehicle) {
        vehicle.state = 'player_driven';
        vehicle.velocity = 0;
        // Sync angle to current discrete direction
        vehicle.angle = DIR_TO_ANGLE[vehicle.direction];
    }

    /**
     * Player exits a vehicle. Returns the exit position for the player.
     */
    exitVehicle(vehicle) {
        vehicle.state = 'parked';
        vehicle.velocity = 0;

        // Calculate exit position (to the left of the vehicle)
        const exitDist = TILE_SIZE * 1.2;
        const leftAngle = vehicle.angle - Math.PI / 2;
        let exitX = vehicle.x + Math.sin(leftAngle) * exitDist;
        let exitY = vehicle.y - Math.cos(leftAngle) * exitDist;

        // If exit position is blocked, try right side
        if (this._isSolidForVehicle(exitX, exitY, 8)) {
            const rightAngle = vehicle.angle + Math.PI / 2;
            exitX = vehicle.x + Math.sin(rightAngle) * exitDist;
            exitY = vehicle.y - Math.cos(rightAngle) * exitDist;
        }

        // If still blocked, try behind
        if (this._isSolidForVehicle(exitX, exitY, 8)) {
            const behindAngle = vehicle.angle + Math.PI;
            exitX = vehicle.x + Math.sin(behindAngle) * exitDist;
            exitY = vehicle.y - Math.cos(behindAngle) * exitDist;
        }

        return { x: exitX, y: exitY };
    }

    /**
     * Get the currently player-driven vehicle, if any.
     */
    getPlayerVehicle() {
        return this.vehicles.find(v => v.state === 'player_driven') || null;
    }

    // ---- Player Driving Update ----

    /**
     * Update a player-driven vehicle based on input.
     */
    updatePlayerDriven(vehicle, dt, input) {
        const type = vehicle.type;
        const { dx, dy } = input.getMovement();

        // Acceleration / braking
        if (dy < 0) {
            // Forward (up arrow)
            vehicle.velocity += type.acceleration * dt;
        } else if (dy > 0) {
            // Brake / reverse (down arrow)
            if (vehicle.velocity > 10) {
                // Braking
                vehicle.velocity -= type.braking * dt;
            } else {
                // Reverse
                vehicle.velocity -= type.acceleration * 0.5 * dt;
            }
        } else {
            // Friction (decelerate toward 0)
            if (Math.abs(vehicle.velocity) < 5) {
                vehicle.velocity = 0;
            } else if (vehicle.velocity > 0) {
                vehicle.velocity -= type.friction * dt;
            } else {
                vehicle.velocity += type.friction * dt;
            }
        }

        // Clamp speed
        vehicle.velocity = Math.max(-type.maxPlayerSpeed * 0.3, Math.min(vehicle.velocity, type.maxPlayerSpeed));

        // Steering (only when moving)
        if (Math.abs(vehicle.velocity) > 5) {
            const speedFactor = Math.min(1, Math.abs(vehicle.velocity) / type.maxPlayerSpeed);
            const turnAmount = type.turnSpeed * speedFactor * dt;
            if (dx > 0) {
                vehicle.angle += turnAmount * Math.sign(vehicle.velocity);
            } else if (dx < 0) {
                vehicle.angle -= turnAmount * Math.sign(vehicle.velocity);
            }
        }

        // Normalize angle to [-PI, PI]
        while (vehicle.angle > Math.PI) vehicle.angle -= Math.PI * 2;
        while (vehicle.angle < -Math.PI) vehicle.angle += Math.PI * 2;

        // Calculate movement
        const moveX = Math.sin(vehicle.angle) * vehicle.velocity * dt;
        const moveY = -Math.cos(vehicle.angle) * vehicle.velocity * dt;

        // Collision detection (check new position against solid tiles)
        const collisionRadius = vehicle.getCollisionRadius();
        const newX = vehicle.x + moveX;
        const newY = vehicle.y + moveY;

        // Try full movement
        if (!this._isSolidForVehicle(newX, newY, collisionRadius)) {
            vehicle.x = newX;
            vehicle.y = newY;
        } else {
            // Try X only
            if (!this._isSolidForVehicle(newX, vehicle.y, collisionRadius)) {
                vehicle.x = newX;
                vehicle.velocity *= 0.5;
            }
            // Try Y only
            else if (!this._isSolidForVehicle(vehicle.x, newY, collisionRadius)) {
                vehicle.y = newY;
                vehicle.velocity *= 0.5;
            }
            // Fully blocked
            else {
                vehicle.velocity *= -0.3; // bounce back slightly
            }
        }

        // Vehicle-to-vehicle collision
        this.lastCrashPhrase = null;
        const cr = collisionRadius;
        for (const other of this.vehicles) {
            if (other === vehicle || other.state === 'player_driven') continue;
            const dist = Math.hypot(vehicle.x - other.x, vehicle.y - other.y);
            const minDist = cr + other.getCollisionRadius();
            if (dist < minDist && Math.abs(vehicle.velocity) > 30) {
                // Push apart
                const overlap = minDist - dist;
                const ax = (vehicle.x - other.x) / (dist || 1);
                const ay = (vehicle.y - other.y) / (dist || 1);
                vehicle.x += ax * overlap * 0.5;
                vehicle.y += ay * overlap * 0.5;
                vehicle.velocity *= -0.3;
                // Crash phrase (cooldown 3 seconds)
                const now = performance.now();
                if (!this._lastCrashTime || now - this._lastCrashTime > 3000) {
                    const phrases = [
                        'Take your aggressiveness somewhere else!',
                        'I have no insurance!',
                        'Fender bender!',
                    ];
                    this.lastCrashPhrase = phrases[Math.floor(Math.random() * phrases.length)];
                    this._lastCrashTime = now;
                }
                break;
            }
        }

        // Clamp to world bounds
        const margin = TILE_SIZE;
        vehicle.x = Math.max(margin, Math.min(vehicle.x, this.mapWidth * TILE_SIZE - margin));
        vehicle.y = Math.max(margin, Math.min(vehicle.y, this.mapHeight * TILE_SIZE - margin));

        // Update discrete direction (for any systems that need it)
        vehicle.direction = this._angleToDir(vehicle.angle);
    }

    _isSolidForVehicle(cx, cy, radius) {
        const T = TILE_SIZE;
        const startCol = Math.floor((cx - radius) / T);
        const endCol = Math.floor((cx + radius) / T);
        const startRow = Math.floor((cy - radius) / T);
        const endRow = Math.floor((cy + radius) / T);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (r < 0 || r >= this.mapHeight || c < 0 || c >= this.mapWidth) return true;
                if (SOLID_TILES.has(this.tiles[r][c])) return true;
            }
        }
        return false;
    }

    _angleToDir(angle) {
        // Normalize to [0, 2PI]
        let a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (a < Math.PI * 0.25 || a >= Math.PI * 1.75) return DIR.UP;
        if (a < Math.PI * 0.75) return DIR.RIGHT;
        if (a < Math.PI * 1.25) return DIR.DOWN;
        return DIR.LEFT;
    }

    // ---- AI Driving ----

    _findNearestLane(lanes, currentTilePos) {
        let nearest = lanes[0];
        let minDist = Infinity;
        for (const lane of lanes) {
            const dist = Math.abs(lane - currentTilePos);
            if (dist < minDist) { minDist = dist; nearest = lane; }
        }
        return nearest;
    }

    _snapToLane(vehicle, newDirection) {
        const T = TILE_SIZE;
        switch (newDirection) {
            case DIR.RIGHT: {
                const lane = this._findNearestLane(this.lanes.right, Math.floor(vehicle.y / T));
                vehicle.y = lane * T + T / 2; break;
            }
            case DIR.LEFT: {
                const lane = this._findNearestLane(this.lanes.left, Math.floor(vehicle.y / T));
                vehicle.y = lane * T + T / 2; break;
            }
            case DIR.DOWN: {
                const lane = this._findNearestLane(this.lanes.down, Math.floor(vehicle.x / T));
                vehicle.x = lane * T + T / 2; break;
            }
            case DIR.UP: {
                const lane = this._findNearestLane(this.lanes.up, Math.floor(vehicle.x / T));
                vehicle.x = lane * T + T / 2; break;
            }
        }
    }

    _distanceToVehicleAhead(vehicle) {
        const checkDist = TILE_SIZE * 3;
        let closest = Infinity;
        for (const other of this.vehicles) {
            if (other === vehicle) continue;
            let dist = Infinity;
            let isSameLane = false;
            switch (vehicle.direction) {
                case DIR.RIGHT:
                    dist = other.x - vehicle.x;
                    isSameLane = dist > 0 && dist < checkDist && Math.abs(other.y - vehicle.y) < TILE_SIZE;
                    break;
                case DIR.LEFT:
                    dist = vehicle.x - other.x;
                    isSameLane = dist > 0 && dist < checkDist && Math.abs(other.y - vehicle.y) < TILE_SIZE;
                    break;
                case DIR.DOWN:
                    dist = other.y - vehicle.y;
                    isSameLane = dist > 0 && dist < checkDist && Math.abs(other.x - vehicle.x) < TILE_SIZE;
                    break;
                case DIR.UP:
                    dist = vehicle.y - other.y;
                    isSameLane = dist > 0 && dist < checkDist && Math.abs(other.x - vehicle.x) < TILE_SIZE;
                    break;
            }
            if (isSameLane && dist < closest) closest = dist;
        }
        return closest;
    }

    // ---- Update ----

    update(dt) {
        for (const vehicle of this.vehicles) {
            if (vehicle.state === 'ai') {
                this._updateAIVehicle(vehicle, dt);
            } else if (vehicle.state === 'pulled_over') {
                vehicle.currentSpeed = 0;
                vehicle.pulledOverTimer -= dt;
                if (vehicle.pulledOverTimer <= 0) {
                    vehicle.state = 'ai';
                    vehicle.currentSpeed = vehicle.aiSpeed;
                }
            }
            // 'parked' and 'player_driven' are handled elsewhere
        }
    }

    /**
     * Get the position and direction of the active siren vehicle (player-driven).
     * Returns null if no siren is active.
     */
    getActiveSiren() {
        for (const v of this.vehicles) {
            if (v.state === 'player_driven' && v.sirenOn) {
                return v;
            }
        }
        return null;
    }

    _updateAIVehicle(vehicle, dt) {
        const T = TILE_SIZE;

        // --- Siren reaction: pull 1 tile to the side and stop ---
        const sirenVehicle = this.getActiveSiren();
        if (sirenVehicle) {
            const dist = Math.hypot(vehicle.x - sirenVehicle.x, vehicle.y - sirenVehicle.y);
            if (dist < T * 8) {
                // Track original position for 1-tile limit
                if (!vehicle._sirenOrigX) {
                    vehicle._sirenOrigX = vehicle.x;
                    vehicle._sirenOrigY = vehicle.y;
                }

                // Nudge toward the side (max 1 tile from original position)
                const nudge = 60 * dt;
                const maxOffset = T;
                switch (vehicle.direction) {
                    case DIR.RIGHT: case DIR.LEFT:
                        if (Math.abs(vehicle.y - vehicle._sirenOrigY) < maxOffset) vehicle.y += nudge;
                        break;
                    case DIR.DOWN: case DIR.UP:
                        if (Math.abs(vehicle.x - vehicle._sirenOrigX) < maxOffset) vehicle.x += nudge;
                        break;
                }

                // Stop the vehicle
                vehicle.currentSpeed = 0;
                vehicle.angle = DIR_TO_ANGLE[vehicle.direction];
                return;
            }
        }
        // Clear siren origin when siren is gone
        if (vehicle._sirenOrigX && !sirenVehicle) {
            vehicle._sirenOrigX = null;
            vehicle._sirenOrigY = null;
        }

        const aheadDist = this._distanceToVehicleAhead(vehicle);
        if (aheadDist < T * 1.5) {
            vehicle.currentSpeed = 0;
        } else if (aheadDist < T * 3) {
            vehicle.currentSpeed = vehicle.aiSpeed * 0.4;
        } else {
            vehicle.currentSpeed = vehicle.aiSpeed;
        }

        const moveAmount = vehicle.currentSpeed * dt;
        switch (vehicle.direction) {
            case DIR.RIGHT: vehicle.x += moveAmount; break;
            case DIR.LEFT:  vehicle.x -= moveAmount; break;
            case DIR.DOWN:  vehicle.y += moveAmount; break;
            case DIR.UP:    vehicle.y -= moveAmount; break;
        }
        vehicle.angle = DIR_TO_ANGLE[vehicle.direction];

        const margin = T * 2;
        if (vehicle.x < -margin || vehicle.x > (this.mapWidth + 2) * T ||
            vehicle.y < -margin || vehicle.y > (this.mapHeight + 2) * T) {
            this._respawnVehicle(vehicle);
            return;
        }

        const tileCol = Math.floor(vehicle.x / T);
        const tileRow = Math.floor(vehicle.y / T);
        const intKey = `${tileCol},${tileRow}`;
        if (this.intersections.has(intKey) && vehicle.lastIntersectionKey !== intKey) {
            vehicle.lastIntersectionKey = intKey;
            const roll = Math.random();
            if (roll < 0.25) {
                const newDir = TURN_LEFT[vehicle.direction];
                if (this._canDriveInDirection(newDir)) {
                    vehicle.direction = newDir;
                    this._snapToLane(vehicle, newDir);
                }
            } else if (roll < 0.5) {
                const newDir = TURN_RIGHT[vehicle.direction];
                if (this._canDriveInDirection(newDir)) {
                    vehicle.direction = newDir;
                    this._snapToLane(vehicle, newDir);
                }
            }
        }
        if (!this.intersections.has(intKey) && vehicle.lastIntersectionKey) {
            const lastParts = vehicle.lastIntersectionKey.split(',').map(Number);
            const dist = Math.hypot(tileCol - lastParts[0], tileRow - lastParts[1]);
            if (dist > 2) vehicle.lastIntersectionKey = '';
        }
    }

    _canDriveInDirection(dir) {
        switch (dir) {
            case DIR.RIGHT: return this.lanes.right.length > 0;
            case DIR.LEFT:  return this.lanes.left.length > 0;
            case DIR.DOWN:  return this.lanes.down.length > 0;
            case DIR.UP:    return this.lanes.up.length > 0;
        }
        return false;
    }

    // ---- Rendering ----

    renderSorted(ctx, camera, time, playerRenderFn, playerSortY, playerVisible, extraEntries) {
        const entries = [];

        for (const v of this.vehicles) {
            entries.push({
                sortY: v.getSortY(),
                render: () => this._renderVehicle(ctx, camera, v, time),
            });
        }

        // Only add player to render list if visible (not inside a car)
        if (playerVisible) {
            entries.push({
                sortY: playerSortY,
                render: playerRenderFn,
            });
        }

        // Add extra entries (e.g. NPCs)
        if (extraEntries) {
            entries.push(...extraEntries);
        }

        entries.sort((a, b) => a.sortY - b.sortY);
        for (const entry of entries) {
            entry.render();
        }
    }

    _renderVehicle(ctx, camera, vehicle, time) {
        const screen = camera.worldToScreen(vehicle.x, vehicle.y);

        const margin = 60;
        if (screen.x < -margin || screen.x > ctx.canvas.width + margin ||
            screen.y < -margin || screen.y > ctx.canvas.height + margin) {
            return;
        }

        const type = vehicle.type;
        const hw = type.width / 2;
        const hl = type.length / 2;

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(vehicle.getRenderAngle());

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(2, 2, hw + 1, hl + 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main body
        ctx.fillStyle = type.bodyColor;
        this._roundRect(ctx, -hw, -hl, type.width, type.length, 4);
        ctx.fill();

        // Outline (thicker when player-driven)
        if (vehicle.state === 'player_driven') {
            ctx.strokeStyle = 'rgba(255, 255, 100, 0.6)';
            ctx.lineWidth = 2;
        } else if (vehicle.state === 'parked') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
        } else {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
        }
        this._roundRect(ctx, -hw, -hl, type.width, type.length, 4);
        ctx.stroke();

        // Type-specific details
        this._renderVehicleDetails(ctx, vehicle, time, hw, hl);

        // Driver head visible through windshield (AI/parked/pulled_over only)
        if (vehicle.state !== 'player_driven' && vehicle.typeName !== 'excavator') {
            ctx.fillStyle = '#f0c27a'; // skin
            ctx.fillRect(-2, -hl + 6, 5, 5);
            ctx.fillStyle = '#4a3520'; // hair
            ctx.fillRect(-2, -hl + 5, 5, 2);
        }

        ctx.restore();

        // Draw "E" prompt for parked vehicles (outside rotation context)
        if (vehicle.state === 'parked') {
            // Small indicator above the vehicle
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.sin(time * 3) * 0.3;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('E', screen.x, screen.y - hl - 8);
            ctx.restore();
        }
    }

    _renderVehicleDetails(ctx, vehicle, time, hw, hl) {
        const type = vehicle.type;
        const w = type.width;
        const l = type.length;

        ctx.fillStyle = type.bumperColor;
        ctx.fillRect(-hw + 1, -hl, w - 2, 3);
        ctx.fillRect(-hw + 1, hl - 3, w - 2, 3);

        ctx.fillStyle = type.windowColor;
        ctx.fillRect(-hw + 3, -hl + 4, w - 6, 6);
        ctx.fillRect(-hw + 3, hl - 9, w - 6, 5);

        switch (vehicle.typeName) {
            case 'police':  this._renderPoliceDetails(ctx, vehicle, type, time, hw, hl, w, l); break;
            case 'firetruck': this._renderFiretruckDetails(ctx, vehicle, type, time, hw, hl, w, l); break;
            case 'garbage': this._renderGarbageDetails(ctx, type, time, hw, hl, w, l); break;
            case 'ambulance': this._renderAmbulanceDetails(ctx, vehicle, type, time, hw, hl, w, l); break;
            case 'excavator': this._renderExcavatorDetails(ctx, type, time, hw, hl, w, l); break;
            case 'construction_truck': this._renderConstructionTruckDetails(ctx, type, time, hw, hl, w, l); break;
            default: this._renderGenericDetails(ctx, vehicle, time, hw, hl, w); break;
        }
    }

    _renderPoliceDetails(ctx, vehicle, type, time, hw, hl, w) {
        ctx.fillStyle = type.topColor;
        ctx.fillRect(-hw + 1, 2, w - 2, hl - 4);
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 1, -2, w - 2, 4);
        if (type.hasLights) {
            const lightsActive = vehicle.state !== 'player_driven' || vehicle.sirenOn;
            if (lightsActive) {
                const rate = vehicle.sirenOn ? 14 : 10;
                const flash = Math.sin(time * rate) > 0;
                ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                ctx.fillRect(-hw + 2, -4, 5, 3);
                ctx.fillStyle = flash ? type.lightColor2 : type.lightColor1;
                ctx.fillRect(hw - 7, -4, 5, 3);
                // Glow effect when siren on
                if (vehicle.sirenOn) {
                    ctx.globalAlpha = 0.25 + Math.sin(time * rate) * 0.15;
                    ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                    ctx.fillRect(-hw - 2, -7, w + 4, 8);
                    ctx.globalAlpha = 1;
                }
            } else {
                // Lights off - dim light bar
                ctx.fillStyle = '#555';
                ctx.fillRect(-hw + 2, -4, 5, 3);
                ctx.fillRect(hw - 7, -4, 5, 3);
            }
        }
    }

    _renderFiretruckDetails(ctx, vehicle, type, time, hw, hl, w, l) {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(-3, -hl + 12, 6, l - 24);
        ctx.fillStyle = '#a0a0a0';
        for (let y = -hl + 16; y < hl - 14; y += 8) ctx.fillRect(-4, y, 8, 2);
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 1, -hl + 10, 3, l - 20);
        ctx.fillRect(hw - 4, -hl + 10, 3, l - 20);
        if (type.hasLights) {
            const lightsActive = vehicle.state !== 'player_driven' || vehicle.sirenOn;
            if (lightsActive) {
                const rate = vehicle.sirenOn ? 12 : 8;
                const flash = Math.sin(time * rate) > 0;
                ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                ctx.fillRect(-hw + 2, -hl + 1, 5, 3);
                ctx.fillStyle = flash ? type.lightColor2 : type.lightColor1;
                ctx.fillRect(hw - 7, -hl + 1, 5, 3);
                if (vehicle.sirenOn) {
                    ctx.globalAlpha = 0.2 + Math.sin(time * rate) * 0.15;
                    ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                    ctx.fillRect(-hw - 2, -hl - 1, w + 4, 6);
                    ctx.globalAlpha = 1;
                }
            } else {
                ctx.fillStyle = '#555';
                ctx.fillRect(-hw + 2, -hl + 1, 5, 3);
                ctx.fillRect(hw - 7, -hl + 1, 5, 3);
            }
        }
    }

    _renderGarbageDetails(ctx, type, time, hw, hl, w) {
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 2, 2, w - 4, hl - 5);
        ctx.fillStyle = '#555';
        ctx.fillRect(-hw + 1, 0, w - 2, 3);
        ctx.fillStyle = type.topColor;
        ctx.fillRect(-hw + 2, -hl + 10, w - 4, 10);
        const blink = Math.sin(time * 4) > 0;
        if (blink) {
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(0, -2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _renderAmbulanceDetails(ctx, vehicle, type, time, hw, hl, w) {
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 1, -4, w - 2, 3);
        ctx.fillRect(-hw + 1, 2, w - 2, 3);
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-2, -5, 4, 10);
        ctx.fillRect(-5, -2, 10, 4);
        if (type.hasLights) {
            const lightsActive = vehicle.state !== 'player_driven' || vehicle.sirenOn;
            if (lightsActive) {
                const rate = vehicle.sirenOn ? 16 : 12;
                const flash = Math.sin(time * rate) > 0;
                ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                ctx.fillRect(-hw + 2, -hl + 1, 5, 3);
                ctx.fillStyle = flash ? type.lightColor2 : type.lightColor1;
                ctx.fillRect(hw - 7, -hl + 1, 5, 3);
                if (vehicle.sirenOn) {
                    ctx.globalAlpha = 0.2 + Math.sin(time * rate) * 0.15;
                    ctx.fillStyle = flash ? type.lightColor1 : type.lightColor2;
                    ctx.fillRect(-hw - 2, -hl - 1, w + 4, 6);
                    ctx.globalAlpha = 1;
                }
            } else {
                ctx.fillStyle = '#555';
                ctx.fillRect(-hw + 2, -hl + 1, 5, 3);
                ctx.fillRect(hw - 7, -hl + 1, 5, 3);
            }
        }
    }

    _renderConstructionTruckDetails(ctx, type, time, hw, hl, w, l) {
        // Cab section (front)
        ctx.fillStyle = type.topColor;
        ctx.fillRect(-hw + 2, -hl + 3, w - 4, l * 0.3);
        // Windshield
        ctx.fillStyle = type.windowColor;
        ctx.fillRect(-hw + 4, -hl + 4, w - 8, 8);
        // Bed section
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 1, -hl + l * 0.35, w - 2, l * 0.2);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-hw + 1, -hl + l * 0.35, w - 2, l * 0.2);
        // Hitch
        ctx.fillStyle = '#555';
        ctx.fillRect(-2, -hl + l * 0.55, 4, 4);
        // Trailer frame
        ctx.fillStyle = '#888';
        ctx.fillRect(-hw + 1, -hl + l * 0.58, w - 2, l * 0.38);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(-hw + 1, -hl + l * 0.58, w - 2, l * 0.38);
        // Porta potty on trailer
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(-6, -hl + l * 0.62, 12, l * 0.28);
        ctx.fillStyle = '#1f6da0';
        ctx.fillRect(-6, -hl + l * 0.62, 12, 3);
        // Door line
        ctx.fillStyle = '#1a6490';
        ctx.fillRect(-1, -hl + l * 0.66, 2, l * 0.2);
        // Warning stripes on trailer
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-hw + 2, hl - 4, 4, 3);
        ctx.fillRect(hw - 6, hl - 4, 4, 3);
    }

    _renderExcavatorDetails(ctx, type, time, hw, hl, w, l) {
        // Cab (darker yellow box)
        ctx.fillStyle = type.topColor;
        ctx.fillRect(-hw + 3, -hl + 4, w - 6, l * 0.4);

        // Window
        ctx.fillStyle = type.windowColor;
        ctx.fillRect(-hw + 5, -hl + 5, w - 10, 8);

        // Tracks (black treads on sides)
        ctx.fillStyle = '#333';
        ctx.fillRect(-hw, -hl + 2, 4, l - 4);
        ctx.fillRect(hw - 4, -hl + 2, 4, l - 4);
        // Track ridges
        ctx.fillStyle = '#444';
        for (let ty = -hl + 4; ty < hl - 4; ty += 5) {
            ctx.fillRect(-hw, ty, 4, 2);
            ctx.fillRect(hw - 4, ty, 4, 2);
        }

        // Boom arm (extends forward from cab)
        const armAngle = Math.sin(time * 0.5) * 0.1;
        ctx.save();
        ctx.translate(0, -hl + l * 0.4);
        ctx.rotate(armAngle);
        // Boom
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-3, 0, 6, 16);
        // Stick
        ctx.fillStyle = '#8b7400';
        ctx.fillRect(-2, 14, 4, 10);
        // Bucket
        ctx.fillStyle = '#555';
        ctx.fillRect(-5, 22, 10, 6);
        ctx.fillRect(-6, 26, 12, 3);
        // Bucket teeth
        ctx.fillStyle = '#888';
        for (let bx = -5; bx < 6; bx += 3) {
            ctx.fillRect(bx, 29, 2, 2);
        }
        ctx.restore();

        // Counterweight at back
        ctx.fillStyle = '#888';
        ctx.fillRect(-hw + 2, hl - 8, w - 4, 6);

        // Hydraulic cylinder
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-1, -hl + l * 0.3, 2, 10);

        // Warning stripes
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-hw + 2, hl - 3, w - 4, 2);
    }

    _renderGenericDetails(ctx, vehicle, time, hw, hl, w) {
        const type = vehicle.type;
        const typeName = vehicle.typeName;
        // Roof/top section
        ctx.fillStyle = type.topColor;
        ctx.fillRect(-hw + 2, -2, w - 4, hl - 2);

        // Accent stripe
        ctx.fillStyle = type.accentColor;
        ctx.fillRect(-hw + 1, 0, w - 2, 2);

        // Taxi sign
        if (typeName === 'taxi') {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(-4, -hl + 1, 8, 4);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(-3, -hl + 2, 6, 2);
        }

        // Pickup truck bed
        if (typeName === 'pickup_truck') {
            ctx.fillStyle = type.accentColor;
            ctx.fillRect(-hw + 1, 4, w - 2, hl - 6);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-hw + 1, 4, w - 2, hl - 6);
        }

        // Sports car spoiler
        if (typeName === 'sports_car') {
            ctx.fillStyle = '#222';
            ctx.fillRect(-hw + 2, hl - 5, w - 4, 2);
            // Racing stripe
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(-2, -hl + 3, 4, type.length - 6);
        }
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
