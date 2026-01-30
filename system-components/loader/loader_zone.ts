import type { Zone } from "../../game-components/zones";
import type { Setting } from "../../core/settings";
import { PlayerTypeID, ZoneData, ZoneRegistry, ZoneTypeID } from "../../core";

type ZoneContructor = new (...p : ConstructorParameters<typeof Zone>) => Zone

export default class ZoneLoader {

    private storage : Map<ZoneTypeID, {class? : ZoneContructor, data? : ZoneData}> = new Map()
    private counter = 0
    get nextID(){
        return this.counter++
    }
    
    //private instanceCache : Map<string, Zone> = new Map()

    load(key : ZoneTypeID, c? : ZoneContructor, data? : ZoneData, ){
        if(!c && !data) return; //error
        this.storage.set(key, {class : c, data})
    };

    get(key : ZoneTypeID){
        return this.storage.get(key)
    }

    getData(key : ZoneTypeID){
        return this.get(key)?.data
    }

    getClass(key : ZoneTypeID){
        return this.get(key)?.class
    }

    getZone(s : Setting, playerType : PlayerTypeID = PlayerTypeID.player, pid : number = -1, zClassID? : ZoneTypeID, zDataID : ZoneTypeID | undefined = zClassID){
        zClassID = zClassID ?? zDataID
        if(!zClassID || !zDataID) return;

        let zclass = this.getClass(zClassID);
        if(!zclass) return;

        let data = this.getData(zDataID)
        if(!data) return;
        
        let runID = Utils.dataIDToUniqueID(zClassID, this.nextID, s, zDataID, playerType, pid)
        return new zclass(-1, runID, zDataID, zClassID, playerType, pid, data)
    }
} 