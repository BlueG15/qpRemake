import effectSubtype from "../baseClass/effectSubtype";
import type Action from "../baseClass/action";
import type Card from "../baseClass/card";
import type dry_system from "../dryData/dry_system";
import type Effect from "../baseClass/effect";
import utils from "../baseClass/util";

class subtype_hardUnique extends effectSubtype {
    constructor(id : string){
        super(id, "hardUnique")
    }

    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action): -1 | boolean {
        //hardUnique is once per turn per type
        //essentially once per effect type
        if (
            system.getActivatedEffectIDs()
            .map(i => utils.uniqueIDTodataID(i))
            .includes(utils.uniqueIDTodataID(e.id))
        ) return false;
        return -1;
    }
}

export default subtype_hardUnique