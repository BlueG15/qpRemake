import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type { dry_system } from "../../../data/systemRegistry";
import type Effect from "../../abstract/gameComponents/effect";
// import utils from "../../../utils";
import { zoneRegistry } from "../../../data/zoneRegistry";

class subtype_hand_or_fieldLock extends effectSubtype {

    

    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action): -1 | boolean {
        //fieldLock effects can only be activated on field
        //jkong say this is by default how a trigger works
        //i dont like it, so i make it a new subtype
        let zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return false;
        if(zone.types.includes(zoneRegistry.z_field) || zone.types.includes(zoneRegistry.z_hand)) return -1;
        return false;
    }
}

export default subtype_hand_or_fieldLock