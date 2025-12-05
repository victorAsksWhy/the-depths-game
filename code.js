inventory = {}
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


const layer1 = ['stone', 'coal', 'iron','copper','lead','tin','gold'];
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
  const container = document.getElementById('log');
  container.innerHTML = '';
  for (const key in inventory) {
    if (inventory.hasOwnProperty(key)) {
      const value = inventory[key];
      const pElement = document.createElement('p');
      pElement.textContent = `You have ${value} of ${key}`;
      pElement.id="inventoryThingy";
      container.appendChild(pElement);
    }
  }
}