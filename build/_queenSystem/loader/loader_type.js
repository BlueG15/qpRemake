"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class typeLoader {
    constructor() {
        this.classCache = new Map();
        // private countCache : Map<string, number> = new Map()
        this.instanceCache = new Map();
    }
    load(key, c) {
        this.classCache.set(key, c);
    }
    ;
    getType_manual(tid, s, eid) {
        let stclass = this.classCache.get(tid);
        if (!stclass)
            return undefined;
        // let c = this.countCache.get(stid);
        // c = (c) ? (c + 1) % s.max_id_count : 0;
        // this.countCache.set(stid, c);
        // let runID = eid ? utils.dataIDToUniqueID(stid, c, s, eid) : utils.dataIDToUniqueID(stid, c, s)
        return new stclass(tid);
    }
    getType(tid, s, eid) {
        if (s.singleton_effect_type) {
            if (this.instanceCache.has(tid))
                return this.instanceCache.get(tid);
            let res = this.getType_manual(tid, s, eid);
            if (!res)
                return res;
            this.instanceCache.set(tid, res);
            return res;
        }
        else {
            this.instanceCache.clear();
            return this.getType_manual(tid, s, eid);
        }
    }
}
exports.default = typeLoader;
