import type Action from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";
import type dry_system from "../types/data/dry/dry_system";
// import type { subTypeOverrideConflict } from "../types/errors";
import { posChange } from "../types/actions";
import initEffect from "../types/effects/effectTypes/initEffect";
import Position from "../types/abstract/generics/position";

export default class appleEffect extends initEffect{
    //add one card apple from deck to hand, if any

    override activate_proto(c: Card, system: dry_system, a: Action): Action[] {
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
}