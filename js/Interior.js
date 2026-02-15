// ============================================================================
// City Dude - Building Interior System
// ============================================================================
// Each building has a UNIQUE interior layout with custom decorations.

import { TILE_SIZE, DIR, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

const ITILE = 48;
const PLAYER_SPEED = 100;

// ---- Shop Item Catalog ----

export const SHOP_CATALOG = {
    burger:     { id: 'burger',     name: 'Burger',       price: 8,  icon: 'B', color: '#e67e22', desc: 'Juicy double burger', edible: true },
    pizza:      { id: 'pizza',      name: 'Pizza Slice',  price: 10, icon: 'P', color: '#e74c3c', desc: 'Cheesy pepperoni slice', edible: true },
    taco:       { id: 'taco',       name: 'Taco',         price: 6,  icon: 'T', color: '#f1c40f', desc: 'Crunchy supreme taco', edible: true },
    coffee:     { id: 'coffee',     name: 'Coffee',       price: 5,  icon: 'C', color: '#6b4423', desc: 'Strong black coffee', edible: true },
    sushi:      { id: 'sushi',      name: 'Sushi Roll',   price: 15, icon: 'S', color: '#1abc9c', desc: 'Fresh salmon roll', edible: true },
    icecream:   { id: 'icecream',   name: 'Ice Cream',    price: 4,  icon: 'I', color: '#f8c9d4', desc: 'Vanilla soft serve', edible: true },
    sunglasses: { id: 'sunglasses', name: 'Cool Shades',  price: 25, icon: 'G', color: '#2c3e50', desc: 'Look like a boss' },
    skateboard: { id: 'skateboard', name: 'Skateboard',   price: 60, icon: 'K', color: '#c0392b', desc: 'Ride in style' },
    book:       { id: 'book',       name: 'Book',         price: 8,  icon: 'R', color: '#8e44ad', desc: 'Expand your mind' },
    energy:     { id: 'energy',     name: 'Energy Drink', price: 6,  icon: 'E', color: '#2ecc71', desc: 'Maximum power', edible: true },
    donut:      { id: 'donut',      name: 'Donut',        price: 4,  icon: 'D', color: '#e8a838', desc: 'Glazed perfection', edible: true },
    chips:      { id: 'chips',      name: 'Chip Bag',     price: 3,  icon: 'H', color: '#f39c12', desc: 'Crunchy & salty', edible: true },
    vinyl:      { id: 'vinyl',      name: 'Vinyl Record', price: 20, icon: 'V', color: '#1a1a2e', desc: 'Sick beats' },
    mega_evo_card: { id: 'mega_evo_card', name: 'Mega Evolution Card', price: 50, icon: 'M', color: '#e74c3c', desc: 'Ultra rare Mega Evolution!' },
    josh_dallan_card: { id: 'josh_dallan_card', name: 'PSA 10 Josh Dallan', price: 200, icon: 'J', color: '#1a5276', desc: '1/1 PSA 10 Dude Dinosaur #17' },
};

const CELL = { FLOOR: 0, WALL: 1, COUNTER: 2, SHELF: 3 };

// Shopkeeper appearance styles
const SK_STYLES = {
    clerk:   { shirt: '#c0392b', pants: '#2c3e50', skin: '#f0c27a', hair: '#4a3520', hat: null },
    barista: { shirt: '#1abc9c', pants: '#2c3e50', skin: '#e8b88a', hair: '#2c1810', hat: null },
    chef:    { shirt: '#ecf0f1', pants: '#2c3e50', skin: '#f0c27a', hair: '#4a3520', hat: '#ecf0f1' },
    hippie:  { shirt: '#f39c12', pants: '#6b4423', skin: '#d4a574', hair: '#8b6040', hat: null },
    police_chief: { shirt: '#2c3e50', pants: '#1a1a2e', skin: '#f0c27a', hair: '#4a3520', hat: '#2c3e50' },
    fire_chief:   { shirt: '#c0392b', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b4423', hat: '#c0392b' },
    receptionist: { shirt: '#8e44ad', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b3a2a', hat: null },
    librarian: { shirt: '#85929e', pants: '#2c3e50', skin: '#e8c8a0', hair: '#6b3a2a', hat: null },
    card_collector: { shirt: '#e67e22', pants: '#2c3e50', skin: '#f0c27a', hair: '#4a3520', hat: '#e67e22' },
    curator: { shirt: '#8e44ad', pants: '#2c3e50', skin: '#e8b88a', hair: '#2c1810', hat: null },
    grocer: { shirt: '#27ae60', pants: '#2c3e50', skin: '#f0c27a', hair: '#6b4423', hat: null },
    gas_attendant: { shirt: '#e74c3c', pants: '#2c3e50', skin: '#d4a574', hair: '#222', hat: '#e74c3c' },
    locker_worker: { shirt: '#2c3e50', pants: '#1a1a2e', skin: '#f0c27a', hair: '#4a3520', hat: null },
    garbage_foreman: { shirt: '#dfff00', pants: '#555', skin: '#d4a574', hair: '#4a3520', hat: '#3498db' },
};

const SK_STYLE_MAP = {
    'Dude Mart': SK_STYLES.clerk,
    'Chill Coffee': SK_STYLES.barista,
    'Pizza Palace': SK_STYLES.chef,
    'Burger Barn': SK_STYLES.chef,
    'Taco Town': SK_STYLES.chef,
    'Corner Shop': SK_STYLES.clerk,
    'Book Café': SK_STYLES.hippie,
    'Radical Records': SK_STYLES.hippie,
    'Ice Cream Hut': SK_STYLES.barista,
    'Sushi Street': SK_STYLES.chef,
    'Dude Angeles Bank': SK_STYLES.clerk,
    'Locker Room': SK_STYLES.locker_worker,
    'Police Station': SK_STYLES.police_chief,
    'Fire Station': SK_STYLES.fire_chief,
    'Porta Potty': null,
    "Dude's Pad": null,
    'Neighbor': null,
    'Green House': null,
    'Yellow House': null,
    'Apt. Complex A': null,
    'Apt. Complex B': null,
    'Office Tower': null,
    'Parking Garage': null,
    'Tech Hub': null,
    'City Hall': null,
    'Warehouse': null,
    'Storage': null,
    'Dude Angeles School': null,
    'Public Library': SK_STYLES.librarian,
    'Break Room': SK_STYLES.clerk,
    'Dude Hotel': SK_STYLES.receptionist,
    'Grocery Store': SK_STYLES.grocer,
    'Gas Station': SK_STYLES.gas_attendant,
    'Car Wash': null,
    'Museum': SK_STYLES.curator,
    'Card Store': SK_STYLES.card_collector,
    'Garbage Break Room': SK_STYLES.garbage_foreman,
};

// ---- Interior Manager ----

export class InteriorManager {
    constructor() {
        this.active = false;
        this.building = null;
        this.grid = null;
        this.gridW = 0;
        this.gridH = 0;
        this.exitCol = 0;
        this.renderOffX = 0;
        this.renderOffY = 0;
        this.px = 0;
        this.py = 0;
        this.pDir = DIR.UP;
        this.pMoving = false;
        this.pAnimTimer = 0;
        this.pAnimFrame = 0;
        this.shopkeeper = null;
        this.shopItems = [];
        this.prisoners = [];
        this.nearExit = false;
        this.nearShopkeeper = false;
        this.nearBed = false;
        this.hasBed = false;
        this.hasToilet = false;
        this.shopOpen = false;
        this.shopCursor = 0;
        this.transitionAlpha = 0;
        this.floorColor = '#e8dcc8';
        this.wallColor = '#8b7355';
        // Custom decor items to render on top of tiles
        this.decor = []; // { type, col, row, color, label, ... }
        // Interior NPCs (firefighters etc.)
        this.interiorNPCs = []; // { col, row, style, bob }
    }

    enter(building) {
        this.active = true;
        this.building = building;
        this.shopOpen = false;
        this.shopCursor = 0;
        this.prisoners = [];
        this.hasToilet = false;
        this.nearBed = false;
        this.hasBed = false;
        this.decor = [];
        this.interiorNPCs = [];
        this.transitionAlpha = 1;
        this._generateInterior(building);
        this.px = (this.exitCol) * ITILE + ITILE / 2 - 10;
        this.py = (this.gridH - 2.5) * ITILE;
        this.pDir = DIR.UP;
        this.pMoving = false;
        this.pAnimFrame = 0;
    }

    exit() {
        this.active = false;
        const b = this.building;
        this.building = null;
        this.shopOpen = false;
        return b;
    }

    openShop() {
        this.shopOpen = true;
        this.shopCursor = 0;
    }

    // ---- Interior Generation ----

    _generateInterior(building) {
        const w = Math.max(8, Math.min(12, building.w * 2 + 2));
        const h = Math.max(7, Math.min(10, building.h * 2 + 2));
        this.gridW = w;
        this.gridH = h;
        this.renderOffX = Math.floor((CANVAS_WIDTH - w * ITILE) / 2);
        this.renderOffY = Math.floor((CANVAS_HEIGHT - h * ITILE) / 2);

        // Create grid
        this.grid = [];
        for (let r = 0; r < h; r++) this.grid[r] = new Array(w).fill(CELL.FLOOR);
        for (let c = 0; c < w; c++) { this.grid[0][c] = CELL.WALL; this.grid[h-1][c] = CELL.WALL; }
        for (let r = 0; r < h; r++) { this.grid[r][0] = CELL.WALL; this.grid[r][w-1] = CELL.WALL; }
        this.exitCol = Math.floor(w / 2);
        this.grid[h-1][this.exitCol] = CELL.FLOOR;

        // Shop buildings
        const hasShop = building.shopItems && building.shopItems.length > 0;
        if (hasShop) {
            this._generateShopInterior(building, w, h);
        } else {
            this.shopkeeper = null;
            this.shopItems = [];
        }

        // Bed in residential buildings
        this.hasBed = false;
        const residentialNames = ["Dude's Pad", 'Neighbor', 'Green House', 'Yellow House', 'Apt. Complex A', 'Apt. Complex B'];
        if (residentialNames.includes(building.name)) {
            this.hasBed = true;
            this.grid[1][w-2] = CELL.COUNTER;
            this.grid[2][w-2] = CELL.COUNTER;
            this.bedCol = w - 2;
            this.bedRow = 1;
        }

        // Dispatch to specific interior generators
        const name = building.name;
        if (name === "Dude's Pad") this._genDudesPad(w, h);
        else if (name === 'Neighbor') this._genNeighbor(w, h);
        else if (name === 'Green House') this._genGreenHouse(w, h);
        else if (name === 'Yellow House') this._genYellowHouse(w, h);
        else if (name === 'Apt. Complex A') this._genAptA(w, h);
        else if (name === 'Apt. Complex B') this._genAptB(w, h);
        else if (name === 'Office Tower') this._genOfficeTower(w, h);
        else if (name === 'Parking Garage') this._genParkingGarage(w, h);
        else if (name === 'Tech Hub') this._genTechHub(w, h);
        else if (name === 'City Hall') this._genCityHall(w, h);
        else if (name === 'Warehouse') this._genWarehouse(w, h);
        else if (name === 'Storage') this._genStorage(w, h);
        else if (name === 'Dude Angeles School') this._genSchool(w, h);
        else if (name === 'Public Library') this._genLibrary(w, h, building);
        else if (name === 'Locker Room') this._genLockerRoom(w, h);
        else if (name === 'Dude Angeles Bank') this._genBank(w, h, building);
        else if (name === 'Police Station') this._genPoliceStation(w, h, building);
        else if (name === 'Fire Station') this._genFireStation(w, h, building);
        else if (name === 'Porta Potty') this._genPortaPotty();
        else if (name === 'Break Room') this._genBreakRoom(w, h, building);
        else if (name === 'Dude Hotel') this._genHotel(w, h, building);
        else if (name === 'Museum') this._genMuseum(w, h, building);
        else if (name === 'Card Store') this._genCardStore(w, h, building);
        else if (name === 'Grocery Store') this._genGroceryStore(w, h, building);
        else if (name === 'Gas Station') this._genGasStation(w, h, building);
        else if (name === 'Car Wash') this._genCarWash(w, h);
        else if (name === 'Garbage Break Room') this._genGarbageBreakRoom(w, h, building);

        // Set colors per building
        this._setColors(building);
    }

    _generateShopInterior(building, w, h) {
        const counterRow = 2;
        for (let c = 2; c < w - 2; c++) this.grid[counterRow][c] = CELL.COUNTER;
        for (let r = 3; r < h - 2; r += 2) {
            if (this.grid[r][1] === CELL.FLOOR) this.grid[r][1] = CELL.SHELF;
            if (this.grid[r][w-2] === CELL.FLOOR) this.grid[r][w-2] = CELL.SHELF;
        }
        this.shopkeeper = {
            col: Math.floor(w / 2), row: 1,
            name: building.shopkeeperName || 'Shopkeeper',
            style: SK_STYLE_MAP[building.name] || SK_STYLES.clerk,
        };
        this.shopItems = (building.shopItems || []).map(id => SHOP_CATALOG[id]).filter(Boolean);

        // Add unique decor per shop
        if (building.name === 'Pizza Palace') {
            this.decor.push({ type: 'oven', col: 1, row: 1 });
            this.decor.push({ type: 'pizza_box', col: w-2, row: 1 });
        } else if (building.name === 'Burger Barn') {
            this.decor.push({ type: 'grill', col: 1, row: 1 });
            this.decor.push({ type: 'menu_board', col: w-2, row: 1 });
        } else if (building.name === 'Taco Town') {
            this.decor.push({ type: 'salsa_bar', col: 1, row: 1 });
            this.decor.push({ type: 'cactus', col: w-2, row: h-2 });
        } else if (building.name === 'Chill Coffee') {
            this.decor.push({ type: 'espresso', col: 1, row: 1 });
            this.decor.push({ type: 'plant', col: w-2, row: h-2 });
        } else if (building.name === 'Sushi Street') {
            this.decor.push({ type: 'fish_tank', col: w-2, row: h-2 });
        } else if (building.name === 'Dude Mart') {
            this.decor.push({ type: 'fridge', col: w-2, row: h-2 });
        } else if (building.name === 'Radical Records') {
            this.decor.push({ type: 'turntable', col: 1, row: 1 });
            this.decor.push({ type: 'poster', col: w-2, row: 1 });
        } else if (building.name === 'Ice Cream Hut') {
            this.decor.push({ type: 'freezer', col: 1, row: 1 });
        } else if (building.name === 'Corner Shop') {
            this.decor.push({ type: 'fridge', col: 1, row: h-2 });
        }
    }

    // ---- Residential Interiors ----

    _genDudesPad(w, h) {
        // Living room: couch, TV, table
        this.grid[Math.floor(h/2)][1] = CELL.SHELF; // TV stand
        this.grid[Math.floor(h/2)+1][1] = CELL.SHELF;
        this.grid[Math.floor(h/2)][3] = CELL.COUNTER; // coffee table
        this.decor.push({ type: 'tv', col: 1, row: 1 });
        this.decor.push({ type: 'couch', col: 3, row: Math.floor(h/2)+1 });
        this.decor.push({ type: 'rug', col: 2, row: Math.floor(h/2) });
        this.decor.push({ type: 'plant', col: 1, row: h-2 });
        this.decor.push({ type: 'poster', col: Math.floor(w/2), row: 0 });
    }

    _genNeighbor(w, h) {
        this.grid[2][1] = CELL.SHELF; // bookcase
        this.grid[Math.floor(h/2)][1] = CELL.COUNTER; // table
        this.decor.push({ type: 'tv', col: w-2, row: 1 });
        this.decor.push({ type: 'plant', col: 1, row: h-2 });
        this.decor.push({ type: 'rug', col: Math.floor(w/2), row: Math.floor(h/2) });
    }

    _genGreenHouse(w, h) {
        this.grid[2][1] = CELL.SHELF;
        this.decor.push({ type: 'plant', col: 1, row: 1 });
        this.decor.push({ type: 'plant', col: w-2, row: h-2 });
        this.decor.push({ type: 'plant', col: 1, row: h-2 });
        this.decor.push({ type: 'couch', col: 3, row: 2 });
    }

    _genYellowHouse(w, h) {
        this.grid[2][1] = CELL.SHELF;
        this.grid[2][w-2] = CELL.SHELF;
        this.decor.push({ type: 'tv', col: 1, row: 1 });
        this.decor.push({ type: 'kitchen_counter', col: w-2, row: Math.floor(h/2) });
        this.decor.push({ type: 'couch', col: Math.floor(w/2), row: Math.floor(h/2)+1 });
    }

    _genAptA(w, h) {
        this.grid[2][1] = CELL.SHELF;
        this.grid[Math.floor(h/2)][Math.floor(w/2)] = CELL.COUNTER;
        this.decor.push({ type: 'tv', col: w-2, row: 1 });
        this.decor.push({ type: 'plant', col: 1, row: h-2 });
    }

    _genAptB(w, h) {
        this.grid[2][w-2] = CELL.SHELF;
        this.grid[Math.floor(h/2)][1] = CELL.COUNTER;
        this.decor.push({ type: 'couch', col: Math.floor(w/2), row: 2 });
        this.decor.push({ type: 'plant', col: w-2, row: h-2 });
    }

    // ---- Commercial / Public Interiors ----

    _genOfficeTower(w, h) {
        // Cubicles (counters as desks)
        for (let r = 2; r < h-2; r += 2) {
            this.grid[r][2] = CELL.COUNTER;
            this.grid[r][3] = CELL.COUNTER;
            if (w > 8) { this.grid[r][w-3] = CELL.COUNTER; this.grid[r][w-4] = CELL.COUNTER; }
        }
        this.grid[1][1] = CELL.SHELF; // filing cabinet
        this.grid[1][w-2] = CELL.SHELF;
        this.decor.push({ type: 'water_cooler', col: Math.floor(w/2), row: 1 });
        this.interiorNPCs.push({ col: 3, row: 2, style: { shirt: '#2c3e50', skin: '#f0c27a', hair: '#4a3520' } });
        this.interiorNPCs.push({ col: w-3, row: 4, style: { shirt: '#85929e', skin: '#d4a574', hair: '#2c1810' } });
    }

    _genParkingGarage(w, h) {
        // Parking lines (counters as barriers)
        for (let r = 2; r < h-2; r += 2) {
            this.grid[r][1] = CELL.COUNTER;
            this.grid[r][w-2] = CELL.COUNTER;
        }
        this.decor.push({ type: 'car_outline', col: 2, row: 2 });
        this.decor.push({ type: 'car_outline', col: 2, row: 4 });
    }

    _genTechHub(w, h) {
        // Server racks
        for (let c = 2; c < w-2; c += 2) this.grid[1][c] = CELL.SHELF;
        // Desks
        this.grid[3][2] = CELL.COUNTER;
        this.grid[3][w-3] = CELL.COUNTER;
        this.decor.push({ type: 'server', col: 2, row: 1 });
        this.decor.push({ type: 'monitor', col: 2, row: 3 });
        this.interiorNPCs.push({ col: 3, row: 3, style: { shirt: '#1abc9c', skin: '#f0c27a', hair: '#1a1a1a' } });
    }

    _genCityHall(w, h) {
        // Reception desk
        this.grid[2][Math.floor(w/2)] = CELL.COUNTER;
        this.grid[2][Math.floor(w/2)-1] = CELL.COUNTER;
        this.grid[2][Math.floor(w/2)+1] = CELL.COUNTER;
        // Benches
        for (let r = 4; r < h-2; r += 2) {
            this.grid[r][2] = CELL.COUNTER;
            this.grid[r][w-3] = CELL.COUNTER;
        }
        // Flag
        this.decor.push({ type: 'flag', col: Math.floor(w/2), row: 0 });
        this.decor.push({ type: 'plant', col: 1, row: 1 });
        this.decor.push({ type: 'plant', col: w-2, row: 1 });
        this.interiorNPCs.push({ col: Math.floor(w/2), row: 1, style: { shirt: '#2c3e50', skin: '#f0c27a', hair: '#4a3520' } });
    }

    _genWarehouse(w, h) {
        // Crates and shelves
        for (let c = 2; c < w-2; c += 2) {
            this.grid[1][c] = CELL.SHELF;
            this.grid[3][c] = CELL.SHELF;
        }
        for (let r = 1; r < h-2; r += 2) {
            this.grid[r][1] = CELL.SHELF;
            this.grid[r][w-2] = CELL.SHELF;
        }
        this.decor.push({ type: 'crate', col: 3, row: 2 });
        this.decor.push({ type: 'crate', col: 5, row: 2 });
        this.decor.push({ type: 'forklift', col: Math.floor(w/2), row: h-2 });
        this.interiorNPCs.push({ col: 3, row: 4, style: { shirt: '#f39c12', skin: '#d4a574', hair: '#4a3520' } });
    }

    _genStorage(w, h) {
        // Storage bins
        for (let r = 1; r < h-1; r++) {
            this.grid[r][1] = CELL.SHELF;
            this.grid[r][w-2] = CELL.SHELF;
        }
        this.decor.push({ type: 'crate', col: Math.floor(w/2), row: 2 });
    }

    _genSchool(w, h) {
        // Desks in rows
        for (let r = 2; r < h-2; r += 2) {
            for (let c = 2; c < w-2; c += 2) {
                this.grid[r][c] = CELL.COUNTER;
            }
        }
        // Teacher's desk
        this.grid[1][Math.floor(w/2)] = CELL.COUNTER;
        // Blackboard
        this.decor.push({ type: 'blackboard', col: Math.floor(w/2), row: 0 });
        this.decor.push({ type: 'globe', col: 1, row: 1 });
        this.interiorNPCs.push({ col: Math.floor(w/2), row: 1, style: { shirt: '#85929e', skin: '#e8c8a0', hair: '#6b3a2a' } });
    }

    _genLibrary(w, h, building) {
        // Bookshelves everywhere
        for (let r = 1; r < h-2; r += 2) {
            this.grid[r][1] = CELL.SHELF;
            this.grid[r][w-2] = CELL.SHELF;
        }
        for (let c = 3; c < w-3; c += 2) this.grid[1][c] = CELL.SHELF;
        // Reading tables
        this.grid[Math.floor(h/2)][Math.floor(w/2)] = CELL.COUNTER;
        this.grid[Math.floor(h/2)][Math.floor(w/2)-1] = CELL.COUNTER;
        this.decor.push({ type: 'globe', col: w-2, row: h-2 });
        // Librarian
        if (building.shopkeeperName) {
            this.shopkeeper = {
                col: Math.floor(w/2)+1, row: Math.floor(h/2)-1,
                name: 'Librarian Liz', style: SK_STYLES.librarian,
            };
        }
        this.interiorNPCs.push({ col: 2, row: 3, style: { shirt: '#9b59b6', skin: '#f0c27a', hair: '#1a1a1a' } });
    }

    // ---- Special Interiors ----

    _genLockerRoom(w, h) {
        // Lockers along top
        for (let c = 2; c < w-2; c++) this.grid[1][c] = CELL.SHELF;
        // Benches (offset from exit column so player doesn't spawn stuck)
        const bc = Math.floor(w/2) - 2;
        for (let r = 3; r < h-3; r += 2) this.grid[r][bc] = CELL.COUNTER;
        // Lockers on sides (only every other row, keep lower rows clear for walking)
        for (let r = 2; r < h-3; r += 2) {
            this.grid[r][1] = CELL.SHELF;
            this.grid[r][w-2] = CELL.SHELF;
        }
        // Jersey closets (decor on top of shelves)
        this.decor.push({ type: 'jersey_closet', col: 2, row: 1 });
        this.decor.push({ type: 'jersey_closet', col: 4, row: 1 });
        if (w > 8) this.decor.push({ type: 'jersey_closet', col: 6, row: 1 });
        // Water cooler
        this.decor.push({ type: 'water_cooler', col: w-2, row: h-2 });
        // Towel rack
        this.decor.push({ type: 'towel_rack', col: 1, row: h-2 });
        // Two resting football players (no helmets, sitting on bench)
        this.interiorNPCs.push({ col: bc, row: 3, style: { shirt: '#1a5276', skin: '#d4a574', hair: '#4a3520' } });
        this.interiorNPCs.push({ col: bc + 2, row: 3, style: { shirt: '#1a5276', skin: '#f0c27a', hair: '#2c1810' } });
        // Locker room worker/attendant
        this.shopkeeper = { col: Math.floor(w/2) + 1, row: 2, name: 'Staff Rick', style: SK_STYLES.locker_worker };
    }

    _genBank(w, h, building) {
        const counterRow = 2;
        for (let c = 2; c < w-2; c++) this.grid[counterRow][c] = CELL.COUNTER;
        for (let r = 4; r < h-2; r += 2) {
            this.grid[r][3] = CELL.SHELF;
            if (w-4 > 3) this.grid[r][w-4] = CELL.SHELF;
        }
        this.decor.push({ type: 'safe', col: 1, row: 1 });
        this.decor.push({ type: 'plant', col: w-2, row: h-2 });
        if (building.shopkeeperName) {
            this.shopkeeper = { col: Math.floor(w/2), row: 1, name: building.shopkeeperName, style: SK_STYLES.clerk };
        }
    }

    _genPoliceStation(w, h, building) {
        // Clear
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] !== CELL.FLOOR) this.grid[r][c] = CELL.FLOOR;

        // Front desk
        this.grid[2][2] = CELL.COUNTER;
        this.grid[2][3] = CELL.COUNTER;

        // Cell block on right
        const cellBarCol = w - 4;
        for (let r = 1; r < h-1; r++) this.grid[r][cellBarCol] = CELL.SHELF;
        this.grid[3][cellBarCol] = CELL.FLOOR; // viewing gap
        if (h > 6) this.grid[Math.floor(h/2)+1][cellBarCol] = CELL.FLOOR;

        // Horizontal cell divider
        const divRow = Math.floor(h/2);
        for (let c = cellBarCol; c < w-1; c++) this.grid[divRow][c] = CELL.SHELF;

        // Cell furniture: each cell gets a bed (counter), toilet decor, sink decor
        // Top cell
        this.grid[2][w-2] = CELL.COUNTER; // bed
        this.decor.push({ type: 'cell_toilet', col: w-3, row: 1 });
        this.decor.push({ type: 'cell_sink', col: w-2, row: 1 });
        // Bottom cell
        if (divRow + 2 < h-1) {
            this.grid[divRow+2][w-2] = CELL.COUNTER; // bed
            this.decor.push({ type: 'cell_toilet', col: w-3, row: divRow+1 });
            this.decor.push({ type: 'cell_sink', col: w-2, row: divRow+1 });
        }

        // Wanted board
        this.decor.push({ type: 'wanted_board', col: 1, row: 1 });
        // Water cooler
        this.decor.push({ type: 'water_cooler', col: 1, row: h-2 });

        // Chief
        if (building.shopkeeperName) {
            this.shopkeeper = { col: 2, row: 1, name: building.shopkeeperName, style: SK_STYLES.police_chief };
        }

        // Prisoners
        this.prisoners = [{ col: w-3, row: 2 }];
        if (divRow + 2 < h-1) this.prisoners.push({ col: w-3, row: divRow+1 });
    }

    _genFireStation(w, h, building) {
        // Clear
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] !== CELL.FLOOR) this.grid[r][c] = CELL.FLOOR;

        // Chief's desk
        this.grid[2][Math.floor(w/2)-1] = CELL.COUNTER;
        this.grid[2][Math.floor(w/2)] = CELL.COUNTER;

        // Pool table in lower area
        this.grid[h-3][2] = CELL.COUNTER;
        this.grid[h-3][3] = CELL.COUNTER;
        this.decor.push({ type: 'pool_table', col: 2, row: h-3 });

        // Kitchen area (right side)
        this.grid[1][w-2] = CELL.SHELF; // fridge
        this.grid[2][w-2] = CELL.COUNTER; // counter/stove
        this.decor.push({ type: 'kitchen_counter', col: w-2, row: 2 });
        this.decor.push({ type: 'fridge', col: w-2, row: 1 });

        // TV area (left side)
        this.grid[1][1] = CELL.SHELF; // TV
        this.decor.push({ type: 'tv', col: 1, row: 1 });
        this.decor.push({ type: 'couch', col: 2, row: 2 });

        // Equipment rack
        for (let r = Math.floor(h/2)+1; r < h-3; r++) {
            this.grid[r][1] = CELL.SHELF;
        }
        this.decor.push({ type: 'fire_pole', col: Math.floor(w/2), row: Math.floor(h/2) });

        // Chief
        if (building.shopkeeperName) {
            this.shopkeeper = { col: Math.floor(w/2), row: 1, name: building.shopkeeperName, style: SK_STYLES.fire_chief };
        }

        // Firefighters hanging out
        this.interiorNPCs.push({ col: 3, row: h-4, style: { shirt: '#c0392b', skin: '#f0c27a', hair: '#4a3520' } });
        this.interiorNPCs.push({ col: w-3, row: 3, style: { shirt: '#c0392b', skin: '#d4a574', hair: '#2c1810' } });
    }

    _genPortaPotty() {
        this.gridW = Math.min(this.gridW, 5);
        this.gridH = Math.min(this.gridH, 5);
        this.grid = [];
        for (let r = 0; r < this.gridH; r++) this.grid[r] = new Array(this.gridW).fill(CELL.FLOOR);
        for (let c = 0; c < this.gridW; c++) { this.grid[0][c] = CELL.WALL; this.grid[this.gridH-1][c] = CELL.WALL; }
        for (let r = 0; r < this.gridH; r++) { this.grid[r][0] = CELL.WALL; this.grid[r][this.gridW-1] = CELL.WALL; }
        this.exitCol = Math.floor(this.gridW / 2);
        this.grid[this.gridH-1][this.exitCol] = CELL.FLOOR;
        this.grid[1][Math.floor(this.gridW/2)] = CELL.COUNTER;
        if (this.gridW > 3) this.grid[1][1] = CELL.SHELF;
        this.hasToilet = true;
        this.renderOffX = Math.floor((CANVAS_WIDTH - this.gridW * ITILE) / 2);
        this.renderOffY = Math.floor((CANVAS_HEIGHT - this.gridH * ITILE) / 2);
        this.px = (this.exitCol) * ITILE + ITILE / 2 - 10;
        this.py = (this.gridH - 2.5) * ITILE;
    }

    _genBreakRoom(w, h, building) {
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] === CELL.SHELF) this.grid[r][c] = CELL.FLOOR;
        // Table
        this.grid[Math.floor(h/2)][Math.floor(w/2)] = CELL.COUNTER;
        this.grid[Math.floor(h/2)][Math.floor(w/2)-1] = CELL.COUNTER;
        // Vending machine & lockers
        this.grid[1][w-2] = CELL.SHELF;
        this.grid[2][w-2] = CELL.SHELF;
        this.grid[1][1] = CELL.SHELF;
        this.decor.push({ type: 'vending', col: w-2, row: 1 });
        this.decor.push({ type: 'hard_hat_rack', col: 1, row: 1 });
        if (building.shopkeeperName) {
            this.shopkeeper = { col: Math.floor(w/2), row: 1, name: building.shopkeeperName, style: SK_STYLES.clerk };
        }
    }

    _genHotel(w, h, building) {
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] === CELL.SHELF) this.grid[r][c] = CELL.FLOOR;
        // Front desk
        this.grid[2][2] = CELL.COUNTER;
        this.grid[2][3] = CELL.COUNTER;
        // Lobby furniture
        this.grid[Math.floor(h/2)][1] = CELL.SHELF; // couch
        this.grid[Math.floor(h/2)][w-2] = CELL.SHELF; // plant
        this.decor.push({ type: 'plant', col: w-2, row: h-2 });
        this.decor.push({ type: 'luggage', col: 1, row: h-2 });
        this.decor.push({ type: 'chandelier', col: Math.floor(w/2), row: 0 });
        if (building.shopkeeperName) {
            this.shopkeeper = { col: 2, row: 1, name: building.shopkeeperName, style: SK_STYLES.receptionist };
        }
    }

    _genMuseum(w, h, building) {
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] !== CELL.FLOOR) this.grid[r][c] = CELL.FLOOR;
        // Display cases (counters)
        this.grid[2][2] = CELL.COUNTER;
        this.grid[2][w-3] = CELL.COUNTER;
        this.grid[Math.floor(h/2)][2] = CELL.COUNTER;
        this.grid[Math.floor(h/2)][w-3] = CELL.COUNTER;
        // Paintings on walls (shelves)
        this.grid[1][Math.floor(w/2)] = CELL.SHELF;
        // Decor
        this.decor.push({ type: 'poster', col: 2, row: 0 });
        this.decor.push({ type: 'poster', col: w-3, row: 0 });
        this.decor.push({ type: 'globe', col: 1, row: h-2 });
        this.decor.push({ type: 'plant', col: w-2, row: h-2 });
        // Curator
        if (building.shopkeeperName) {
            this.shopkeeper = { col: Math.floor(w/2), row: 1, name: building.shopkeeperName, style: SK_STYLES.curator };
        }
        // Visitor NPC
        this.interiorNPCs.push({ col: 3, row: Math.floor(h/2)+1, style: { shirt: '#f39c12', skin: '#f0c27a', hair: '#8b6040' } });
    }

    _genCardStore(w, h, building) {
        // Counter
        const counterRow = 2;
        for (let c = 2; c < w-2; c++) this.grid[counterRow][c] = CELL.COUNTER;
        // Display shelves
        for (let r = 3; r < h-2; r += 2) {
            if (this.grid[r][1] === CELL.FLOOR) this.grid[r][1] = CELL.SHELF;
            if (this.grid[r][w-2] === CELL.FLOOR) this.grid[r][w-2] = CELL.SHELF;
        }
        // Card display decor
        this.decor.push({ type: 'card_display', col: 1, row: 1 });
        this.decor.push({ type: 'card_display', col: w-2, row: 1 });
        this.decor.push({ type: 'poster', col: Math.floor(w/2), row: 0 });
        // Shopkeeper
        this.shopkeeper = {
            col: Math.floor(w/2), row: 1,
            name: building.shopkeeperName || 'Card Collector',
            style: SK_STYLE_MAP[building.name] || SK_STYLES.card_collector,
        };
        this.shopItems = (building.shopItems || []).map(id => SHOP_CATALOG[id]).filter(Boolean);
    }

    _genGroceryStore(w, h, building) {
        // Standard shop layout
        const counterRow = 2;
        for (let c = 2; c < w-2; c++) this.grid[counterRow][c] = CELL.COUNTER;
        for (let r = 3; r < h-2; r += 2) {
            if (this.grid[r][1] === CELL.FLOOR) this.grid[r][1] = CELL.SHELF;
            if (this.grid[r][w-2] === CELL.FLOOR) this.grid[r][w-2] = CELL.SHELF;
        }
        this.shopkeeper = {
            col: Math.floor(w/2), row: 1,
            name: building.shopkeeperName || 'Grocer',
            style: SK_STYLE_MAP[building.name] || SK_STYLES.grocer,
        };
        this.shopItems = (building.shopItems || []).map(id => SHOP_CATALOG[id]).filter(Boolean);
        this.decor.push({ type: 'fridge', col: w-2, row: 1 });
        this.decor.push({ type: 'plant', col: 1, row: h-2 });
    }

    _genGasStation(w, h, building) {
        const counterRow = 2;
        for (let c = 2; c < w-2; c++) this.grid[counterRow][c] = CELL.COUNTER;
        this.grid[1][1] = CELL.SHELF;
        this.grid[1][w-2] = CELL.SHELF;
        this.shopkeeper = {
            col: Math.floor(w/2), row: 1,
            name: building.shopkeeperName || 'Attendant',
            style: SK_STYLE_MAP[building.name] || SK_STYLES.gas_attendant,
        };
        this.shopItems = (building.shopItems || []).map(id => SHOP_CATALOG[id]).filter(Boolean);
        this.decor.push({ type: 'fridge', col: w-2, row: h-2 });
    }

    _genGarbageBreakRoom(w, h, building) {
        // Clear any defaults
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] !== CELL.FLOOR) this.grid[r][c] = CELL.FLOOR;

        // Widen exit — two floor tiles at bottom wall for easy exit
        const ec = this.exitCol;
        if (ec > 1) this.grid[h-1][ec - 1] = CELL.FLOOR;
        if (ec < w - 2) this.grid[h-1][ec + 1] = CELL.FLOOR;

        // Desks with computers (left side only — keep center clear)
        this.grid[2][1] = CELL.COUNTER;
        this.grid[2][2] = CELL.COUNTER;
        this.decor.push({ type: 'monitor', col: 1, row: 2 });
        this.decor.push({ type: 'monitor', col: 2, row: 2 });

        // More desks on right side
        this.grid[2][w-2] = CELL.COUNTER;
        this.grid[2][w-3] = CELL.COUNTER;
        this.decor.push({ type: 'monitor', col: w-2, row: 2 });
        this.decor.push({ type: 'monitor', col: w-3, row: 2 });

        // Sofa/couch (lower left, away from exit path)
        this.decor.push({ type: 'couch', col: 1, row: h-3 });
        this.decor.push({ type: 'couch', col: 2, row: h-3 });

        // Water refill station (top right)
        this.grid[1][w-2] = CELL.SHELF;
        this.decor.push({ type: 'water_cooler', col: w-2, row: 1 });

        // Vending machine (top left)
        this.grid[1][1] = CELL.SHELF;
        this.decor.push({ type: 'vending', col: 1, row: 1 });

        // Hard hat rack (top wall decor)
        this.decor.push({ type: 'hard_hat_rack', col: Math.floor(w/2), row: 0 });

        // Foreman (shopkeeper) — placed at col 3, away from center exit path
        if (building.shopkeeperName) {
            this.shopkeeper = { col: 3, row: 1, name: building.shopkeeperName, style: SK_STYLES.garbage_foreman };
        }
    }

    _genCarWash(w, h) {
        for (let r = 1; r < h-1; r++) for (let c = 1; c < w-1; c++) if (this.grid[r][c] !== CELL.FLOOR) this.grid[r][c] = CELL.FLOOR;
        this.grid[1][1] = CELL.SHELF;
        this.grid[1][w-2] = CELL.SHELF;
        this.decor.push({ type: 'water_cooler', col: 1, row: h-2 });
    }

    _setColors(building) {
        this.wallColor = building.roof || '#8b7355';
        this.floorColor = '#e8dcc8';
        const colorMap = {
            'Locker Room': { floor: '#b8b8b0', wall: '#2c3e50' },
            'Dude Angeles Bank': { floor: '#d4c9a8', wall: '#0e3a5c' },
            'Police Station': { floor: '#c0c0c0', wall: '#1a252f' },
            'Fire Station': { floor: '#c8c0b0', wall: '#962d22' },
            'Porta Potty': { floor: '#a8d0e0', wall: '#1f6da0' },
            'Break Room': { floor: '#c8c0a8', wall: '#8b7355' },
            'Office Tower': { floor: '#d0d0d0', wall: '#4a5768' },
            'Tech Hub': { floor: '#c8d8e0', wall: '#2c3e50' },
            'City Hall': { floor: '#d8d0c0', wall: '#2c3e50' },
            'Warehouse': { floor: '#a8a090', wall: '#616466' },
            'Storage': { floor: '#a0a090', wall: '#717578' },
            'Dude Angeles School': { floor: '#d8d0b8', wall: '#962d22' },
            'Public Library': { floor: '#e0d8c0', wall: '#b08050' },
            'Dude Hotel': { floor: '#d0c8e0', wall: '#6c3483' },
            'Parking Garage': { floor: '#b0b0b0', wall: '#6b7a88' },
            "Dude's Pad": { floor: '#d8c8a8', wall: '#8b4028' },
            'Neighbor': { floor: '#c8d0d8', wall: '#3d6b8a' },
            'Green House': { floor: '#d0e0c8', wall: '#5a8a4a' },
            'Yellow House': { floor: '#e0d8c0', wall: '#c08828' },
            'Museum': { floor: '#e0d8d0', wall: '#6c3483' },
            'Card Store': { floor: '#e8dcc0', wall: '#d35400' },
            'Grocery Store': { floor: '#d8e8d0', wall: '#1e8449' },
            'Gas Station': { floor: '#d0d0d0', wall: '#c0392b' },
            'Car Wash': { floor: '#c8d8e8', wall: '#2980b9' },
            'Garbage Break Room': { floor: '#c0c0a8', wall: '#4a5528' },
        };
        const c = colorMap[building.name];
        if (c) { this.floorColor = c.floor; this.wallColor = c.wall; }
    }

    // ---- Update ----

    update(dt, input) {
        if (this.transitionAlpha > 0) this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 3);

        if (this.shopOpen) {
            if (input.isPressed('ArrowUp') || input.isPressed('KeyW')) this.shopCursor = Math.max(0, this.shopCursor - 1);
            if (input.isPressed('ArrowDown') || input.isPressed('KeyS')) this.shopCursor = Math.min(this.shopItems.length - 1, this.shopCursor + 1);
            return;
        }

        const { dx, dy } = input.getMovement();
        this.pMoving = dx !== 0 || dy !== 0;
        if (this.pMoving) {
            if (Math.abs(dx) >= Math.abs(dy)) this.pDir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
            else this.pDir = dy > 0 ? DIR.DOWN : DIR.UP;
            let moveX = dx * PLAYER_SPEED * dt, moveY = dy * PLAYER_SPEED * dt;
            if (dx !== 0 && dy !== 0) { moveX *= 0.707; moveY *= 0.707; }
            const pw = 14, ph = 10, offX = 3, offY = 18;
            if (!this._isSolid(this.px + offX + moveX, this.py + offY, pw, ph)) this.px += moveX;
            if (!this._isSolid(this.px + offX, this.py + offY + moveY, pw, ph)) this.py += moveY;
            this.pAnimTimer += dt;
            if (this.pAnimTimer >= 0.15) { this.pAnimTimer -= 0.15; this.pAnimFrame = this.pAnimFrame === 1 ? 2 : 1; }
        } else { this.pAnimTimer = 0; this.pAnimFrame = 0; }

        const pcx = this.px + 10, pcy = this.py + 14;
        const exitX = (this.exitCol + 0.5) * ITILE, exitY = (this.gridH - 1.2) * ITILE;
        this.nearExit = Math.hypot(pcx - exitX, pcy - exitY) < ITILE * 1.5;

        this.nearBed = false;
        if (this.hasBed) {
            const bedX = (this.bedCol + 0.5) * ITILE, bedY = (this.bedRow + 1.5) * ITILE;
            this.nearBed = Math.hypot(pcx - bedX, pcy - bedY) < ITILE * 2;
        }

        this.nearShopkeeper = false;
        if (this.shopkeeper) {
            const skX = (this.shopkeeper.col + 0.5) * ITILE, counterY = (this.shopkeeper.row + 2) * ITILE;
            this.nearShopkeeper = Math.hypot(pcx - skX, pcy - counterY) < ITILE * 2;
        }
    }

    _isSolid(x, y, w, h) {
        const sc = Math.floor(x / ITILE), ec = Math.floor((x + w - 1) / ITILE);
        const sr = Math.floor(y / ITILE), er = Math.floor((y + h - 1) / ITILE);
        for (let r = sr; r <= er; r++) for (let c = sc; c <= ec; c++) {
            if (r < 0 || r >= this.gridH || c < 0 || c >= this.gridW) return true;
            if (this.grid[r][c] !== CELL.FLOOR) return true;
        }
        return false;
    }

    // ---- Rendering ----

    render(ctx, player, time, inventory) {
        const ox = this.renderOffX, oy = this.renderOffY;
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#3c3228';
        ctx.fillRect(ox - 6, oy - 6, this.gridW * ITILE + 12, this.gridH * ITILE + 12);

        for (let r = 0; r < this.gridH; r++)
            for (let c = 0; c < this.gridW; c++)
                this._renderCell(ctx, ox + c * ITILE, oy + r * ITILE, this.grid[r][c], r, c);

        this._renderExit(ctx, ox, oy, time);
        if (this.hasToilet) this._renderToilet(ctx, ox, oy);

        // Custom decor
        this._renderDecor(ctx, ox, oy, time);

        // Interior NPCs
        this._renderInteriorNPCs(ctx, ox, oy, time);

        if (this.shopkeeper) this._renderShopkeeper(ctx, ox, oy, time);
        if (this.prisoners && this.prisoners.length > 0) this._renderPrisoners(ctx, ox, oy, time);

        this._renderInteriorPlayer(ctx, player, ox, oy);
        this._renderHeader(ctx);
        this._renderMoney(ctx, inventory);

        // Bed
        if (this.hasBed) {
            const bx = ox + this.bedCol * ITILE, by = oy + this.bedRow * ITILE;
            ctx.fillStyle = '#6b4423'; ctx.fillRect(bx + 4, by + 2, ITILE - 8, 8);
            ctx.fillStyle = '#ecf0f1'; ctx.fillRect(bx + 10, by + 10, ITILE - 20, 10);
            ctx.fillStyle = '#3498db'; ctx.fillRect(bx + 6, by + 20, ITILE - 12, ITILE + ITILE - 28);
            ctx.fillStyle = '#2980b9'; ctx.fillRect(bx + 6, by + 20, ITILE - 12, 4);
        }

        // Prompts
        if (!this.shopOpen) {
            if (this.nearBed) this._renderPrompt(ctx, 'Press E to sleep', time);
            else if (this.nearExit) this._renderPrompt(ctx, 'Press E to exit', time);
            else if (this.nearShopkeeper) {
                const hasItems = this.shopItems && this.shopItems.length > 0;
                this._renderPrompt(ctx, hasItems ? 'Press E to shop' : 'Press E to talk', time);
            }
        }
        if (this.shopOpen) this._renderShopUI(ctx, time, inventory);
        if (this.transitionAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
    }

    _renderCell(ctx, x, y, cell, row, col) {
        switch (cell) {
            case CELL.FLOOR:
                ctx.fillStyle = this.floorColor;
                ctx.fillRect(x, y, ITILE, ITILE);
                ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, ITILE, ITILE);
                break;
            case CELL.WALL:
                ctx.fillStyle = this.wallColor; ctx.fillRect(x, y, ITILE, ITILE);
                ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1;
                for (let by = y + 8; by < y + ITILE; by += 12) { ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x + ITILE, by); ctx.stroke(); }
                const shift = (row % 2) * ITILE / 2;
                for (let bx = x + shift; bx < x + ITILE; bx += ITILE / 2) { ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx, y + ITILE); ctx.stroke(); }
                break;
            case CELL.COUNTER:
                ctx.fillStyle = this.floorColor; ctx.fillRect(x, y, ITILE, ITILE);
                ctx.fillStyle = '#8b6b4a'; ctx.fillRect(x, y + 10, ITILE, ITILE - 10);
                ctx.fillStyle = '#a07b5a'; ctx.fillRect(x, y + 10, ITILE, 4);
                ctx.fillStyle = '#6b4b2a'; ctx.fillRect(x, y + ITILE - 6, ITILE, 6);
                break;
            case CELL.SHELF:
                ctx.fillStyle = this.floorColor; ctx.fillRect(x, y, ITILE, ITILE);
                ctx.fillStyle = '#6b4423'; ctx.fillRect(x + 4, y + 2, ITILE - 8, ITILE - 4);
                const colors = ['#c0392b', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'];
                const seed = (row * 7 + col * 13) % 5;
                ctx.fillStyle = colors[seed]; ctx.fillRect(x + 8, y + 6, 10, 12);
                ctx.fillStyle = colors[(seed+2)%5]; ctx.fillRect(x + 22, y + 8, 12, 10);
                ctx.fillStyle = colors[(seed+4)%5]; ctx.fillRect(x + 10, y + 24, 14, 10);
                break;
        }
    }

    // ---- Decor Rendering ----

    _renderDecor(ctx, ox, oy, time) {
        for (const d of this.decor) {
            const x = ox + d.col * ITILE, y = oy + d.row * ITILE;
            switch (d.type) {
                case 'tv':
                    ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x + 8, y + 6, ITILE - 16, ITILE - 18);
                    ctx.fillStyle = `hsl(${(time * 60) % 360}, 60%, 40%)`; ctx.fillRect(x + 10, y + 8, ITILE - 20, ITILE - 24);
                    ctx.fillStyle = '#333'; ctx.fillRect(x + ITILE/2 - 3, y + ITILE - 10, 6, 8);
                    break;
                case 'couch':
                    ctx.fillStyle = '#7f4a2a'; ctx.fillRect(x + 4, y + 12, ITILE - 8, ITILE - 16);
                    ctx.fillStyle = '#a06030'; ctx.fillRect(x + 6, y + 14, ITILE - 12, ITILE - 22);
                    ctx.fillStyle = '#7f4a2a'; ctx.fillRect(x + 2, y + 10, 8, ITILE - 14);
                    ctx.fillRect(x + ITILE - 10, y + 10, 8, ITILE - 14);
                    break;
                case 'plant':
                    ctx.fillStyle = '#8b4513'; ctx.fillRect(x + 16, y + 28, 16, 16);
                    ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(x + 24, y + 22, 14, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.arc(x + 20, y + 18, 8, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'rug':
                    ctx.fillStyle = 'rgba(180, 60, 30, 0.3)'; ctx.fillRect(x + 4, y + 4, ITILE - 8, ITILE - 8);
                    ctx.strokeStyle = 'rgba(200, 80, 40, 0.4)'; ctx.lineWidth = 2; ctx.strokeRect(x + 8, y + 8, ITILE - 16, ITILE - 16);
                    break;
                case 'poster':
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 12, y + 4, ITILE - 24, 20);
                    ctx.fillStyle = '#fff'; ctx.font = '6px monospace'; ctx.fillText('DUDE', x + 14, y + 17);
                    break;
                case 'oven':
                    ctx.fillStyle = '#555'; ctx.fillRect(x + 6, y + 6, ITILE - 12, ITILE - 10);
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 10, y + 10, ITILE - 20, ITILE - 22);
                    ctx.fillStyle = '#ff6633'; ctx.fillRect(x + 14, y + 18, 8, 4);
                    break;
                case 'pizza_box':
                    ctx.fillStyle = '#d4a574'; ctx.fillRect(x + 10, y + 14, 28, 20);
                    ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(x + 24, y + 24, 8, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'grill':
                    ctx.fillStyle = '#444'; ctx.fillRect(x + 6, y + 10, ITILE - 12, ITILE - 14);
                    ctx.fillStyle = '#ff4400'; ctx.fillRect(x + 10, y + 16, ITILE - 20, 4);
                    ctx.fillStyle = '#666'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 10 + i * 7, y + 22, 5, 2);
                    break;
                case 'menu_board':
                    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x + 8, y + 4, ITILE - 16, ITILE - 12);
                    ctx.fillStyle = '#f1c40f'; ctx.font = '5px monospace';
                    ctx.fillText('MENU', x + 14, y + 14); ctx.fillText('$8', x + 22, y + 24);
                    break;
                case 'salsa_bar':
                    ctx.fillStyle = '#8b4513'; ctx.fillRect(x + 6, y + 16, ITILE - 12, 20);
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 10, y + 18, 10, 10);
                    ctx.fillStyle = '#2ecc71'; ctx.fillRect(x + 24, y + 18, 10, 10);
                    break;
                case 'cactus':
                    ctx.fillStyle = '#2ecc71'; ctx.fillRect(x + 20, y + 10, 8, 30);
                    ctx.fillRect(x + 12, y + 16, 8, 6); ctx.fillRect(x + 28, y + 20, 8, 6);
                    ctx.fillStyle = '#8b4513'; ctx.fillRect(x + 18, y + 38, 12, 6);
                    break;
                case 'espresso':
                    ctx.fillStyle = '#888'; ctx.fillRect(x + 10, y + 12, 28, 28);
                    ctx.fillStyle = '#666'; ctx.fillRect(x + 14, y + 16, 20, 6);
                    ctx.fillStyle = '#6b4423'; ctx.fillRect(x + 18, y + 26, 12, 8);
                    break;
                case 'fish_tank':
                    ctx.fillStyle = 'rgba(100, 180, 255, 0.5)'; ctx.fillRect(x + 6, y + 8, ITILE - 12, ITILE - 14);
                    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.strokeRect(x + 6, y + 8, ITILE - 12, ITILE - 14);
                    ctx.fillStyle = '#f39c12'; ctx.fillRect(x + 18, y + 20, 6, 4);
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 28, y + 26, 6, 4);
                    break;
                case 'fridge':
                    ctx.fillStyle = '#ddd'; ctx.fillRect(x + 8, y + 4, ITILE - 16, ITILE - 8);
                    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1; ctx.strokeRect(x + 8, y + 4, ITILE - 16, ITILE - 8);
                    ctx.fillStyle = '#999'; ctx.fillRect(x + ITILE - 14, y + 18, 3, 10);
                    break;
                case 'freezer':
                    ctx.fillStyle = '#b0d0e0'; ctx.fillRect(x + 8, y + 4, ITILE - 16, ITILE - 8);
                    ctx.fillStyle = '#88b0c8'; ctx.fillRect(x + 8, y + 4, ITILE - 16, 6);
                    break;
                case 'turntable':
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 8, y + 12, ITILE - 16, ITILE - 18);
                    ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(x + 24, y + 26, 10, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(x + 24, y + 26, 3, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'water_cooler':
                    ctx.fillStyle = '#ddd'; ctx.fillRect(x + 16, y + 8, 16, 30);
                    ctx.fillStyle = '#3498db'; ctx.fillRect(x + 18, y + 10, 12, 14);
                    ctx.fillStyle = '#aaa'; ctx.fillRect(x + 22, y + 26, 4, 8);
                    break;
                case 'safe':
                    ctx.fillStyle = '#555'; ctx.fillRect(x + 8, y + 8, ITILE - 16, ITILE - 12);
                    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(x + 24, y + 24, 6, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'jersey_closet':
                    ctx.fillStyle = '#6b4423'; ctx.fillRect(x + 4, y + 2, ITILE - 8, ITILE - 4);
                    ctx.fillStyle = '#1a5276'; ctx.fillRect(x + 10, y + 8, 12, 16);
                    ctx.fillStyle = '#ecf0f1'; ctx.font = '5px monospace'; ctx.fillText('#7', x + 13, y + 19);
                    ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 26, y + 8, 12, 16);
                    ctx.fillStyle = '#ecf0f1'; ctx.fillText('#3', x + 29, y + 19);
                    break;
                case 'towel_rack':
                    ctx.fillStyle = '#8b6b4a'; ctx.fillRect(x + 14, y + 6, 20, 4);
                    ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x + 16, y + 10, 8, 20);
                    ctx.fillStyle = '#3498db'; ctx.fillRect(x + 26, y + 10, 8, 20);
                    break;
                case 'pool_table':
                    ctx.fillStyle = '#2ecc71'; ctx.fillRect(x + 2, y + 6, ITILE * 2 - 4, ITILE - 12);
                    ctx.strokeStyle = '#8b4513'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 6, ITILE * 2 - 4, ITILE - 12);
                    // Balls
                    const ballColors = ['#e74c3c', '#f1c40f', '#2c3e50', '#e67e22', '#1abc9c'];
                    for (let i = 0; i < 5; i++) {
                        ctx.fillStyle = ballColors[i]; ctx.beginPath();
                        ctx.arc(x + 16 + i * 14, y + 22, 4, 0, Math.PI * 2); ctx.fill();
                    }
                    break;
                case 'kitchen_counter':
                    ctx.fillStyle = '#aaa'; ctx.fillRect(x + 4, y + 10, ITILE - 8, ITILE - 14);
                    ctx.fillStyle = '#888'; ctx.fillRect(x + 8, y + 14, 12, 12); // burner
                    ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(x + 14, y + 20, 4, 0, Math.PI * 2); ctx.fill();
                    break;
                case 'fire_pole':
                    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(x + 22, y + 2, 4, ITILE - 4);
                    ctx.fillStyle = '#ddd'; ctx.fillRect(x + 21, y + 2, 6, 4);
                    break;
                case 'cell_toilet':
                    ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.ellipse(x + 24, y + 32, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x + 16, y + 20, 16, 8);
                    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x + 24, y + 32, 8, 6, 0, 0, Math.PI * 2); ctx.stroke();
                    break;
                case 'cell_sink':
                    ctx.fillStyle = '#ddd'; ctx.fillRect(x + 14, y + 8, 20, 6);
                    ctx.fillStyle = '#bbb'; ctx.fillRect(x + 18, y + 14, 12, 4);
                    ctx.fillStyle = '#aaa'; ctx.fillRect(x + 22, y + 6, 4, 4);
                    break;
                case 'wanted_board':
                    ctx.fillStyle = '#8b6b4a'; ctx.fillRect(x + 6, y + 4, ITILE - 12, ITILE - 10);
                    ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x + 10, y + 8, 14, 16);
                    ctx.fillRect(x + 26, y + 10, 10, 14);
                    ctx.fillStyle = '#e74c3c'; ctx.font = '4px monospace'; ctx.fillText('WANTED', x + 10, y + 30);
                    break;
                case 'crate':
                    ctx.fillStyle = '#a0784a'; ctx.fillRect(x + 6, y + 8, ITILE - 12, ITILE - 12);
                    ctx.strokeStyle = '#806030'; ctx.lineWidth = 2;
                    ctx.strokeRect(x + 6, y + 8, ITILE - 12, ITILE - 12);
                    ctx.beginPath(); ctx.moveTo(x + 6, y + 8); ctx.lineTo(x + ITILE - 6, y + ITILE - 4); ctx.stroke();
                    break;
                case 'forklift':
                    ctx.fillStyle = '#f39c12'; ctx.fillRect(x + 12, y + 10, 24, 24);
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 8, y + 6, 6, 30); // fork
                    ctx.fillRect(x + 36, y + 28, 4, 10); // wheel
                    break;
                case 'blackboard':
                    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x + 4, y + 4, ITILE - 8, 20);
                    ctx.fillStyle = '#ecf0f1'; ctx.font = '5px monospace'; ctx.fillText('A + B = C', x + 10, y + 16);
                    break;
                case 'globe':
                    ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(x + 24, y + 28, 10, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#2ecc71'; ctx.fillRect(x + 18, y + 24, 6, 8);
                    ctx.fillStyle = '#8b4513'; ctx.fillRect(x + 22, y + 38, 4, 6);
                    break;
                case 'server':
                    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x + 8, y + 4, ITILE - 16, ITILE - 8);
                    const blink = Math.sin(time * 6 + d.col) > 0;
                    ctx.fillStyle = blink ? '#2ecc71' : '#555'; ctx.fillRect(x + 12, y + 10, 4, 4);
                    ctx.fillStyle = blink ? '#555' : '#e74c3c'; ctx.fillRect(x + 20, y + 10, 4, 4);
                    break;
                case 'monitor':
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 10, y + 8, 28, 20);
                    ctx.fillStyle = '#3498db'; ctx.fillRect(x + 12, y + 10, 24, 16);
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 22, y + 28, 4, 6);
                    break;
                case 'flag':
                    ctx.fillStyle = '#888'; ctx.fillRect(x + 22, y + 4, 3, ITILE - 8);
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 25, y + 6, 16, 10);
                    ctx.fillStyle = '#fff'; ctx.fillRect(x + 25, y + 16, 16, 4);
                    ctx.fillStyle = '#3498db'; ctx.fillRect(x + 25, y + 20, 16, 10);
                    break;
                case 'vending':
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 6, y + 4, ITILE - 12, ITILE - 6);
                    ctx.fillStyle = '#fff'; ctx.fillRect(x + 10, y + 8, ITILE - 20, 20);
                    ctx.fillStyle = '#333'; ctx.fillRect(x + 12, y + 32, 8, 8);
                    break;
                case 'hard_hat_rack':
                    ctx.fillStyle = '#8b6b4a'; ctx.fillRect(x + 8, y + 4, ITILE - 16, ITILE - 8);
                    ctx.fillStyle = '#f1c40f'; ctx.fillRect(x + 12, y + 10, 12, 8);
                    ctx.fillStyle = '#ff6600'; ctx.fillRect(x + 26, y + 10, 12, 8);
                    break;
                case 'luggage':
                    ctx.fillStyle = '#8e44ad'; ctx.fillRect(x + 10, y + 14, 18, 24);
                    ctx.fillStyle = '#6c3483'; ctx.fillRect(x + 30, y + 20, 12, 18);
                    ctx.fillStyle = '#bbb'; ctx.fillRect(x + 16, y + 12, 6, 4);
                    break;
                case 'chandelier':
                    ctx.fillStyle = '#f1c40f'; ctx.fillRect(x + 18, y + 6, 12, 4);
                    ctx.fillRect(x + 14, y + 10, 4, 8);
                    ctx.fillRect(x + 30, y + 10, 4, 8);
                    ctx.fillStyle = '#ffeaa7'; ctx.fillRect(x + 12, y + 18, 8, 4);
                    ctx.fillRect(x + 28, y + 18, 8, 4);
                    break;
                case 'car_outline':
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
                    ctx.strokeRect(x + 6, y + 4, ITILE - 12, ITILE - 8);
                    break;
                case 'card_display':
                    ctx.fillStyle = '#6b4423'; ctx.fillRect(x + 4, y + 2, ITILE - 8, ITILE - 4);
                    // Cards on display
                    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 8, y + 6, 10, 14);
                    ctx.fillStyle = '#3498db'; ctx.fillRect(x + 22, y + 8, 10, 14);
                    ctx.fillStyle = '#f1c40f'; ctx.fillRect(x + 14, y + 24, 10, 12);
                    // Star
                    ctx.fillStyle = '#fff'; ctx.font = '6px monospace'; ctx.fillText('\u2605', x + 10, y + 16);
                    break;
            }
        }
    }

    // ---- Interior NPCs (firefighters, workers, etc.) ----

    _renderInteriorNPCs(ctx, ox, oy, time) {
        for (let i = 0; i < this.interiorNPCs.length; i++) {
            const npc = this.interiorNPCs[i];
            const sx = ox + (npc.col + 0.5) * ITILE;
            const sy = oy + npc.row * ITILE + 10;
            const s = npc.style;
            const bob = Math.sin(time * 1.2 + i * 2.5) * 1;
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.ellipse(sx, sy + 28, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#333'; ctx.fillRect(sx - 6, sy + 24, 5, 3); ctx.fillRect(sx + 1, sy + 24, 5, 3);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(sx - 6, sy + 19 + bob, 5, 6); ctx.fillRect(sx + 1, sy + 19 + bob, 5, 6);
            ctx.fillStyle = s.shirt; ctx.fillRect(sx - 7, sy + 10 + bob, 14, 10);
            ctx.fillStyle = s.skin; ctx.fillRect(sx - 5, sy + 3 + bob, 10, 8);
            ctx.fillStyle = s.hair; ctx.fillRect(sx - 5, sy + 2 + bob, 10, 3);
            ctx.fillStyle = '#222'; ctx.fillRect(sx - 3, sy + 7 + bob, 2, 2); ctx.fillRect(sx + 2, sy + 7 + bob, 2, 2);
        }
    }

    _renderExit(ctx, ox, oy, time) {
        const ex = ox + this.exitCol * ITILE, ey = oy + (this.gridH - 1) * ITILE;
        ctx.fillStyle = '#4a3520'; ctx.fillRect(ex - 2, ey, ITILE + 4, ITILE);
        ctx.fillStyle = 'rgba(200, 220, 180, 0.3)'; ctx.fillRect(ex + 4, ey + 4, ITILE - 8, ITILE - 4);
        if (this.nearExit) {
            const pulse = 0.6 + Math.sin(time * 4) * 0.3;
            ctx.save(); ctx.globalAlpha = pulse;
            ctx.fillStyle = '#2ecc71'; ctx.font = 'bold 10px "Press Start 2P", monospace'; ctx.textAlign = 'center';
            ctx.fillText('EXIT', ex + ITILE / 2, ey + ITILE / 2 + 4); ctx.textAlign = 'left'; ctx.restore();
        }
    }

    _renderToilet(ctx, ox, oy) {
        const col = Math.floor(this.gridW / 2), row = 1;
        const tx = ox + col * ITILE + ITILE / 2, ty = oy + row * ITILE + ITILE / 2;
        ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.ellipse(tx, ty + 8, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#bdc3c7'; ctx.beginPath(); ctx.ellipse(tx, ty + 10, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(100,180,255,0.4)'; ctx.beginPath(); ctx.ellipse(tx, ty + 11, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ecf0f1'; ctx.fillRect(tx - 10, ty - 12, 20, 14);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(tx - 10, ty - 12, 20, 14);
        ctx.fillStyle = '#bbb'; ctx.fillRect(tx + 8, ty - 8, 6, 3);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(tx, ty + 8, 14, 10, 0, 0, Math.PI * 2); ctx.stroke();
    }

    _renderShopkeeper(ctx, ox, oy, time) {
        const sk = this.shopkeeper;
        const sx = ox + (sk.col + 0.5) * ITILE, sy = oy + sk.row * ITILE + 10;
        const s = sk.style; const bob = Math.sin(time * 1.5) * 1;
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(sx, sy + 28, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#333'; ctx.fillRect(sx - 6, sy + 24, 5, 3); ctx.fillRect(sx + 1, sy + 24, 5, 3);
        ctx.fillStyle = s.pants; ctx.fillRect(sx - 6, sy + 19 + bob, 5, 6); ctx.fillRect(sx + 1, sy + 19 + bob, 5, 6);
        ctx.fillStyle = s.shirt; ctx.fillRect(sx - 7, sy + 10 + bob, 14, 10);
        if (s.hat === '#ecf0f1' || s === SK_STYLES.barista) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(sx - 5, sy + 12 + bob, 10, 7); }
        ctx.fillStyle = s.skin; ctx.fillRect(sx - 5, sy + 3 + bob, 10, 8);
        ctx.fillStyle = s.hair; ctx.fillRect(sx - 5, sy + 2 + bob, 10, 3);
        ctx.fillStyle = '#222'; ctx.fillRect(sx - 3, sy + 7 + bob, 2, 2); ctx.fillRect(sx + 2, sy + 7 + bob, 2, 2);
        ctx.fillStyle = '#c47a4a'; ctx.fillRect(sx - 2, sy + 10 + bob, 4, 1);
        if (s.hat) { ctx.fillStyle = s.hat; ctx.fillRect(sx - 6, sy + 1 + bob, 12, 3); }
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.font = '7px "Press Start 2P", monospace'; ctx.textAlign = 'center';
        const tw = ctx.measureText(sk.name).width;
        ctx.fillRect(sx - tw / 2 - 4, sy - 10, tw + 8, 14); ctx.fillStyle = '#fff'; ctx.fillText(sk.name, sx, sy - 1);
        ctx.textAlign = 'left'; ctx.restore();
    }

    _renderPrisoners(ctx, ox, oy, time) {
        const pCol = [
            { shirt: '#f39c12', pants: '#f39c12', skin: '#d4a574', hair: '#222' },
            { shirt: '#f39c12', pants: '#f39c12', skin: '#f0c27a', hair: '#4a3520' },
        ];
        for (let i = 0; i < this.prisoners.length; i++) {
            const p = this.prisoners[i]; const sx = ox + (p.col + 0.5) * ITILE; const sy = oy + p.row * ITILE + 10;
            const s = pCol[i % pCol.length]; const bob = Math.sin(time * 0.8 + i * 2) * 1;
            ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.beginPath(); ctx.ellipse(sx, sy + 28, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#555'; ctx.fillRect(sx - 6, sy + 24, 5, 3); ctx.fillRect(sx + 1, sy + 24, 5, 3);
            ctx.fillStyle = s.pants; ctx.fillRect(sx - 6, sy + 19 + bob, 5, 6); ctx.fillRect(sx + 1, sy + 19 + bob, 5, 6);
            ctx.fillStyle = s.shirt; ctx.fillRect(sx - 7, sy + 10 + bob, 14, 10);
            ctx.fillStyle = s.skin; ctx.fillRect(sx - 5, sy + 3 + bob, 10, 8);
            ctx.fillStyle = s.hair; ctx.fillRect(sx - 5, sy + 2 + bob, 10, 3);
            ctx.fillStyle = '#222'; ctx.fillRect(sx - 3, sy + 7 + bob, 2, 2); ctx.fillRect(sx + 2, sy + 7 + bob, 2, 2);
            if (Math.sin(time * 0.5 + i * 3.14) > 0.6) {
                ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.font = '5px "Press Start 2P", monospace'; ctx.textAlign = 'center';
                const line = i === 0 ? 'Cold beans...' : 'Tortilla again!';
                const tw2 = ctx.measureText(line).width; ctx.fillRect(sx - tw2 / 2 - 4, sy - 12, tw2 + 8, 12);
                ctx.fillStyle = '#eee'; ctx.fillText(line, sx, sy - 4); ctx.textAlign = 'left'; ctx.restore();
            }
        }
    }

    _renderInteriorPlayer(ctx, player, ox, oy) {
        const sx = ox + this.px, sy = oy + this.py;
        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(sx + 10, sy + 28, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
        const spriteKey = `${this.pDir}_${this.pAnimFrame}`;
        const sprite = player.sprites[spriteKey];
        if (sprite) ctx.drawImage(sprite, sx - 4, sy - 4);
    }

    _renderHeader(ctx) {
        const name = this.building ? this.building.name : '';
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.75)'; const boxW = 320;
        _roundRect(ctx, (CANVAS_WIDTH - boxW) / 2, 8, boxW, 32, 8); ctx.fill();
        ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 11px "Press Start 2P", monospace'; ctx.textAlign = 'center';
        ctx.fillText(name, CANVAS_WIDTH / 2, 30); ctx.textAlign = 'left'; ctx.restore();
    }

    _renderMoney(ctx, inventory) {
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const text = `$${inventory.money}`; ctx.font = 'bold 11px "Press Start 2P", monospace'; ctx.textAlign = 'right';
        const tw = ctx.measureText(text).width;
        _roundRect(ctx, CANVAS_WIDTH - tw - 26, 8, tw + 22, 26, 6); ctx.fill();
        ctx.fillStyle = '#2ecc71'; ctx.fillText(text, CANVAS_WIDTH - 14, 26);
        if (inventory.getTotalItems() > 0) { ctx.font = '7px "Press Start 2P", monospace'; ctx.fillStyle = '#aaa'; ctx.fillText(`${inventory.getTotalItems()} items`, CANVAS_WIDTH - 14, 40); }
        ctx.textAlign = 'left'; ctx.restore();
    }

    _renderPrompt(ctx, text, time) {
        const pulse = 0.7 + Math.sin(time * 4) * 0.15;
        ctx.save(); ctx.globalAlpha = pulse; ctx.font = '10px "Press Start 2P", monospace'; ctx.textAlign = 'center';
        const tw = ctx.measureText(text).width; const x = CANVAS_WIDTH / 2; const y = CANVAS_HEIGHT - 50;
        ctx.fillStyle = 'rgba(0, 80, 180, 0.85)'; _roundRect(ctx, x - tw / 2 - 16, y - 16, tw + 32, 32, 6); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.fillText(text, x, y + 2); ctx.textAlign = 'left'; ctx.restore();
    }

    _renderShopUI(ctx, time, inventory) {
        const items = this.shopItems;
        if (!items || items.length === 0) return;
        const panelW = 420, itemH = 38, panelH = 65 + items.length * itemH + 40;
        const px = (CANVAS_WIDTH - panelW) / 2, py = (CANVAS_HEIGHT - panelH) / 2;
        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)'; _roundRect(ctx, px, py, panelW, panelH, 12); ctx.fill();
        ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2; _roundRect(ctx, px, py, panelW, panelH, 12); ctx.stroke();
        ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 12px "Press Start 2P", monospace'; ctx.textAlign = 'center';
        ctx.fillText(this.shopkeeper.name + "'s Shop", CANVAS_WIDTH / 2, py + 24);
        ctx.fillStyle = '#2ecc71'; ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(`Your money: $${inventory.money}`, CANVAS_WIDTH / 2, py + 44); ctx.textAlign = 'left';
        for (let i = 0; i < items.length; i++) {
            const item = items[i]; const iy = py + 58 + i * itemH; const selected = i === this.shopCursor;
            const canAfford = inventory.money >= item.price;
            if (selected) {
                ctx.fillStyle = 'rgba(241, 196, 15, 0.12)'; _roundRect(ctx, px + 8, iy, panelW - 16, itemH - 4, 4); ctx.fill();
                ctx.fillStyle = '#f1c40f'; ctx.font = '10px "Press Start 2P", monospace'; ctx.fillText('>', px + 14, iy + 18);
            }
            ctx.fillStyle = item.color; ctx.fillRect(px + 30, iy + 6, 16, 16);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(px + 30, iy + 6, 16, 16);
            ctx.fillStyle = selected ? '#fff' : '#aaa'; ctx.font = '9px "Press Start 2P", monospace'; ctx.fillText(item.name, px + 54, iy + 18);
            ctx.fillStyle = canAfford ? '#2ecc71' : '#e74c3c'; ctx.textAlign = 'right'; ctx.fillText(`$${item.price}`, px + panelW - 16, iy + 18); ctx.textAlign = 'left';
            if (selected) { ctx.fillStyle = '#777'; ctx.font = '7px "Press Start 2P", monospace'; ctx.fillText(item.desc, px + 54, iy + 30); }
        }
        ctx.fillStyle = '#555'; ctx.font = '7px "Press Start 2P", monospace'; ctx.textAlign = 'center';
        ctx.fillText('Up/Down Browse | E Buy | Esc Close', CANVAS_WIDTH / 2, py + panelH - 14); ctx.textAlign = 'left'; ctx.restore();
    }

    static getDoorPosition(building) {
        const T = TILE_SIZE;
        return { x: (building.x + building.w / 2) * T, y: (building.y + building.h) * T + T * 0.5 };
    }

    static findNearestDoor(buildings, playerX, playerY, maxDist = 1.8) {
        const T = TILE_SIZE;
        let nearest = null, nearestDist = maxDist * T;
        for (const b of buildings) {
            if (!b.enterable) continue;
            const door = InteriorManager.getDoorPosition(b);
            const dist = Math.hypot(playerX - door.x, playerY - door.y);
            if (dist < nearestDist) { nearest = b; nearestDist = dist; }
        }
        return nearest;
    }
}

function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
