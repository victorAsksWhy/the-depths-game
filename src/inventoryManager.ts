export type Inventory = Record<string,number>;
type Callback = () => void;
const inventory: Inventory = (()=>{
    const rawData = localStorage.getItem('inventory');
    if (!rawData) return Object.create(null);
    try{
        return JSON.parse(rawData) as Inventory;
    } catch {
        console.error("Save data failed to load")
        return Object.create(null);
    }

})();
function autosave(){
    console.log('saving...');
    try {
        localStorage.setItem('inventory',JSON.stringify(inventory));
        console.log('success!')
    } catch (e){
        console.log('failure!')
    }

}
function inventorySet(material:string,amount:number):void{
    if (material in inventory){
        inventory[material] += amount;
    }
    else{
        inventory[material]=amount;
    }
}
function inventoryGet():void {
    const container = document.getElementById('dynamic');
    container!.innerHTML = '';
    for (const key in inventory) {
        if (inventory.hasOwnProperty(key)) {
        const value = inventory[key];
        const pElement = document.createElement('p');
        pElement.textContent = `You have ${value} ${key}`;
        pElement.id="inventoryThingy";
        container!.appendChild(pElement);
        }
    }
}
function inventoryRemove(
    material:string,
    amount:number, 
    callback?:Callback
):  boolean {
    const amountOfItem = inventory[material] ?? 0;
    if (inventory[material]<amount){
        console.log(`Could not buy, not enough ${material}.`)
        return false;
        
    }
    inventory[material] -= amount
    if (callback){
        callback();
    }
    return true;
}

export {autosave, inventoryGet,inventoryRemove,inventorySet}