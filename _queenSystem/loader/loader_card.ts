import Card from "../../types/gameComponents/card";
import type { cardData, cardData_unified, effectData } from "../../data/cardRegistry";
import type effectLoader from "./loader_effect";
import type { Setting } from "../../types/gameComponents/settings";
import Effect from "../../types/gameComponents/effect";

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

    get classkeys() {
        return Array.from(this.customClassCache.keys())
    }

    get datakeys() {
        return Array.from(this.dataCache.keys())
    }

    load(key : string, data : cardData, c? : typeof Card | Record<string, typeof Card>){
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
        dataOnly? : false
    ) : Card;
    getCard(
        cid : string, 
        s : Setting, 
        variantid : string[],
        dataOnly : true
    ) : Omit<cardData_unified, "effects"> & {effects : effectData[]};
    getCard(
        cid : string, 
        s : Setting, 
        variantid? : string[],
        dataOnly = false
    ){
        let data = this.dataCache.get(cid)
        if(!data) return undefined

        let cclass = this.customClassCache.get(cid)
        if(!cclass) cclass = Card

        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        if(!dataOnly) this.countCache.set(cid, c); 

        let runID = variantid ? Utils.dataIDToUniqueID(cid, c, s, ...variantid) : Utils.dataIDToUniqueID(cid, c, s);

        if(!data.variantData) {
            console.log("invalid data somehow", JSON.stringify(data))
            return undefined
        }

        let baseData = data.variantData.base

        let d : cardData_unified = {
            id : runID, 
            dataID : cid,
            variants : variantid ?? ["base"],
            ...baseData
        }

        if(variantid){
            variantid.forEach(i => {
                Utils.patchCardData(d, data.variantData[i])
            })
        }
        
        let effArr : Effect [] = []
        let effDataArr : effectData[] = []
        Object.keys(d.effects).forEach(i => {
            const eObj : effectData & {
                __loadOptions? : {
                    ___internalMultipleLoadCount? : number,
                    __additionalPatches?: Partial<effectData>[]
                }
            } | undefined = (d.effects as any)[i]

            function Load(t : cardLoader, eObj : Partial<effectData> | undefined){
                // console.log("Trying to load eff: ", JSON.stringify(eObj))
                let e = t.effectHandler.getEffect(i, s, eObj, dataOnly);
                if(!e) return console.log(`Effect id not found: ${i}\n`);
                if(e instanceof Effect) effArr.push(e);
                else effDataArr.push(e)
            }

            if(eObj && typeof eObj.__loadOptions === "object"){
                if(eObj.__loadOptions.___internalMultipleLoadCount || eObj.__loadOptions.__additionalPatches){
                    let t1 = eObj.__loadOptions.___internalMultipleLoadCount ?? 0
                    let t2 = (eObj.__loadOptions.__additionalPatches ?? []).length

                    let t = Math.max(t1, t2);
                    
                    if(!Number.isFinite(t)) console.log(
                        "Trying to load an infinite ammounnt of effects: ", cid, eObj
                    ); else if(t > 0) {
                        for(let z = 0; z < t; z++){
                            Load(this, eObj.__loadOptions.__additionalPatches ? eObj.__loadOptions.__additionalPatches[z] : eObj)
                        }
                    }
                }
            } else {
                Load(this, eObj)
            }
            
        })
        
        if(effArr.length != Object.keys(d.effects).length && !s.ignore_undefined_effect){
            return undefined
        }

        // console.log(`
        //     debug log: loading card ${cid}, loaded ${effArr.length} effects\n`)
    
        if(dataOnly) {
            const res = d as any as Omit<cardData_unified, "effects"> & {effects : effectData[]}
            res.effects = effDataArr
            return res
        }
        return new cclass(s, d, effArr)
    }

    getDirect(cid : string, s : Setting, ...eff : Effect<any>[]){
        //default partiton scheme: all eff into one partiton

        let data = this.dataCache.get("c_test")
        if(!data) return undefined

        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c); 

        let runID = Utils.dataIDToUniqueID(cid, c, s);
        let baseData = data.variantData.base

        let d : cardData_unified = {
            id : runID, 
            dataID : cid,
            variants : ["base"],
            ...baseData
        }

        d.effects = Object.fromEntries( eff.map(e => [e.dataID, e.originalData]) )
        return new Card(s, d, eff)
    }
}

