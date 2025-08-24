import type { dry_card, dry_system } from "../../data/systemRegistry";
import { zoneRegistry } from "../../data/zoneRegistry";
import Position from "../../types/abstract/generics/position";
import type { Player_specific, Positionable } from "../../types/misc";
import type { Action } from "./actionGenrator";
import { 
    inputFormRegistry,
    inputRequester, 
    inputRequester_multiple,
} from "./actionInputGenerator";
import { inputType } from "../../data/systemRegistry";



class inputRequesterGenerator {

    //quick specific zonetype requests

    field(s : dry_system, c : Player_specific | Positionable){
        return this.one_zone(s, c, zoneRegistry.z_field)
    }

    grave(s : dry_system, c : Player_specific | Positionable){
        return this.one_zone(s, c, zoneRegistry.z_grave)
    }

    deck(s : dry_system, c : Player_specific | Positionable){
        return this.one_zone(s, c, zoneRegistry.z_deck)
    }

    hand(s : dry_system, c : Player_specific | Positionable){
        return this.one_zone(s, c, zoneRegistry.z_hand)
    }

    //frequent usages

    cards_on_field<T extends number>(s : dry_system, c : Player_specific | Positionable, len : T){
        return this.multiple_card_from_zoneType(s, c, zoneRegistry.z_field, len)
    }

    cards_in_grave<T extends number>(s : dry_system, c : Player_specific | Positionable, len : T){
        return this.multiple_card_from_zoneType(s, c, zoneRegistry.z_grave, len)
    }

    cards_of_same_archtype<T extends number>(s : dry_system, c : dry_card, len : T){
        const cards = s.getAllInputs(inputType.card, true).filter(c_ele => c_ele.is(c.extensionArr));
        return new inputRequester_multiple(
            len,
            inputType.card,
            cards
        )
    }

    one_enemy(s : dry_system, c : dry_card){
        const cZone = s.getZoneOf(c)!;
        const cards = cZone.getOppositeCards(c).filter(c => s.getZoneOf(c)!.is(zoneRegistry.z_field));
        return new inputRequester(
            inputType.card,
            cards.map(c => inputFormRegistry.card(s, c))
        )
    }

    cards_of_same_archtype_from_zoneType<T extends number>(s : dry_system, c : dry_card, zType : zoneRegistry, len : T){
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c);
        const zones = s.filter(0, z => z.is(zType) && z.of(p_specific));
        const cards = zones.flatMap(z => z.cardArr_filtered).filter(c_ele => c_ele.is(c.extensionArr));
        return new inputRequester_multiple(
            len,
            inputType.card,
            cards.map(c => inputFormRegistry.card(s, c))
        )
    }

    cards_of_same_archtype_on_field<T extends number>(s : dry_system, c : dry_card, len : T){
        return this.cards_of_same_archtype_from_zoneType(s, c, zoneRegistry.z_field, len)
    }

    cards_of_same_archtype_in_grave<T extends number>(s : dry_system, c : dry_card, len : T){
        return this.cards_of_same_archtype_from_zoneType(s, c, zoneRegistry.z_grave, len)
    }

    cards_of_same_archtype_in_deck<T extends number>(s : dry_system, c : dry_card, len : T){
        return this.cards_of_same_archtype_from_zoneType(s, c, zoneRegistry.z_deck, len)
    }

    

    //generic common inputs
    one_zone(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry){
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c) 
        return new inputRequester(
            inputType.zone, 
            s.getAllInputs(inputType.zone, true).filter(
                i => i.is(zType) && i.of(p_specific)
            )
        )
    }

    multiple_zone<T extends number>(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry, len : T) {
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c) 
        return new inputRequester_multiple(
            len,
            inputType.zone, 
            s.getAllInputs(inputType.zone, true).filter(
                i => i.is(zType) && i.of(p_specific)
            )
        )
    }

    one_card_from_zoneType(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry){
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c);
        const zones = s.filter(0, z => z.is(zType) && z.of(p_specific));
        const cards = zones.flatMap(z => z.cardArr_filtered);
        return new inputRequester(
            inputType.card,
            cards.map(c => inputFormRegistry.card(s, c))
        )
    }
    
    multiple_card_from_zoneType<T extends number>(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry, len : T){
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c);
        const zones = s.filter(0, z => z.is(zType) && z.of(p_specific));
        const cards = zones.flatMap(z => z.cardArr_filtered);
        return new inputRequester_multiple(
            len,
            inputType.card,
            cards.map(c => inputFormRegistry.card(s, c))
        )
    }

    multiple_position_from_zoneType<T extends number>(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry, len : T){
        const p_specific = Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c);
        const zones = s.filter(0, z => z.is(zType) && z.of(p_specific));
        const pos = zones.flatMap(z => z.getAllPos());
        return new inputRequester_multiple(
            len,
            inputType.position,
            pos.map(p => inputFormRegistry.pos(s, p))
        )
    }

    chain(){
        
    }
}

const Request = new inputRequesterGenerator()
export default Request