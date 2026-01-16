export type Inventory = Record<string, number>;
type Callback = () => void;

const inventory: Inventory = (() => {
    const raw = localStorage.getItem('inventory');
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? {} : parsed;
    } catch {
        return {};
    }
})();

console.log(`Tried to load inventory ${inventory} ${typeof inventory}`);
const specialInventory: Inventory = (() => {
    const rawData = localStorage.getItem('specialInventory');
    if (!rawData) return Object.create(null);
    try {
        return JSON.parse(rawData) as Inventory;
    } catch {
        console.error('Save data failed to load');
        return {};
    }
})();
function autosave() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('specialInventory', JSON.stringify(specialInventory));
    console.log('sucessful save');
}
function inventorySet(
    material: string,
    amount: number,
    special: boolean
): void {
    if (special) {
        if (material in inventory) {
            inventory[material] += amount;
        } else {
            inventory[material] = amount;
        }
    } else {
        if (material in inventory) {
            inventory[material] += amount;
        } else {
            inventory[material] = amount;
        }
    }
}
function inventoryGet(): void {
    const container = document.getElementById('dynamic');
    container!.innerHTML = '';
    for (const key in inventory) {
        if (Object.prototype.hasOwnProperty.call(inventory, key)) {
            const value = inventory[key];
            const pElement = document.createElement('p');
            pElement.textContent = `You have ${value} ${key}`;
            pElement.id = 'inventoryThingy';
            container!.appendChild(pElement);
        }
    }
}
/**
 * Remove items from the inventory. Use inventory[item] -= x instead.
 *
 * @param material material to remove
 * @param amount amount to remove
 * @param callback function to call on sucess
 * @returns
 */
function inventoryRemove(material: string, amount: number): boolean {
    const amountOfItem = inventory[material] ?? 0;
    if (inventory[material] < amount) {
        console.log(`Could not buy, not enough ${material}.`);
        return false;
    }
    inventory[material] -= amount;
    return true;
}
function inventoryGetAmount(material: string): number {
    return inventory[material] ?? 0;
}
function inventoryCheck(material: string) {
    if (specialInventory[material] > 0) {
        return false;
    } else {
        return true;
    }
} //only works on specialInventory
export {
    autosave,
    inventoryGet,
    inventoryRemove,
    inventorySet,
    inventoryGetAmount,
    inventory,
};
