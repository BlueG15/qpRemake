//manages the creation of cards
import type cardRegistry from "../data/cardRegistry"

import Card from "../baseClass/card"
import utils from "../baseClass/util"
import effectHandler from "./effectHandler"

class cardHandler {
    //instead of zone importing everything on creation
    //cardHandler import on request
    //to avoid potential...overhead...
    //its like 200 cards lmao
    cardCounterMap : Map<string, number> = new Map()
    cardReg : typeof cardRegistry
    effHandler : effectHandler

    randomIDLen = 6;
 
    constructor(cardReg : typeof cardRegistry){
        this.cardReg = cardReg
        this.effHandler = new effectHandler()
    }

    clear(){this.cardCounterMap.clear()}

    async requestCard(cardID : string, isUpgraded: boolean = false){
        //card now no longer requires dynamic imports
        //only effects do
        let num : number
        if(this.cardCounterMap.has(cardID)){
            num = (this.cardCounterMap.get(cardID) as number) + 1
        } else {
            num = 0
        }
        this.cardCounterMap.set(cardID, num)

        //generate random ID to append to the cardID
        let runID = utils.dataIDToUniqueID(cardID, num, this.randomIDLen)

        let cData = utils.collapseCardData(isUpgraded, this.cardReg[cardID])
        let res = new Card(runID, cardID, cData)
        for(let i = 0; i < cData.effectIDs.length; i++){
            let e = await this.effHandler.requestEffect(cData.effectIDs[i]);
            res.effects.push(e)
        }
        return res
    }
}

export default cardHandler