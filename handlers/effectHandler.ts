//manages the creation of effects
// import type cardRegistry from "../data/cardRegistry"

import type Effect from "../baseClass/effect"
import utils from "../baseClass/util"

class effectHandler {
    //also import on request
    effectCounterMap : Map<string, number> = new Map()
    randomIDLen = 6;
 
    constructor(){}

    clear(){this.effectCounterMap.clear()}

    async requestEffect(eID : string){
        let effectClass = (await import("../specificEffect/" + eID)).default

        let num : number
        if(this.effectCounterMap.has(eID)){
            num = (this.effectCounterMap.get(eID) as number) + 1
        } else {
            num = 0
        }
        this.effectCounterMap.set(eID, num)

        //generate random ID to append to the cardID
        let runID = utils.dataIDToUniqueID(eID, num, this.randomIDLen)

        return new effectClass(runID) as Effect
    }
}

export default effectHandler