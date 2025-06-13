import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import utils from "../../utils";

export default class subtypeLoader {

    private classCache : Map<string, typeof effectSubtype> = new Map()
    private countCache : Map<string, number> = new Map()

    load(key : string, c : typeof effectSubtype){
        this.classCache.set(key, c);
    };

    getSubtype(stid : string, s : Setting, eid? : string){
        let stclass = this.classCache.get(stid);
        if(!stclass) return undefined

        let c = this.countCache.get(stid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(stid, c);
        
        let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(runID)
    }
}