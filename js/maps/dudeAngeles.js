// ============================================================================
// City Dude - Dude Angeles Map
// ============================================================================
// Procedurally builds the city map from a high-level description.
// This makes it easy to modify the layout and add new areas.
//
// Map Layout (62 wide x 40 tall):
//
//   Trees border the entire map.
//   Horizontal roads at rows 13-14 and rows 26-27
//   Vertical roads at cols 12-13, cols 24-25, cols 37-38, cols 49-50
//
//   Blocks:
//   NW (2-10, 2-11)   : Residential   - Player starts here ("Dude's Pad")
//   NC (15-22, 2-11)  : Basketball    - Dynamic Dudes Basketball Stadium
//   NE (27-35, 2-11)  : Shopping      - Stores and mall
//   NFE (40-47, 2-11) : Apartments    - More residential
//
//   MW (2-10, 16-24)  : Office        - Office buildings
//   MC (15-22, 16-24) : Downtown      - City center
//   ME (27-35, 16-24) : Food District - Restaurants
//   MFE (40-47, 16-24): Industrial    - Warehouses
//
//   SW (2-10, 29-37)  : School Area   - School building
//   SC (15-22, 29-37) : Library       - Public library
//   SE (27-35, 29-37) : Skate Park    - FIRST GOAL DESTINATION
//   SFE (40-47, 29-37): Beach         - Sandy area, water

import { TILES } from '../constants.js';

// ---- Map Builder Helpers ----

function createEmptyGrid(width, height, fill = TILES.GRASS) {
    const tiles = [];
    for (let r = 0; r < height; r++) {
        tiles[r] = new Array(width).fill(fill);
    }
    return tiles;
}

function fillRect(tiles, tile, x, y, w, h, mapW, mapH) {
    for (let r = y; r < y + h && r < mapH; r++) {
        for (let c = x; c < x + w && c < mapW; c++) {
            if (r >= 0 && c >= 0) tiles[r][c] = tile;
        }
    }
}

function addSidewalks(tiles, width, height) {
    // Any grass tile adjacent to a road becomes sidewalk
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const toConvert = [];
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (tiles[r][c] === TILES.GRASS) {
                for (const [dr, dc] of dirs) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
                        if (tiles[nr][nc] === TILES.ROAD) {
                            toConvert.push([r, c]);
                            break;
                        }
                    }
                }
            }
        }
    }
    for (const [r, c] of toConvert) {
        tiles[r][c] = TILES.SIDEWALK;
    }
}

// ---- Main Builder ----

export function createDudeAngelesMap() {
    const width = 62;
    const height = 40;
    const tiles = createEmptyGrid(width, height);
    const buildings = [];

    // --- Border Trees ---
    for (let c = 0; c < width; c++) {
        tiles[0][c] = TILES.TREE;
        tiles[height - 1][c] = TILES.TREE;
    }
    for (let r = 0; r < height; r++) {
        tiles[r][0] = TILES.TREE;
        tiles[r][width - 1] = TILES.TREE;
    }

    // --- Roads ---
    // Horizontal roads (2 tiles wide)
    fillRect(tiles, TILES.ROAD, 1, 13, width - 2, 2, width, height);
    fillRect(tiles, TILES.ROAD, 1, 26, width - 2, 2, width, height);

    // Vertical roads (2 tiles wide)
    fillRect(tiles, TILES.ROAD, 12, 1, 2, height - 2, width, height);
    fillRect(tiles, TILES.ROAD, 24, 1, 2, height - 2, width, height);
    fillRect(tiles, TILES.ROAD, 37, 1, 2, height - 2, width, height);
    fillRect(tiles, TILES.ROAD, 49, 1, 2, height - 2, width, height);

    // --- Auto-generate Sidewalks ---
    addSidewalks(tiles, width, height);

    // --- NW Block: Residential (Player's Home) ---
    // Dude's apartment
    buildings.push({ x: 3, y: 3, w: 4, h: 3, color: '#b85c38', roof: '#8b4028', name: "Dude's Pad", enterable: true });
    fillRect(tiles, TILES.BUILDING, 3, 3, 4, 3, width, height);

    // Neighbor's house
    buildings.push({ x: 8, y: 3, w: 3, h: 3, color: '#5b8fb9', roof: '#3d6b8a', name: 'Neighbor', enterable: true });
    fillRect(tiles, TILES.BUILDING, 8, 3, 3, 3, width, height);

    // Small house
    buildings.push({ x: 3, y: 8, w: 3, h: 3, color: '#7fb069', roof: '#5a8a4a', name: 'Green House', enterable: true });
    fillRect(tiles, TILES.BUILDING, 3, 8, 3, 3, width, height);

    // Another house
    buildings.push({ x: 7, y: 8, w: 4, h: 3, color: '#e8a838', roof: '#c08828', name: 'Yellow House', enterable: true });
    fillRect(tiles, TILES.BUILDING, 7, 8, 4, 3, width, height);

    // --- NC Block: Dynamic Dudes Basketball Stadium ---
    // Fence perimeter (cols 15-22, rows 2-11)
    for (let c = 15; c <= 22; c++) {
        tiles[2][c] = TILES.FENCE;
        tiles[11][c] = TILES.FENCE;
    }
    for (let r = 2; r <= 11; r++) {
        tiles[r][15] = TILES.FENCE;
        tiles[r][22] = TILES.FENCE;
    }
    // Entrance gap (south side, wide for easy access)
    tiles[11][18] = TILES.CONCRETE;
    tiles[11][19] = TILES.CONCRETE;

    // Concrete sidelines / walkway
    fillRect(tiles, TILES.CONCRETE, 16, 3, 6, 1, width, height);  // north sideline
    fillRect(tiles, TILES.CONCRETE, 16, 10, 6, 1, width, height); // south sideline
    for (let r = 3; r <= 10; r++) {
        tiles[r][16] = TILES.CONCRETE; // west sideline
        tiles[r][21] = TILES.CONCRETE; // east sideline
    }

    // Court surface (concrete - the orange floor is rendered in Game.js)
    fillRect(tiles, TILES.CONCRETE, 17, 4, 4, 6, width, height);

    // Concrete entrance walkway
    fillRect(tiles, TILES.CONCRETE, 18, 11, 2, 1, width, height);

    // Bench area (west sideline concrete, row 5-8 at col 16 — already concrete)
    // Drink station area (NW corner, col 16 row 3 — already concrete)

    // --- NE Block: Shopping District ---
    buildings.push({ x: 27, y: 3, w: 5, h: 3, color: '#c0392b', roof: '#962d22', name: 'Dude Mart',
        enterable: true, shopkeeperName: 'Clerk Bob', shopItems: ['energy', 'chips', 'donut', 'sunglasses'] });
    fillRect(tiles, TILES.BUILDING, 27, 3, 5, 3, width, height);

    buildings.push({ x: 33, y: 3, w: 3, h: 3, color: '#8e44ad', roof: '#6c3483', name: 'Radical Records',
        enterable: true, shopkeeperName: 'DJ Mike', shopItems: ['vinyl', 'energy'] });
    fillRect(tiles, TILES.BUILDING, 33, 3, 3, 3, width, height);

    buildings.push({ x: 27, y: 8, w: 4, h: 3, color: '#2980b9', roof: '#1f6da0', name: 'Chill Coffee',
        enterable: true, shopkeeperName: 'Barista Jay', shopItems: ['coffee', 'donut', 'chips'] });
    fillRect(tiles, TILES.BUILDING, 27, 8, 4, 3, width, height);

    buildings.push({ x: 32, y: 8, w: 4, h: 3, color: '#e67e22', roof: '#c56a18', name: 'Pizza Palace',
        enterable: true, shopkeeperName: 'Chef Tony', shopItems: ['pizza', 'energy'] });
    fillRect(tiles, TILES.BUILDING, 32, 8, 4, 3, width, height);

    // --- NFE Block: More Apartments ---
    buildings.push({ x: 40, y: 3, w: 4, h: 3, color: '#d4a574', roof: '#b08050', name: 'Apt. Complex A', enterable: true });
    fillRect(tiles, TILES.BUILDING, 40, 3, 4, 3, width, height);

    buildings.push({ x: 45, y: 3, w: 3, h: 3, color: '#a0785a', roof: '#806040', name: 'Apt. Complex B', enterable: true });
    fillRect(tiles, TILES.BUILDING, 45, 3, 3, 3, width, height);

    buildings.push({ x: 40, y: 8, w: 3, h: 3, color: '#7dcea0', roof: '#5eb080', name: 'Corner Shop',
        enterable: true, shopkeeperName: 'Mama Rose', shopItems: ['chips', 'energy', 'donut', 'sunglasses', 'skateboard'] });
    fillRect(tiles, TILES.BUILDING, 40, 8, 3, 3, width, height);

    // Hotel
    buildings.push({ x: 44, y: 8, w: 4, h: 3, color: '#8e44ad', roof: '#6c3483', name: 'Dude Hotel',
        enterable: true, shopkeeperName: 'Receptionist Amy', shopItems: [], isHotel: true });
    fillRect(tiles, TILES.BUILDING, 44, 8, 4, 3, width, height);

    // Trees in yard
    tiles[9][43] = TILES.TREE;

    // --- MW Block: Office District ---
    buildings.push({ x: 3, y: 16, w: 5, h: 4, color: '#5d6d7e', roof: '#4a5768', name: 'Office Tower', enterable: true });
    fillRect(tiles, TILES.BUILDING, 3, 16, 5, 4, width, height);

    buildings.push({ x: 9, y: 16, w: 2, h: 3, color: '#85929e', roof: '#6b7a88', name: 'Parking Garage', enterable: true });
    fillRect(tiles, TILES.BUILDING, 9, 16, 2, 3, width, height);

    buildings.push({ x: 8, y: 20, w: 3, h: 3, color: '#1a5276', roof: '#0e3a5c', name: 'Dude Angeles Bank', enterable: true, shopkeeperName: 'Teller Kim', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 8, 20, 3, 3, width, height);

    buildings.push({ x: 3, y: 22, w: 4, h: 2, color: '#aab7b8', roof: '#8a9a9b', name: 'Tech Hub', enterable: true });
    fillRect(tiles, TILES.BUILDING, 3, 22, 4, 2, width, height);

    // --- MC Block: Downtown ---
    buildings.push({ x: 16, y: 16, w: 4, h: 4, color: '#2c3e50', roof: '#1a252f', name: 'City Hall', enterable: true });
    fillRect(tiles, TILES.BUILDING, 16, 16, 4, 4, width, height);

    buildings.push({ x: 21, y: 17, w: 2, h: 3, color: '#c0392b', roof: '#962d22', name: 'Fire Station', enterable: true, shopkeeperName: 'Chief Burns', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 21, 17, 2, 3, width, height);

    // --- Police Station ---
    buildings.push({ x: 16, y: 22, w: 4, h: 2, color: '#2c3e50', roof: '#1a252f', name: 'Police Station',
        enterable: true, shopkeeperName: 'Chief Johnson', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 16, 22, 4, 2, width, height);

    // --- ME Block: Food District ---
    buildings.push({ x: 27, y: 17, w: 3, h: 3, color: '#e74c3c', roof: '#c0392b', name: 'Burger Barn',
        enterable: true, shopkeeperName: 'Chef Dan', shopItems: ['burger', 'chips', 'energy'] });
    fillRect(tiles, TILES.BUILDING, 27, 17, 3, 3, width, height);

    buildings.push({ x: 31, y: 17, w: 3, h: 3, color: '#f39c12', roof: '#d4850f', name: 'Taco Town',
        enterable: true, shopkeeperName: 'Chef Maria', shopItems: ['taco', 'chips', 'energy'] });
    fillRect(tiles, TILES.BUILDING, 31, 17, 3, 3, width, height);

    buildings.push({ x: 27, y: 22, w: 5, h: 2, color: '#1abc9c', roof: '#16a085', name: 'Sushi Street',
        enterable: true, shopkeeperName: 'Chef Sato', shopItems: ['sushi', 'coffee'] });
    fillRect(tiles, TILES.BUILDING, 27, 22, 5, 2, width, height);

    buildings.push({ x: 33, y: 22, w: 3, h: 2, color: '#9b59b6', roof: '#7d3c98', name: 'Ice Cream Hut',
        enterable: true, shopkeeperName: 'Scoops', shopItems: ['icecream', 'donut'] });
    fillRect(tiles, TILES.BUILDING, 33, 22, 3, 2, width, height);

    // --- MFE Block: Industrial ---
    buildings.push({ x: 40, y: 16, w: 5, h: 3, color: '#797d7f', roof: '#616466', name: 'Warehouse', enterable: true });
    fillRect(tiles, TILES.BUILDING, 40, 16, 5, 3, width, height);

    buildings.push({ x: 46, y: 16, w: 2, h: 3, color: '#909497', roof: '#717578', name: 'Storage', enterable: true });
    fillRect(tiles, TILES.BUILDING, 46, 16, 2, 3, width, height);

    // Fence around industrial yard
    for (let c = 40; c <= 47; c++) {
        if (tiles[21][c] === TILES.GRASS || tiles[21][c] === TILES.SIDEWALK) {
            tiles[21][c] = TILES.FENCE;
        }
    }

    // --- Grocery Store (below industrial fence) ---
    buildings.push({ x: 40, y: 22, w: 4, h: 2, color: '#27ae60', roof: '#1e8449', name: 'Grocery Store',
        enterable: true, shopkeeperName: 'Grocer Sam', shopItems: ['chips', 'energy', 'donut', 'burger'] });
    fillRect(tiles, TILES.BUILDING, 40, 22, 4, 2, width, height);

    // --- Gas Station (next to grocery) ---
    buildings.push({ x: 45, y: 22, w: 3, h: 2, color: '#e74c3c', roof: '#c0392b', name: 'Gas Station',
        enterable: true, shopkeeperName: 'Pump Pete', shopItems: ['energy', 'chips'] });
    fillRect(tiles, TILES.BUILDING, 45, 22, 3, 2, width, height);

    // --- Stadium: Dude Dinosaurs ---
    // Fence perimeter
    for (let c = 51; c <= 60; c++) {
        tiles[2][c] = TILES.FENCE;
        tiles[12][c] = TILES.FENCE;
    }
    for (let r = 2; r <= 12; r++) {
        tiles[r][51] = TILES.FENCE;
        tiles[r][60] = TILES.FENCE;
    }
    // Entrance gap (south center)
    tiles[12][55] = TILES.CONCRETE;
    tiles[12][56] = TILES.CONCRETE;

    // Concrete sidelines and walkways
    fillRect(tiles, TILES.CONCRETE, 52, 3, 8, 1, width, height); // north sideline
    fillRect(tiles, TILES.CONCRETE, 52, 11, 8, 1, width, height); // south sideline
    for (let r = 3; r <= 11; r++) {
        tiles[r][52] = TILES.CONCRETE;
        tiles[r][59] = TILES.CONCRETE;
    }

    // Field (grass) - the actual playing field
    for (let r = 4; r <= 10; r++) {
        for (let c = 53; c <= 58; c++) {
            tiles[r][c] = TILES.GRASS;
        }
    }

    // Concrete entrance walkway
    fillRect(tiles, TILES.CONCRETE, 54, 12, 4, 1, width, height);

    // --- Locker Room (below stadium, south of road) ---
    fillRect(tiles, TILES.CONCRETE, 52, 15, 8, 1, width, height); // sidewalk between road and locker room
    buildings.push({ x: 52, y: 16, w: 5, h: 3, color: '#2c3e50', roof: '#1a252f', name: 'Locker Room', enterable: true, shopkeeperName: '', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 52, 16, 5, 3, width, height);

    // --- Car Wash (east of locker room) ---
    buildings.push({ x: 58, y: 16, w: 2, h: 3, color: '#3498db', roof: '#2980b9', name: 'Car Wash',
        enterable: true, shopkeeperName: '', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 58, 16, 2, 3, width, height);

    // --- SW Block: School Area ---
    buildings.push({ x: 3, y: 30, w: 6, h: 4, color: '#c0392b', roof: '#962d22', name: 'Dude Angeles School', enterable: true });
    fillRect(tiles, TILES.BUILDING, 3, 30, 6, 4, width, height);

    // Playground (concrete)
    fillRect(tiles, TILES.CONCRETE, 3, 35, 4, 2, width, height);

    // Trees around school
    tiles[29][10] = TILES.TREE;
    tiles[36][10] = TILES.TREE;

    // --- SC Block: Library ---
    buildings.push({ x: 16, y: 30, w: 5, h: 3, color: '#d4a574', roof: '#b08050', name: 'Public Library', enterable: true });
    fillRect(tiles, TILES.BUILDING, 16, 30, 5, 3, width, height);

    buildings.push({ x: 16, y: 35, w: 3, h: 2, color: '#85c1e9', roof: '#5dade2', name: 'Book Café',
        enterable: true, shopkeeperName: 'Librarian Liz', shopItems: ['book', 'coffee'] });
    fillRect(tiles, TILES.BUILDING, 16, 35, 3, 2, width, height);

    // --- Card Store (near library) ---
    buildings.push({ x: 20, y: 30, w: 3, h: 2, color: '#e67e22', roof: '#d35400', name: 'Card Store',
        enterable: true, shopkeeperName: 'Card Collector Rick', shopItems: ['mega_evo_card', 'josh_dallan_card'] });
    fillRect(tiles, TILES.BUILDING, 20, 30, 3, 2, width, height);

    // --- Museum (next to library) ---
    buildings.push({ x: 20, y: 34, w: 3, h: 3, color: '#8e44ad', roof: '#6c3483', name: 'Museum',
        enterable: true, shopkeeperName: 'Curator Ada', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 20, 34, 3, 3, width, height);

    // Flowers near library
    fillRect(tiles, TILES.FLOWERS, 23, 31, 1, 2, width, height);

    // --- SE Block: SKATE PARK (Goal Destination!) ---
    // Concrete skate park surface
    fillRect(tiles, TILES.CONCRETE, 28, 30, 7, 6, width, height);

    // Fence around parts of it
    for (let c = 28; c <= 34; c++) {
        if (tiles[29][c] === TILES.GRASS || tiles[29][c] === TILES.SIDEWALK) {
            tiles[29][c] = TILES.FENCE;
        }
    }
    tiles[29][31] = TILES.CONCRETE; // entrance gap

    // --- SFE Block: Beach ---
    fillRect(tiles, TILES.SAND, 40, 29, 8, 5, width, height);
    fillRect(tiles, TILES.WATER, 40, 34, 8, 4, width, height);
    // Transition sand near water
    fillRect(tiles, TILES.SAND, 40, 33, 8, 1, width, height);

    // Palm trees on beach
    tiles[30][41] = TILES.TREE;
    tiles[30][46] = TILES.TREE;
    tiles[32][43] = TILES.TREE;

    // --- Extra decorative trees along roads ---
    const decorTrees = [
        [12, 6], [12, 9],
        [15, 14], [15, 23],
        [15, 36],
        [28, 6], [28, 10],
        [25, 14], [25, 36],
    ];
    for (const [r, c] of decorTrees) {
        if (r >= 0 && r < height && c >= 0 && c < width) {
            if (tiles[r][c] === TILES.GRASS || tiles[r][c] === TILES.SIDEWALK) {
                tiles[r][c] = TILES.TREE;
            }
        }
    }

    // --- Construction Site (SE new area, below stadium road) ---
    // Orange cone perimeter around construction area (cols 52-59, rows 29-36)
    for (let c = 52; c <= 59; c++) {
        tiles[29][c] = TILES.CONE;
        tiles[36][c] = TILES.CONE;
    }
    for (let r = 29; r <= 36; r++) {
        tiles[r][52] = TILES.CONE;
        tiles[r][59] = TILES.CONE;
    }
    // Entrance gap
    tiles[29][55] = TILES.CONCRETE;
    tiles[29][56] = TILES.CONCRETE;

    // Construction floor (sand/dirt)
    fillRect(tiles, TILES.SAND, 53, 30, 6, 6, width, height);

    // Concrete foundation pads
    fillRect(tiles, TILES.CONCRETE, 54, 31, 3, 2, width, height);
    fillRect(tiles, TILES.CONCRETE, 54, 34, 4, 1, width, height);

    // Blue Portable Toilet (small enterable building)
    buildings.push({ x: 57, y: 30, w: 1, h: 1, color: '#2980b9', roof: '#1f6da0', name: 'Porta Potty',
        enterable: true, shopkeeperName: '', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 57, 30, 1, 1, width, height);

    // Scaffolding (represented as fence tiles)
    tiles[32][53] = TILES.FENCE;
    tiles[33][53] = TILES.FENCE;
    tiles[32][58] = TILES.FENCE;
    tiles[33][58] = TILES.FENCE;

    // Construction Break Room (moved up so door is accessible from sand area)
    buildings.push({ x: 53, y: 32, w: 3, h: 2, color: '#d4a574', roof: '#b08050', name: 'Break Room',
        enterable: true, shopkeeperName: 'Foreman Dave', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 53, 32, 3, 2, width, height);

    // --- Road Work Zone (near school, south road) ---
    // Cones on sidewalk marking road work area (rows 25 & 28, cols 7-10)
    for (let c = 7; c <= 10; c++) {
        if (tiles[25][c] === TILES.SIDEWALK || tiles[25][c] === TILES.GRASS) tiles[25][c] = TILES.CONE;
        if (tiles[28][c] === TILES.SIDEWALK || tiles[28][c] === TILES.GRASS) tiles[28][c] = TILES.CONE;
    }
    // A couple cones on the road itself to protect workers
    tiles[26][7] = TILES.CONE;
    tiles[26][10] = TILES.CONE;

    // --- Garbage Center (outdoor area, east of locker room) ---
    // Fence perimeter (cols 52-59, rows 20-25)
    // Only place fence on corners + left/right walls; wide open north entrance
    tiles[20][52] = TILES.FENCE;  // NW corner
    tiles[20][59] = TILES.FENCE;  // NE corner
    for (let c = 52; c <= 59; c++) {
        tiles[25][c] = TILES.FENCE; // south wall
    }
    for (let r = 20; r <= 25; r++) {
        tiles[r][52] = TILES.FENCE; // west wall
        tiles[r][59] = TILES.FENCE; // east wall
    }
    // Wide entrance gap (north side, cols 53-58 = 6 tiles wide for trucks)
    for (let c = 53; c <= 58; c++) {
        tiles[20][c] = TILES.CONCRETE;
    }

    // Concrete floor inside
    fillRect(tiles, TILES.CONCRETE, 53, 21, 6, 4, width, height);

    // Garbage Break Room (inside the garbage center)
    buildings.push({ x: 53, y: 21, w: 2, h: 1, color: '#6b7b3a', roof: '#4a5528', name: 'Garbage Break Room',
        enterable: true, shopkeeperName: 'Garbage Foreman', shopItems: [] });
    fillRect(tiles, TILES.BUILDING, 53, 21, 2, 1, width, height);

    // --- Goal Definitions ---
    const goals = [
        {
            id: 'reach_skatepark',
            title: 'Find the Skate Park',
            description: 'Head to the Gnarly Skate Park in the southeast part of town. Look for the concrete area!',
            type: 'reach_spot',
            targetCol: 31,
            targetRow: 32,
            radius: 2.5,
            completeMessage: 'Gnarly! You found the Skate Park! 🛹\nDude Angeles is yours to explore!',
            nextGoalId: null, // Future: chain goals here
        },
    ];

    // --- Player Start ---
    const playerStart = { col: 5, row: 7 };

    // --- Garbage can positions around the city ---
    const garbageCans = [
        { col: 5, row: 12 },    // near residential NW
        { col: 17, row: 12 },   // near basketball stadium NC
        { col: 30, row: 12 },   // near shopping NE
        { col: 43, row: 15 },   // near apartments NFE
        { col: 7, row: 25 },    // near office MW
        { col: 18, row: 25 },   // near downtown MC
        { col: 30, row: 25 },   // near food district ME
        { col: 5, row: 28 },    // near school SW
        { col: 18, row: 28 },   // near library SC
        { col: 35, row: 28 },   // near skate park SE
        { col: 42, row: 28 },   // near beach SFE
        { col: 52, row: 15 },   // near stadium
    ];

    return {
        name: 'Dude Angeles',
        width,
        height,
        tiles,
        buildings,
        goals,
        playerStart,
        constructionSite: {
            zoneCols: [53, 58],
            zoneRows: [30, 35],
        },
        stadiumField: {
            fieldCols: [53, 58],
            fieldRows: [4, 10],
            sidelineRow: 3,
            teamName: 'DUDE DINOSAURS',
        },
        roadWork: {
            zoneCols: [7, 10],
            zoneRows: [26, 27],
        },
        // Excavator spawn position (inside construction site)
        excavatorSpawn: { col: 56, row: 31 },
        // Driveable construction truck+trailer near construction entrance
        constructionTruckSpawn: { col: 57, row: 28 },
        // Garbage center
        garbageCenter: {
            zoneCols: [53, 58],
            zoneRows: [21, 24],
        },
        // 4 garbage truck spawn positions inside garbage center (centered for easy exit)
        garbageTruckSpawns: [
            { col: 55, row: 22 },
            { col: 57, row: 22 },
            { col: 55, row: 24 },
            { col: 57, row: 24 },
        ],
        // Garbage cans around city
        garbageCans,
        // Basketball stadium
        basketballCourt: {
            courtCols: [17, 20],   // actual court playing area
            courtRows: [4, 9],
            sidelineCols: [16, 21], // sideline/bench areas
            sidelineRows: [3, 10],
            fenceCols: [15, 22],
            fenceRows: [2, 11],
            benchCol: 16,          // west sideline for benches
            benchRows: [5, 8],
            drinkCol: 16,          // drink station at NW
            drinkRow: 3,
            homeTeam: 'DYNAMIC DUDES',
            awayTeam: 'NUGGETS',
        },
    };
}
