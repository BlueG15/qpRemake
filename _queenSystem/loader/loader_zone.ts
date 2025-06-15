import type Zone from "../../types/abstract/gameComponents/zone";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type { zoneData } from "../../types/data/zoneRegistry";
// import utils from "../../utils";

export default class zoneLoader {

    private classCache : Map<string, typeof Zone> = new Map() //for custom zones only
    private dataCache : Map<string, zoneData> = new Map()

    load(key : string, data? : zoneData, c? : typeof Zone){
        if(data) this.dataCache.set(key, data)
        if(c) this.classCache.set(key, c);
    };

    getZone(zclassID : string, s : Setting, zDataID? : string){
        //setting unused for now, passed in as standard
        let zclass = this.classCache.get(zclassID);
        if(!zclass) return undefined

        let data = this.dataCache.get(zDataID ?? zclassID)
        if(!data) return undefined
        
        // commented out, may need later
        // let runID = (zDataID) ? utils.dataIDToUniqueID(zclassID, index, s, zDataID) : utils.dataIDToUniqueID(zclassID, index, s)
        
        let zone = new zclass(-1, zclassID, data)
        return zone;
    }
}