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
import { Howl, Howler } from 'howler';
const out = await (await fetch('/data/diggingTools.json')).json();
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
const mineSound = new Howl({
    src: ['/public/minesound.wav'],
    volume: 0.05,
});
let layerKeepChancesAsString: string[][] = [];
export function getLayerObjectByIdHelper(id: string): Layer | undefined {
    return layers.find((layer) => layer.id === id);
}
export function getLayerIndexByIdHelper(id: string): number | undefined {
    return layers.findIndex((layer) => layer.id === id);
}
export async function getToolIndexByNameHelper(
    name: string
): Promise<number> | undefined {
    const output = out as DiggingTool[];
    return output.findIndex((tool) => tool.name === name);
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
    updateOresInLayerDisplay(); //can be called only when switiching layers. Does not change otherwise (hopefully).
}
export async function calculateBurrowingPower() {
    let power: number = 1;
    let accumulatedPickaxePower = 0;
    let accumulatedDrillPower = 0;
    const gear = Object.keys(fetchSpecialInventory());
    for (const item of gear) {
        let type = await fetchDiggingType(item);

        if (type === DiggingToolType.Drill) {
            accumulatedDrillPower += Number(await fetchDiggingPower(item));
        } else if (type === DiggingToolType.Pickaxe) {
            accumulatedPickaxePower += (await fetchDiggingPower(
                item
            )) as number;
        }
        power += (await fetchDiggingPower(item)) as number;
    }
    totalDrillPower = accumulatedDrillPower;
    totalPickaxePower = accumulatedPickaxePower;
}
export function mine() {
    let power = totalPickaxePower;

    try {
        const ore = weightedRandomChoice(
            layers[currentLayer].associatedOres,
            layers[currentLayer].associatedChances as number[],
            power
        );

        inventorySetBulk(ore, false);
        mineSound.play();
    } catch (error) {
        console.error('CRITICAL ERROR, ABORTING', error);
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
export async function fetchDiggingPower(name): Promise<number | boolean> {
    try {
        const index = await getToolIndexByNameHelper(name);
        if (index === -1) {
            return false;
        }
        return out[index].power;
    } catch (e) {
        console.error(e);
    }
}
export async function fetchDiggingType(
    name: string
): Promise<DiggingToolType | undefined> {
    try {
        // Find tool by name
        const tool = out.find((t) => t.name === name);

        if (!tool) {
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
        layerKeepChancesAsString.push(
            layers[layer].associatedChances as string[]
        );
        for (const chance in layers[layer].associatedChances) {
            layers[layer].associatedChances[chance] = parseChances(
                layers[layer].associatedChances[chance] as string
            );
        }
    }
}
export async function updateDepth() {
    updateDiggingStats();
    await calculateBurrowingPower();
    const infoBox = document.getElementById('depthInfoBox');
    infoBox.innerHTML = `You are ${depth} meters deep. You are getting depth at a rate of ${totalDrillPower} m/s, and the next layer, ${layers[currentLayer + 1].humanName}, is at ${layers[currentLayer + 1].minDepth} meters.`;
}
function updateDiggingStats() {
    console.log(totalPickaxePower);
    const infoBox = document.getElementById('mineButtonText');
    const layerInfoBox = document.getElementById('mineButtonLayerText');
    if (totalPickaxePower === 1) {
        infoBox.innerHTML = `Mine for materials`;
    } else {
        infoBox.innerHTML = `Mine for ${totalPickaxePower} materials`;
    }
    layerInfoBox.innerHTML = `You are on the layer ${layers[currentLayer].humanName}. This layer has the following ores:`;
}
export function updateOresInLayerDisplay() {
    const depthInfoContainer = document.getElementById('depthInfo');
    const tableContainerContainer = document.getElementById('depthOres');
    tableContainerContainer.innerHTML = '';
    const tableContainer = document.createElement('table');
    const tableHeaderOre = document.createElement('th');
    const tableHeaderChance = document.createElement('th');
    tableHeaderOre.innerHTML = 'Ore';
    tableHeaderChance.innerHTML = 'Chance';
    const tableRowHeaders = document.createElement('tr');
    tableRowHeaders.appendChild(tableHeaderOre);
    tableRowHeaders.appendChild(tableHeaderChance);

    tableContainer.appendChild(tableRowHeaders);
    tableContainerContainer.appendChild(tableContainer);
    for (const ore of layers[currentLayer].associatedOres) {
        const newRow = document.createElement('tr');
        const oreNameIndicator = document.createElement('td');
        oreNameIndicator.innerHTML = ore;
        newRow.appendChild(oreNameIndicator);
        tableContainer.appendChild(newRow);
    }
}
export function dig() {
    //different from mining
    if (totalDrillPower === 0) {
        return false;
    }
    depth += totalDrillPower;
}
console.log(`[DBG] loaded script ${import.meta.url}`);
export async function init() {
    await fetchDepths();
    chanceStringToNumberHelper();
    await updateDepth();
    updateOresInLayerDisplay();
    updateDiggingStats();
}
init();
