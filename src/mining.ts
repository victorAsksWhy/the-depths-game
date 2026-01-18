import { inventorySet, inventoryCheck } from './inventoryManager';
import { weightedRandomChoice } from './random';
export interface Layer {
    minDepth: number;
    humanName: string;
    id: string;
    flavorText: string;
    associatedOres: string[];
    associatedChances: string[] | number[]; //later converted to number
}
let layers: Layer[] = [];
let currentLayer: number = 0;
let depth: number = 0;
export function increaseDepth(amount: number) { // will need to expand on this later
    depth += amount;
}
export function getLayerObjectByIdHelper(id: string): Layer | undefined {
    return layers.find((layer) => layer.id === id);
}
export function getLayerIndexByIdHelper(id: string): number | undefined {
    return layers.findIndex((layer) => layer.id === id);
}
export function getCurrentDepthHelper():number{
    return depth;
}
export function getCurrentLayerHelper():number{
    return currentLayer;
}
export function changeLayer(desiredLayer: Layer): boolean {
    if (depth >= desiredLayer.minDepth) {
        currentLayer = getLayerIndexByIdHelper(desiredLayer.id);
        return true;
    } else {
        return false;
    }
}
function calculateMinePower(): number {
    let power: number = 1;
    if (inventoryCheck('Iron Pickaxe')) {
        power += 1;
    }
    return power;
}
export function mine() {
    let power = calculateMinePower();
    while (power > 0) {
        const ore = weightedRandomChoice(layers[currentLayer].associatedOres,layers[currentLayer].associatedChances as number[]);
        inventorySet(ore, 1, false);
        power--;
    }
    power = 0;
}
async function fetchDepths(): Promise<void> {
    try {
        const resource = await fetch('/depthThresholds.json');
        const out = await resource.json();
        for (const o of out) {
            layers.push(o);
        }
    } catch (e) {
        console.error(e);
    }
}
function parseChances(chance: string): number {
    const match = chance.match(/^\s*1\s*\/\s*([1-9]\d*)\s*$/);
    if (!match) {
        throw new Error(`Invalid format in ${match}`);
    }
    const denominator = Number(match[1]);
    return 1 / denominator;
}
export function chanceStringToNumberHelper() {
    for (const layer in layers) {
        for (const chance in layers[layer].associatedChances) {
            layers[layer].associatedChances[chance] = parseChances(
                layers[layer].associatedChances[chance] as string
            );
        }
        console.log(
            `[DBG] Chances of ${layers[layer]}: ${layers[layer].associatedChances} which is ${typeof layers[layer].associatedChances}`
        );
    }
}
async function init() {
    await fetchDepths();
    chanceStringToNumberHelper();
    console.log(`[DBG] ran conversion script`);
}
console.log(`[DBG] loaded script ${import.meta.url}`);
window.addEventListener('DOMContentLoaded', async () => {
    await init();
});
