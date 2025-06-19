import Card from "../../types/abstract/gameComponents/card";
import type { cardData, cardData_unified } from "../../data/cardRegistry";
import type effectLoader from "./loader_effect";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type Effect from "../../types/abstract/gameComponents/effect";
import utils from "../../utils";

//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction sheme, similar to paging  
export default class cardLoader {

    private dataCache : Map<string, cardData> = new Map()
    private customClassCache : Map<string, typeof Card> = new Map()
    private countCache : Map<string, number> = new Map() 
    private effectHandler : effectLoader

    constructor(effectHandler : effectLoader){
        this.effectHandler = effectHandler
    }

    load(key : string, data : cardData, c? : typeof Card){
        this.dataCache.set(key, data)
        if(c) this.customClassCache.set(key, c);
    }

    getCard(cid : string, s : Setting, variantid? : string[]){
        let data = this.dataCache.get(cid)
        if(!data) return undefined

        let cclass = this.customClassCache.get(cid)
        if(!cclass) cclass = Card

        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c); 

        let runID = variantid ? utils.dataIDToUniqueID(cid, c, s, ...variantid) : utils.dataIDToUniqueID(cid, c, s);
        let baseData = data.variantData.base

        let d : cardData_unified = {
            id : runID, 
            dataID : cid,
            variants : variantid ?? ["base"],
            ...baseData
        }

        if(variantid){
            variantid.forEach(i => {
                utils.patchCardData(d, data.variantData[i])
            })
        }
        
        let effArr : Effect[] = []
        Object.keys(d.effects).forEach(i => {
            let e = this.effectHandler.getEffect(i, s, d);
            if(e) effArr.push(e);
            // else console.log(`Effect id not found: ${i}\n`)
        })
        
        if(effArr.length != Object.keys(d.effects).length && !s.ignore_undefined_effect){
            return undefined
        }

        // console.log(`
        //     debug log: loading card ${cid}, loaded ${effArr.length} effects\n`)
    
        return new cclass(s, d, effArr)
    }
}

