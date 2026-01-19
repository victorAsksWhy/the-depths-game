import {
    inventoryRemove,
    inventoryGetAmount,
    inventory,
    inventorySet,
} from './inventoryManager';
const craftedOnce = loadCrafting('craftedItems');
const flags = loadCrafting('flags');
let recipes: Recipe[] = [];
let recipeIDs: Record<string, Recipe> = {};
const expandedRecipes = new Set<string>();
export interface Recipe {
    id: string;
    humanName: string;
    inputs: Record<string, number>;
    outputs: Record<string, number>;
    flavorText: string;
    isSpecial: boolean;
    requires?: {
        items?: Record<string, number>; // these are not consumed.
        crafted?: string[];
        flags?: string[];
    };
    blockedBy?: {
        crafted?: string[];
        flags?: string[];
    };
    setsFlags?: string;
}
function saveCrafting(): void {
    try {
        localStorage.setItem('craftedItems', JSON.stringify([...craftedOnce]));
    } catch (e) {
        console.log('Failure');
    }
    console.log('Saving flags...');
    try {
        localStorage.setItem('flags', JSON.stringify([...flags]));
    } catch (e) {
        console.log('Failure');
    }
}
function loadCrafting(key: string): Set<string> {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();

    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set<string>();
        return new Set<string>(arr);
    } catch {
        return new Set<string>();
    }
}
function isBlocked(recipe: Recipe): boolean {
    const disable = recipe.blockedBy;
    if (!disable) {
        return false;
    }
    if (disable?.crafted) {
        for (const craft of disable.crafted) {
            if (craftedOnce.has(craft)) {
                return true;
            }
        }
    }
    if (disable?.flags) {
        for (const flag of disable.flags) {
            if (flags.has(flag)) {
                return true;
            }
        }
    }
    return false;
}
function meetsRequirements(recipe: Recipe): boolean {
    const req = recipe.requires;

    if (req === undefined) {
        return true;
    }

    if (req!.items) {
        //check for items (not ingredients; these act as a gate and are not consumed.)
        for (const item in req!.items) {
            if ((inventory[item] ?? 0) < req!.items[item]) {
                return false;
            }
        }
    } //check for crafted item gate
    if (req!.crafted) {
        for (const id of req!.crafted!) {
            if (craftedOnce.has(id)) {
                return false;
            }
        }
    }
    if (req!.flags) {
        for (const flag of req!.flags!) {
            if (!flags.has(flag)) {
                return false;
            }
        }
    }
    return true;
}
function craft(recipe: Recipe, count: number, special: boolean): boolean {
    if (!meetsRequirements(recipe)) {
        console.log('was not meeting requrement');
        return false;
    }
    if (isBlocked(recipe)) {
        console.log('Was blocked');
        return false;
    }
    if (recipe.setsFlags) {
        for (const settingFlag of recipe.setsFlags) {
            flags.add(settingFlag);
        }
    }
    for (const [itemName, amount] of Object.entries(recipe.inputs)) {
        if (inventory[itemName] === undefined) {
            console.log('inventory error');
            return false;
        }
        if (inventory[itemName] < amount * count) {
            console.error(`[DBG] not enough ${itemName}`);
            return false;
        }
    }
    for (const [itemName, amount] of Object.entries(recipe.inputs)) {
        if (inventoryRemove(itemName, amount * count) == false) {
            console.log('removal failure');
            return false;
        }
        }
    if (special) {
        for (const [itemName, amount] of Object.entries(recipe.outputs)) {
            inventorySet(itemName, amount * count, true);
            console.log(`[DBG] tried to set ${itemName}`);
        }
    }
    if (!special) {
        for (const [itemName, amount] of Object.entries(recipe.outputs)) {
            console.log(`[DBG] ${amount} of ${itemName}`);
            inventorySet(itemName, amount * count, false);
            console.log(`[DBG] tried to set ${itemName}`);
        }
    craftedOnce.add(recipe.id);
    renderCraftingButtons();
    return true;
    }
}
async function fetchRecipes(): Promise<void> {
    try {
        const resource = await fetch('/recipe.json');
        if (!resource.ok) {
            alert('Critical error: failed to load recipes.');
            throw new Error('Failed to load recipes');
        }
        const data: Recipe[] = await resource.json();
        recipes = data;
    } catch (e) {
        console.error(e);
    }
}
function buildRecipeMap() {
    for (const recipe of recipes) {
        recipeIDs[recipe.id] = recipe;
    }
}
function createButton(recipe: Recipe, count: number, special: boolean) {
    const btn = document.createElement('button');
    btn.textContent = `${recipe.humanName} x${count}`;
    btn.dataset.recipeID = recipe.id;
    btn.dataset.count = String(count);
    btn.dataset.special = String(special);
    btn.className = 'craftingButton';
    btn.disabled = !meetsRequirements(recipe) || isBlocked(recipe);

    return btn;
}
function renderCraftingButtons() {
    const container = document.getElementById('craftingButtons');
    if (!container) return;
    container.innerHTML = '';
    for (const recipe of recipes) {
        if (!meetsRequirements(recipe) || isBlocked(recipe)) continue;

        // Create collapsible container
        const header = document.createElement('div');
        header.id = 'craftHeader';
        header.className = 'craft-header';
        header.textContent = recipe.humanName;

        const collapsible = document.createElement('div');
        collapsible.className = 'craft-container';
        collapsible.id = 'craftContainer';
        const inputInfoHeader = document.createElement('p');
        inputInfoHeader.innerHTML = 'Inputs:';
        inputInfoHeader.className = 'infoText';
        collapsible.appendChild(inputInfoHeader);

        const panel = document.createElement('div');
        panel.className = 'craft-panel';
        for (const [inputName, amount] of Object.entries(recipe.inputs)) {
            const inputInfo = document.createElement('p');
            inputInfo.innerHTML = `${amount} ${inputName}`;
            inputInfo.className = 'infoText';
            collapsible.appendChild(inputInfo);
        }
        if (recipe.isSpecial) {
            collapsible.appendChild(createButton(recipe, 1, true));
            if (recipe.flavorText) {
                const flavorText = document.createElement('p');
                flavorText.className = 'flavorText';
                flavorText.innerHTML = `\"${recipe.flavorText}\"`;
                collapsible.appendChild(flavorText);
            }
        } else {
            if (recipe.flavorText) {
                const flavorText = document.createElement('p');
                flavorText.className = 'flavorText';
                flavorText.innerHTML = recipe.flavorText;
                collapsible.appendChild(flavorText);
            }
            const inputForm = document.createElement('input');
            inputForm.type = 'number';
            inputForm.min = '0';
            inputForm.id = `buttonInput-${String(Number(Math.random) * Number(Math.random))}`;
            inputForm.placeholder = 'How many to craft?';
            const label = document.createElement('label');
            label.htmlFor = `${inputForm.id}`;
            label.innerHTML = `Craft ${recipe.humanName}: `;
            label.style.fontFamily = 'Arial, Helective, sans-serif';
            label.style.color = 'white';
            const button = document.createElement('button');
            button.className = 'craftingButton';
            button.innerHTML = 'Craft';
            button.addEventListener('click', (e) => {
                craft(
                    recipe,
                    Number(inputForm.value),
                    Boolean(button.dataset.special)
                );
            });
            collapsible.append(label);
            collapsible.append(inputForm);
            collapsible.append(button);
        }
        if (expandedRecipes.has(recipe.id)) {
            collapsible.classList.toggle('show');
        }
        // Toggle expand/collapse on click
        header.addEventListener('click', () => {
            const status = collapsible.classList.toggle('show');
            if (status) {
                expandedRecipes.add(recipe.id);
            } else {
                expandedRecipes.delete(recipe.id);
            }
        });

        // Append header + collapsible to container
        panel.appendChild(header);
        panel.appendChild(collapsible);
        container.appendChild(panel);
    }
}
const container = document.getElementById('craftingButtons');
container?.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    if (target.tagName !== 'BUTTON') {
        return;
    }
    const recipeID = target.dataset.recipeID!;
    if (target.dataset.count) {
        const recipe = recipeIDs[recipeID];
        if (!recipe) {
            return;
        }
        craft(
            recipe,
            Number(target.dataset.count),
            Boolean(target.dataset.special)
        );
        console.log(`[DBG] tried to craft ${recipe.id}`);
    }
    if (!target.dataset.count) {
        const recipe = recipeIDs[recipeID];
        if (!recipe) {
            return;
        }
        craft(recipe, 1, Boolean(target.dataset.special));
        console.log(`[DBG] tried to craft ${recipe.id}`);
    }
});

await fetchRecipes();
buildRecipeMap();
renderCraftingButtons();

export {
    craftedOnce,
    flags,
    saveCrafting,
    loadCrafting,
    craft,
    fetchRecipes,
    renderCraftingButtons,
    recipes,
    recipeIDs,
};
console.log(`[DBG] loaded script ${import.meta.url}`);
