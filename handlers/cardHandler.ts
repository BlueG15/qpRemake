//manages the creation of cards
import type cardRegistry from "../data/cardRegistry"

import Card from "../baseClass/card"
import utils from "../baseClass/util"

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

    requestCard(cardID : string, isUpgraded: boolean = false){
        //let cardClass = (await import("../specificCard/" + this.cardReg[cardID].id)).default
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
        let runID = utils.generateID(this.randomIDLen);
        runID = cardID + '_' + runID + '_' + num;

        return new Card(runID, cardID, utils.collapseCardData(isUpgraded, this.cardReg[cardID]))
    }
}

export default cardHandler