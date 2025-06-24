import type { Action } from "../_queenSystem/handler/actionGenrator";
import type { dry_system, dry_card, dry_position } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import subtype_instant from "../types/effects/effectSubtypes/subtype_instant";
import subtypeRegistry from "../data/subtypeRegistry";
import { identificationType } from "../data/systemRegistry";
import actionRegistry from "../data/actionRegistry";
import { actionConstructorRegistry, actionFormRegistry } from "../_queenSystem/handler/actionGenrator";
import { damageType } from "../types/misc";
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
import e_generic_poschange_target from "./e_generic_poschange_target";


export class e_quick extends Effect {
    protected instant_subtype = new subtype_instant(subtypeRegistry[subtypeRegistry.e_instant])

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
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

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []

        let res : Action[] = []
        while(t !== 0){
            res.push(
                actionConstructorRegistry.a_attack(system, c)(actionFormRegistry.card(system, c), {
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

export class e_addToHand extends Effect {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        const z = system.getZoneWithID(c.pos.zoneID);
        if(!z) return [];

        return [
            actionConstructorRegistry.a_pos_change(system, c)(
                system.getAllZonesOfPlayer(z.playerIndex)[zoneRegistry.z_hand][0].top
            )(actionFormRegistry.card(system, c))
        ]
    }
}

export class e_add_stat_change_diff extends Effect {
    get atk() {return this.attr.get("atk") ?? 0}
    get hp() {return this.attr.get("hp") ?? 0}
    get maxAtk() {return this.attr.get("maxAtk") ?? this.atk}
    get maxHp() {return this.attr.get("maxHp") ?? this.hp}
    get level() {return this.attr.get("level") ?? 0}

    set atk(val : number) {this.attr.set("atk", val)}
    set hp(val : number) {this.attr.set("hp", val)}
    set maxAtk(val : number) {this.attr.set("maxAtk", val)}
    set maxHp(val : number) {this.attr.set("maxHp", val)}
    set level(val : number) {this.attr.set("level", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        return [
            actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(system, c)(actionFormRegistry.card(system, c), {
                atk : this.atk,
                hp : this.hp,
                maxAtk : this.maxAtk,
                maxHp : this.maxHp,
                level : this.level
            })
        ]
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.atk, this.hp, this.maxAtk, this.maxHp, this.level]
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
            !a.targets[0].pos.equal(c.pos)
        ) return false

        return super.canRespondAndActivate_final(c, system, a);
    }
}

export class e_reflect extends e_revenge {
    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
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

    override activate_final(c: dry_card, system: dry_system, a: Action<"a_deal_damage_card"> | Action<"a_deal_damage_internal"> | Action<"a_deal_damage_position">): Action[] {
        const attr = a.flatAttr()
        let oldDmg = attr.dmg ?? 0;
        let newDmg = oldDmg - this.reductionAmmount;
        if(newDmg < this.minDmg) newDmg = 0
        return [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(system, a as any)(actionFormRegistry.card(system, c))({
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

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []

        let res : Action[] = []
        while(t !== 0){
            res.push(
                actionConstructorRegistry.a_add_status_effect("generic_counter", true)(system, c)(actionFormRegistry.card(system, c), {})
            )
            t--;
        }
        return res;
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.times]
    }
}

export class e_revive extends e_generic_poschange_target {
    protected override check_input_condition(system : dry_system, thisCard : dry_card, c: dry_card, pos: dry_position): boolean {
        //c in grave and pos on field

        const z1 = system.getZoneWithID(c.pos.zoneID)
        const z2 = system.getZoneWithID(pos.zoneID)

        if(!z1 || !z2) return false
        return (
            z1.types.includes(zoneRegistry.z_grave) &&
            z2.types.includes(zoneRegistry.z_field)
        )
    }
}

export class e_volatile extends e_void {
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

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        let res = super.activate_final(c, system, a)[0];
        return [
            actionConstructorRegistry.a_replace_action(system, res)(res.cause)
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

export class e_draw extends Effect {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    get cooldown() {return this.attr.get("cooldown") ?? NaN}
    set cooldown(val : number) {this.attr.set("cooldown", val)}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times !== 0
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []

        let res : Action[] = []

        const z = system.getZoneWithID(c.pos.zoneID)
        if(!z) return []

        const deck = system.getAllZonesOfPlayer(z.playerIndex)[zoneRegistry.z_deck]
        if(!deck || !deck.length) return []

        while(t !== 0){
            res.push(
                actionConstructorRegistry.a_draw(system, deck[0])(actionFormRegistry.card(system, c), {
                    cooldown : this.cooldown,
                    doTurnReset : false,
                    actuallyDraw : true,
                })
            )
            t--;
        }
        return res;
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.times, this.cooldown]
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