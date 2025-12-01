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
const chances1 = [1/2, 1/3, 1/4,1/6,1/8,1/16,1/32]; //has to be in oreder or else   

function mine(){
    console.log(weightedRandomChoice(choices, chances));
}