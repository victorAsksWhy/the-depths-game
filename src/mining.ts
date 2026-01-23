import {
    inventorySet,
    inventoryCheck,
    fetchSpecialInventory,
    inventorySetBulk,
} from './inventoryManager';
import { weightedRandomChoice } from './random';
export interface Layer {
    minDepth: number;
    humanName: string;
    id: string;
    flavorText: string;
    associatedOres: string[];
    associatedChances: string[] | number[]; //later converted to number
}
export enum DiggingToolType {
    Pickaxe = 'pickaxe',
    Drill = 'drill',
}
export interface DiggingTool {
    name: string;
    type: DiggingToolType;
    power: number;
}
export let totalPickaxePower: number = 1;
export let totalDrillPower: number = 0;
let layers: Layer[] = [];
let currentLayer: number = 0;
let depth: number = 0;
export function increaseDepth(amount: number) {
    // will need to expand on this later
    depth += amount;
}
export function getLayerObjectByIdHelper(id: string): Layer | undefined {
    return layers.find((layer) => layer.id === id);
}
export function getLayerIndexByIdHelper(id: string): number | undefined {
    return layers.findIndex((layer) => layer.id === id);
}
export function getCurrentDepthHelper(): number {
    return depth;
}
export function getCurrentLayerHelper(): number {
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
export async function calculateBurrowingPower() {
    let power: number = 1;
    const gear = Object.keys(fetchSpecialInventory());
    for (const item in gear) {
        let type = await fetchDiggingType(item);
        if (type === DiggingToolType.Drill) {
            totalDrillPower += await fetchDiggingPower(item);
            console.log(`[DBG] total drilling power: ${totalDrillPower}`);
        } else if (type === DiggingToolType.Pickaxe) {
            totalPickaxePower += await fetchDiggingPower(item[0]);
            console.log(`[DBG] total pickaxe power: ${totalPickaxePower}`);
        }
        power += await fetchDiggingPower(item);
    }
}
export function mine() {
    console.log(layers);
    console.log(typeof layers)
    console.log(layers[currentLayer]);
    let power = totalPickaxePower;
    try{    
        const ore = weightedRandomChoice(
        layers[currentLayer].associatedOres,
        layers[currentLayer].associatedChances as number[],
        power)
        inventorySetBulk(ore, false);
    } catch (error){
        console.error("CRITICAL ERROR, ABORTING", error);
        return false;
    }


}
export async function fetchDepths(): Promise<void> {
    try {
        const resource = await fetch('/data/depthThresholds.json');
        const out = await resource.json();
        for (const o of out) {
            layers.push(o);
        }
    } catch (e) {
        console.error(e);
    }
}
export async function fetchDiggingPower(name): Promise<number> {
    try {
        const resource = await fetch('/data/diggingTools.json');
        const out = (await resource.json()) as DiggingTool[];
        return out[name].power;
    } catch (e) {
        console.error(e);
    }
}
export async function fetchDiggingType(
    name: string
): Promise<DiggingToolType | undefined> {
    try {
        const resource = await fetch('/data/diggingTools.json');
        const out = (await resource.json()) as DiggingTool[];

        // Find tool by name
        const tool = out.find((t) => t.name === name);

        if (!tool) {
            console.error(`Tool not found: ${name}`);
            return undefined;
        }
        if (!Object.values(DiggingToolType).includes(tool.type)) {
            console.error(`Invalid tool type in JSON: ${tool.type}`);
            return undefined;
        }

        return tool.type as DiggingToolType;
    } catch (e) {
        console.error(e);
        return undefined;
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
console.log(`[DBG] loaded script ${import.meta.url}`);
export async function init(){
    fetchDepths();

}
init();
