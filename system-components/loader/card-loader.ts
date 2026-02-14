import { Card, CardDataWithVariantKeys } from "../../game-components/cards";
import { CardDataRegistry, CardPatchData, CardPatchDataFull, type CardDataID, type CardDataUnified, type EffectData, type EffectDataID, type Setting } from "../../core";
import type EffectLoader from "./effect-loader";
import { Effect } from "../../game-components/effects";
import { DoubleKeyRegistry, Registry } from "../../core/registry/base";

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

    loadClass(id : CardDataID, c : new (...p : ConstructorParameters<typeof Card>) => Card){
        this.classCache.set(id, c)
    }

    loadNew(key : string, data : CardPatchDataFull, c? : new (...p : ConstructorParameters<typeof Card>) => Card){
        const id = DoubleKeyRegistry.addNew(CardDataRegistry, key, data)
        if(c) {
            this.loadClass(id, c);
        }
        return id
    }

    loadNewVariantData(id : CardDataID, variantName : string, data : CardPatchData){
        DoubleKeyRegistry.addExisting(CardDataRegistry, id, variantName, data)
    }

    loadBulk(key : string, data : CardDataWithVariantKeys, c? : new (...p : ConstructorParameters<typeof Card>) => Card){
        const id = DoubleKeyRegistry.addBulk(CardDataRegistry, key, data)
        if(c) {
            this.loadClass(id, c);
        }
        return id
    }

    getCard(
        cid : CardDataID, 
        s : Setting, 
        variantid : string[] = ["base"],
    ) : Card | undefined {
        let data = CardDataRegistry.getAllData(cid)
        if(!data) return;

        let baseData = data[CardDataRegistry.getBaseKey()]
        if(!baseData){
            console.log("In Card loader, Invalid data somehow, no base", JSON.stringify(baseData))
            return undefined
        }

        let cclass = this.classCache.get(cid)
        if(!cclass) cclass = Card

        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c); 

        let runID = variantid ? Utils.formatDataIDtoUniqueID(cid, c, s, ...variantid) : Utils.formatDataIDtoUniqueID(cid, c, s);

        let d : CardDataUnified = {
            id : runID, 
            dataID : cid,
            variants : variantid,
            ...baseData
        }

        const patchDatas = variantid ? variantid.flatMap(id => CardDataRegistry.isBaseKey(id) ? [] : data[id]) : []
        if(patchDatas.length) d = Utils.patch<CardDataUnified>(d, ...patchDatas);
        
        let effArr : Effect [] = d.effects.flatMap(i => {
            let dataID : EffectDataID
            let dataObj : Partial<EffectData> | undefined
            if(Array.isArray(i)){
                dataID = i[0]
                dataObj = i[1]
            } else {
                dataID = i
            }

            // console.log("Trying to load eff: ", JSON.stringify(eObj))
            let e = this.effectHandler.getEffect(dataID, variantid, s, dataObj);
            if(!e){
                if(s.ignore_undefined_effect) return [];
                throw new Error(`In Card loader, Effect id not found: ${i}`);
            } 

            return e;
        })

        return new cclass(s, d, effArr)
    }
}

