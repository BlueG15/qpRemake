import EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_system } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";
import { zoneRegistry } from "../../data/zoneRegistry";

class GraveLock extends EffectSubtype {
    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action) {
        //fieldLock effects can only be activated on field
        //jkong say this is by default how a trigger works
        //i dont like it, so i make it a new subtype
        let zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return false;
        if(zone.is(zoneRegistry.z_grave)) return controlCode.doNothingAndPass;
        return false;
    }
}

export default GraveLock