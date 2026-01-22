function weightedRandomChoice(
    choices: string[],
    weights: number[],
    count: number
): Record<string, number> {
    if (choices.length !== weights.length || choices.length === 0) {
        throw new Error(
            'Choices and weights arrays must be non-empty and have the same length.'
        );
    }
    if (count <= 0) return {};
    const cumulativeWeights: number[] = [];
    let totalWeight = 0;
    for (const weight of weights) {
        totalWeight += weight;
        cumulativeWeights.push(totalWeight);
    }
    const randomNumbers = Array.from({ length: count }, () => Math.random() * totalWeight);
    randomNumbers.sort((a, b) => a - b);
    const result: Record<string, number> = {};
    let choiceIndex = 0;

    for (const rand of randomNumbers) {
        while (rand >= cumulativeWeights[choiceIndex]) {
            choiceIndex++;
        }
        result[choices[choiceIndex]] = (result[choices[choiceIndex]] ?? 0) + 1;
    }

    return result;
}


export { weightedRandomChoice };
console.log(`[DBG] loaded script ${import.meta.url}`);