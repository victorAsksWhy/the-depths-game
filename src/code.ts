import {inventoryGet, inventorySet, inventoryRemove, autosave} from './inventoryManager.ts'
import { weightedRandomChoice } from './random.ts';
//import {Inventory} from './inventoryManager.ts'
const FRAME_CAP = 30;
const FPS_INT = (1000/FRAME_CAP);
const SAVE_INT = 15 * 1000;
let timeSinceSave : number = 0;
let lastTime : number = performance.now();
function testFunction():void{
    alert('something trigged testfunction!')
}
const mineButton = document.getElementById("mineButton");
let minePending : boolean = false;
let running : boolean = true;
mineButton!.addEventListener('click', () =>{
    minePending=true;
});



const layer1 : string[] = ['stone', 'coal', 'raw iron','raw copper','raw lead','raw tin','raw gold'];
const chances1 : number[] = [1/2, 1/3, 1/4,1/6,1/8,1/16,1/40]; //has to be in oreder or else   
function mine(){
    const ore=(weightedRandomChoice(layer1, chances1))
    inventorySet(ore,1);
}
function update(){ //will not be good //what does delta mean
    // update first
    inventoryGet();
    //buttons go below 
    if (minePending){
        mine();
        minePending=false;
    }
}

function loop(cTime:number){
    requestAnimationFrame(loop);
    const elapsed = cTime - lastTime;
    if (!running){
        return;
    }
    if (elapsed > FPS_INT){
        update();
        lastTime = cTime - (elapsed % FPS_INT)
        if (cTime-timeSinceSave >= SAVE_INT){
            autosave();
            timeSinceSave = cTime;
        }
    }      
}
requestAnimationFrame((time) => {
    timeSinceSave = time;
    loop(time);
});