import { Card } from "../../game-components/cards";
import { CardDataRegistry, EffectDataRegistry, type CardData, type CardDataID, type CardDataUnified, type EffectData, type EffectDataID, type Setting } from "../../core";
import type EffectLoader from "./effect-loader";
import { Effect } from "../../game-components/effects";

//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction sheme, similar to paging  
export default class CardLoader {

    private classCache = new Map<CardDataID, new (...p : ConstructorParameters<typeof Card>) => Card>()
    private countCache = new Map<CardDataID, number>() 
    private effectHandler : EffectLoader

    constructor(effectHandler : EffectLoader){
        this.effectHandler = effectHandler
    }

    load(key : string, data : CardData, c? : new (...p : ConstructorParameters<typeof Card>) => Card){
        const id = CardDataRegistry.add(key, data)
        if(c) {
            this.classCache.set(id, c);
        }
    }

    getCard(
        cid : CardDataID, 
        s : Setting, 
        variantid? : string[],
    ) : Card | undefined {
        let data = CardDataRegistry.getData(cid)
        if(!data) return undefined

        let cclass = this.classCache.get(cid)
        if(!cclass) cclass = Card

        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c); 

        let runID = variantid ? Utils.dataIDToUniqueID(cid, c, s, ...variantid) : Utils.dataIDToUniqueID(cid, c, s);

        if(!data.variantData) {
            console.log("invalid data somehow", JSON.stringify(data))
            return undefined
        }

        let baseData = data.variantData.base

        let d : CardDataUnified = {
            id : runID, 
            dataID : cid,
            variants : variantid ?? ["base"],
            ...baseData
        }

        if(variantid){
            variantid.forEach(i => {
                const pdata = data.variantData[i]
                if(pdata){
                    Utils.patchCardData(d, pdata)
                }
            })
        }
        
        let effArr : Effect [] = []
        // let effDataArr : EffectData[] = []
        d.effects.forEach(i => {
            let dataID : EffectDataID
            let dataObj : Partial<EffectData> | undefined
            if(Array.isArray(i)){
                dataID = i[0]
                dataObj = i[1]
            } else {
                dataID = i
            }

            const eObj : EffectData | undefined = EffectDataRegistry.getData(dataID);
            if(dataObj) Utils.patchGeneric(eObj, dataObj);

            // console.log("Trying to load eff: ", JSON.stringify(eObj))
            let e = this.effectHandler.getEffect(dataID, s, eObj);
            if(!e) return console.log(`Effect id not found: ${i}\n`);

            effArr.push(e);
        })
        
        if(effArr.length != Object.keys(d.effects).length && !s.ignore_undefined_effect){
            return undefined
        }

        return new cclass(s, d, effArr)
    }
}

