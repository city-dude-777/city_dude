// ============================================================================
// City Dude - Inventory & Money System
// ============================================================================
// Tracks the player's money, purchased items, job, day, and active quests.

export class Inventory {
    constructor() {
        this.money = 0;
        this.items = []; // { id, name, price, icon, desc, quantity }
        this.hasJob = null; // 'Police Officer', 'Firefighter', 'Construction Worker'
        this.day = 1;
        this.activeQuest = null; // { type, description, itemNeeded, giver, reward, delivered }
    }

    addMoney(amount) {
        this.money += amount;
    }

    canAfford(price) {
        return this.money >= price;
    }

    spend(price) {
        if (this.money >= price) {
            this.money -= price;
            return true;
        }
        return false;
    }

    addItem(itemDef) {
        const existing = this.items.find(i => i.id === itemDef.id);
        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ ...itemDef, quantity: 1 });
        }
    }

    removeItem(id) {
        const item = this.items.find(i => i.id === id);
        if (item && item.quantity > 0) {
            item.quantity--;
            if (item.quantity <= 0) {
                this.items = this.items.filter(i => i.id !== id);
            }
            return true;
        }
        return false;
    }

    hasItem(id) {
        const item = this.items.find(i => i.id === id);
        return item && item.quantity > 0;
    }

    getItemCount(id) {
        const item = this.items.find(i => i.id === id);
        return item ? item.quantity : 0;
    }

    getTotalItems() {
        return this.items.reduce((sum, i) => sum + i.quantity, 0);
    }
}
