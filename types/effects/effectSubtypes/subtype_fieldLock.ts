import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type Action from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";
import utils from "../../../utils";

class subtype_fieldLock extends effectSubtype {
    constructor(id : string){
        super(id, "fieldLock")
    }

    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action): -1 | boolean {
        //fieldLock effects can only be activated on field
        //jkong say this is by default how a trigger works
        //i dont like it, so i make it a new subtype
        if (
            c.pos.zoneID !== system.playerField.id &&
            c.pos.zoneID !== system.enemyField.id
        ) return false;
        return -1;
    }
}

export default subtype_fieldLock