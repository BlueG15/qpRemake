import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type Action from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";
import utils from "../../../utils";

class subtype_hardUnique extends effectSubtype {
    constructor(id : string){
        super(id, "hardUnique")
    }

    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action): -1 | boolean {
        //hardUnique is once per turn per card
        if (
            system.getActivatedCardIDs().includes(c.id)
        ) return false;
        return -1;
    }
}

export default subtype_hardUnique