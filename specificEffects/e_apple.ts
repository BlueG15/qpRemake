import type Action_prototype from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";
import type dry_system from "../data/dry/dry_system";
// import type { subTypeOverrideConflict } from "../types/errors";
import { posChange } from "../types/actions_old";
import Position from "../types/abstract/generics/position";
import Effect from "../types/abstract/gameComponents/effect";

export default class appleEffect extends Effect {
    //add one card apple from deck to hand, if any

    override activate_proto(c: Card, system: dry_system, a: Action_prototype): Action_prototype[] {
        let target = system.deck.getCardWithDataID(c.dataID);
        if(!target) return []; 
        return [
            new posChange(
                target.id, 
                true, 
                new Position(target.pos), 
                system.hand.lastPos, 
                undefined, 
                c.id
            )
        ]
    }

    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action_prototype): boolean {
        return true;
    }

    override getDisplayInput(c : Card, system : dry_system): (string | number)[] {
        //how many targets there are in the deck
        return [system.deck.count(i => i.dataID === c.dataID)]
    }
}