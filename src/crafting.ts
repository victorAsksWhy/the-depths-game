import { inventoryRemove, inventoryGetAmount , inventory, inventorySet} from "./inventoryManager";
const craftedOnce = loadCrafting("craftedItems");
const flags = loadCrafting("flags");
console.log("DEBUG: Flags",flags);
console.log("DEBUG: crafted",craftedOnce);
let recipes : Recipe[]=[];
let recipeIDs : Record<string,Recipe>={};
export interface Recipe{
    id: string;
    humanName: string;
    inputs: Record<string,number>;
    outputs: Record<string,number>;
    flavorText: string;
    isSpecial: boolean;
    requires?:{
        items?: Record<string,number>; // these are not consumed.
        crafted?: string[];
        flags?: string[];
    };
    blockedBy?:{
        crafted?:string[];
        flags?: string[];
    };
    setsFlags?: string; 
}
function saveCrafting():void{
    try{
        localStorage.setItem(
            "craftedItems",
            JSON.stringify([...craftedOnce])
        );
    }
    catch(e){
        console.log("Failure")
    }
    console.log("Saving flags...")
    try{
        localStorage.setItem(
            "flags",
            JSON.stringify([...flags])
        );
    }
    catch(e){
        console.log("Failure")
    }
}
function loadCrafting(key: string): Set<string> {
  const raw = localStorage.getItem(key);
  if (!raw) return new Set<string>();

  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set<string>();
    return new Set<string>(arr);
  } catch {
    return new Set<string>();
  }
}
function isBlocked(recipe:Recipe):boolean{
    const disable = recipe.blockedBy;
    if (!disable){
        return false;
    }
    if (disable?.crafted){
        for (const craft of disable.crafted){
            if (craftedOnce.has(craft)){
                return true;
            };
        }
    }
    if(disable?.flags){
        for (const flag of disable.flags){
            if (flags.has(flag)){
                return true;
            }
        }
    }
    return false;
}
function meetsRequirements(recipe:Recipe):boolean{

    const req = recipe.requires;

    if (req === undefined){
        return true;
    }
    
    console.log(req);
    if (req!.items){ //check for items (not ingredients; these act as a gate and are not consumed.)
        for (const item in req!.items){
           if ((inventory[item] ?? 0) < req!.items[item]) {
                    return false;
            }

        }
    } //check for crafted item gate
    if (req!.crafted){
        for (const id of req!.crafted!){
            if(craftedOnce.has(id)){
                return false;
            }
        }
    }
    if(req!.flags){
        for (const flag of req!.flags!){
            if(!flags.has(flag)){
                return false;
            }
        }
    }
    return true;
}
function craft(recipe:Recipe, count:number):boolean{
    renderCraftingButtons();
    if(!meetsRequirements(recipe)){
        return false;
    }
    if(isBlocked(recipe)){
        console.log(isBlocked(recipe));
        return false;
    }
    for (const [itemName, amount] of Object.entries(recipe.inputs)){
        console.log(`[DBG] ${amount} of ${itemName} is needed.`);
        if(inventory[itemName]===undefined){
            return false;
        }
        if ((inventory[itemName]<amount*count)){
            console.error(`[DEBUG] not enough ${itemName}`);
            return false;
        }
        console.log(`[DEBUG] planning to remove ${amount*count} of ${itemName}`)
        if(inventoryRemove(itemName,amount*count)==false){
            return false;
        }
    }
    for (const [itemName, amount] of Object.entries(recipe.outputs)){
        console.log(`[DEBUG] planning to add ${amount*count} of ${itemName}`)
        inventorySet(itemName,amount*count);
    }
    if (recipe.setsFlags){
        for (const settingFlag of recipe.setsFlags){
            flags.add(settingFlag)
        }
    }
    craftedOnce.add(recipe.id);
    renderCraftingButtons();
    return true;
}
async function fetchRecipes():Promise<void>{
    try {
        const resource = await fetch('/public/recipe.json');
        console.log(`[DEBUG] Resource is a ${typeof resource}`);
        if (!resource.ok){
            alert("Critical error: failed to load recipes.");
            throw new Error("Failed to load recipes");
        }
        const data: Recipe[] = await resource.json();
        recipes = data;
        console.log(recipes);
        console.log(recipes[0]);
    } catch (e) {
        console.error(e);
    }
}
function buildRecipeMap(){
    for (const recipe of recipes){
        recipeIDs[recipe.id] = recipe;
    }
}
console.log(recipes);
function renderCraftingButtons(){
    const container = document.getElementById("craftingButtons");
    container!.innerHTML=""
    const targets : number[] = [1,5,10,25,50,100,250,500]
    for (const recipe of recipes){
        if (!meetsRequirements(recipe)){
            continue;
        }
        if(isBlocked(recipe)){
            continue;
        }
        for (const target of targets){
            const newButton = document.createElement("button");
            newButton.textContent = `${recipe.humanName} x${target}` ;
            newButton.dataset.recipeID=recipe.id;
            newButton.dataset.count=String(target);
            newButton.disabled=!meetsRequirements;
            container?.appendChild(newButton);
            container?.appendChild(document.createElement("br"));
        }

    }
}
const container = document.getElementById("craftingButtons");
container?.addEventListener("click", (event)=>{
    const target = event.target as HTMLButtonElement; // as type HTMLButton...
    if (target.tagName !== "BUTTON"){
        return;
    }
    const recipeID = target.dataset.recipeID!;
    const count = target.dataset.count!;
    const recipe = recipeIDs[recipeID];
    if (!recipe){
        return;
    }
    craft(recipe,Number(count));
});

await fetchRecipes();
buildRecipeMap();
renderCraftingButtons();
console.log(recipeIDs);

export {craftedOnce, flags, saveCrafting, loadCrafting, craft, fetchRecipes, renderCraftingButtons,recipes, recipeIDs}

