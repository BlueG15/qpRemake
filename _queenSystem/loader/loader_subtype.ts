import type EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Setting } from "../../types/gameComponents/settings";

export default class subtypeLoader {

    private classCache : Map<number, typeof EffectSubtype> = new Map()
    // private countCache : Map<string, number> = new Map()

    private instanceCache : Map<number, EffectSubtype> = new Map()

    load(key : number, c : typeof EffectSubtype){
        this.classCache.set(key, c);
    };

    private getSubtype_manual(stid : number, s : Setting, eid? : string){
        let stclass = this.classCache.get(stid);
        if(!stclass) return undefined

        // let c = this.countCache.get(stid);
        // c = (c) ? (c + 1) % s.max_id_count : 0;
        // this.countCache.set(stid, c);
        
        // let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(stid)
    }

    getSubtype(stid : number, s : Setting, eid? : string){
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