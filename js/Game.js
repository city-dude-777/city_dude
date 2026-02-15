// ============================================================================
// City Dude - Main Game Engine
// ============================================================================
// Orchestrates all game systems: input, rendering, entities, goals,
// interiors, dialogue, inventory, and shops.
//
// E Key Priority (context-sensitive):
//   Driving       → Exit vehicle
//   Inside + shop open  → Buy item
//   Inside + near exit  → Exit building
//   Inside + near shopkeeper → Open shop
//   Outside + dialogue  → Dismiss dialogue
//   Outside + near door → Enter building
//   Outside + near car  → Enter vehicle
//   Outside + near NPC  → Talk to NPC

import { CANVAS_WIDTH, CANVAS_HEIGHT, STATE, COLORS, TILE_SIZE, DIR } from './constants.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';
import { Player } from './Player.js';
import { TileMap } from './TileMap.js';
import { GoalManager } from './GoalManager.js';
import { HUD } from './HUD.js';
import { VehicleManager } from './Vehicle.js';
import { NPCManager } from './NPC.js';
import { Inventory } from './Inventory.js';
import { InteriorManager, SHOP_CATALOG } from './Interior.js';
import { SoundManager } from './Sound.js';
import { createDudeAngelesMap } from './maps/dudeAngeles.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;

        // Core systems
        this.input = new Input();
        this.camera = new Camera();
        this.hud = new HUD();
        this.goalManager = new GoalManager();
        this.inventory = new Inventory();
        this.interior = new InteriorManager();
        this.sound = new SoundManager();

        // Game state
        this.state = STATE.TITLE;
        this.time = 0;
        this.lastTimestamp = 0;
        this.goalCompleteTimer = 0;

        // Dialogue state
        this.dialogueActive = false;
        this.dialogueNPC = null;

        // Day/night cycle (0–1440 minutes, 480 = 8 AM start)
        this.gameMinutes = 480; // 8:00 AM
        this.gameSpeed = 3; // game minutes per real second (1 day = 8 real minutes)

        // Sleep transition
        this.sleeping = false;
        this.sleepTimer = 0;

        // Wardrobe UI
        this.wardrobeOpen = false;
        this.wardrobeCursor = 0;
        this.wardrobeOptions = [
            { label: 'Default (Cap & Hoodie)', job: null },
            { label: 'Construction Worker', job: 'Construction Worker' },
            { label: 'Police Officer', job: 'Police Officer' },
            { label: 'Firefighter', job: 'Firefighter' },
            { label: 'Garbage Truck Driver', job: 'Garbage Truck Driver' },
        ];

        // Garbage collection state
        this.garbageCans = [];      // { x, y, collected }
        this.trashCollected = 0;    // current trash in truck (0-4)
        this.garbageCenter = null;  // zone bounds for dump point
        this.basketballCourt = null;

        // Road clear mission (police chief quest)
        this.roadClearMission = {
            active: false,
            parked: false,          // player has parked police car at the spot
            carsDismissed: 0,       // how many cars dismissed (need 5)
            carsNeeded: 5,
            reward: 250,
            parkingSpot: { col: 6, row: 27 }, // just west of road work cones
        };

        // Title screen animation
        this.titleTime = 0;

        // Load the map
        this._loadMap();

        // Bind game loop
        this._gameLoop = this._gameLoop.bind(this);
    }

    _loadMap() {
        const mapData = createDudeAngelesMap();

        this.tileMap = new TileMap(mapData);
        this.player = new Player(mapData.playerStart.col, mapData.playerStart.row);

        this.goalManager.addGoals(mapData.goals);
        if (mapData.goals.length > 0) {
            this.goalManager.setActiveGoal(mapData.goals[0].id);
        }

        this.goalManager.onComplete((goal) => {
            this.state = STATE.GOAL_COMPLETE;
            this.goalCompleteTimer = 4;
            this.hud.showMessage(goal.completeMessage, 4);
        });

        this.vehicleManager = new VehicleManager(this.tileMap);
        this.npcManager = new NPCManager(this.tileMap);

        // Provide door positions to NPC system for building-enter behavior
        const doorPositions = mapData.buildings
            .filter(b => b.enterable)
            .map(b => InteriorManager.getDoorPosition(b));
        this.npcManager.setDoorPositions(doorPositions);

        // Store buildings for door detection
        this.buildings = mapData.buildings;

        // Spawn stadium NPCs (football players, security, coach)
        if (mapData.stadiumField) {
            this.npcManager.spawnStadiumNPCs(mapData.stadiumField);
            this.npcManager.spawnFootballReferees(mapData.stadiumField);
        }

        // Spawn basketball arena NPCs
        if (mapData.basketballCourt) {
            this.basketballCourt = mapData.basketballCourt;
            this.npcManager.spawnBasketballNPCs(mapData.basketballCourt);
        }

        // Spawn construction workers
        if (mapData.constructionSite) {
            this.npcManager.spawnConstructionWorkers(mapData.constructionSite);
            this.npcManager.setConstructionZone(mapData.constructionSite);
        }

        // Spawn road workers
        if (mapData.roadWork) {
            this.npcManager.spawnRoadWorkers(mapData.roadWork);
        }

        // Spawn excavator inside construction site
        if (mapData.excavatorSpawn) {
            this.vehicleManager.spawnParkedAt('excavator', mapData.excavatorSpawn.col, mapData.excavatorSpawn.row);
        }

        // Spawn driveable construction truck+trailer near entrance
        if (mapData.constructionTruckSpawn) {
            this.vehicleManager.spawnParkedAt('construction_truck', mapData.constructionTruckSpawn.col, mapData.constructionTruckSpawn.row, DIR.DOWN);
        }

        // Spawn garbage trucks at garbage center
        if (mapData.garbageTruckSpawns) {
            for (const spawn of mapData.garbageTruckSpawns) {
                this.vehicleManager.spawnParkedAt('garbage', spawn.col, spawn.row, DIR.DOWN);
            }
        }

        // Set garbage center zone (foreman is now inside the Garbage Break Room)
        if (mapData.garbageCenter) {
            this.garbageCenter = mapData.garbageCenter;
        }

        // Initialize garbage cans
        if (mapData.garbageCans) {
            this.garbageCans = mapData.garbageCans.map(gc => ({
                x: gc.col * TILE_SIZE + TILE_SIZE / 2,
                y: gc.row * TILE_SIZE + TILE_SIZE / 2,
                col: gc.col,
                row: gc.row,
                collected: false,
            }));
        }

        const center = this.player.getCenter();
        this.camera.snapTo(center.x, center.y, this.tileMap.width, this.tileMap.height);
        this.mapName = mapData.name;
    }

    start() {
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this._gameLoop);
    }

    _gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
        this.lastTimestamp = timestamp;
        this.time += dt;

        this._update(dt);
        this._render();

        this.input.endFrame();
        requestAnimationFrame(this._gameLoop);
    }

    // ========================================================================
    // UPDATE
    // ========================================================================

    _update(dt) {
        switch (this.state) {
            case STATE.TITLE:
                this.titleTime += dt;
                if (this.input.isPressed('Enter') || this.input.isPressed('Space')) {
                    this.state = STATE.PLAYING;
                    this.hud.showAreaTitle(this.mapName);
                    this.sound.playStart();
                }
                break;

            case STATE.PLAYING:
                this._updatePlaying(dt);
                break;

            case STATE.GOAL_COMPLETE:
                this.goalCompleteTimer -= dt;
                this.hud.update(dt);
                if (this.player.isDriving) {
                    this.vehicleManager.updatePlayerDriven(this.player.currentVehicle, dt, this.input);
                } else {
                    this.player.update(dt, this.input, this.tileMap);
                }
                this.vehicleManager.update(dt);
                this.npcManager.update(dt, this.vehicleManager.vehicles);
                this._claimDropoffReward();
                this._updateCamera();
                if (this.goalCompleteTimer <= 0) {
                    this.state = STATE.PLAYING;
                }
                break;
        }
    }

    _updatePlaying(dt) {
        // ---- Day/Night cycle ----
        this.gameMinutes += this.gameSpeed * dt;
        if (this.gameMinutes >= 1440) this.gameMinutes -= 1440;
        this.hud.setDayInfo(this.inventory.day, this._getTimeString());

        // ---- Sleep transition ----
        if (this.sleeping) {
            this.sleepTimer -= dt;
            if (this.sleepTimer <= 0) {
                this.sleeping = false;
                this.gameMinutes = 480; // wake at 8 AM
                this.inventory.day++;
                this.hud.showMessage(`Good morning! Day ${this.inventory.day}`, 2);
            }
            this.hud.update(dt);
            return;
        }

        // ---- Wardrobe UI ----
        if (this.wardrobeOpen) {
            this._updateWardrobe(dt);
            return;
        }

        // ---- Open wardrobe with C key ----
        if (this.input.isPressed('KeyC') || this.input.isPressed('Tab')) {
            if (!this.interior.active && !this.dialogueActive && !this.player.isDriving) {
                this.wardrobeOpen = true;
                this.wardrobeCursor = 0;
                return;
            }
        }

        // ---- Inside building mode ----
        if (this.interior.active) {
            this._updateInside(dt);
            return;
        }

        // ---- Dialogue mode ----
        if (this.dialogueActive) {
            this._updateDialogue(dt);
            return;
        }

        // ---- Eat food with Q key ----
        if (this.input.isPressed('KeyQ')) {
            this._tryEatFood();
        }

        // ---- Siren toggle (R key while driving emergency vehicle) ----
        if (this.input.isPressed('KeyR')) {
            if (this.player.isDriving && this.player.currentVehicle) {
                const vt = this.player.currentVehicle.typeName;
                if (vt === 'police' || vt === 'firetruck' || vt === 'ambulance') {
                    const v = this.player.currentVehicle;
                    v.sirenOn = !v.sirenOn;
                    if (v.sirenOn) {
                        this.sound.startSiren();
                        this.hud.showMessage('Siren ON', 1);
                    } else {
                        this.sound.stopSiren();
                        this.hud.showMessage('Siren OFF', 1);
                    }
                }
            } else if (!this.player.isDriving && this.roadClearMission.active && this.roadClearMission.parked) {
                // Dismiss nearby car
                const center = this.player.getCenter();
                const nearCar = this.vehicleManager.findNearestDismissable(center.x, center.y);
                if (nearCar) {
                    this.vehicleManager.dismissVehicle(nearCar.vehicle);
                    this.roadClearMission.carsDismissed++;
                    const left = this.roadClearMission.carsNeeded - this.roadClearMission.carsDismissed;
                    this.sound.playDismiss();
                    if (left > 0) {
                        this.hud.showMessage(`Dismissed ${nearCar.vehicle.driverName}'s ${nearCar.vehicle.type.name}! (${this.roadClearMission.carsDismissed}/${this.roadClearMission.carsNeeded})`, 2);
                    } else {
                        // Mission complete!
                        const reward = this.roadClearMission.reward;
                        this.inventory.addMoney(reward);
                        this.hud.showMessage(`Road cleared! Chief Johnson: "Great work, officer!" +$${reward}`, 3);
                        this.hud.showMoneyPopup(`+$${reward}`, 2);
                        this.sound.playCashRegister();
                        this.roadClearMission.active = false;
                        this.roadClearMission.parked = false;
                        this.roadClearMission.carsDismissed = 0;
                    }
                }
            }
        }

        // ---- Normal outdoor gameplay ----
        const playerDriving = this.player.isDriving;
        const ePressed = this.input.isPressed('KeyE') || this.input.isPressed('KeyF');

        // --- Police pullover mechanic ---
        const isPolice = this.player.uniform === 'Police Officer' &&
            playerDriving && this.player.currentVehicle &&
            this.player.currentVehicle.typeName === 'police';

        // --- Garbage can pickup (while driving garbage truck) ---
        const isGarbageDriver = this.player.uniform === 'Garbage Truck Driver' &&
            playerDriving && this.player.currentVehicle &&
            this.player.currentVehicle.typeName === 'garbage';

        // --- E key actions ---
        if (ePressed) {
            // Garbage can pickup
            if (isGarbageDriver && this.trashCollected < 4) {
                const center = this.player.getCenter();
                const nearCan = this._findNearestGarbageCan(center.x, center.y, TILE_SIZE * 2.5);
                if (nearCan) {
                    nearCan.collected = true;
                    this.trashCollected++;
                    this.hud.showMessage(`Picked up trash! (${this.trashCollected}/4)`, 1.5);
                    this.sound.playPickup();
                    // Don't process other E actions
                }
            }

            // Garbage dump at garbage center
            if (isGarbageDriver && this.trashCollected >= 4 && this.garbageCenter) {
                const center = this.player.getCenter();
                const T = TILE_SIZE;
                const gcLeft = this.garbageCenter.zoneCols[0] * T;
                const gcRight = (this.garbageCenter.zoneCols[1] + 1) * T;
                const gcTop = this.garbageCenter.zoneRows[0] * T;
                const gcBot = (this.garbageCenter.zoneRows[1] + 1) * T;
                if (center.x >= gcLeft && center.x <= gcRight && center.y >= gcTop && center.y <= gcBot) {
                    const reward = 100;
                    this.trashCollected = 0;
                    // Respawn all garbage cans
                    for (const can of this.garbageCans) can.collected = false;
                    this.inventory.addMoney(reward);
                    this.hud.showMessage(`Trash dumped! +$${reward}`, 2.5);
                    this.hud.showMoneyPopup(`+$${reward}`, 2);
                    this.sound.playCashRegister();
                }
            }

            if (playerDriving) {
                // Check if police can pull someone over first
                if (isPolice) {
                    const center = this.player.getCenter();
                    const nearby = this.vehicleManager.findNearestPullover(center.x, center.y);
                    if (nearby && nearby.vehicle.state === 'ai') {
                        this.vehicleManager.pullOverVehicle(nearby.vehicle);
                        this.hud.showMessage(`Pulling over ${nearby.vehicle.driverName}'s ${nearby.vehicle.type.name}...`, 2);
                        this.sound.playTalk();
                        // Don't exit vehicle, just pull them over
                    } else if (nearby && nearby.vehicle.state === 'pulled_over') {
                        // Exit vehicle to talk to driver
                        const vehicle = this.player.currentVehicle;
                        const exitPos = this.vehicleManager.exitVehicle(vehicle);
                        this.player.exitVehicle(exitPos.x, exitPos.y);
                        this.sound.stopEngine();
                        // Start dialogue with pulled over driver
                        const fine = 25 + Math.floor(Math.random() * 75);
                        this.dialogueActive = true;
                        this.dialogueNPC = null;
                        this.hud.setDialogue(nearby.vehicle.driverName,
                            `"Here's my license, officer... I'm sorry, I was going too fast. Here's $${fine} for the ticket."`);
                        this.inventory.addMoney(fine);
                        this.hud.showMoneyPopup(`+$${fine}`, 2);
                        this.sound.playCashRegister();
                        nearby.vehicle.pulledOverTimer = 5; // resume soon
                    } else {
                        // Normal exit
                        this._exitCurrentVehicle();
                    }
                } else {
                    this._exitCurrentVehicle();
                }
            } else {
                // ON FOOT: check for pulled over vehicle to talk to
                const center = this.player.getCenter();
                const nearPulledOver = this.vehicleManager.findNearestPullover(center.x, center.y, TILE_SIZE * 2);

                if (nearPulledOver && nearPulledOver.vehicle.state === 'pulled_over') {
                    const v = nearPulledOver.vehicle;
                    const fine = 25 + Math.floor(Math.random() * 75);
                    this.dialogueActive = true;
                    this.dialogueNPC = null;
                    this.hud.setDialogue(v.driverName,
                        `"Here's my license, officer... Please don't give me a big ticket. Here's $${fine}."`);
                    this.inventory.addMoney(fine);
                    this.hud.showMoneyPopup(`+$${fine}`, 2);
                    this.sound.playCashRegister();
                    v.pulledOverTimer = 5;
                } else {
                    // Priority: door > vehicle > NPC talk
                    const nearDoor = InteriorManager.findNearestDoor(this.buildings, center.x, center.y);
                    const nearVehicle = this.vehicleManager.findNearestEnterable(center.x, center.y);
                    const nearNPC = this.npcManager.findNearestTalkable(center.x, center.y);

                    if (nearDoor) {
                        // Warehouse is workers-only
                        if (nearDoor.name === 'Warehouse' && this.player.uniform !== 'Construction Worker') {
                            this.hud.showMessage('Workers only! Wear a construction uniform to enter.', 2);
                            this.sound.playError();
                        } else {
                            this.interior.enter(nearDoor);
                            this.hud.showMessage(`Entered ${nearDoor.name}`, 1.5);
                            this.sound.playDoor();
                        }
                    } else if (nearVehicle) {
                        this.vehicleManager.enterVehicle(nearVehicle.vehicle);
                        this.player.enterVehicle(nearVehicle.vehicle);
                        this.hud.showMessage(`Driving ${nearVehicle.vehicle.type.name}`, 1.5);
                        this.sound.playEngineStart();
                        this.sound.startEngine();
                    } else if (nearNPC) {
                        // Special handling for Josh Dallan - signature
                        if (nearNPC.role === 'josh_dallan') {
                            this.dialogueActive = true;
                            this.dialogueNPC = nearNPC;
                            this.hud.setDialogue('Josh Dallan #17', '"Want my signature?"');
                            this.sound.playTalk();
                        }
                        else {
                            this.dialogueActive = true;
                            this.dialogueNPC = nearNPC;
                            const line = this.npcManager.getDialogue(nearNPC);
                            this.hud.setDialogue(nearNPC.style.name, line);
                            this.sound.playTalk();
                        }
                    }
                }
            }
        }

        // --- Movement ---
        if (this.player.isDriving) {
            const vehicle = this.player.currentVehicle;
            this.vehicleManager.updatePlayerDriven(vehicle, dt, this.input);
            this.vehicleManager.update(dt);
            const speedNorm = Math.min(1, Math.abs(vehicle.velocity) / vehicle.type.maxPlayerSpeed);
            this.sound.updateEngine(speedNorm);
        } else {
            this.player.update(dt, this.input, this.tileMap);
            this.vehicleManager.update(dt);
        }

        // --- NPCs ---
        this.npcManager.update(dt, this.vehicleManager.vehicles);
        this.npcManager.updateBasketball(dt);

        // Check for pickups (NPCs that hopped in this frame)
        const pickups = this.npcManager.claimPickups();
        for (const npc of pickups) {
            const count = this.npcManager.passengers.length;
            const max = this.npcManager.maxPassengers;
            const line = this.npcManager.getPickupLine();
            this.hud.showMessage(`${npc.style.name}: "${line}" (${count}/${max})`, 2);
            this.sound.playPickup();
        }

        // Check for dropoff at Skate Park (when driving with passengers)
        if (this.player.isDriving && this.npcManager.passengers.length > 0) {
            const center = this.player.getCenter();
            const reward = this.npcManager.checkDropoff(center.x, center.y);
            if (reward > 0) {
                const line = this.npcManager.getDropoffLine();
                this.hud.showMessage(`"${line}" +$${reward}!`, 2.5);
                this.hud.showMoneyPopup(`+$${reward}`, 2);
                this.sound.playCashRegister();
            }
        }

        // --- Road clear mission: detect parking at spot ---
        if (this.roadClearMission.active && !this.roadClearMission.parked && !playerDriving) {
            // Check if player just exited a police car near the parking spot
            const center = this.player.getCenter();
            const spot = this.roadClearMission.parkingSpot;
            const spotX = (spot.col + 0.5) * TILE_SIZE;
            const spotY = (spot.row + 0.5) * TILE_SIZE;
            const dist = Math.hypot(center.x - spotX, center.y - spotY);
            if (dist < TILE_SIZE * 3) {
                this.roadClearMission.parked = true;
                this.hud.showMessage('Police car parked! Now dismiss 5 cars nearby. Press R near a car.', 3);
            }
        }

        this._claimDropoffReward();
        this._updateCamera();
        this.goalManager.checkCompletion(this.player);
        this._updateHUDPrompts();
        this.hud.update(dt);
    }

    _exitCurrentVehicle() {
        const vehicle = this.player.currentVehicle;
        // Turn off siren if active
        if (vehicle.sirenOn) {
            vehicle.sirenOn = false;
            this.sound.stopSiren();
        }
        const exitPos = this.vehicleManager.exitVehicle(vehicle);
        this.player.exitVehicle(exitPos.x, exitPos.y);
        this.sound.stopEngine();
        const released = this.npcManager.releasePassengers(exitPos.x, exitPos.y);
        if (released > 0) {
            this.hud.showMessage(`${released} passenger(s) left - no fare!`, 2);
        } else {
            this.hud.showMessage(`Exited ${vehicle.type.name}`, 1.5);
        }
    }

    // ---- Inside Building ----

    _updateInside(dt) {
        this.interior.update(dt, this.input);

        const ePressed = this.input.isPressed('KeyE') || this.input.isPressed('KeyF');

        if (this.interior.shopOpen) {
            // Buy item with E/Enter/Space
            if (ePressed || this.input.isPressed('Enter') || this.input.isPressed('Space')) {
                const item = this.interior.shopItems[this.interior.shopCursor];
                if (item) {
                    if (this.inventory.spend(item.price)) {
                        this.inventory.addItem(item);
                        this.hud.showMessage(`Bought ${item.name}!`, 1.2);
                        this.hud.showMoneyPopup(`-$${item.price}`, 1);
                        this.sound.playBuy();
                    } else {
                        this.hud.showMessage(`Can't afford that!`, 1.2);
                        this.sound.playError();
                    }
                }
            }
            // Close shop with Escape
            if (this.input.isPressed('Escape')) {
                this.interior.shopOpen = false;
            }
        } else if (ePressed) {
            if (this.interior.nearBed) {
                // SLEEP
                this.sleeping = true;
                this.sleepTimer = 1.2; // black screen duration
                this.hud.showMessage('Zzz...', 1);
                const building = this.interior.exit();
                const door = InteriorManager.getDoorPosition(building);
                this.player.x = door.x - this.player.width / 2;
                this.player.y = door.y;
                this.player.direction = DIR.DOWN;
            } else if (this.interior.nearExit) {
                // EXIT BUILDING
                const building = this.interior.exit();
                const door = InteriorManager.getDoorPosition(building);
                this.player.x = door.x - this.player.width / 2;
                this.player.y = door.y;
                this.player.direction = DIR.DOWN;
                this.hud.showMessage(`Exited ${building.name}`, 1.2);
                this.sound.playDoorExit();
            } else if (this.interior.nearShopkeeper) {
                // OPEN SHOP or TALK if no items
                if (this.interior.shopItems && this.interior.shopItems.length > 0) {
                    this.interior.openShop();
                } else {
                    // No items to sell - check for hiring or generic greeting
                    const name = this.interior.shopkeeper ? this.interior.shopkeeper.name : 'Staff';
                    const bName = this.interior.building ? this.interior.building.name : '';

                    if (bName === 'Locker Room') {
                        const greetings = [
                            `${name}: "Welcome to the locker room!"`,
                            `${name}: "Players only... just kidding!"`,
                            `${name}: "Need a towel? Help yourself!"`,
                        ];
                        this.hud.showMessage(greetings[Math.floor(Math.random() * greetings.length)], 2);
                        this.sound.playTalk();
                    } else if (bName === 'Museum') {
                        const greetings = [
                            `${name}: "Welcome to the Dude Angeles Museum!"`,
                            `${name}: "Please don't touch the exhibits!"`,
                            `${name}: "Our Dude Dinosaurs exhibit is very popular!"`,
                        ];
                        this.hud.showMessage(greetings[Math.floor(Math.random() * greetings.length)], 2);
                        this.sound.playTalk();
                    } else if (bName === 'Police Station' || bName === 'Fire Station' || bName === 'Break Room' || bName === 'Garbage Break Room') {
                        // Hiring mechanic
                        const jobMap = { 'Police Station': 'Police Officer', 'Fire Station': 'Firefighter', 'Break Room': 'Construction Worker', 'Garbage Break Room': 'Garbage Truck Driver' };
                        const job = jobMap[bName];
                        const hiringBonus = 100;
                        if (!this.inventory.hasJob || this.inventory.hasJob !== job) {
                            this.inventory.hasJob = job;
                            this.inventory.addMoney(hiringBonus);
                            this.player.setUniform(job);
                            this.hud.showMessage(`${name}: "You're hired as a ${job}! Here's $${hiringBonus} signing bonus!"`, 3);
                            this.hud.showMoneyPopup(`+$${hiringBonus}`, 2);
                            this.sound.playHire();
                        } else if (bName === 'Garbage Break Room' && this.inventory.hasJob === 'Garbage Truck Driver') {
                            const lines = [
                                `${name}: "Pick up 4 trash cans around the city, then dump them here!"`,
                                `${name}: "The garbage trucks are parked right outside. Hop in one!"`,
                                `${name}: "We keep Dude Angeles clean! Go get those cans!"`,
                            ];
                            this.hud.showMessage(lines[Math.floor(Math.random() * lines.length)], 2.5);
                            this.sound.playTalk();
                        } else if (bName === 'Break Room' && this.inventory.hasJob === 'Construction Worker') {
                            // Construction delivery quest
                            if (this.inventory.activeQuest && this.inventory.activeQuest.type === 'pizza_delivery') {
                                // Returning with pizza
                                if (this.inventory.hasItem('pizza')) {
                                    this.inventory.removeItem('pizza');
                                    const reward = 50;
                                    this.inventory.addMoney(reward);
                                    this.inventory.activeQuest = null;
                                    this.hud.showMessage(`${name}: "Thanks for the pizza! Here's $${reward} tip!"`, 3);
                                    this.hud.showMoneyPopup(`+$${reward}`, 2);
                                    this.sound.playCashRegister();
                                } else {
                                    this.hud.showMessage(`${name}: "Where's the pizza? Go buy one at Pizza Palace!"`, 2.5);
                                    this.sound.playTalk();
                                }
                            } else if (!this.inventory.activeQuest) {
                                // Give new quest
                                this.inventory.activeQuest = { type: 'pizza_delivery', description: 'Buy pizza and bring it back to Foreman Dave' };
                                this.inventory.addMoney(100);
                                this.hud.showMessage(`${name}: "Here's $100, please buy pizza at Pizza Palace and bring it back here!"`, 3.5);
                                this.hud.showMoneyPopup(`+$100`, 2);
                                this.sound.playTalk();
                            } else {
                                this.hud.showMessage(`${name}: "Finish your current task first!"`, 2);
                                this.sound.playTalk();
                            }
                    } else if (bName === 'Police Station' && this.inventory.hasJob === 'Police Officer') {
                        // Police chief road clear mission
                        if (this.roadClearMission.active) {
                            const left = this.roadClearMission.carsNeeded - this.roadClearMission.carsDismissed;
                            this.hud.showMessage(`${name}: "You still have ${left} cars to dismiss. Get to it, officer!"`, 2.5);
                            this.sound.playTalk();
                        } else {
                            this.roadClearMission.active = true;
                            this.roadClearMission.parked = false;
                            this.roadClearMission.carsDismissed = 0;
                            this.hud.showMessage(`${name}: "Help the road workers! Dismiss 5 cars near the road work zone so the road is more clear. Park your police car at the marker and clear them out! $${this.roadClearMission.reward} reward."`, 5);
                            this.sound.playTalk();
                        }
                    } else {
                        const lines = [
                            `${name}: "Good to see you, ${job}!"`,
                            `${name}: "Keep up the good work out there!"`,
                            `${name}: "Stay safe on duty!"`,
                        ];
                        this.hud.showMessage(lines[Math.floor(Math.random() * lines.length)], 2);
                        this.sound.playTalk();
                    }
                    } else if (bName === 'Dude Hotel') {
                        // Hotel - offer to sleep for $30
                        const cost = 30;
                        if (this.inventory.canAfford(cost)) {
                            this.inventory.spend(cost);
                            this.hud.showMessage(`${name}: "Room's ready! Sweet dreams! (-$${cost})"`, 1.5);
                            this.hud.showMoneyPopup(`-$${cost}`, 1);
                            this.sleeping = true;
                            this.sleepTimer = 1.2;
                            const building = this.interior.exit();
                            const door = InteriorManager.getDoorPosition(building);
                            this.player.x = door.x - this.player.width / 2;
                            this.player.y = door.y;
                            this.player.direction = DIR.DOWN;
                        } else {
                            this.hud.showMessage(`${name}: "A room costs $${cost}. You don't have enough..."`, 2);
                            this.sound.playError();
                        }
                    } else {
                        const greetings = [
                            `${name}: "Welcome to ${bName}!"`,
                            `${name}: "How can I help you today?"`,
                            `${name}: "Your balance is $${this.inventory.money}. Have a great day!"`,
                            `${name}: "Come back anytime!"`,
                        ];
                        this.hud.showMessage(greetings[Math.floor(Math.random() * greetings.length)], 2);
                        this.sound.playTalk();
                    }
                }
            }
        }

        this.hud.update(dt);
    }

    // ---- Dialogue ----

    _updateDialogue(dt) {
        if (this.input.isPressed('KeyE') || this.input.isPressed('KeyF') ||
            this.input.isPressed('Space') || this.input.isPressed('Enter')) {
            this.dialogueActive = false;
            this.dialogueNPC = null;
            this.hud.clearDialogue();
        }
        this.hud.update(dt);
    }

    // ---- Wardrobe ----

    _updateWardrobe(dt) {
        if (this.input.isPressed('ArrowUp') || this.input.isPressed('KeyW')) {
            this.wardrobeCursor = Math.max(0, this.wardrobeCursor - 1);
        }
        if (this.input.isPressed('ArrowDown') || this.input.isPressed('KeyS')) {
            this.wardrobeCursor = Math.min(this.wardrobeOptions.length - 1, this.wardrobeCursor + 1);
        }
        if (this.input.isPressed('KeyE') || this.input.isPressed('Enter') || this.input.isPressed('Space')) {
            const selected = this.wardrobeOptions[this.wardrobeCursor];
            this.player.setUniform(selected.job);
            this.hud.showMessage(`Changed outfit to: ${selected.label}`, 1.5);
            this.wardrobeOpen = false;
        }
        if (this.input.isPressed('Escape') || this.input.isPressed('KeyC') || this.input.isPressed('Tab')) {
            this.wardrobeOpen = false;
        }
        this.hud.update(dt);
    }

    _getTimeString() {
        const h = Math.floor(this.gameMinutes / 60) % 24;
        const m = Math.floor(this.gameMinutes % 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    /** Get night darkness alpha (0 = full day, 0.6 = full night) */
    _getNightAlpha() {
        const h = this.gameMinutes / 60;
        // Dark from 8PM (20) to 6AM (6)
        if (h >= 20) return Math.min(0.55, (h - 20) * 0.14);
        if (h <= 5) return 0.55;
        if (h <= 7) return Math.max(0, (7 - h) * 0.275);
        return 0;
    }

    // ---- Helpers ----

    _claimDropoffReward() {
        const reward = this.npcManager.claimReward();
        if (reward > 0) {
            this.inventory.addMoney(reward);
        }
    }

    _updateHUDPrompts() {
        // Update siren button visibility
        const isEmergencyDriving = this.player.isDriving && this.player.currentVehicle &&
            (this.player.currentVehicle.typeName === 'police' ||
             this.player.currentVehicle.typeName === 'firetruck' ||
             this.player.currentVehicle.typeName === 'ambulance');
        this.hud.showSirenButton = isEmergencyDriving;
        this.hud.sirenButtonOn = isEmergencyDriving && this.player.currentVehicle.sirenOn;

        // Update dismiss button visibility
        let showDismiss = false;
        if (!this.player.isDriving && this.roadClearMission.active && this.roadClearMission.parked) {
            const center = this.player.getCenter();
            const nearCar = this.vehicleManager.findNearestDismissable(center.x, center.y);
            showDismiss = !!nearCar;
        }
        this.hud.showDismissButton = showDismiss;

        if (!this.player.isDriving) {
            const center = this.player.getCenter();

            // Building label
            const nearbyBuilding = this.tileMap.getNearbyBuilding(center.x, center.y, 2.5);
            this.hud.setBuildingLabel(nearbyBuilding ? nearbyBuilding.name : '');

            // Vehicle prompt
            const nearVehicle = this.vehicleManager.findNearestEnterable(center.x, center.y);

            // Door prompt
            const nearDoor = InteriorManager.findNearestDoor(this.buildings, center.x, center.y);

            // NPC talk prompt
            const nearNPC = this.npcManager.findNearestTalkable(center.x, center.y);

            // Show the highest priority prompt; hide others
            if (nearDoor) {
                this.hud.setDoorPrompt(nearDoor.name);
                this.hud.setVehiclePrompt('');
                this.hud.setTalkPrompt('');
            } else if (nearVehicle) {
                this.hud.setDoorPrompt('');
                this.hud.setVehiclePrompt(nearVehicle.vehicle.type.name);
                this.hud.setTalkPrompt('');
            } else if (nearNPC) {
                this.hud.setDoorPrompt('');
                this.hud.setVehiclePrompt('');
                this.hud.setTalkPrompt(nearNPC.style.name);
            } else {
                this.hud.setDoorPrompt('');
                this.hud.setVehiclePrompt('');
                this.hud.setTalkPrompt('');
            }

            this.hud.setDrivingInfo(null);
        } else {
            this.hud.setBuildingLabel('');
            this.hud.setVehiclePrompt('');
            this.hud.setDoorPrompt('');
            this.hud.setTalkPrompt('');
            this.hud.setDrivingInfo(this.player.currentVehicle);

            // Police pullover prompt
            const isPoliceDriving = this.player.uniform === 'Police Officer' &&
                this.player.currentVehicle && this.player.currentVehicle.typeName === 'police';
            if (isPoliceDriving) {
                const center = this.player.getCenter();
                const nearby = this.vehicleManager.findNearestPullover(center.x, center.y);
                if (nearby) {
                    this.hud.setTalkPrompt(`Pull over ${nearby.vehicle.driverName}`);
                }
            }

            // Garbage pickup prompt
            const isGarbageDriving = this.player.uniform === 'Garbage Truck Driver' &&
                this.player.currentVehicle && this.player.currentVehicle.typeName === 'garbage';
            if (isGarbageDriving) {
                const center = this.player.getCenter();
                if (this.trashCollected < 4) {
                    const nearCan = this._findNearestGarbageCan(center.x, center.y, TILE_SIZE * 2.5);
                    if (nearCan) {
                        this.hud.setTalkPrompt('Pick up trash');
                    }
                } else if (this.garbageCenter) {
                    const T = TILE_SIZE;
                    const gcLeft = this.garbageCenter.zoneCols[0] * T;
                    const gcRight = (this.garbageCenter.zoneCols[1] + 1) * T;
                    const gcTop = this.garbageCenter.zoneRows[0] * T;
                    const gcBot = (this.garbageCenter.zoneRows[1] + 1) * T;
                    if (center.x >= gcLeft && center.x <= gcRight && center.y >= gcTop && center.y <= gcBot) {
                        this.hud.setTalkPrompt('Dump trash');
                    }
                }
            }
        }

        // Dismiss prompt (on foot during road clear mission)
        if (!this.player.isDriving && this.roadClearMission.active && this.roadClearMission.parked) {
            const center = this.player.getCenter();
            const nearCar = this.vehicleManager.findNearestDismissable(center.x, center.y);
            if (nearCar) {
                this.hud.setTalkPrompt(`Dismiss ${nearCar.vehicle.driverName}'s car`);
            }
        }
    }

    _tryEatFood() {
        // Find first edible item in inventory
        const edible = this.inventory.items.find(i => {
            const cat = SHOP_CATALOG[i.id];
            return cat && cat.edible && i.quantity > 0;
        });
        if (edible) {
            this.inventory.removeItem(edible.id);
            this.hud.showMessage(`*munch* Ate ${edible.name}! Delicious!`, 1.5);
            this.sound.playBuy();
        } else {
            this.hud.showMessage('No food to eat! Buy some at a shop.', 1.5);
        }
    }

    _findNearestGarbageCan(px, py, maxDist) {
        let nearest = null;
        let nearestDist = maxDist;
        for (const can of this.garbageCans) {
            if (can.collected) continue;
            const dist = Math.hypot(px - can.x, py - can.y);
            if (dist < nearestDist) {
                nearest = can;
                nearestDist = dist;
            }
        }
        return nearest;
    }

    _updateCamera() {
        const center = this.player.getCenter();
        this.camera.follow(center.x, center.y, this.tileMap.width, this.tileMap.height);
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    _render() {
        const ctx = this.ctx;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.state) {
            case STATE.TITLE:
                this._renderTitle(ctx);
                break;

            case STATE.PLAYING:
            case STATE.GOAL_COMPLETE:
                if (this.interior.active) {
                    this._renderInterior(ctx);
                } else {
                    this._renderGame(ctx);
                }
                break;
        }
    }

    _renderInterior(ctx) {
        this.interior.render(ctx, this.player, this.time, this.inventory);

        // Also render HUD messages on top
        this.hud._renderMessages(ctx);
        this.hud._renderMoneyPopups(ctx);
    }

    _renderTitle(ctx) {
        const t = this.titleTime;

        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#0a0a1a';
        const buildings = [
            { x: 50, w: 60, h: 180 }, { x: 120, w: 40, h: 140 },
            { x: 170, w: 80, h: 220 }, { x: 260, w: 50, h: 160 },
            { x: 320, w: 70, h: 200 }, { x: 400, w: 45, h: 130 },
            { x: 455, w: 90, h: 250 }, { x: 555, w: 55, h: 170 },
            { x: 620, w: 65, h: 190 }, { x: 695, w: 80, h: 210 },
            { x: 785, w: 50, h: 150 }, { x: 845, w: 70, h: 230 },
        ];
        for (const b of buildings) {
            ctx.fillRect(b.x, CANVAS_HEIGHT - b.h, b.w, b.h);
            ctx.fillStyle = `rgba(255, 220, 100, ${0.3 + Math.sin(t * 2 + b.x * 0.1) * 0.2})`;
            for (let wy = CANVAS_HEIGHT - b.h + 15; wy < CANVAS_HEIGHT - 20; wy += 25) {
                for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 15) {
                    if ((wx + wy) % 3 !== 0) {
                        ctx.fillRect(wx, wy, 8, 10);
                    }
                }
            }
            ctx.fillStyle = '#0a0a1a';
        }

        ctx.fillStyle = '#222';
        ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);

        const titleBob = Math.sin(t * 2) * 5;
        ctx.save();
        ctx.textAlign = 'center';

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.fillText('CITY DUDE', CANVAS_WIDTH / 2 + 3, 200 + titleBob + 3);

        ctx.fillStyle = COLORS.UI_ACCENT;
        ctx.fillText('CITY DUDE', CANVAS_WIDTH / 2, 200 + titleBob);

        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('A Dude in the City', CANVAS_WIDTH / 2, 240 + titleBob);

        if (Math.sin(t * 3) > 0) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = '#fff';
            ctx.fillText('Press ENTER or SPACE to start', CANVAS_WIDTH / 2, 360);
        }

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#666';
        ctx.fillText('Pick up people & drive to Skate Park for $$$!', CANVAS_WIDTH / 2, 440);

        ctx.restore();
    }

    _renderGame(ctx) {
        // 1. Tile map
        this.tileMap.render(ctx, this.camera);

        // 1b. Basketball court overlay (before entities so they walk on top)
        if (this.basketballCourt) {
            this._renderBasketballCourt(ctx);
        }

        // 2. Garbage cans
        this._renderGarbageCans(ctx);

        // 2b. Dumpsters at garbage center
        this._renderDumpsters(ctx);

        // 3. Goal marker
        this.goalManager.renderGoalMarker(ctx, this.camera, this.time);

        // 3. Depth-sorted entities: vehicles + player + NPCs
        const playerSortY = this.player.y + this.player.height;
        const playerVisible = !this.player.isDriving;
        const npcEntries = this.npcManager.getRenderEntries(ctx, this.camera, this.time);
        this.vehicleManager.renderSorted(
            ctx, this.camera, this.time,
            () => this.player.render(ctx, this.camera),
            playerSortY,
            playerVisible,
            npcEntries
        );

        // 4. Night overlay
        const nightAlpha = this._getNightAlpha();
        if (nightAlpha > 0) {
            ctx.fillStyle = `rgba(5, 5, 30, ${nightAlpha})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        // 5. Celebration particles
        if (this.state === STATE.GOAL_COMPLETE) {
            this._renderCelebration(ctx);
        }

        // 6. Minimap
        const pos = this.player.getTilePos();
        const goalPos = this.goalManager.activeGoal
            ? { col: this.goalManager.activeGoal.targetCol, row: this.goalManager.activeGoal.targetRow }
            : {};
        this.tileMap.renderMinimap(ctx, pos.col, pos.row, goalPos.col, goalPos.row, this.time);

        // 7. HUD
        this.hud.render(ctx, this.goalManager, this.player, this.time, this.npcManager, this.inventory);

        // 8. Road clear mission: parking marker + status
        if (this.roadClearMission.active) {
            this._renderParkingMarker(ctx);
            this._renderRoadClearStatus(ctx);
        }

        // 8c. Basketball scoreboard (rendered on-screen if near court)
        if (this.basketballCourt && this.npcManager.basketballNPCs) {
            this._renderBasketballScoreboard(ctx);
        }

        // 8b. Garbage collection status
        if (this.player.uniform === 'Garbage Truck Driver' && this.player.isDriving &&
            this.player.currentVehicle && this.player.currentVehicle.typeName === 'garbage') {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = '8px "Press Start 2P", monospace';
            const gt = `Trash: ${this.trashCollected}/4`;
            const tw = ctx.measureText(gt).width;
            ctx.fillRect(10, 104, tw + 16, 20);
            ctx.fillStyle = this.trashCollected >= 4 ? '#2ecc71' : '#dfff00';
            ctx.fillText(gt, 18, 118);
            if (this.trashCollected >= 4) {
                ctx.fillStyle = '#fff';
                ctx.font = '7px "Press Start 2P", monospace';
                ctx.fillText('Go to Garbage Center to dump!', 18, 134);
            }
            ctx.restore();
        }

        // 9. Active quest indicator
        if (this.inventory.activeQuest) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.font = '8px "Press Start 2P", monospace';
            const qt = `Quest: ${this.inventory.activeQuest.description}`;
            const tw = ctx.measureText(qt).width;
            ctx.fillRect(10, 82, tw + 16, 20);
            ctx.fillStyle = '#f39c12';
            ctx.fillText(qt, 18, 96);
            ctx.restore();
        }

        // 9. Wardrobe UI overlay
        if (this.wardrobeOpen) {
            this._renderWardrobe(ctx);
        }

        // 10. Sleep black screen
        if (this.sleeping) {
            const a = this.sleepTimer < 0.3 ? this.sleepTimer / 0.3 : this.sleepTimer > 0.9 ? (1.2 - this.sleepTimer) / 0.3 : 1;
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, a)})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Zzz...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.textAlign = 'left';
        }
    }

    _renderWardrobe(ctx) {
        const panelW = 380;
        const panelH = 50 + this.wardrobeOptions.length * 36 + 30;
        const px = (CANVAS_WIDTH - panelW) / 2;
        const py = (CANVAS_HEIGHT - panelH) / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
        ctx.beginPath();
        ctx.rect(px, py, panelW, panelH);
        ctx.fill();

        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, panelW, panelH);

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Wardrobe', CANVAS_WIDTH / 2, py + 24);
        ctx.textAlign = 'left';

        for (let i = 0; i < this.wardrobeOptions.length; i++) {
            const opt = this.wardrobeOptions[i];
            const iy = py + 40 + i * 36;
            const selected = i === this.wardrobeCursor;

            if (selected) {
                ctx.fillStyle = 'rgba(241, 196, 15, 0.12)';
                ctx.fillRect(px + 8, iy, panelW - 16, 32);
                ctx.fillStyle = '#f1c40f';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText('>', px + 14, iy + 20);
            }

            ctx.fillStyle = selected ? '#fff' : '#aaa';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(opt.label, px + 32, iy + 20);
        }

        ctx.fillStyle = '#555';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Up/Down Select | E Choose | Esc Close', CANVAS_WIDTH / 2, py + panelH - 12);
        ctx.textAlign = 'left';
        ctx.restore();
    }

    _renderGarbageCans(ctx) {
        for (const can of this.garbageCans) {
            if (can.collected) continue;
            const screen = this.camera.worldToScreen(can.x, can.y);
            if (screen.x < -20 || screen.x > ctx.canvas.width + 20 ||
                screen.y < -20 || screen.y > ctx.canvas.height + 20) continue;

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.ellipse(screen.x, screen.y + 8, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Can body
            ctx.fillStyle = '#555';
            ctx.fillRect(screen.x - 6, screen.y - 10, 12, 16);
            // Can lid
            ctx.fillStyle = '#777';
            ctx.fillRect(screen.x - 7, screen.y - 12, 14, 4);
            // Handle
            ctx.fillStyle = '#444';
            ctx.fillRect(screen.x - 1, screen.y - 14, 2, 3);
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(screen.x - 4, screen.y - 8, 3, 10);
        }
    }

    _renderDumpsters(ctx) {
        if (!this.garbageCenter) return;
        const T = TILE_SIZE;
        // Draw dumpsters along the edges of the garbage center (avoid break room + truck spawns)
        const dumpsterPositions = [
            { col: 56, row: 21 },
            { col: 58, row: 21 },
            { col: 53, row: 23 },
            { col: 58, row: 23 },
        ];
        for (const dp of dumpsterPositions) {
            const wx = dp.col * T + T / 2;
            const wy = dp.row * T + T / 2;
            const screen = this.camera.worldToScreen(wx, wy);
            if (screen.x < -30 || screen.x > ctx.canvas.width + 30 ||
                screen.y < -30 || screen.y > ctx.canvas.height + 30) continue;

            // Dumpster body (large green container)
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(screen.x - 14, screen.y - 8, 28, 18);
            // Lid
            ctx.fillStyle = '#1e8449';
            ctx.fillRect(screen.x - 15, screen.y - 10, 30, 4);
            // Side detail
            ctx.fillStyle = '#219150';
            ctx.fillRect(screen.x - 12, screen.y - 4, 24, 2);
            // Wheels
            ctx.fillStyle = '#333';
            ctx.fillRect(screen.x - 12, screen.y + 10, 5, 3);
            ctx.fillRect(screen.x + 7, screen.y + 10, 5, 3);
        }
    }

    _renderBasketballCourt(ctx) {
        const T = TILE_SIZE;
        const bc = this.basketballCourt;
        const cLeft = bc.courtCols[0] * T;
        const cRight = (bc.courtCols[1] + 1) * T;
        const cTop = bc.courtRows[0] * T;
        const cBot = (bc.courtRows[1] + 1) * T;
        const cW = cRight - cLeft;
        const cH = cBot - cTop;

        // Court surface (orange hardwood)
        const tl = this.camera.worldToScreen(cLeft, cTop);
        const br = this.camera.worldToScreen(cRight, cBot);
        if (br.x < -20 || tl.x > ctx.canvas.width + 20 ||
            br.y < -20 || tl.y > ctx.canvas.height + 20) return;

        ctx.save();

        // Wood floor
        ctx.fillStyle = '#c87533';
        ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

        // Floor grain lines
        ctx.strokeStyle = '#b5652a';
        ctx.lineWidth = 0.5;
        for (let yy = tl.y; yy < br.y; yy += 6) {
            ctx.beginPath();
            ctx.moveTo(tl.x, yy);
            ctx.lineTo(br.x, yy);
            ctx.stroke();
        }

        // Court lines (white)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        // Outer boundary
        ctx.strokeRect(tl.x + 2, tl.y + 2, br.x - tl.x - 4, br.y - tl.y - 4);

        // Center line
        const midY = (tl.y + br.y) / 2;
        ctx.beginPath();
        ctx.moveTo(tl.x + 2, midY);
        ctx.lineTo(br.x - 2, midY);
        ctx.stroke();

        // Center circle
        const midX = (tl.x + br.x) / 2;
        const circRadius = Math.min(cW, cH) * 0.15;
        ctx.beginPath();
        ctx.arc(midX, midY, circRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Free throw lanes (top and bottom)
        const laneW = (br.x - tl.x) * 0.35;
        const laneH = (br.y - tl.y) * 0.2;
        // Top (north) basket area
        ctx.strokeRect(midX - laneW / 2, tl.y + 2, laneW, laneH);
        // Bottom (south) basket area
        ctx.strokeRect(midX - laneW / 2, br.y - laneH - 2, laneW, laneH);

        // Three-point arcs (simplified as arcs)
        ctx.beginPath();
        ctx.arc(midX, tl.y + 4, laneW * 0.8, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(midX, br.y - 4, laneW * 0.8, Math.PI + 0.2, -0.2);
        ctx.stroke();

        // Hoops (backboard + rim)
        // North hoop
        const hoopNScreen = this.camera.worldToScreen(cLeft + cW / 2, cTop + 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(hoopNScreen.x - 10, hoopNScreen.y - 2, 20, 3); // backboard
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoopNScreen.x, hoopNScreen.y + 5, 5, 0, Math.PI * 2);
        ctx.stroke();

        // South hoop
        const hoopSScreen = this.camera.worldToScreen(cLeft + cW / 2, cBot - 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(hoopSScreen.x - 10, hoopSScreen.y - 1, 20, 3); // backboard
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoopSScreen.x, hoopSScreen.y - 5, 5, 0, Math.PI * 2);
        ctx.stroke();

        // Team names on sidelines
        const sideNScreen = this.camera.worldToScreen(bc.sidelineCols[1] * T + T / 2, (bc.courtRows[0] + 1) * T);
        ctx.fillStyle = '#e67e22';
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DYNAMIC DUDES', sideNScreen.x, sideNScreen.y);

        const sideAScreen = this.camera.worldToScreen(bc.sidelineCols[1] * T + T / 2, (bc.courtRows[1]) * T);
        ctx.fillStyle = '#1b2a4a';
        ctx.fillText('VS NUGGETS', sideAScreen.x, sideAScreen.y);
        ctx.textAlign = 'left';

        // Drink station indicator (water cooler)
        const drinkScreen = this.camera.worldToScreen(bc.drinkCol * T + T / 2, bc.drinkRow * T + T / 2);
        // Water cooler body
        ctx.fillStyle = '#3498db';
        ctx.fillRect(drinkScreen.x - 5, drinkScreen.y - 6, 10, 12);
        ctx.fillStyle = '#85c1e9';
        ctx.fillRect(drinkScreen.x - 4, drinkScreen.y - 4, 8, 6);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(drinkScreen.x - 6, drinkScreen.y + 6, 12, 2);
        // Label
        ctx.fillStyle = '#3498db';
        ctx.font = '4px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WATER', drinkScreen.x, drinkScreen.y - 9);
        ctx.textAlign = 'left';

        // Benches (west = home, east = away)
        const benchCols = [bc.benchCol, bc.sidelineCols[1]];
        for (const bCol of benchCols) {
            for (let row = bc.benchRows[0]; row <= bc.benchRows[1]; row++) {
                const benchScreen = this.camera.worldToScreen(bCol * T + 4, row * T + T / 2);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(benchScreen.x - 2, benchScreen.y - 4, T - 4, 6);
                ctx.fillStyle = '#6b3410';
                ctx.fillRect(benchScreen.x - 3, benchScreen.y - 6, 2, 10);
                ctx.fillRect(benchScreen.x + T - 5, benchScreen.y - 6, 2, 10);
            }
        }

        ctx.restore();
    }

    _renderBasketballScoreboard(ctx) {
        if (!this.npcManager.basketballNPCs) return;
        const bb = this.npcManager.basketballNPCs;
        const bc = this.basketballCourt;

        // Only show scoreboard when player is near the court
        const pos = this.player.getTilePos();
        const courtCenterCol = (bc.courtCols[0] + bc.courtCols[1]) / 2;
        const courtCenterRow = (bc.courtRows[0] + bc.courtRows[1]) / 2;
        const dist = Math.hypot(pos.col - courtCenterCol, pos.row - courtCenterRow);
        if (dist > 12) return;

        ctx.save();
        // Scoreboard panel at top of screen
        const panelW = 220;
        const panelH = 32;
        const px = (CANVAS_WIDTH - panelW) / 2;
        const py = 4;

        ctx.fillStyle = 'rgba(10, 10, 20, 0.9)';
        ctx.fillRect(px, py, panelW, panelH);
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, panelW, panelH);

        // Home team
        ctx.fillStyle = '#e67e22';
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DUDES', px + 8, py + 13);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText(String(bb.score[0]), px + 8, py + 27);

        // Away team
        ctx.fillStyle = '#1b2a4a';
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText('NUGGETS', px + panelW - 8, py + 13);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText(String(bb.score[1]), px + panelW - 8, py + 27);

        // VS
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VS', px + panelW / 2, py + 20);

        ctx.textAlign = 'left';
        ctx.restore();
    }

    _renderParkingMarker(ctx) {
        if (!this.roadClearMission.active) return;
        const spot = this.roadClearMission.parkingSpot;
        const T = TILE_SIZE;
        const wx = (spot.col + 0.5) * T;
        const wy = (spot.row + 0.5) * T;
        const screen = this.camera.worldToScreen(wx, wy);

        if (screen.x < -40 || screen.x > ctx.canvas.width + 40 ||
            screen.y < -40 || screen.y > ctx.canvas.height + 40) return;

        ctx.save();
        if (this.roadClearMission.parked) {
            // Parked - green checkmark
            ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
            ctx.fillRect(screen.x - T, screen.y - T, T * 2, T * 2);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(screen.x - T, screen.y - T, T * 2, T * 2);
            ctx.setLineDash([]);
        } else {
            // Not parked yet - pulsing blue marker
            const pulse = 0.4 + Math.sin(this.time * 3) * 0.2;
            ctx.fillStyle = `rgba(52, 152, 219, ${pulse})`;
            ctx.fillRect(screen.x - T, screen.y - T, T * 2, T * 2);
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.strokeRect(screen.x - T, screen.y - T, T * 2, T * 2);
            ctx.setLineDash([]);

            // "P" icon and label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('P', screen.x, screen.y - T - 8);
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.fillText('Park Police Car Here', screen.x, screen.y - T - 20);
            ctx.textAlign = 'left';
        }
        ctx.restore();
    }

    _renderRoadClearStatus(ctx) {
        if (!this.roadClearMission.active) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        const statusText = this.roadClearMission.parked
            ? `Dismiss: ${this.roadClearMission.carsDismissed}/${this.roadClearMission.carsNeeded}`
            : 'Park police car at marker';
        ctx.font = '8px "Press Start 2P", monospace';
        const tw = ctx.measureText(statusText).width;
        ctx.fillRect(10, 104, tw + 16, 20);
        ctx.fillStyle = this.roadClearMission.parked ? '#3498db' : '#f39c12';
        ctx.fillText(statusText, 18, 118);

        if (this.roadClearMission.parked && this.roadClearMission.carsDismissed < this.roadClearMission.carsNeeded) {
            ctx.fillStyle = '#fff';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillText('Press R near a car to dismiss it', 18, 134);
        }
        ctx.restore();
    }

    _renderCelebration(ctx) {
        const numParticles = 20;
        const elapsed = 4 - this.goalCompleteTimer;
        ctx.save();
        for (let i = 0; i < numParticles; i++) {
            const seed = i * 137.508;
            const angle = (seed + elapsed * 100) % 360 * (Math.PI / 180);
            const dist = 50 + Math.sin(elapsed * 3 + i) * 30 + elapsed * 40;
            const px = CANVAS_WIDTH / 2 + Math.cos(angle) * dist;
            const py = CANVAS_HEIGHT / 2 - 50 + Math.sin(angle) * dist * 0.5 + elapsed * 20;

            const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = Math.max(0, 1 - elapsed * 0.2);

            const size = 4 + Math.sin(seed) * 3;
            ctx.fillRect(px, py, size, size);
        }
        ctx.restore();
    }
}
