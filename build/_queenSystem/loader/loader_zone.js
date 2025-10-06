"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class zoneLoader {
    constructor() {
        this.classCache = new Map();
        this.dataCache = new Map();
        this.counter = 0;
    }
    //private instanceCache : Map<string, Zone> = new Map()
    load(key, data, c) {
        if (data)
            this.dataCache.set(key, data);
        if (c)
            this.classCache.set(key, c);
    }
    ;
    getData(key) {
        return this.dataCache.get(key);
    }
    getZone(zclassID, s, ptype = -1, pid = -1, zDataID) {
        zDataID = zDataID !== null && zDataID !== void 0 ? zDataID : zclassID;
        //setting unused for now, passed in as standard
        let zclass = this.classCache.get(zclassID);
        if (!zclass)
            return undefined;
        let data = this.dataCache.get(zDataID);
        if (!data)
            return undefined;
        // commented out, may need later
        let runID = Utils.dataIDToUniqueID(zclassID, this.counter, s, zDataID, ptype.toString(), pid.toString());
        this.counter++;
        return new zclass(-1, runID, zDataID, zclassID, ptype, pid, data);
    }
}
exports.default = zoneLoader;
