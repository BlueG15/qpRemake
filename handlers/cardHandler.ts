//manages the creation of cards
import type cardRegistry from "../data/cardRegistry"
import type card from "../baseClass/card"

class cardHandler {
    //instead of zone importing everything on creation
    //cardHandler import on request
    //to avoid potential...overhead...
    //its like 200 cards lmao
    cardCounterMap : Map<string, number> = new Map()
    cardReg : typeof cardRegistry
    constructor(cardReg : typeof cardRegistry){
        this.cardReg = cardReg
    }

    clear(){this.cardCounterMap.clear()}

    async requestCard(cardID : string){
        let cardClass = (await import(this.cardReg[cardID].importURL)).default
        let num : number
        if(this.cardCounterMap.has(cardID)){
            num = (this.cardCounterMap.get(cardID) as number) + 1
        } else {
            num = 0
        }
        this.cardCounterMap.set(cardID, num)
        return new cardClass(num) as card
    }
}

export default cardHandler