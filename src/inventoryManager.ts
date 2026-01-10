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
    localStorage.setItem('inventory',JSON.stringify(inventory));
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
        if (Object.prototype.hasOwnProperty.call(inventory,key)) {
            const value = inventory[key];
            const pElement = document.createElement('p');
            pElement.textContent = `You have ${value} ${key}`;
            pElement.id="inventoryThingy";
            container!.appendChild(pElement);
        }
    }
}
/**
 * Remove items from the inventory. Use inventory[item] -= x instead.
 * 
 * @param material material to remove
 * @param amount amount to remove
 * @param callback function to call on sucess
 * @returns 
 */
function inventoryRemove(
    material:string,
    amount:number, 
):  boolean {
    const amountOfItem = inventory[material] ?? 0;
    if (inventory[material]<amount){
        console.log(`Could not buy, not enough ${material}.`)
        return false;
    }
    inventory[material] -= amount
    return true;
}
function inventoryGetAmount(material:string):number{
    return inventory[material] ?? 0;
}
export {autosave, inventoryGet,inventoryRemove,inventorySet, inventoryGetAmount, inventory}