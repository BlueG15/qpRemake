import type EffectType from "../../types/abstract/gameComponents/effectType";
import type { Setting } from "../../types/abstract/gameComponents/settings";

export default class typeLoader {

    private classCache : Map<string, typeof EffectType> = new Map()
    // private countCache : Map<string, number> = new Map()

    private instanceCache : Map<string, EffectType> = new Map()

    load(key : string, c : typeof EffectType){
        this.classCache.set(key, c);
    };

    private getType_manual(tid : string, s : Setting, eid? : string){
        let stclass = this.classCache.get(tid);
        if(!stclass) return undefined

        // let c = this.countCache.get(stid);
        // c = (c) ? (c + 1) % s.max_id_count : 0;
        // this.countCache.set(stid, c);
        
        // let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(tid)
    }

    getType(tid : string, s : Setting, eid? : string){
        if(s.singleton_effect_type){
            if(this.instanceCache.has(tid)) 
                return this.instanceCache.get(tid);
            let res = this.getType_manual(tid, s , eid);
            if(!res) return res;
            this.instanceCache.set(tid, res);
            return res;
        } else {
            this.instanceCache.clear();
            return this.getType_manual(tid, s, eid);
        } 
    }
}