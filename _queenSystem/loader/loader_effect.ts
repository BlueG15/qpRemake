import type Effect from "../../types/abstract/gameComponents/effect";
import type { cardData_unified, effectData } from "../../data/cardRegistry";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type subtypeLoader from "./loader_subtype";
import type typeLoader from "./loader_type";
import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import utils from "../../utils";

//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction scheme, similar to paging  
export default class effectLoader {

    private dataCache : Map<string, effectData>
    private classCache : Map<string, typeof Effect> = new Map()
    private countCache : Map<string, number> = new Map()

    private subtypeLoader : subtypeLoader
    private typeLoader : typeLoader

    constructor(
        dataRegistry : Record<string, effectData>, 
        subtypeLoader : subtypeLoader,
        typeLoader : typeLoader,
    ){
        this.dataCache = new Map(Object.entries(dataRegistry))
        this.subtypeLoader = subtypeLoader
        this.typeLoader = typeLoader
    }

    private async loadSingle(path : string, eid : string, s : Setting){
        this.classCache.set(
            eid,
            (await import(path + eid)).default
        )
    }

    async load(s : Setting) : Promise<void>{
        let path = s.effectFolder
        if(!path.endsWith("/")) path += "/"
        let arr : Promise<void>[] = []

        this.dataCache.forEach((_, eid) => {
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

    getEffect(eid : string, s : Setting, cdata? : cardData_unified){
        let data = this.dataCache.get(eid)
        if(!data) return undefined

        let eclass = this.classCache.get(eid)
        if(!eclass) return undefined

        let c = this.countCache.get(eid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(eid, c); 

        //load type
        let type = this.typeLoader.getType(data.typeID, s, eid)
        if(!type) return undefined

        let runID = utils.dataIDToUniqueID(eid, c, s, ...data.subTypeIDs)

        if(cdata && cdata.effects[eid]) utils.patchGeneric(data, cdata.effects[eid])
            
        //load subtypes
        let k : effectSubtype[] = []
        data.subTypeIDs.forEach(i => {
            let st = this.subtypeLoader.getSubtype(i, s, eid)
            if(st) k.push(st);
        })

        if(k.length != data.subTypeIDs.length && !s.ignore_undefined_subtype){
            return undefined
        }

        return new eclass(runID, eid, type, k, data);
    }
}