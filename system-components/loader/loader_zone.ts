import type { Zone } from "../../game-components/zones";
import type { Setting } from "../../core/settings";
import { PlayerTypeID, ZoneData, ZoneRegistry, ZoneTypeID } from "../../core";
import ZoneStack from "../../game-components/zones/zone-stack";
import ZoneGrid from "../../game-components/zones/zone-grid";
import { Registry } from "../../core/registry/base";

type ZoneContructor = new (...p : ConstructorParameters<typeof Zone>) => Zone

export default class ZoneLoader {
    zoneArr : Zone[] =  []
    private storage : Map<ZoneTypeID, {class? : ZoneContructor, data? : ZoneData}> = new Map()
    private counter = 0

    constructor(){
        this.loadDefault(ZoneRegistry.ability, )
        this.loadDefault(ZoneRegistry.deck,    )
        this.loadDefault(ZoneRegistry.drop,    )
        this.loadDefault(ZoneRegistry.grave,   )
        this.loadDefault(ZoneRegistry.hand,    )
        this.loadDefault(ZoneRegistry.void,    )
        this.loadDefault(ZoneRegistry.storage, )
        // this.loadDefault(ZoneRegistry.system,  )
        this.loadDefault(ZoneRegistry.field,   ZoneGrid )
    }

    get nextID(){
        return this.counter++
    }
    
    //private instanceCache : Map<string, Zone> = new Map()
    
    private loadDefault(type : ZoneTypeID, constructor : ZoneContructor = ZoneStack){
        this.load(type, ZoneRegistry.getData(type), constructor)
    }

    load(key : ZoneTypeID | string, data : ZoneData, c : ZoneContructor){
        if(typeof key === "string"){
            key = Registry.add(ZoneRegistry, key, data)
        }
        this.storage.set(key, {class : c, data})
        return key
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
        
        let runID = Utils.formatDataIDtoUniqueID(zClassID, this.nextID, s, zDataID, playerType, pid)
        return new zclass(-1, zDataID, zClassID, playerType, pid, data)
    }
} 