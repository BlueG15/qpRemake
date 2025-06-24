import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import type { Setting } from "../../types/abstract/gameComponents/settings";
// import utils from "../../utils";

export default class subtypeLoader {

    private classCache : Map<string, typeof effectSubtype> = new Map()
    // private countCache : Map<string, number> = new Map()

    private instanceCache : Map<string, effectSubtype> = new Map()

    load(key : string, c : typeof effectSubtype){
        this.classCache.set(key, c);
    };

    private getSubtype_manual(stid : string, s : Setting, eid? : string){
        let stclass = this.classCache.get(stid);
        if(!stclass) return undefined

        // let c = this.countCache.get(stid);
        // c = (c) ? (c + 1) % s.max_id_count : 0;
        // this.countCache.set(stid, c);
        
        // let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(stid)
    }

    getSubtype(stid : string, s : Setting, eid? : string){
        if(s.singleton_effect_subtype){
            if(this.instanceCache.has(stid)) 
                return this.instanceCache.get(stid);
            let res = this.getSubtype_manual(stid, s, eid);
            if(!res) return res;
            this.instanceCache.set(stid, res);
            return res;
        } else {
            this.instanceCache.clear()
            return this.getSubtype_manual(stid, s, eid);
        } 
    }
}