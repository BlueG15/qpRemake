import Effect from "../../types/abstract/gameComponents/effect";
import type { cardData_unified, effectData } from "../../data/cardRegistry";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type subtypeLoader from "./loader_subtype";
import type typeLoader from "./loader_type";
import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import type effectDataRegistry from "../../data/effectRegistry";

//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction scheme, similar to paging  
export default class effectLoader {

    private dataCache : Map<string, effectData>
    private classCache : Map<string, typeof Effect | Function> = new Map()
    private countCache : Map<string, number> = new Map()

    private subtypeLoader : subtypeLoader
    private typeLoader : typeLoader

    constructor(
        dataRegistry : Record<string, effectData> | typeof effectDataRegistry, 
        subtypeLoader : subtypeLoader,
        typeLoader : typeLoader,
    ){
        this.dataCache = new Map(Object.entries(dataRegistry))
        this.subtypeLoader = subtypeLoader
        this.typeLoader = typeLoader
    }

    get classkeys() {
        return Array.from(this.classCache.keys())
    }

    get datakeys() {
        return Array.from(this.dataCache.keys())
    }

    private async loadSingle(path : string, eid : string, s : Setting){
        const obj = (await import(path + eid)).default

        if(typeof obj === "function"){
            this.classCache.set(
                eid, obj
            )
        } else if (typeof obj === "object"){
            Object.keys(obj).forEach(k => {
                if(typeof obj[k] === "function") {
                    this.classCache.set(k, obj[k]);
                }
            })
        }
    }

    async load(s : Setting) : Promise<void>{
        let path = s.effectFolder
        if(!path.endsWith("/")) path += "/"
        let arr : Promise<void>[] = []

        s.effectFiles.forEach(eid => {
            arr.push(this.loadSingle(path, eid, s));
        })

        await Promise.all(arr)
    };

    add(key : string, data : effectData) : void;
    add(key : string, constructor : typeof Effect) : void;
    add(key : string, param : effectData | typeof Effect){
        if(typeof param == "function"){
            this.classCache.set(key, param)
        } else {
            this.dataCache.set(key, param);
        }
    }

    //most hacky fix ever
    //ahhhh
    //TODO : find a better solution
    private validator(x : Function) : x is typeof Effect {
        try {
            x()
            return false
        } catch(e : any){
            try{
                return (e as Error).message.includes("cannot be invoked without 'new'")
            } catch(e : any){
                return false
            }
        }
    }

    getEffect(eid : keyof typeof effectDataRegistry, s : Setting, edata? : Partial<effectData>) : Effect
    getEffect(eid : string, s : Setting, edata? : Partial<effectData>) : Effect | undefined

    getEffect(eid : keyof typeof effectDataRegistry, s : Setting, edata : Partial<effectData>, dataOnly : true) : effectData
    getEffect(eid : string, s : Setting, edata : Partial<effectData>, dataOnly : true) : effectData | undefined

    getEffect(eid : string, s : Setting, edata? : Partial<effectData>, dataOnly? : boolean) : effectData | Effect | undefined

    getEffect(eid : string, s : Setting, edata? : Partial<effectData>, dataOnly = false) : Effect | effectData | undefined{
        let data = this.dataCache.get(eid)
        if(!data) return undefined

        if(edata) Utils.patchGeneric(data, edata);
        if(dataOnly) return data

        let eclass = this.classCache.get(eid)
        if(!eclass) {console.log("No class Data for key ", eid); return undefined}

        return this.getDirect(eid, s, eclass, data)
    }

    getDirect(eid : string, s : Setting, eclass : typeof Effect | Function, data : effectData){
        let c = this.countCache.get(eid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(eid, c); 

        //load type
        let type = this.typeLoader.getType(data.typeID, s, eid)
        if(!type) return undefined

        let runID = Utils.dataIDToUniqueID(eid, c, s, ...data.subTypeIDs)
            
        //load subtypes
        let k : effectSubtype[] = []
        data.subTypeIDs.forEach(i => {
            let st = this.subtypeLoader.getSubtype(i, s, eid)
            if(st) k.push(st);
        })

        if(k.length != data.subTypeIDs.length && !s.ignore_undefined_subtype){
            return undefined
        }


        if(this.validator(eclass)){
            const res = new eclass(runID, eid, type, k, data);
            return (res instanceof Effect) ? res : undefined
        }
        return undefined
    }
}