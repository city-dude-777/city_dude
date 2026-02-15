// ============================================================================
// City Dude - TileMap Renderer & Collision
// ============================================================================
// Pre-renders the entire map to an offscreen canvas for performance.
// Handles collision detection against solid tiles.

import { TILE_SIZE, TILES, SOLID_TILES, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

export class TileMap {
    constructor(mapData) {
        this.mapData = mapData;
        this.width = mapData.width;
        this.height = mapData.height;
        this.tiles = mapData.tiles;
        this.buildings = mapData.buildings;
        this.pixelWidth = this.width * TILE_SIZE;
        this.pixelHeight = this.height * TILE_SIZE;

        // Pre-render the map
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.width = this.pixelWidth;
        this.mapCanvas.height = this.pixelHeight;
        this.mapCtx = this.mapCanvas.getContext('2d');

        // Pre-render minimap
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCanvas.width = this.width;
        this.minimapCanvas.height = this.height;
        this.minimapCtx = this.minimapCanvas.getContext('2d');

        // Seed for grass variation
        this.grassSeeds = [];
        for (let r = 0; r < this.height; r++) {
            this.grassSeeds[r] = [];
            for (let c = 0; c < this.width; c++) {
                this.grassSeeds[r][c] = (r * 7 + c * 13 + r * c * 3) % 7;
            }
        }

        this._preRender();
        this._preRenderMinimap();
    }

    // ---- Pre-rendering ----

    _preRender() {
        const ctx = this.mapCtx;
        const T = TILE_SIZE;

        // 1. Render base tiles
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                const tile = this.tiles[r][c];
                const x = c * T;
                const y = r * T;
                this._renderBaseTile(ctx, tile, x, y, r, c);
            }
        }

        // 2. Render buildings with details
        for (const b of this.buildings) {
            this._renderBuilding(ctx, b);
        }

        // 3. Render trees on top (they have canopy that overlaps)
        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                if (this.tiles[r][c] === TILES.TREE) {
                    this._renderTree(ctx, c * T, r * T);
                }
            }
        }

        // 4. Render road markings
        this._renderRoadMarkings(ctx);

        // 5. Render stadium field markings (if present)
        if (this.mapData.stadiumField) {
            this._renderFieldMarkings(ctx);
        }

        // 6. Construction truck is now a driveable vehicle (rendered by VehicleManager)

        // 7. Render road work decorations (tools, barriers)
        this._renderRoadWorkDecor(ctx);
    }

    _renderBaseTile(ctx, tile, x, y, row, col) {
        const T = TILE_SIZE;
        const seed = this.grassSeeds[row][col];

        switch (tile) {
            case TILES.GRASS: {
                const grassColors = [COLORS.GRASS_1, COLORS.GRASS_2, COLORS.GRASS_3];
                ctx.fillStyle = grassColors[seed % 3];
                ctx.fillRect(x, y, T, T);
                // Occasional grass detail
                if (seed > 4) {
                    ctx.fillStyle = '#6ba84e';
                    ctx.fillRect(x + 8 + (seed * 3) % 16, y + 4 + (seed * 7) % 20, 2, 4);
                }
                break;
            }
            case TILES.ROAD: {
                ctx.fillStyle = COLORS.ROAD;
                ctx.fillRect(x, y, T, T);
                // Subtle texture
                ctx.fillStyle = 'rgba(0,0,0,0.05)';
                if (seed % 2 === 0) {
                    ctx.fillRect(x + seed * 3, y + seed * 2, 4, 2);
                }
                break;
            }
            case TILES.SIDEWALK: {
                ctx.fillStyle = COLORS.SIDEWALK;
                ctx.fillRect(x, y, T, T);
                // Crack/joint lines
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                if (col % 2 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(x + T, y);
                    ctx.lineTo(x + T, y + T);
                    ctx.stroke();
                }
                if (row % 2 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + T);
                    ctx.lineTo(x + T, y + T);
                    ctx.stroke();
                }
                break;
            }
            case TILES.BUILDING:
                // Buildings rendered separately with metadata
                ctx.fillStyle = '#999';
                ctx.fillRect(x, y, T, T);
                break;
            case TILES.TREE:
                // Base ground under tree
                ctx.fillStyle = COLORS.GRASS_1;
                ctx.fillRect(x, y, T, T);
                // Tree rendered separately in pass 3
                break;
            case TILES.WATER: {
                ctx.fillStyle = COLORS.WATER;
                ctx.fillRect(x, y, T, T);
                // Wave highlight
                ctx.fillStyle = COLORS.WATER_LIGHT;
                const wx = x + 4 + (seed * 5) % 16;
                const wy = y + 6 + (seed * 3) % 14;
                ctx.fillRect(wx, wy, 8, 2);
                break;
            }
            case TILES.SAND: {
                ctx.fillStyle = COLORS.SAND;
                ctx.fillRect(x, y, T, T);
                // Sand grain detail
                if (seed > 3) {
                    ctx.fillStyle = 'rgba(0,0,0,0.05)';
                    ctx.fillRect(x + seed * 2, y + seed * 3, 2, 2);
                }
                break;
            }
            case TILES.CONCRETE: {
                ctx.fillStyle = COLORS.CONCRETE;
                ctx.fillRect(x, y, T, T);
                // Expansion joints
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                if (col % 3 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(x + T, y);
                    ctx.lineTo(x + T, y + T);
                    ctx.stroke();
                }
                if (row % 3 === 0) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + T);
                    ctx.lineTo(x + T, y + T);
                    ctx.stroke();
                }
                break;
            }
            case TILES.FLOWERS: {
                // Grass base
                ctx.fillStyle = COLORS.GRASS_1;
                ctx.fillRect(x, y, T, T);
                // Colorful flower dots
                const flowerColors = [COLORS.FLOWERS_1, COLORS.FLOWERS_2, COLORS.FLOWERS_3];
                for (let i = 0; i < 4; i++) {
                    ctx.fillStyle = flowerColors[(seed + i) % 3];
                    const fx = x + 4 + ((seed + i * 7) % 22);
                    const fy = y + 4 + ((seed + i * 11) % 22);
                    ctx.beginPath();
                    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            }
            case TILES.FENCE: {
                // Grass base
                ctx.fillStyle = COLORS.GRASS_1;
                ctx.fillRect(x, y, T, T);
                // Fence posts and rails
                ctx.fillStyle = COLORS.FENCE;
                ctx.fillRect(x + 2, y + 10, T - 4, 4);     // horizontal rail
                ctx.fillRect(x + 2, y + 18, T - 4, 4);     // lower rail
                ctx.fillRect(x + 4, y + 6, 4, 20);          // left post
                ctx.fillRect(x + T - 8, y + 6, 4, 20);     // right post
                break;
            }
            case TILES.CONE: {
                // Ground base (concrete/sand)
                ctx.fillStyle = COLORS.CONCRETE;
                ctx.fillRect(x, y, T, T);
                // Orange traffic cone
                const coneCx = x + T / 2;
                const coneBot = y + T - 4;
                // Cone base (dark)
                ctx.fillStyle = '#333';
                ctx.fillRect(coneCx - 6, coneBot, 12, 4);
                // Cone body (orange)
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.moveTo(coneCx - 5, coneBot);
                ctx.lineTo(coneCx + 5, coneBot);
                ctx.lineTo(coneCx + 2, coneBot - 14);
                ctx.lineTo(coneCx - 2, coneBot - 14);
                ctx.closePath();
                ctx.fill();
                // White reflective stripes
                ctx.fillStyle = '#fff';
                ctx.fillRect(coneCx - 4, coneBot - 5, 8, 2);
                ctx.fillRect(coneCx - 3, coneBot - 10, 6, 2);
                // Cone tip
                ctx.fillStyle = '#ff4400';
                ctx.fillRect(coneCx - 1, coneBot - 16, 2, 3);
                break;
            }
        }
    }

    _renderBuilding(ctx, building) {
        const T = TILE_SIZE;
        const x = building.x * T;
        const y = building.y * T;
        const w = building.w * T;
        const h = building.h * T;

        // Building shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 4, y + 4, w, h);

        // Main building body
        ctx.fillStyle = building.color;
        ctx.fillRect(x, y, w, h);

        // Roof line (top 6px darker)
        ctx.fillStyle = building.roof;
        ctx.fillRect(x, y, w, 6);

        // Outline
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        // Windows
        ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
        const windowSize = 6;
        const windowGap = 10;
        for (let wy = y + 12; wy < y + h - 10; wy += windowGap + windowSize) {
            for (let wx = x + 8; wx < x + w - 10; wx += windowGap + windowSize) {
                ctx.fillRect(wx, wy, windowSize, windowSize);
                // Window frame
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.strokeRect(wx, wy, windowSize, windowSize);
            }
        }

        // Door (bottom center)
        const doorW = 8;
        const doorH = 12;
        const doorX = x + Math.floor(w / 2) - Math.floor(doorW / 2);
        const doorY = y + h - doorH;
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(doorX, doorY, doorW, doorH);
        // Door knob
        ctx.fillStyle = '#c0a060';
        ctx.fillRect(doorX + doorW - 3, doorY + doorH / 2, 2, 2);
    }

    _renderTree(ctx, x, y) {
        const T = TILE_SIZE;
        const cx = x + T / 2;
        const cy = y + T / 2;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + 6, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.fillStyle = COLORS.TREE_TRUNK;
        ctx.fillRect(cx - 3, cy, 6, 12);

        // Canopy (layered circles for depth)
        ctx.fillStyle = COLORS.TREE_CANOPY;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.TREE_CANOPY_LIGHT;
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 4, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    _renderRoadMarkings(ctx) {
        const T = TILE_SIZE;
        ctx.fillStyle = COLORS.ROAD_LINE;

        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                if (this.tiles[r][c] !== TILES.ROAD) continue;

                const x = c * T;
                const y = r * T;

                // Check if this is part of a horizontal road (road above or below is also road)
                const hasRoadUp = r > 0 && this.tiles[r - 1][c] === TILES.ROAD;
                const hasRoadDown = r < this.height - 1 && this.tiles[r + 1][c] === TILES.ROAD;
                const hasRoadLeft = c > 0 && this.tiles[r][c - 1] === TILES.ROAD;
                const hasRoadRight = c < this.width - 1 && this.tiles[r][c + 1] === TILES.ROAD;

                // Horizontal road center line (dashed)
                if (hasRoadUp && !hasRoadDown && hasRoadLeft) {
                    // Bottom edge of horizontal road
                    if (c % 3 === 0) {
                        ctx.fillRect(x + 4, y + T - 2, 16, 2);
                    }
                }

                // Vertical road center line (dashed)
                if (hasRoadLeft && !hasRoadRight && hasRoadUp) {
                    // Right edge of vertical road
                    if (r % 3 === 0) {
                        ctx.fillRect(x + T - 2, y + 4, 2, 16);
                    }
                }
            }
        }
    }

    _renderFieldMarkings(ctx) {
        const T = TILE_SIZE;
        const f = this.mapData.stadiumField;
        const fieldLeft = f.fieldCols[0] * T;
        const fieldRight = (f.fieldCols[1] + 1) * T;
        const fieldTop = f.fieldRows[0] * T;
        const fieldBot = (f.fieldRows[1] + 1) * T;
        const fieldW = fieldRight - fieldLeft;
        const fieldH = fieldBot - fieldTop;
        const midX = (fieldLeft + fieldRight) / 2;

        // End zone shading (team color tint)
        ctx.fillStyle = 'rgba(26, 82, 118, 0.3)';
        ctx.fillRect(fieldLeft, fieldTop, fieldW, T * 1.5);           // north end zone
        ctx.fillRect(fieldLeft, fieldBot - T * 1.5, fieldW, T * 1.5); // south end zone

        // Field border (white lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(fieldLeft + 3, fieldTop + 3, fieldW - 6, fieldH - 6);

        // Yard lines (every row within the field)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        const yardLabels = ['', '10', '20', '30', '40', '50', '40', '30', '20', '10', ''];
        for (let r = f.fieldRows[0] + 1; r <= f.fieldRows[1]; r++) {
            const y = r * T;
            ctx.beginPath();
            ctx.moveTo(fieldLeft + 6, y);
            ctx.lineTo(fieldRight - 6, y);
            ctx.stroke();
        }

        // Center line (50 yard - thicker)
        const midRow = (f.fieldRows[0] + f.fieldRows[1]) / 2;
        const midY = midRow * T + T / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fieldLeft + 6, midY);
        ctx.lineTo(fieldRight - 6, midY);
        ctx.stroke();

        // Yard line numbers (American football style)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        for (let r = f.fieldRows[0] + 1; r <= f.fieldRows[1]; r++) {
            const idx = r - f.fieldRows[0];
            const label = yardLabels[idx];
            if (label) {
                const y = r * T + 4;
                ctx.fillText(label, fieldLeft + 14, y);
                ctx.fillText(label, fieldRight - 14, y);
            }
        }
        ctx.textAlign = 'left';

        // Hash marks (American football style - small ticks)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        const hashInset1 = fieldLeft + fieldW * 0.33;
        const hashInset2 = fieldLeft + fieldW * 0.67;
        for (let r = f.fieldRows[0] + 1; r <= f.fieldRows[1]; r++) {
            const y = r * T;
            ctx.beginPath(); ctx.moveTo(hashInset1, y - 3); ctx.lineTo(hashInset1, y + 3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(hashInset2, y - 3); ctx.lineTo(hashInset2, y + 3); ctx.stroke();
        }

        // Goal posts (H-shape at each end zone)
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        // North goal post
        const gpNY = fieldTop + 8;
        ctx.beginPath();
        ctx.moveTo(midX - 12, gpNY); ctx.lineTo(midX - 12, gpNY - 14); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX + 12, gpNY); ctx.lineTo(midX + 12, gpNY - 14); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX - 12, gpNY); ctx.lineTo(midX + 12, gpNY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX, gpNY); ctx.lineTo(midX, gpNY + 10); ctx.stroke();
        // South goal post
        const gpSY = fieldBot - 8;
        ctx.beginPath();
        ctx.moveTo(midX - 12, gpSY); ctx.lineTo(midX - 12, gpSY + 14); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX + 12, gpSY); ctx.lineTo(midX + 12, gpSY + 14); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX - 12, gpSY); ctx.lineTo(midX + 12, gpSY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX, gpSY); ctx.lineTo(midX, gpSY - 10); ctx.stroke();

        // Team name in end zones
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DINOSAURS', midX, fieldTop + T * 0.9);
        ctx.fillText('DINOSAURS', midX, fieldBot - T * 0.4);
        ctx.textAlign = 'left';

        // "DUDE DINOSAURS" sign above field (on north sideline concrete)
        const signY = f.sidelineRow * T;
        ctx.fillStyle = 'rgba(26, 82, 118, 0.9)';
        ctx.fillRect(midX - 60, signY + 4, 120, 18);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 60, signY + 4, 120, 18);
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DUDE DINOSAURS', midX, signY + 16);
        ctx.textAlign = 'left';

        // --- Bleachers with fans ---
        // West bleachers (col 52 concrete sideline)
        const westX = 52 * T;
        this._renderBleacher(ctx, westX + 2, (f.fieldRows[0]) * T, T - 4, (f.fieldRows[1] - f.fieldRows[0] + 1) * T, 'vertical');
        // East bleachers (col 59 concrete sideline)
        const eastX = 59 * T;
        this._renderBleacher(ctx, eastX + 2, (f.fieldRows[0]) * T, T - 4, (f.fieldRows[1] - f.fieldRows[0] + 1) * T, 'vertical');

        // --- Water cooler stations (larger, on both sidelines) ---
        const coolerPositions = [
            { x: fieldLeft - T * 0.5, y: (f.sidelineRow + 0.2) * T },
            { x: fieldRight + T * 0.15, y: (f.sidelineRow + 0.2) * T },
            { x: fieldLeft - T * 0.5, y: (f.fieldRows[1] + 1.1) * T },
            { x: fieldRight + T * 0.15, y: (f.fieldRows[1] + 1.1) * T },
        ];
        for (const cp of coolerPositions) {
            // Table
            ctx.fillStyle = '#8b6b4a';
            ctx.fillRect(cp.x - 2, cp.y + 10, 16, 6);
            ctx.fillRect(cp.x, cp.y + 16, 3, 6);
            ctx.fillRect(cp.x + 9, cp.y + 16, 3, 6);
            // Blue water cooler jug
            ctx.fillStyle = '#3498db';
            ctx.fillRect(cp.x + 1, cp.y, 10, 12);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(cp.x + 1, cp.y, 10, 3);
            // Spigot
            ctx.fillStyle = '#ccc';
            ctx.fillRect(cp.x + 4, cp.y + 10, 4, 3);
            // White cups
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(cp.x - 1, cp.y + 2, 3, 5);
            ctx.fillRect(cp.x + 10, cp.y + 2, 3, 5);
        }

        // --- Bench on south sideline (team bench) ---
        const benchRow = f.fieldRows[1] + 1;
        const benchY = benchRow * T + 6;
        ctx.fillStyle = '#555';
        ctx.fillRect(midX - 30, benchY, 60, 6);
        ctx.fillStyle = '#444';
        ctx.fillRect(midX - 30, benchY + 6, 4, 8);
        ctx.fillRect(midX + 26, benchY + 6, 4, 8);
    }

    /** Render bleacher rows with small fan sprites */
    _renderBleacher(ctx, x, y, w, h, orientation) {
        // Draw stepped bleacher rows
        const numRows = 4;
        const rowH = h / numRows;
        const fanColors = ['#1a5276', '#ecf0f1', '#c0392b', '#1a5276', '#f1c40f', '#1a5276'];
        let fanIdx = 0;

        for (let i = 0; i < numRows; i++) {
            const ry = y + i * rowH;
            // Bleacher step (gray metal)
            ctx.fillStyle = '#888';
            ctx.fillRect(x, ry, w, rowH - 2);
            ctx.fillStyle = '#777';
            ctx.fillRect(x, ry + rowH - 4, w, 2);

            // Fan sprites sitting on this row
            const numFans = 2 + (i % 2);
            for (let f = 0; f < numFans; f++) {
                const fx = x + 4 + f * (w / numFans);
                const fy = ry + 2;
                const col = fanColors[fanIdx % fanColors.length];
                fanIdx++;

                // Small fan body (jersey color)
                ctx.fillStyle = col;
                ctx.fillRect(fx, fy + 4, 6, 6);
                // Head
                ctx.fillStyle = '#f0c27a';
                ctx.fillRect(fx + 1, fy, 4, 4);
                // Pants
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(fx, fy + 10, 3, 4);
                ctx.fillRect(fx + 3, fy + 10, 3, 4);
            }
        }
    }

    /** Render the static pickup truck with trailer near construction entrance */
    _renderTruckTrailer(ctx) {
        if (!this.mapData.truckTrailer) return;
        const T = TILE_SIZE;
        const tx = this.mapData.truckTrailer.col * T;
        const ty = this.mapData.truckTrailer.row * T;

        // --- Pickup Truck ---
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(tx + 2, ty + 2, 28, 20);
        // Truck body (orange/brown construction truck)
        ctx.fillStyle = '#d4850f';
        ctx.fillRect(tx, ty, 28, 18);
        // Cab
        ctx.fillStyle = '#c07a0e';
        ctx.fillRect(tx, ty, 14, 18);
        // Windshield
        ctx.fillStyle = 'rgba(100, 160, 220, 0.8)';
        ctx.fillRect(tx + 2, ty + 2, 10, 6);
        // Bed
        ctx.fillStyle = '#a06b0c';
        ctx.fillRect(tx + 14, ty + 2, 13, 14);
        // Wheels
        ctx.fillStyle = '#333';
        ctx.fillRect(tx + 2, ty + 16, 6, 4);
        ctx.fillRect(tx + 20, ty + 16, 6, 4);
        // Outline
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, 28, 18);

        // --- Trailer ---
        const tlx = tx + 30;
        // Hitch
        ctx.fillStyle = '#555';
        ctx.fillRect(tx + 27, ty + 7, 5, 4);
        // Trailer frame
        ctx.fillStyle = '#888';
        ctx.fillRect(tlx, ty + 2, 22, 16);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(tlx, ty + 2, 22, 16);
        // Trailer wheels
        ctx.fillStyle = '#333';
        ctx.fillRect(tlx + 3, ty + 16, 5, 4);
        ctx.fillRect(tlx + 14, ty + 16, 5, 4);

        // --- Porta Potty on trailer ---
        const ppx = tlx + 4;
        const ppy = ty + 3;
        // Blue box
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(ppx, ppy, 14, 12);
        // Roof
        ctx.fillStyle = '#1f6da0';
        ctx.fillRect(ppx, ppy, 14, 3);
        // Door line
        ctx.fillStyle = '#1a6490';
        ctx.fillRect(ppx + 6, ppy + 3, 2, 9);
        // Vent
        ctx.fillStyle = '#34a1d4';
        ctx.fillRect(ppx + 2, ppy + 4, 3, 2);
    }

    /** Render road work zone decorations (barriers, tools, signs) */
    _renderRoadWorkDecor(ctx) {
        if (!this.mapData.roadWork) return;
        const T = TILE_SIZE;
        const rw = this.mapData.roadWork;
        const left = rw.zoneCols[0] * T;
        const right = (rw.zoneCols[1] + 1) * T;
        const top = rw.zoneRows[0] * T;

        // "ROAD WORK" sign
        const signX = left + (right - left) / 2;
        const signY = (rw.zoneRows[0] - 1) * T + T / 2;
        // Sign post
        ctx.fillStyle = '#888';
        ctx.fillRect(signX - 1, signY + 6, 3, 18);
        // Sign board (diamond shape - orange)
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath();
        ctx.moveTo(signX, signY - 8);
        ctx.lineTo(signX + 10, signY);
        ctx.lineTo(signX, signY + 8);
        ctx.lineTo(signX - 10, signY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Shovel on the ground
        const shX = left + 16;
        const shY = top + 8;
        ctx.fillStyle = '#888';
        ctx.fillRect(shX, shY, 2, 18);
        ctx.fillStyle = '#555';
        ctx.fillRect(shX - 2, shY + 16, 6, 6);

        // Hole / patch area (darker road)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(left + T, top + 4, T * 1.5, T * 0.8);
        ctx.fillStyle = '#444';
        ctx.fillRect(left + T + 4, top + 8, T, T * 0.4);
    }

    _preRenderMinimap() {
        const ctx = this.minimapCtx;
        const minimapColors = {
            [TILES.GRASS]: '#5a8f3c',
            [TILES.ROAD]: '#666',
            [TILES.SIDEWALK]: '#c4b48f',
            [TILES.BUILDING]: '#8b6040',
            [TILES.TREE]: '#2d5a1e',
            [TILES.WATER]: '#4a90b8',
            [TILES.SAND]: '#dcc07a',
            [TILES.CONCRETE]: '#a8a8a0',
            [TILES.FLOWERS]: '#d4a84a',
            [TILES.FENCE]: '#8b6b4a',
            [TILES.CONE]: '#ff6600',
        };

        for (let r = 0; r < this.height; r++) {
            for (let c = 0; c < this.width; c++) {
                ctx.fillStyle = minimapColors[this.tiles[r][c]] || '#000';
                ctx.fillRect(c, r, 1, 1);
            }
        }

        // Overlay building colors
        for (const b of this.buildings) {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
        }
    }

    // ---- Collision Detection ----

    /**
     * Check if a world-space rectangle collides with any solid tile.
     * @param {number} x - Left edge in pixels
     * @param {number} y - Top edge in pixels
     * @param {number} w - Width in pixels
     * @param {number} h - Height in pixels
     * @returns {boolean} True if collision
     */
    isSolidAt(x, y, w, h) {
        const T = TILE_SIZE;
        const startCol = Math.floor(x / T);
        const endCol = Math.floor((x + w - 1) / T);
        const startRow = Math.floor(y / T);
        const endRow = Math.floor((y + h - 1) / T);

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (r < 0 || r >= this.height || c < 0 || c >= this.width) return true;
                if (SOLID_TILES.has(this.tiles[r][c])) return true;
            }
        }
        return false;
    }

    /** Get tile type at a world position */
    getTileAt(worldX, worldY) {
        const col = Math.floor(worldX / TILE_SIZE);
        const row = Math.floor(worldY / TILE_SIZE);
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) return -1;
        return this.tiles[row][col];
    }

    /** Get nearest building to a world position */
    getNearbyBuilding(worldX, worldY, radius = 2) {
        const col = worldX / TILE_SIZE;
        const row = worldY / TILE_SIZE;
        for (const b of this.buildings) {
            const bcx = b.x + b.w / 2;
            const bcy = b.y + b.h / 2;
            const dist = Math.hypot(col - bcx, row - bcy);
            if (dist < radius + Math.max(b.w, b.h) / 2) {
                return b;
            }
        }
        return null;
    }

    // ---- Rendering ----

    /**
     * Render the visible portion of the pre-rendered map.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Camera} camera
     */
    render(ctx, camera) {
        const bounds = camera.getVisibleBounds();

        // Source rectangle (from pre-rendered canvas)
        const sx = Math.max(0, Math.floor(bounds.left));
        const sy = Math.max(0, Math.floor(bounds.top));
        const sw = Math.min(CANVAS_WIDTH, this.pixelWidth - sx);
        const sh = Math.min(CANVAS_HEIGHT, this.pixelHeight - sy);

        // Destination on screen
        const dx = Math.max(0, -Math.floor(bounds.left));
        const dy = Math.max(0, -Math.floor(bounds.top));

        if (sw > 0 && sh > 0) {
            ctx.drawImage(this.mapCanvas, sx, sy, sw, sh, dx, dy, sw, sh);
        }
    }

    /** Render the minimap at a fixed screen position */
    renderMinimap(ctx, playerCol, playerRow, goalCol, goalRow, time) {
        const scale = 3;
        const mmW = this.width * scale;
        const mmH = this.height * scale;
        const padding = 10;
        const mmX = CANVAS_WIDTH - mmW - padding;
        const mmY = CANVAS_HEIGHT - mmH - padding;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);

        // Map
        ctx.drawImage(this.minimapCanvas, mmX, mmY, mmW, mmH);

        // Player dot (white)
        ctx.fillStyle = '#fff';
        ctx.fillRect(
            mmX + Math.floor(playerCol * scale) - 1,
            mmY + Math.floor(playerRow * scale) - 1,
            3, 3
        );

        // Goal dot (pulsing yellow)
        if (goalCol !== undefined && goalRow !== undefined) {
            const pulse = Math.sin(time * 4) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(241, 196, 15, ${0.5 + pulse * 0.5})`;
            ctx.fillRect(
                mmX + Math.floor(goalCol * scale) - 1,
                mmY + Math.floor(goalRow * scale) - 1,
                3, 3
            );
        }

        // Border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(mmX - 0.5, mmY - 0.5, mmW + 1, mmH + 1);
    }
}
