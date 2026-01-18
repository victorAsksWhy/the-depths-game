import {
    inventoryGet,
    inventorySet,
    inventoryRemove,
    autosave,
    inventoryGetAmount,
    inventory,
    specialInventory,
    inventoryCheck,
} from './inventoryManager';
import { weightedRandomChoice } from './random';
import {
    craftedOnce,
    flags,
    saveCrafting,
    loadCrafting,
    craft,
    fetchRecipes,
    recipes,
    recipeIDs,
    renderCraftingButtons,
} from './crafting';
export interface Layer {
    minDepth: number;
    humanName: string;
    id: string;
    flavorText:string;
    associatedOres:string[];
    associatedChances:string[]; //later converted to number
}
let layers:Layer[]=[];
let currentLayer:number=0;
function calculateMinePower(): number {
    let power: number = 1;
    if (inventoryCheck('Iron Pickaxe')) {
        power += 1;
    }
    return power;
}
`export function mine() {
    let power = calculateMinePower();
    while (power > 0) {
        const ore = weightedRandomChoice(layer1, chances1);
        inventorySet(ore, 1, false);
        power--;
    }
    power = 0;
}`
async function fetchDepths(): Promise<void> {
    try {
        const resource = await fetch('/depthThresholds.json');
        const out = await resource.json();
        layers.push(out);
        //console.log(layers[0][0]); //always the extra 0
    } catch (e) {
        console.error(e);
    }
}
function parseChances(chance:string):number{
    const match = chance.match(/^\s*1\s*\/\s*([1-9]\d*)\s*$/);
    if(!match){
        throw new Error(`Invalid format in ${match}`);
    }
    const denominator = Number(match[1]);
    return 1/denominator;
}
fetchDepths();
