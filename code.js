inventory = {}
const FRAME_CAP = 30;
const FPS_INT = (1000/FRAME_CAP);
const SAVE_INT = 15 * 1000;
const retrieved = localStorage.getItem('inventory');
if (retrieved){
    inventory = JSON.parse(retrieved)
}
let timeSinceSave = 0;
lastTime =  performance.now();
function testFunction(){
    alert('something trigged testfunction!')
}
const mineButton = document.getElementById("mineButton");
let minePending = false;
let running = true;
mineButton.addEventListener('click', () =>{
    minePending=true;
});
function weightedRandomChoice(choices, weights) {
    if (choices.length !== weights.length || choices.length === 0) {
        throw new Error("Choices and weights arrays must be non-empty and have the same length.");
    }

    let cumulativeWeights = [];
    let currentCumulativeSum = 0;

    for (const weight of weights) {
        currentCumulativeSum += weight;
        cumulativeWeights.push(currentCumulativeSum);
    }

    const totalWeight = currentCumulativeSum;
    const randomNumber = Math.random() * totalWeight;
    for (let i = 0; i < choices.length; i++) {
        if (randomNumber < cumulativeWeights[i]) {
            return choices[i];
        }
    }

    return choices[choices.length - 1];
}


const layer1 = ['stone', 'coal', 'raw iron','raw copper','raw lead','raw tin','raw gold'];
const chances1 = [1/2, 1/3, 1/4,1/6,1/8,1/16,1/40]; //has to be in oreder or else   
function inventorySet(material,amount){
    if (material in inventory){
        inventory[material] += amount;
    }
    else{
        inventory[material]=amount;
    }
}
function mine(){
    const ore=(weightedRandomChoice(layer1, chances1))
    inventorySet(ore,1);
}
function inventoryGet() {
  const container = document.getElementById('dynamic');
  container.innerHTML = '';
  for (const key in inventory) {
    if (inventory.hasOwnProperty(key)) {
      const value = inventory[key];
      const pElement = document.createElement('p');
      pElement.textContent = `You have ${value} ${key}`;
      pElement.id="inventoryThingy";
      container.appendChild(pElement);
    }
  }
}
function inventoryRemove(material, amount, func){
    const toExecute = globalThis[func];
    if (inventory[material]>=amount){
        toExecute();
        inventory[material] -= amount
    }
    else{
        console.log(`Could not buy, not enough ${material}.`)
    }   
}
function update(delta){ //will not be good //what does delta mean
    // update first
    inventoryGet();
    //buttons go below 
    if (minePending){
        mine();
        minePending=false;
    }
}
function autosave(){
    console.log('saving...');
    try {
        localStorage.setItem('inventory',JSON.stringify(inventory));
        console.log('success!')
    } catch (e){
        console.log('failure!')
    }

}
function loop(cTime){
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
