import { Card } from "../../game-components/cards";
import { EffectDataRegistry, type CardData, type CardDataUnified, type EffectData, type EffectDataID, type Setting } from "../../core";
import type effectLoader from "./effect-loader";
import { Effect } from "../../game-components/effects";

//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction sheme, similar to paging  
export default class cardLoader {

    private dataCache : Map<string, CardData> = new Map()
    private customClassCache : Map<string, typeof Card> = new Map()
    private countCache : Map<string, number> = new Map() 
    private effectHandler : effectLoader

    constructor(effectHandler : effectLoader){
        this.effectHandler = effectHandler
    }

    get classkeys() {
        return Array.from(this.customClassCache.keys())
    }

    get datakeys() {
        return Array.from(this.dataCache.keys())
    }

    load(key : string, data : CardData, c? : typeof Card | Record<string, typeof Card>){
        this.dataCache.set(key, data)
        if(c) {
            if(typeof c === "function") this.customClassCache.set(key, c);
            else {
                for(const key in Object.keys(c)){
                    this.customClassCache.set(key, c[key]);
                }
            }
        }
    }

    getCard(
        cid : string, 
        s : Setting, 
        variantid? : string[],
    ) : Card | undefined {
        let data = this.dataCache.get(cid)
        if(!data) return undefined

        let cclass = this.customClassCache.get(cid)
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

