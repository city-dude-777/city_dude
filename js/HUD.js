// ============================================================================
// City Dude - HUD (Heads-Up Display)
// ============================================================================
// Renders UI overlays: goal info, messages, money, building/vehicle/NPC
// interaction prompts, dialogue boxes, and control hints.

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants.js';

export class HUD {
    constructor() {
        // Floating message system
        this.messages = []; // { text, timeLeft, totalTime }

        // Area title display
        this.areaTitle = '';
        this.areaTitleTimer = 0;

        // Building label
        this.buildingLabel = '';
        this._lastBuildingLabel = '';
        this.buildingLabelAlpha = 0;

        // Vehicle prompt
        this.vehiclePrompt = '';
        this._lastVehiclePrompt = '';
        this.vehiclePromptAlpha = 0;

        // Driving info
        this.drivingVehicle = null;

        // Building door prompt
        this.doorPrompt = '';
        this._lastDoorPrompt = '';
        this.doorPromptAlpha = 0;

        // NPC talk prompt
        this.talkPrompt = '';
        this._lastTalkPrompt = '';
        this.talkPromptAlpha = 0;

        // Dialogue box
        this.dialogueActive = false;
        this.dialogueName = '';
        this.dialogueText = '';
        this.dialogueAlpha = 0;

        // Money popup
        this.moneyPopups = []; // { text, timeLeft, totalTime }

        // Siren / Dismiss button visibility
        this.showSirenButton = false;
        this.sirenButtonOn = false;
        this.showDismissButton = false;

        // Day/time display
        this.currentDay = 1;
        this.timeOfDay = '8:00 AM';
    }

    showMessage(text, duration = 3) {
        this.messages.push({
            text,
            timeLeft: duration,
            totalTime: duration,
        });
    }

    showAreaTitle(name) {
        this.areaTitle = name;
        this.areaTitleTimer = 3;
    }

    showMoneyPopup(text, duration = 1.5) {
        this.moneyPopups.push({ text, timeLeft: duration, totalTime: duration });
    }

    setBuildingLabel(name) {
        this.buildingLabel = name;
    }

    setVehiclePrompt(vehicleName) {
        this.vehiclePrompt = vehicleName;
    }

    setDrivingInfo(vehicle) {
        this.drivingVehicle = vehicle;
    }

    setDoorPrompt(buildingName) {
        this.doorPrompt = buildingName;
    }

    setTalkPrompt(npcStyleName) {
        this.talkPrompt = npcStyleName;
    }

    setDayInfo(day, timeStr) {
        this.currentDay = day;
        this.timeOfDay = timeStr;
    }

    setDialogue(name, text) {
        this.dialogueActive = true;
        this.dialogueName = name;
        this.dialogueText = text;
    }

    clearDialogue() {
        this.dialogueActive = false;
    }

    update(dt) {
        // Update messages
        for (const msg of this.messages) {
            msg.timeLeft -= dt;
        }
        this.messages = this.messages.filter(m => m.timeLeft > 0);

        // Money popups
        for (const p of this.moneyPopups) {
            p.timeLeft -= dt;
        }
        this.moneyPopups = this.moneyPopups.filter(p => p.timeLeft > 0);

        // Area title
        if (this.areaTitleTimer > 0) {
            this.areaTitleTimer -= dt;
        }

        // Smooth alphas
        this.buildingLabelAlpha = this._smoothAlpha(this.buildingLabelAlpha, this.buildingLabel, dt, 4);
        this.vehiclePromptAlpha = this._smoothAlpha(this.vehiclePromptAlpha, this.vehiclePrompt, dt, 5);
        this.doorPromptAlpha = this._smoothAlpha(this.doorPromptAlpha, this.doorPrompt, dt, 5);
        this.talkPromptAlpha = this._smoothAlpha(this.talkPromptAlpha, this.talkPrompt, dt, 5);
        this.dialogueAlpha = this._smoothAlpha(this.dialogueAlpha, this.dialogueActive, dt, 6);
    }

    _smoothAlpha(current, condition, dt, speed) {
        if (condition) {
            return Math.min(1, current + dt * speed);
        } else {
            return Math.max(0, current - dt * speed);
        }
    }

    render(ctx, goalManager, player, time, npcManager, inventory) {
        this._renderDayBar(ctx);
        this._renderGoalInfo(ctx, goalManager, player);
        this._renderMessages(ctx);
        this._renderAreaTitle(ctx);
        this._renderBuildingLabel(ctx);
        this._renderVehiclePrompt(ctx, time);
        this._renderDoorPrompt(ctx, time);
        this._renderTalkPrompt(ctx, time);
        this._renderDrivingInfo(ctx, time);
        this._renderControls(ctx, player);
        this._renderMoneyDisplay(ctx, inventory);
        this._renderMoneyPopups(ctx);
        if (npcManager) {
            this._renderPassengerInfo(ctx, npcManager, time);
            if (npcManager.deliveryCount > 0) {
                this._renderDeliveryCounter(ctx, npcManager.deliveryCount);
            }
        }
        this._renderDialogueBox(ctx, time);
        this._renderWardrobeButton(ctx, time);
    }

    // ---- Goal Info ----

    _renderGoalInfo(ctx, goalManager, player) {
        if (!goalManager.activeGoal && !goalManager.allComplete) return;

        const padding = 12;
        const x = padding;
        const y = padding;

        ctx.save();

        if (goalManager.allComplete) {
            ctx.fillStyle = COLORS.UI_BG;
            this._roundRect(ctx, x, y, 260, 50, 8);
            ctx.fill();

            ctx.fillStyle = COLORS.UI_GOAL;
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.fillText('✓ Free Roam!', x + padding, y + 22);

            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillText('Explore Dude Angeles', x + padding, y + 40);
        } else {
            const goal = goalManager.activeGoal;
            const dist = goalManager.getDistanceToGoal(player);
            const distText = dist !== null ? `${Math.round(dist)} tiles away` : '';

            ctx.fillStyle = COLORS.UI_BG;
            this._roundRect(ctx, x, y, 280, 65, 8);
            ctx.fill();

            ctx.fillStyle = COLORS.UI_ACCENT;
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.fillText('◆ ' + goal.title, x + padding, y + 22);

            ctx.fillStyle = '#bbb';
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillText(goal.description.substring(0, 40), x + padding, y + 40);
            if (goal.description.length > 40) {
                ctx.fillText(goal.description.substring(40, 80), x + padding, y + 54);
            }

            if (distText) {
                ctx.fillStyle = COLORS.UI_GOAL;
                ctx.font = '9px "Press Start 2P", monospace';
                const tw = ctx.measureText(distText).width;
                ctx.fillText(distText, x + 280 - padding - tw, y + 22);
            }
        }

        ctx.restore();
    }

    // ---- Messages ----

    _renderMessages(ctx) {
        if (this.messages.length === 0) return;

        ctx.save();
        let offsetY = 0;

        for (const msg of this.messages) {
            const fadeIn = Math.min(1, (msg.totalTime - msg.timeLeft) * 4);
            const fadeOut = Math.min(1, msg.timeLeft * 2);
            const alpha = fadeIn * fadeOut;

            const lines = msg.text.split('\n');
            const lineHeight = 22;
            const boxHeight = lines.length * lineHeight + 30;
            const boxWidth = 400;
            const x = (CANVAS_WIDTH - boxWidth) / 2;
            const y = (CANVAS_HEIGHT - boxHeight) / 2 - 40 + offsetY;

            ctx.globalAlpha = alpha;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this._roundRect(ctx, x, y, boxWidth, boxHeight, 12);
            ctx.fill();

            ctx.strokeStyle = COLORS.UI_ACCENT;
            ctx.lineWidth = 2;
            this._roundRect(ctx, x, y, boxWidth, boxHeight, 12);
            ctx.stroke();

            ctx.fillStyle = COLORS.UI_TEXT;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], CANVAS_WIDTH / 2, y + 24 + i * lineHeight);
            }
            ctx.textAlign = 'left';

            offsetY += boxHeight + 10;
        }

        ctx.restore();
    }

    // ---- Area Title ----

    _renderAreaTitle(ctx) {
        if (this.areaTitleTimer <= 0) return;

        const fadeIn = Math.min(1, (3 - this.areaTitleTimer) * 3);
        const fadeOut = Math.min(1, this.areaTitleTimer);
        const alpha = fadeIn * fadeOut;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.font = 'bold 20px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.areaTitle, CANVAS_WIDTH / 2, 100);

        const tw = ctx.measureText(this.areaTitle).width;
        ctx.strokeStyle = COLORS.UI_ACCENT;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2 - tw / 2, 106);
        ctx.lineTo(CANVAS_WIDTH / 2 + tw / 2, 106);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Building Label ----

    _renderBuildingLabel(ctx) {
        if (this.buildingLabelAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.buildingLabelAlpha;

        const text = this.buildingLabel || this._lastBuildingLabel || '';
        if (this.buildingLabel) this._lastBuildingLabel = this.buildingLabel;

        ctx.font = '10px "Press Start 2P", monospace';
        const tw = ctx.measureText(text).width;
        const x = (CANVAS_WIDTH - tw) / 2;
        const y = CANVAS_HEIGHT - 60;

        ctx.fillStyle = COLORS.UI_BG;
        this._roundRect(ctx, x - 12, y - 16, tw + 24, 28, 6);
        ctx.fill();

        ctx.fillStyle = COLORS.UI_TEXT;
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    // ---- Vehicle Prompt ----

    _renderVehiclePrompt(ctx, time) {
        if (this.vehiclePromptAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.vehiclePromptAlpha;

        const name = this.vehiclePrompt || this._lastVehiclePrompt || '';
        if (this.vehiclePrompt) this._lastVehiclePrompt = this.vehiclePrompt;

        const text = `Press E to enter ${name}`;
        ctx.font = '10px "Press Start 2P", monospace';
        const tw = ctx.measureText(text).width;
        const x = (CANVAS_WIDTH - tw) / 2;
        const y = CANVAS_HEIGHT - 90;

        const pulse = 0.7 + Math.sin(time * 4) * 0.15;
        ctx.globalAlpha = this.vehiclePromptAlpha * pulse;

        ctx.fillStyle = 'rgba(0, 80, 180, 0.8)';
        this._roundRect(ctx, x - 14, y - 16, tw + 28, 30, 6);
        ctx.fill();

        ctx.globalAlpha = this.vehiclePromptAlpha;
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    // ---- Door Prompt ----

    _renderDoorPrompt(ctx, time) {
        if (this.doorPromptAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.doorPromptAlpha;

        const name = this.doorPrompt || this._lastDoorPrompt || '';
        if (this.doorPrompt) this._lastDoorPrompt = this.doorPrompt;

        const text = `Press E to enter ${name}`;
        ctx.font = '10px "Press Start 2P", monospace';
        const tw = ctx.measureText(text).width;
        const x = (CANVAS_WIDTH - tw) / 2;
        const y = CANVAS_HEIGHT - 120;

        const pulse = 0.7 + Math.sin(time * 4) * 0.15;
        ctx.globalAlpha = this.doorPromptAlpha * pulse;

        ctx.fillStyle = 'rgba(140, 80, 30, 0.85)';
        this._roundRect(ctx, x - 14, y - 16, tw + 28, 30, 6);
        ctx.fill();

        ctx.globalAlpha = this.doorPromptAlpha;
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    // ---- NPC Talk Prompt ----

    _renderTalkPrompt(ctx, time) {
        if (this.talkPromptAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.talkPromptAlpha;

        const name = this.talkPrompt || this._lastTalkPrompt || '';
        if (this.talkPrompt) this._lastTalkPrompt = this.talkPrompt;

        const text = `Press E to talk to ${name}`;
        ctx.font = '10px "Press Start 2P", monospace';
        const tw = ctx.measureText(text).width;
        const x = (CANVAS_WIDTH - tw) / 2;
        const y = CANVAS_HEIGHT - 90;

        const pulse = 0.7 + Math.sin(time * 4) * 0.15;
        ctx.globalAlpha = this.talkPromptAlpha * pulse;

        ctx.fillStyle = 'rgba(40, 120, 40, 0.85)';
        this._roundRect(ctx, x - 14, y - 16, tw + 28, 30, 6);
        ctx.fill();

        ctx.globalAlpha = this.talkPromptAlpha;
        ctx.fillStyle = '#fff';
        ctx.fillText(text, x, y);

        ctx.restore();
    }

    // ---- Driving Info ----

    _renderDrivingInfo(ctx, time) {
        if (!this.drivingVehicle) return;

        ctx.save();

        const vehicle = this.drivingVehicle;
        const speed = Math.abs(Math.round(vehicle.velocity));
        const name = vehicle.type.name;

        const barW = 220;
        const barH = 42;
        const barX = (CANVAS_WIDTH - barW) / 2;
        const barY = CANVAS_HEIGHT - barH - 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this._roundRect(ctx, barX, barY, barW, barH, 8);
        ctx.fill();

        ctx.fillStyle = COLORS.UI_ACCENT;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(name, CANVAS_WIDTH / 2, barY + 14);

        ctx.fillStyle = speed > 150 ? '#e74c3c' : speed > 80 ? '#f1c40f' : '#2ecc71';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText(`${speed} mph`, CANVAS_WIDTH / 2, barY + 32);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('E to exit', CANVAS_WIDTH / 2 + barW / 2 - 30, barY + 14);

        // Siren indicator on driving bar
        if (this.showSirenButton && this.sirenButtonOn) {
            const sirenPulse = 0.6 + Math.sin(time * 8) * 0.4;
            ctx.globalAlpha = sirenPulse;
            ctx.fillStyle = '#e74c3c';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillText('SIREN', CANVAS_WIDTH / 2 - barW / 2 + 6, barY + 14);
            ctx.globalAlpha = 1;
        }

        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Money Display ----

    _renderMoneyDisplay(ctx, inventory) {
        if (!inventory) return;

        ctx.save();
        const text = `$${inventory.money}`;
        ctx.font = 'bold 11px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        const tw = ctx.measureText(text).width;
        const x = CANVAS_WIDTH - 12;
        const y = 46;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this._roundRect(ctx, x - tw - 14, y - 4, tw + 22, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#2ecc71';
        ctx.fillText(text, x, y + 14);

        // Item count
        if (inventory.getTotalItems() > 0) {
            const iText = `${inventory.getTotalItems()} items`;
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = '#aaa';
            ctx.fillText(iText, x, y + 28);
        }

        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Money Popups ----

    _renderMoneyPopups(ctx) {
        if (this.moneyPopups.length === 0) return;

        ctx.save();
        for (const p of this.moneyPopups) {
            const progress = 1 - p.timeLeft / p.totalTime;
            const fadeOut = Math.min(1, p.timeLeft * 3);
            ctx.globalAlpha = fadeOut;
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(p.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80 - progress * 30);
            ctx.textAlign = 'left';
        }
        ctx.restore();
    }

    // ---- Delivery Counter ----

    _renderDeliveryCounter(ctx, count) {
        ctx.save();
        const x = CANVAS_WIDTH - 12;
        const y = 16;

        ctx.fillStyle = 'rgba(30, 100, 180, 0.8)';
        const text = `✓ ${count} rides`;
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        const tw = ctx.measureText(text).width;
        this._roundRect(ctx, x - tw - 14, y - 4, tw + 22, 26, 6);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.fillText(text, x, y + 14);

        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Passenger Info (when driving) ----

    _renderPassengerInfo(ctx, npcManager, time) {
        if (npcManager.passengers.length === 0) return;

        const count = npcManager.passengers.length;
        const max = npcManager.maxPassengers;

        ctx.save();

        // Passenger count bar (above driving info)
        const barW = 280;
        const barH = 36;
        const barX = (CANVAS_WIDTH - barW) / 2;
        const barY = CANVAS_HEIGHT - 100;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this._roundRect(ctx, barX, barY, barW, barH, 8);
        ctx.fill();

        // Border (pulsing when full)
        const isFull = count >= max;
        if (isFull) {
            const pulse = 0.5 + Math.sin(time * 4) * 0.3;
            ctx.strokeStyle = `rgba(241, 196, 15, ${pulse})`;
        } else {
            ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
        }
        ctx.lineWidth = 2;
        this._roundRect(ctx, barX, barY, barW, barH, 8);
        ctx.stroke();

        // Passenger icons
        ctx.textAlign = 'left';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#3498db';
        ctx.fillText('Passengers:', barX + 10, barY + 14);

        // Dots for passengers
        for (let i = 0; i < max; i++) {
            const dotX = barX + 155 + i * 22;
            const dotY = barY + 10;
            if (i < count) {
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(dotX, dotY, 14, 14);
                // Little person icon
                ctx.fillStyle = '#fff';
                ctx.fillRect(dotX + 5, dotY + 2, 4, 4); // head
                ctx.fillRect(dotX + 3, dotY + 7, 8, 6); // body
            } else {
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(dotX, dotY, 14, 14);
            }
        }

        // "Drive to Skate Park!" hint
        const hintText = isFull ? 'FULL! Drive to Skate Park!' : 'Drive to Skate Park!';
        const pulse = 0.6 + Math.sin(time * 3) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = isFull ? '#f1c40f' : '#3498db';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hintText, CANVAS_WIDTH / 2, barY + 32);

        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Dialogue Box ----

    _renderDialogueBox(ctx, time) {
        if (this.dialogueAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.dialogueAlpha;

        const boxW = 600;
        const boxH = 100;
        const x = (CANVAS_WIDTH - boxW) / 2;
        const y = CANVAS_HEIGHT - boxH - 20;

        // Background
        ctx.fillStyle = 'rgba(10, 10, 30, 0.95)';
        this._roundRect(ctx, x, y, boxW, boxH, 12);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        this._roundRect(ctx, x, y, boxW, boxH, 12);
        ctx.stroke();

        // NPC name
        ctx.fillStyle = '#3498db';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText(this.dialogueName, x + 16, y + 22);

        // Dialogue text
        ctx.fillStyle = '#fff';
        ctx.font = '9px "Press Start 2P", monospace';
        const maxWidth = boxW - 32;
        const words = this.dialogueText.split(' ');
        let line = '';
        let ly = y + 46;
        for (const word of words) {
            const testLine = line ? line + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth) {
                ctx.fillText(line, x + 16, ly);
                line = word;
                ly += 18;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x + 16, ly);

        // Continue prompt (blinking)
        if (Math.sin(time * 4) > 0) {
            ctx.fillStyle = '#888';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('Press E to continue', x + boxW - 16, y + boxH - 12);
            ctx.textAlign = 'left';
        }

        ctx.restore();
    }

    // ---- Controls Hint ----

    _renderControls(ctx, player) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';

        let text;
        if (player && player.isDriving) {
            text = this.showSirenButton ? 'Arrows to drive | E exit | R siren' : 'Arrows to drive | E to exit';
        } else if (this.showDismissButton) {
            text = 'Arrows/WASD move | R dismiss car';
        } else {
            text = 'Arrows/WASD move | E interact';
        }
        const tw = ctx.measureText(text).width;
        ctx.fillText(text, CANVAS_WIDTH - tw - 12, CANVAS_HEIGHT - 140);
        ctx.restore();
    }

    // ---- Day / Time Bar ----

    _renderDayBar(ctx) {
        ctx.save();
        const text = `Day ${this.currentDay}  ${this.timeOfDay}`;
        ctx.font = '9px "Press Start 2P", monospace';
        const tw = ctx.measureText(text).width;
        const barW = tw + 24;
        const barX = (CANVAS_WIDTH - barW) / 2;
        const barY = 4;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this._roundRect(ctx, barX, barY, barW, 22, 6);
        ctx.fill();

        ctx.fillStyle = '#f1c40f';
        ctx.textAlign = 'center';
        ctx.fillText(text, CANVAS_WIDTH / 2, barY + 16);
        ctx.textAlign = 'left';
        ctx.restore();
    }

    // ---- Wardrobe & Eat Buttons ----

    _renderWardrobeButton(ctx, time) {
        ctx.save();
        const bw = 68, bh = 24;
        const bx = CANVAS_WIDTH - bw - 10;

        // Clothes button
        const by1 = CANVAS_HEIGHT - 172;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this._roundRect(ctx, bx, by1, bw, bh, 6);
        ctx.fill();
        ctx.fillStyle = '#aaa';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('C Clothes', bx + bw / 2, by1 + 16);

        // Eat button
        const by2 = by1 - 30;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this._roundRect(ctx, bx, by2, bw, bh, 6);
        ctx.fill();
        ctx.fillStyle = '#e67e22';
        ctx.fillText('Q Eat', bx + bw / 2, by2 + 16);

        // Siren button (only shown when driving emergency vehicle)
        if (this.showSirenButton) {
            const by3 = by2 - 30;
            const sirenOn = this.sirenButtonOn;
            ctx.fillStyle = sirenOn ? 'rgba(231, 76, 60, 0.8)' : 'rgba(0,0,0,0.6)';
            this._roundRect(ctx, bx, by3, bw, bh, 6);
            ctx.fill();
            if (sirenOn) {
                const pulse = 0.6 + Math.sin(time * 8) * 0.4;
                ctx.strokeStyle = `rgba(255, 100, 100, ${pulse})`;
                ctx.lineWidth = 2;
                this._roundRect(ctx, bx, by3, bw, bh, 6);
                ctx.stroke();
            }
            ctx.fillStyle = sirenOn ? '#fff' : '#e74c3c';
            ctx.fillText(sirenOn ? 'R Siren!' : 'R Siren', bx + bw / 2, by3 + 16);
        }

        // Dismiss button (only shown when on foot during road clear mission near a car)
        if (this.showDismissButton) {
            const by4 = (this.showSirenButton ? by2 - 60 : by2 - 30);
            ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
            this._roundRect(ctx, bx, by4, bw, bh, 6);
            ctx.fill();
            const pulse = 0.7 + Math.sin(time * 4) * 0.3;
            ctx.strokeStyle = `rgba(100, 200, 255, ${pulse})`;
            ctx.lineWidth = 2;
            this._roundRect(ctx, bx, by4, bw, bh, 6);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillText('R Dismiss', bx + bw / 2, by4 + 16);
        }

        ctx.textAlign = 'left';
        ctx.restore();
    }

    /** Helper: draw a rounded rectangle path */
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
