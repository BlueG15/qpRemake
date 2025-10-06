"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class subtypeLoader {
    constructor() {
        this.classCache = new Map();
        // private countCache : Map<string, number> = new Map()
        this.instanceCache = new Map();
    }
    load(key, c) {
        this.classCache.set(key, c);
    }
    ;
    getSubtype_manual(stid, s, eid) {
        let stclass = this.classCache.get(stid);
        if (!stclass)
            return undefined;
        // let c = this.countCache.get(stid);
        // c = (c) ? (c + 1) % s.max_id_count : 0;
        // this.countCache.set(stid, c);
        // let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(stid);
    }
    getSubtype(stid, s, eid) {
        if (s.singleton_effect_subtype) {
            if (this.instanceCache.has(stid))
                return this.instanceCache.get(stid);
            let res = this.getSubtype_manual(stid, s, eid);
            if (!res)
                return res;
            this.instanceCache.set(stid, res);
            return res;
        }
        else {
            this.instanceCache.clear();
            return this.getSubtype_manual(stid, s, eid);
        }
    }
}
exports.default = subtypeLoader;
