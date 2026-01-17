import type Zone from "../../types/gameComponents/zone";
import type { Setting } from "../../types/gameComponents/settings";
import type { zoneData } from "../../data/zoneRegistry";
import type { Zone_T } from "../../types/gameComponents/zone";

type ZoneContructor = new (...p : ConstructorParameters<typeof Zone>) => Zone_T

export default class zoneLoader {

    private classCache : Map<number, ZoneContructor> = new Map()
    private dataCache : Map<number, zoneData> = new Map()
    private counter = 0

    //private instanceCache : Map<string, Zone> = new Map()

    load(key : number, data? : zoneData, c? : ZoneContructor){
        if(data) this.dataCache.set(key, data)
        if(c) this.classCache.set(key, c);
    };

    getData(key : number){
        return this.dataCache.get(key)
    }

    getZone(zclassID : number, s : Setting, ptype : number = -1, pid : number = -1, zDataID? : number){
        zDataID = zDataID ?? zclassID
        //setting unused for now, passed in as standard
        let zclass = this.classCache.get(zclassID);
        if(!zclass) return undefined

        let data = this.dataCache.get(zDataID)
        if(!data) return undefined
        
        // commented out, may need later
        let runID = Utils.dataIDToUniqueID(String(zclassID), this.counter, s, String(zDataID), ptype.toString(), pid.toString())
        
        this.counter++;
        return new zclass(-1, runID, zDataID, zclassID, ptype, pid, data) as Zone
    }
} 