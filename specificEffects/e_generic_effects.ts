import type { Action, Action_class } from "../_queenSystem/handler/actionGenrator";
import type { dry_system, dry_card, dry_position, inputData_card, inputData_pos, inputData, dry_zone, identificationInfo, inputData_zone } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import subtype_instant from "../types/effects/effectSubtypes/subtype_instant";
import subtypeRegistry from "../data/subtypeRegistry";
import { identificationType, inputType } from "../data/systemRegistry";
import actionRegistry from "../data/actionRegistry";
import { actionConstructorRegistry, actionFormRegistry} from "../_queenSystem/handler/actionGenrator";
import { damageType, notFull } from "../types/misc";
import { zoneRegistry } from "../data/zoneRegistry";

import { 
    e_reactivate, 
    e_clear_all_status, 
    e_generic_cardTargetting, 
    e_deactivate, 
    e_decompile, 
    e_destroy,
    e_void,
    e_execute,
    e_reset,
} from "./e_generic_cardTargetting";
import { inputFormRegistry, inputRequester_finalized, inputRequester } from "../_queenSystem/handler/actionInputGenerator";

export class e_quick extends Effect {
    protected instant_subtype = new subtype_instant(subtypeRegistry[subtypeRegistry.e_instant])

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action){
        if(!system.turnAction) return [];
        const res = this.instant_subtype.onEffectActivate(c, this, system, system.turnAction!);
        return (res === -1) ? [] : res;
    }
}

export class e_reactivate_on_attack_destroy extends e_reactivate {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        //so logically, it is
        //whenever the action resolved an us attacking, deals damage, then destroy that attacked card
        //we activate, reactivating this card

        //hopefully this works?
        let actionChain = system.findSpecificChainOfAction_resolve([
            "a_attack",
            "a_deal_damage_internal",
            "a_destroy",
        ]) as [Action<"a_attack">, Action<"a_deal_damage_internal">, Action<"a_destroy">]

        if(!actionChain) return false;

        let dmgTarget = actionChain[1].targets[0].card
        let destroyTarget = actionChain[2].targets[0].card

        return (
            dmgTarget.id === destroyTarget.id &&

            actionChain[0].cause.type === identificationType.card && 
            actionChain[0].cause.card.id === c.id &&

            actionChain[1].cause.type === identificationType.card &&
            actionChain[1].cause.card.id === c.id
        )
    }
}

export class e_attack extends Effect {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    get dmg() : number | undefined {return this.attr.get("dmg")}
    set dmg(val : number) {this.attr.set("dmg", val)}

    get dmgType() {return this.attr.get("dmgType") ?? damageType.physical}
    set dmgType(val : damageType) {this.attr.set("dmgType", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times !== 0
    }

    override activate_final(c: dry_card, system: dry_system, a: Action) {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []

        let res : Action[] = []
        while(t !== 0){
            res.push(
                actionConstructorRegistry.a_attack(system, c)(actionFormRegistry.effect(system, c, this), {
                    dmg : (this.dmg === undefined) ? c.atk : this.dmg,
                    dmgType : this.dmgType
                })
            )
            t--;
        }
        return res;
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.times, this.dmg ?? c.atk, this.dmgType]
    }
}

export class e_addToHand extends Effect<[inputData_zone]> {
    protected input_condition(thisCard: dry_card): [] | [(s: dry_system, z: dry_zone) => boolean] {
        return [
            (s : dry_system, z : dry_zone) => z.is(zoneRegistry.z_hand)
        ]
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action){
        return s.requestInput_zone_default(c, zoneRegistry.z_hand);
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone]>): Action[] {
        const z = input.next()[0].data.zone 

        return [
            actionConstructorRegistry.a_pos_change(s, c)(
                z.top
            )(actionFormRegistry.effect(s, c, this))
        ]
    }
}

export class e_add_stat_change_diff extends Effect {
    get maxAtk() {return this.attr.get("maxAtk") ?? 0}
    get maxHp() {return this.attr.get("maxHp") ?? 0}
    get level() {return this.attr.get("level") ?? 0}

    set maxAtk(val : number) {this.attr.set("maxAtk", val)}
    set maxHp(val : number) {this.attr.set("maxHp", val)}
    set level(val : number) {this.attr.set("level", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true
    }

    override activate_final(c: dry_card, system: dry_system, a: Action) {
        return [
            actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(system, c)(actionFormRegistry.effect(system, c, this), {
                maxAtk : this.maxAtk,
                maxHp : this.maxHp,
                level : this.level
            })
        ]
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.maxAtk, this.maxHp, this.level]
    }
}

export class e_add_stat_change_override extends Effect {
    get maxAtk() {return this.attr.get("maxAtk") ?? 0}
    get maxHp() {return this.attr.get("maxHp") ?? 0}
    get level() {return this.attr.get("level") ?? 0}

    set maxAtk(val : number) {this.attr.set("maxAtk", val)}
    set maxHp(val : number) {this.attr.set("maxHp", val)}
    set level(val : number) {this.attr.set("level", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true
    }

    override activate_final(c: dry_card, system: dry_system, a: Action) {
        return [
            actionConstructorRegistry.a_add_status_effect("generic_stat_change_override", true)(system, c)(actionFormRegistry.effect(system, c, this), {
                maxAtk : this.maxAtk,
                maxHp : this.maxHp,
                level : this.level
            })
        ]
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.maxAtk, this.maxHp, this.level]
    }
}

export class e_revenge extends e_attack {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        if(
            a.typeID !== actionRegistry.a_deal_damage_card &&
            a.typeID !== actionRegistry.a_deal_damage_internal && 
            a.typeID !== actionRegistry.a_deal_damage_position
        ) return false;

        if(
            a.targets[0].type === identificationType.card &&
            a.targets[0].card.id !== c.id
        ) return false

        if(
            a.targets[0].type === identificationType.position &&
            !a.targets[0].pos.is(c.pos)
        ) return false

        return super.canRespondAndActivate_final(c, system, a);
    }
}

export class e_reflect extends e_revenge {
    override activate_final(c: dry_card, system: dry_system, a: Action){
        const attr = (a as Action<"a_deal_damage_internal">).flatAttr()
        this.dmg = attr.dmg
        return super.activate_final(c, system, a);
    }
}

export class e_dmg_reduction extends Effect {

    get reductionAmmount() : number {return this.attr.get("reductionAmmount") ?? 0};
    set reductionAmmount(val : number) {this.attr.set("reductionAmmount", val)};

    get minDmg() : number {return this.attr.get("minDmg") ?? 0};
    set minDmg(val : number) {this.attr.set("minDmg", val)};

    get reductionDmgType() : number | undefined {return this.attr.get("reductionDmgType")} //undefined is all damage
    set reductionDmgType(val : number | undefined) {
        if(val === undefined) this.attr.delete("reductionDmgType"); 
        else this.attr.set("reductionDmgType", val)
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        //all dmg
        if(
            a.typeID === actionRegistry.a_deal_damage_card ||
            a.typeID === actionRegistry.a_deal_damage_internal ||
            a.typeID === actionRegistry.a_deal_damage_position
        ){
            if(this.reductionDmgType === undefined) return true;
            return a.flatAttr().dmgType === this.reductionDmgType
        }
        return false;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action<"a_deal_damage_card"> | Action<"a_deal_damage_internal"> | Action<"a_deal_damage_position">) {
        const attr = a.flatAttr()
        let oldDmg = attr.dmg ?? 0;
        let newDmg = oldDmg - this.reductionAmmount;
        if(newDmg < this.minDmg) newDmg = this.minDmg
        return [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(system, a as any)(actionFormRegistry.effect(system, c, this))({
                dmg : newDmg
            })
        ]
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.reductionAmmount, this.minDmg, this.reductionDmgType ?? "all"]
    }
}

export class e_add_counter extends Effect {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times !== 0
    }

    override activate_final(c: dry_card, system: dry_system, a: Action) {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []

        let res : Action[] = []
        while(t !== 0){
            res.push(
                actionConstructorRegistry.a_add_status_effect("generic_counter", true)(system, c)(actionFormRegistry.effect(system, c, this), {})
            )
            t--;
        }
        return res;
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.times]
    }
}

export class e_revive extends Effect<[inputData_zone, inputData_card, inputData_zone, inputData_pos]> {
    //condition: card in grave, pos on field

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    protected card_input_condition(thisCard : dry_card) : Partial<[
        (s : dry_system, z : dry_zone) => boolean,
        (s : dry_system, c : dry_card, z : dry_zone) => boolean
    ]>{
        return []
    }

    protected pos_input_condition(thisCard : dry_card) : Partial<[
        (s : dry_system, z : dry_zone) => boolean,
        (s : dry_system, p : dry_position, z : dry_zone) => boolean,
    ]>{
        return []
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_zone, inputData_card, inputData_zone, inputData_pos], [inputData_zone, inputData_card, inputData_zone, inputData_pos], inputData_zone, [inputData_card, inputData_zone, inputData_pos]> {
        const g1 = s.requestInput_card_default(c, zoneRegistry.z_grave, ...this.card_input_condition(c))
        const g2 = s.requestInput_pos_default(c, zoneRegistry.z_field, true, ...this.pos_input_condition(c))
        return g1.merge(g2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, inputData_card, inputData_zone, inputData_pos]>): Action[] {
        const tc = input.next()[1].data.card
        const tp = input.next()[3].data.pos
        const cause = actionFormRegistry.effect(s, c, this)

        return [
            actionConstructorRegistry.a_pos_change(s, tc)(tp)(cause)
        ]
    }
}

export class e_volatile extends Effect {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        //activate cond : when this card is removed from field
        if(
            (a.typeID === actionRegistry.a_pos_change ||
            a.typeID === actionRegistry.a_pos_change_force) &&
            (a as Action<"a_pos_change">).targets[0].card.id === c.id
        ){
            let zid1 = (a as Action<"a_pos_change">).targets[1].pos.zoneID
            let zid2 = c.pos.zoneID

            if(zid1 === zid2) return false;

            let zFrom = system.getZoneWithID(zid2)
            if(!zFrom) return false;

            return zFrom.types.includes(zoneRegistry.z_field)
        }   
        return false
    }

    override activate_final(c: dry_card, s: dry_system, a: Action){
        const cause = actionFormRegistry.effect(s, c, this)
        return [
            actionConstructorRegistry.a_replace_action(s, 
                actionConstructorRegistry.a_void(s, c)(cause)
            )(cause)
        ]
    }
}

export class e_fragile extends e_destroy {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        //if this card attacks
        if(
            a.is("a_attack") &&
            a.targets[0].is(c)
        ) return super.canRespondAndActivate_final(c, system, a);
        return false
    }
}

export class e_draw extends Effect<[inputData_zone, inputData_zone]> {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    get cooldown() {return this.attr.get("cooldown") ?? NaN}
    set cooldown(val : number) {this.attr.set("cooldown", val)}

    get doTurnDraw() : boolean {return this.attr.get("doTurnDraw") ? true : false}
    set doTurnDraw(val : boolean) {this.attr.set("doTurnDraw", Number(val))}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times !== 0 && !isNaN(this.times) && isFinite(this.times)
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_zone, inputData_zone], [inputData_zone, inputData_zone], inputData_zone, [inputData_zone]> {
        const g1 = s.requestInput_zone_default(c, zoneRegistry.z_deck);
        const g2 = s.requestInput_zone_default(c, zoneRegistry.z_hand);
        return g1.merge(g2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, inputData_zone]>): Action[] {
        let t = this.times
        let res : Action[] = []

        const i = input.next()
        const hand = i[0].data.zone
        const deck = i[1].data.zone

        const cause = actionFormRegistry.effect(s, c, this)

        while(t !== 0){
            res.push(
                deck.getAction_draw!(s, hand, cause, this.doTurnDraw)
            )
            t--;
        }

        res.unshift(
            deck.getAction_shuffle(s, cause)
        )

        return res;
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.times, this.cooldown]
    }
}

export class e_draw_until extends e_draw {
    get count() {return this.attr.get("count") ?? 0}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0;
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, inputData_zone]>): Action[] {
        const i = input.next()
        const hand = i[0].data.zone

        let diff = 2 - hand.cardArr_filtered.length

        if(diff > 0){
            this.times = diff;
            return super.activate_final(c, s, a, input);
        }

        return []
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.count, this.cooldown]
    }
}

export class e_generic_lock extends Effect {
    //delegates the actual condition to a sensible function rather than the inverses

    //return true to unlock
    protected key_condition(c : dry_card, s : dry_system, a : Action){
        return true;
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return !this.key_condition(c, system, a);
    }
}

export class e_bounce extends Effect<[inputData_zone, ...inputData_card[], inputData_zone]>{
    //target zone, cards, deck
    get target_zone() : zoneRegistry {return this.attr.get("target_zone") ?? zoneRegistry.z_field}
    get count() : number {return this.attr.get("count") ?? 1}

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_zone, ...inputData_card[], inputData_zone], [inputData_zone, ...inputData_card[], inputData_zone], inputData_zone, [...inputData_card[], inputData_zone]> {
        const g1 = s.requestInput_zone_default(c, this.target_zone).extendMultiple(s, this.count, (s : dry_system, prev : [inputData_zone, ...inputData_card[]]) => {
            const z = prev[0].data.zone
            if(z.cardArr_filtered.length < this.count) return []
            return z.cardArr_filtered.map(c => inputFormRegistry.card(s, c))
        })
        const g2 = s.requestInput_zone_default(c, zoneRegistry.z_deck)
        return g1.merge(g2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, ...inputData_card[], inputData_zone]>): Action[] {
        const i = input.next();
        const deck = (i.pop() as inputData_zone).data.zone;
        i.shift()
        const cards = i as inputData_card[];

        const cause = actionFormRegistry.effect(s, c, this)

        const res :Action[] = cards.map(c_i => {
            return actionConstructorRegistry.a_add_top(s, c_i.data.card)(deck)(cause)
        })

        res.push(
            deck.getAction_shuffle(s, cause)
        )

        return res;
    }
}

export class e_do_nothing extends Effect {
    override canRespondAndActivate_final(c: any, system: any, a: any): boolean {
        return true //type check is done in init (as a type)
    }
}

export default {
    e_addToHand, 
    e_quick,
    e_reactivate_on_attack_destroy,
    e_attack,
    e_add_counter,
    e_add_stat_change_diff,
    e_add_stat_change_override,
    e_dmg_reduction,
    e_revenge,
    e_reflect,
    e_revive,
    e_volatile,
    e_fragile,
    e_draw,
    e_clear_all_status_self : e_clear_all_status,
    e_deactivate_self : e_deactivate,
    e_decompile_self : e_decompile,
    e_destroy_self : e_destroy,
    e_execute_self : e_execute,
    e_reactivate_self : e_reactivate,
    e_reset_self : e_reset,
    e_void_self : e_void,
}