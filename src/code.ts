import { inventoryGet, inventorySet, autosave } from './inventoryManager';
import { saveCrafting, fetchRecipes } from './crafting';
import { mine, chanceStringToNumberHelper } from './mining';
import { getLayerIndexByIdHelper, getLayerObjectByIdHelper, getCurrentDepthHelper,getCurrentLayerHelper } from './mining';
await fetchRecipes;
//import {Inventory} from './inventoryManager.ts'
const FRAME_CAP = 30;
const FPS_INT = 1000 / FRAME_CAP;
const SAVE_INT = 15 * 1000;
let timeSinceSave: number = 0;
let lastTime: number = performance.now();
function testFunction(): void {
    alert('something trigged testfunction!');
}
const mineButton = document.getElementById('mineButton');
const wipesave = document.getElementById('wipeSave');
const showFlags = document.getElementById('showFlags');
const showCrafted = document.getElementById('showCrafted');
const clearFlags = document.getElementById('clearFlags');
const clearCrafted = document.getElementById('clearCrafted');
const maxMaterials = document.getElementById('9999everything');
let minePending: boolean = false;
let running: boolean = true;
mineButton!.addEventListener('click', () => {
    minePending = true;
});
wipesave!.addEventListener('click', () => {
    localStorage.setItem('inventory', JSON.stringify([]));
    localStorage.setItem('craftedItems', JSON.stringify([]));
    localStorage.setItem('flags', JSON.stringify([]));
    localStorage.setItem('specialInventory', JSON.stringify([]));
    location.reload();
});
clearFlags!.addEventListener('click', () => {
    localStorage.setItem('flags', JSON.stringify([]));
    location.reload();
});
clearCrafted!.addEventListener('click', () => {
    localStorage.setItem('craftedItems', JSON.stringify([]));
    location.reload();
});
showFlags!.addEventListener('click', () => {
    alert(localStorage.getItem('flags'));
});
showCrafted!.addEventListener('click', () => {
    chanceStringToNumberHelper();
});
maxMaterials!.addEventListener('click', () => {
    for (const material of layer1) {
        inventorySet(material, 9999, false);
    }
});
const layer1: string[] = [
    'stone',
    'coal',
    'raw iron',
    'raw copper',
    'raw lead',
    'raw tin',
    'raw gold',
];
const chances1: number[] = [1 / 2, 1 / 3, 1 / 4, 1 / 6, 1 / 8, 1 / 16, 1 / 40]; //has to be in oreder or else

function update() {
    //will not be good //what does delta mean
    // update first
    inventoryGet();
    //renderCraftingButtons();
    //buttons go below
    if (minePending) {
        mine();
        minePending = false;
    }
}
function loop(cTime: number) {
    requestAnimationFrame(loop);
    const elapsed = cTime - lastTime;
    if (!running) {
        return;
    }
    if (elapsed > FPS_INT) {
        update();
        lastTime = cTime - (elapsed % FPS_INT);
        if (cTime - timeSinceSave >= SAVE_INT) {
            autosave();
            saveCrafting();
            timeSinceSave = cTime;
        }
    }
}
requestAnimationFrame((time) => {
    timeSinceSave = time;
    loop(time);
});
console.log(`[DBG] loaded script ${import.meta.url}`);
