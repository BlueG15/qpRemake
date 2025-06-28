import type { dry_card, dry_system, dry_position, dry_zone, inputData_card, inputData_pos, inputData, identificationInfo_card, identificationInfo_pos, identificationInfo_zone, identificationInfo, dry_effect } from "../data/systemRegistry";
import { Action_class, actionConstructorRegistry, actionFormRegistry, actionInputObj, type Action } from "../_queenSystem/handler/actionGenrator";
import actionRegistry from "../data/actionRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import { zoneRegistry } from "../data/zoneRegistry";
import { e_revive } from "./e_generic_effects";
import { damageType } from "../types/misc";
import { e_generic_poschange_input, e_generic_singular_input } from "./e_generic_input";
import { chained_filtered_input_obj, sequenced_independent_input_obj } from "../_queenSystem/handler/actionInputGenerator";

export class e_apple extends Effect {
    //add one card apple from deck to hand, if any

    get count() {return this.attr.get("count") ?? 0};
    set count(val : number) {this.attr.set("count", val)};

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        
        //get the card with the same dataID as C in the deck
        const z = system.getZoneWithID(c.pos.zoneID);
        if(!z) return [];

        const data = system.getAllZonesOfPlayer(z.playerIndex);

        const decks = data[zoneRegistry.z_deck];
        const hands = data[zoneRegistry.z_hand];

        if(!decks || !decks.length || !hands || !hands.length) return []

        let target : dry_card[] = []

        for(let i = 0; i < decks.length; i++){
            target = decks[i].cardArr_filtered.filter(i =>i.dataID === c.dataID)
            if(!target.length) continue;
            break;
        }

        if(!target.length) return []

        let res : Action[] = []
        for(let i = 0; i < this.count; i++){
            res.push(actionConstructorRegistry.a_pos_change(system, target[i])(hands[0].top)(actionFormRegistry.card(system, c)))
        }
        return res
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count !== 0;
    }

    override getDisplayInput(c : dry_card, system : dry_system): (string | number)[] {
        //how many targets there are in the deck
        const z = system.getZoneWithID(c.pos.zoneID);
        if(!z) return [];
        return system.getAllZonesOfPlayer(z.playerIndex)[
            zoneRegistry.z_deck
        ].map(z => z.count(i => i.dataID === c.dataID))
    }
}

export class e_banana extends e_revive {
    get doFruitCheck() : 0 | 1 {return this.attr.get("doFruitCheck") === 1 ? 1 : 0}
    set doFruitCheck(val : boolean) {this.attr.set("doFruitCheck", Number(val))}

    protected override card_input_condition(thisCard : dry_card) {
        const res = super.card_input_condition(thisCard);
        res[1] = (
            (system: dry_system, c: dry_card): boolean => {
            //extra condition the targetted card is a fruit and is not a banana
                return (!this.doFruitCheck || c.extensionArr.includes("fruit")) && c.dataID !== thisCard.dataID && c.level === 1
            }
        )
        return res;
    }
}

export class e_lemon extends Effect {

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {

        const zone = system.getZoneWithID(c.pos.zoneID)
        if(!zone) return [];

        let cards = system.filter(1, (c_find, zid) => {
            let z = system.getZoneWithID(zid)!
            return z.types.includes(zoneRegistry.z_field) && c.dataID === c_find.dataID && z.playerIndex === zone.playerIndex
        })

        return cards.map(c_element => 
            actionConstructorRegistry.a_attack(system, c_element)(actionFormRegistry.card(system, c), {
                dmg : c_element.atk,
                dmgType : damageType.physical
            })
        )
    }
}

export class e_pomegranate extends Effect {

    get exposedDmg() : number {return this.attr.get("exposedDmg") ?? 0};
    get coveredDmg() : number {return this.attr.get("coveredDmg") ?? 0};

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        if(
            a.typeID === actionRegistry.a_pos_change ||
            a.typeID === actionRegistry.a_pos_change_force
        ) {
            const target = (a as Action<"a_pos_change">).targets;

            if(target[0].card.id !== c.id) return false;

            const zone = system.getZoneWithID(target[1].pos.zoneID)
            if(!zone) return false;

            return zone.types.includes(zoneRegistry.z_grave);
        }
        return false;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {

        const zone = system.getZoneWithID(c.pos.zoneID);
        if(!zone) return [];

        // const targets = system.map(1, (z : dry_zone, c_ele : dry_card) => {
        //     if(z.isExposed !== undefined && z.isOpposite(zone) && z.isOpposite(c_ele, c)) return [z, c_ele];
        //     else return undefined
        // }).filter(i => i !== undefined) as [dry_zone, dry_card][]

        const targets = system.map(1, (c_ele, zid) => {
            let z = system.getZoneWithID(zid)!
            if(z.isCardExposed !== undefined && z.isOpposite(zone) && z.isOpposite(c_ele, c)) return [z, c_ele];
            else return undefined
        }).filter(i => i !== undefined) as [dry_zone, dry_card][]

        return targets.map(([zone, target]) => {
            return actionConstructorRegistry.a_deal_damage_card(system, target)(actionFormRegistry.card(system, c), {
                dmg : (zone.isCardExposed!(target)) ? this.exposedDmg : this.coveredDmg,
                dmgType : damageType.magic,
            })
        })

    }
} 

export class e_pollinate extends e_generic_singular_input<dry_card> {

    // protected override check_input_condition(system: dry_system, thisCard: dry_card, c: dry_card, pos: dry_position): boolean {
    //     const zone = system.getZoneWithID(c.pos.zoneID);
    //     if(!zone) return false;

    //     return zone.types.includes(zoneRegistry.z_deck) && 
    //            c.effects.length >= 1 &&
    //            c.level === 1
    // }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        return []
    }
}

export class e_growth extends e_generic_singular_input<dry_card> {
    get doFruitCheck() : 0 | 1 {return this.attr.get("doFruitCheck") === 1 ? 1 : 0}
    set doFruitCheck(val : boolean) {this.attr.set("doFruitCheck", Number(val))}

    protected override getApplyFunc(thisCard: dry_card): (s: dry_system, inputs: [inputData_card]) => Action[] {
        return (s : dry_system, inputs : [inputData_card]) => {
            const c = inputs[0].data.card
            const pid = s.getPIDof(c)
            const deck = s.getAllZonesOfPlayer(pid)[zoneRegistry.z_deck]
            if(!deck.length || !deck[0].getAction_shuffle) return []

            const cause = actionFormRegistry.card(s, thisCard)
            return [
                actionConstructorRegistry.a_pos_change(s, c)(deck[0].top)(cause),
                deck[0].getAction_shuffle(s, cause),
            ]
        }
    }

    protected override input_condition(thisCard: dry_card): [] | [(s: dry_system, z: dry_zone) => boolean, (s: dry_system, c: dry_card) => boolean] | [(s: dry_system, z: dry_zone) => boolean] {
        return [
            (s : dry_system, z : dry_zone) => z.is(zoneRegistry.z_grave),
            (s : dry_system, c : dry_card) => (!this.doFruitCheck || c.is("fruit"))
        ]
    }
}

export default {
    //white
    e_apple,
    e_banana,
    e_lemon,
    e_pomegranate,

    //green
    // e_pollinate,
    e_growth,
}