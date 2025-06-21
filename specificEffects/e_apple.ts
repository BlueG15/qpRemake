import { actionConstructorRegistry, actionFormRegistry, type Action } from "../_queenSystem/handler/actionGenrator";
import type Card from "../types/abstract/gameComponents/card";
import type dry_system from "../data/dry/dry_system";
// import type { subTypeOverrideConflict } from "../types/errors";
// import Position from "../types/abstract/generics/position";
import Effect from "../types/abstract/gameComponents/effect";
import { zoneRegistry } from "../data/zoneRegistry";
import type dry_card from "../data/dry/dry_card";

export default class appleEffect extends Effect {
    //add one card apple from deck to hand, if any

    override activate_proto(c: Card, system: dry_system, a: Action): Action[] {
        
        //get the card with the same dataID as C in the deck
        const z = system.getZoneWithID(c.pos.zoneID);
        if(!z) return [];

        const data = system.getAllZonesOfPlayer(z.playerIndex);

        const decks = data[zoneRegistry.z_deck];
        const hands = data[zoneRegistry.z_hand];

        if(!decks || !decks.length || !hands || !hands.length) return []

        let target : dry_card | undefined = undefined

        for(let i = 0; i < decks.length; i++){
            target = decks[i].getCardWithDataID(c.dataID);
            if(!target) continue;
            break;
        }

        if(!target) return []
        return [
            actionConstructorRegistry.a_pos_change(system, target)(hands[0].top)(actionFormRegistry.card(system, c.toDry()))
        ]
    }

    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action): boolean {
        return true;
    }

    override getDisplayInput(c : Card, system : dry_system): (string | number)[] {
        //how many targets there are in the deck
        const z = system.getZoneWithID(c.pos.zoneID);
        if(!z) return [];
        return system.getAllZonesOfPlayer(z.playerIndex)[
            zoneRegistry.z_deck
        ].map(z => z.count(i => i.dataID === c.dataID))
    }
}