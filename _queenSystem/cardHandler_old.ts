//manages the creation of cards
import type cardRegistry from "../types/data/old/old_file_for_reference/cardRegistry_old"
import utils from "../utils"
import type Card from "../types/abstract/gameComponents/card"
import { uniqueCardData, variantPatchData } from "../types/data/cardRegistry"

class cardHandler {
    //instead of zone importing everything on creation
    //cardHandler import on request
    //to avoid potential...overhead...
    //its like 200 cards lmao
    cardCounterMap : Map<string, number> = new Map()
    cardReg : typeof cardRegistry

    randomIDLen = 6;
 
    constructor(cardReg : typeof cardRegistry){
        this.cardReg = cardReg
    }

    clear(){this.cardCounterMap.clear()}

    async requestCard(cardID : string, variantID? : string){
        //ard is now a dynamic import again
        //card handles their own fucking effects
        //card effects is inside them now

        //ok the problem now is 
        //the handling of adding quick to effets to some variants

        //option 1: make a quick version of that effect with a different id (bad)
        //option 2: make the card have a switch case in its construtor that adds it
        //(better, but annoying)
        //option 3: assume variants just change stats, keep the stat file, 
        // the problem can be done by adding a new effect that gives subtypes to other effects
        //(most expandable, easiest, but harder for display purposes)

        //i think ima go with option 3, and remake the whole display idea
        //display data for effects is now extended to beyond texts
        //we making a full "fake effect" data type with this one

        //so is variants separated from isUpgraded?
        //on one hand, keeping them separated makes for variants having an upgraded version
        //saves on making variantA-normal and variantA-upgrade

        //on the other hand, merge them can lead to a more streamlined data structure for the stat file
        
        //why do we need variants anyway
        // 1. enemy variants, they act mostly the same with different stat and ai
        // 2. more upgrade levels

        //ok, so i think based on these 2 reasons, we merge the 2 system together, solely on reason 2 alone
        

        //why does this need to be card variant anyway, 
        //why not effect variant and now go through this change at all?

        //cause effects do not have a stat file
        //effect variants differ in code implementation, 
        //at that point its practically just adding a new effect
        // i am doing this solely to avoid that, make effects more modular indirectly

        //so to conclude:
        //+ variants differ only in constructor parameter, aka stat file entry
        //+ cards handles their own effect implementation in their file
        //(this comes at the cost of a card reusing some other card's effects, but its a normal sacrifice)
        //+ upgrade is a variant
        
        //TO DO :
        // update cardRegistry and cardData to reflect this change in structure
        // move variants to their own file, acts as patches on top of the original data
        // done

        // change effect display data to a different struct, 
        // still pass it through every sub-effect in their partition
        // but we have more data than just text, let sub-effects add display subttypes as well
        // this though, causes a decoupling between effects and display effects
        // ... acceptable sacrifice

        

        
        let num : number
        if(this.cardCounterMap.has(cardID)){
            num = (this.cardCounterMap.get(cardID) as number) + 1
        } else {
            num = 0
        }
        this.cardCounterMap.set(cardID, num)
        //generate random ID to append to the cardID
        let runID : string
        let cData = uniqueCardData[cardID]
        if(variantID && cData.variantList.includes(variantID)){
            runID = utils.dataIDToUniqueID(cardID, num, this.randomIDLen, variantID)
            let pData = variantPatchData[variantID];
            utils.patchCardData(cData, pData);
        } else {
            runID = utils.dataIDToUniqueID(cardID, num, this.randomIDLen)
        }
        let cardClass = await import("../specificCard/" + cardID) as typeof Card
        return new cardClass(runID, cardID, variantID, cData) 
    }
}

export default cardHandler