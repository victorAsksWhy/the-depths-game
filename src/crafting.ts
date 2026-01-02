import { inventoryRemove, inventoryGetAmount , inventory, inventorySet} from "./inventoryManager";
const craftedOnce = loadCrafting("craftedItems");
const flags = loadCrafting("flags");
let recipes : Recipe[]=[];
let recipeIDs : Record<string,Recipe>={};
export interface Recipe{
    id: string;
    humanName: string;
    inputs: Record<string,number>;
    outputs: Record<string,number>;
    requires?:{
        items?: Record<string,number>; // these are not consumed.
        crafted?: string[];
        flags?: string[];
    };
}
function saveCrafting():void{
    console.log('Saving crafted items...')
    try{
        localStorage.setItem(
            "craftedItems",
            JSON.stringify([...craftedOnce])
        );
        console.log("Sucess!");
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
        console.log("Sucess!");
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
function craft(recipe:Recipe){
    if(!meetsRequirements(recipe)){
        return false;
    }   
    for (const items in recipe.inputs){
        const amount = recipe.inputs[items];
        const itemName = items;
        console.log(`[DEBUG] planning to remove ${amount} of ${itemName}`)
        inventoryRemove(itemName,amount);
    }
    for (const outputs in recipe.outputs){
        console.log(`[DEBUG] planning to add ${recipe.outputs[outputs]} of ${outputs}`)
        inventorySet(outputs,recipe.outputs[outputs]);
    }

}
async function fetchRecipes():Promise<void>{
    try {
        const resource = await fetch('/src/recipe.json');
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

    for (const recipe of recipes){
        if (!meetsRequirements(recipe)){
            continue;
        }
        const newButton = document.createElement("button");
        newButton.textContent = recipe.humanName;
        newButton.dataset.recipeID=recipe.id;
        newButton.disabled=!meetsRequirements;
        container?.appendChild(newButton);
    }
}
const container = document.getElementById("craftingButtons");
container?.addEventListener("click", (event)=>{
    const target = event.target as HTMLButtonElement; // as type HTMLButton...
    if (target.tagName !== "BUTTON"){
        return;
    }
    const recipeID = target.dataset.recipeID!;
    const recipe = recipeIDs[recipeID];
    if (!recipe){
        return;
    }
    craft(recipe);
});

await fetchRecipes();
buildRecipeMap();
renderCraftingButtons();
console.log(recipeIDs);

export {craftedOnce, flags, saveCrafting, loadCrafting, meetsRequirements, craft, fetchRecipes, recipes, recipeIDs}

