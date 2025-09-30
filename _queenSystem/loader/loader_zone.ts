import type Zone from "../../types/abstract/gameComponents/zone";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type { zoneData } from "../../data/zoneRegistry";
import type { inputData } from "../../data/systemRegistry";

export default class zoneLoader {

    private classCache : Map<string, typeof Zone> = new Map()
    private dataCache : Map<string, zoneData> = new Map()
    private counter = 0

    //private instanceCache : Map<string, Zone> = new Map()

    load(key : string, data? : zoneData, c? : typeof Zone){
        if(data) this.dataCache.set(key, data)
        if(c) this.classCache.set(key, c);
    };

    getData(key : string){
        return this.dataCache.get(key)
    }

    getZone(zclassID : string, s : Setting, ptype : number = -1, pid : number = -1, zDataID? : string){
        zDataID = zDataID ?? zclassID
        //setting unused for now, passed in as standard
        let zclass = this.classCache.get(zclassID);
        if(!zclass) return undefined

        let data = this.dataCache.get(zDataID)
        if(!data) return undefined
        
        // commented out, may need later
        let runID = Utils.dataIDToUniqueID(zclassID, this.counter, s, zDataID, ptype.toString(), pid.toString())
        
        this.counter++;
        return new zclass(-1, runID, zDataID, zclassID, ptype, pid, data)
    }
}