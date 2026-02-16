// ============================================================================
// City Dude - Game Constants
// ============================================================================

export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;

// Tile type identifiers
export const TILES = {
    GRASS: 0,
    ROAD: 1,
    SIDEWALK: 2,
    BUILDING: 3,
    TREE: 4,
    WATER: 5,
    SAND: 6,
    CONCRETE: 7,
    FLOWERS: 8,
    FENCE: 9,
    CONE: 10,
    SNOW: 11,
};

// Which tiles block movement
export const SOLID_TILES = new Set([
    TILES.BUILDING,
    TILES.TREE,
    TILES.WATER,
    TILES.FENCE,
    TILES.CONE,
]);

// Player facing directions
export const DIR = {
    DOWN: 0,
    UP: 1,
    LEFT: 2,
    RIGHT: 3,
};

// Game states
export const STATE = {
    TITLE: 'title',
    PLAYING: 'playing',
    GOAL_COMPLETE: 'goal_complete',
    PAUSED: 'paused',
    SKIING: 'skiing',
};

// Color palette
export const COLORS = {
    GRASS_1: '#5a8f3c',
    GRASS_2: '#528a36',
    GRASS_3: '#629442',
    ROAD: '#666666',
    ROAD_LINE: '#e8c84a',
    SIDEWALK: '#c4b48f',
    WATER: '#4a90b8',
    WATER_LIGHT: '#5da8d0',
    SAND: '#dcc07a',
    CONCRETE: '#a8a8a0',
    FLOWERS_1: '#e74c3c',
    FLOWERS_2: '#f1c40f',
    FLOWERS_3: '#9b59b6',
    FENCE: '#8b6b4a',
    SNOW_1: '#eef4f8',
    SNOW_2: '#e0eaf0',
    SNOW_3: '#d5e2ec',
    TREE_TRUNK: '#6b4423',
    TREE_CANOPY: '#2d6b1e',
    TREE_CANOPY_LIGHT: '#3d8b2e',
    // Character colors
    SKIN: '#f0c27a',
    CAP: '#c0392b',
    HOODIE: '#555555',
    HOODIE_LIGHT: '#666666',
    SHORTS: '#2c6fbb',
    SHOES: '#ecf0f1',
    EYES: '#333333',
    // UI colors
    UI_BG: 'rgba(0, 0, 0, 0.7)',
    UI_TEXT: '#ffffff',
    UI_ACCENT: '#f1c40f',
    UI_GOAL: '#2ecc71',
    UI_GOAL_ARROW: '#e74c3c',
};
