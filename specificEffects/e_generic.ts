import type { Action, Action_class } from "../_queenSystem/handler/actionGenrator";
import type { dry_system, dry_card, dry_position, inputData_card, inputData_pos, inputData, dry_zone, identificationInfo, inputData_zone, inputData_standard, inputData_effect } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import subtype_instant from "../types/effects/effectSubtypes/subtype_instant";
import subtypeRegistry from "../data/subtypeRegistry";
import { identificationType, inputType } from "../data/systemRegistry";
import actionRegistry from "../data/actionRegistry";
import { actionConstructorRegistry, actionFormRegistry} from "../_queenSystem/handler/actionGenrator";
import { damageType, notFull } from "../types/misc";
import { zoneRegistry } from "../data/zoneRegistry";

import { inputFormRegistry, inputRequester_finalized, inputRequester } from "../_queenSystem/handler/actionInputGenerator";
import { e_automate_base } from "./e_status";
import Request from "../_queenSystem/handler/actionInputRequesterGenerator";
import error from "../types/errors/error";
import { e_clear_all_status, e_deactivate, e_decompile, e_destroy, e_execute, e_reactivate, e_void } from "./e_generic_cardTargetting";

/**
 * All typical effects should have 3 versions
 * - target c or this
 * - target inputs
 * - target all of a higher order input (card -> zone, eff -> card)
 * 
 */

export class e_quick extends Effect {
    protected instant_subtype = new subtype_instant(subtypeRegistry[subtypeRegistry.e_st_instant])

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return system.turnAction !== undefined && system.turnAction.id === a.id;
    }

    override activate_final(c: dry_card, system: dry_system, a: Action){
        return [
            actionConstructorRegistry.a_modify_action("a_turn_end")(
                system, system.getRootAction()
            )(this.cause(system, c))({
                doIncreaseTurnCount : false
            })
        ]
    }
}

export class e_attack extends Effect<inputData_card[]> {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    get dmg() : number | undefined {return this.attr.get("dmg")}
    set dmg(val : number) {this.attr.set("dmg", val)}

    get dmgType() {return this.attr.get("dmgType") ?? damageType.physical}
    set dmgType(val : damageType) {this.attr.set("dmgType", val)}

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.field(s, c).cards().many(this.count, this)
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times > 0 && this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []
        const cards = input.next()
        const cause = this.cause(s, c)

        let res : Action[] = []
        while(t > 0){
            res.push(
                ...cards.map(
                    c => actionConstructorRegistry.a_attack(s, c.data.card)(
                        cause, 
                        {
                            dmg : (this.dmg === undefined) ? c.data.card.atk : this.dmg,
                            dmgType : this.dmgType
                        }
                    )
                )
            )
            t--;
        }
        return res;
    }
}

export class e_add_to_hand extends Effect<[...inputData_card[], inputData_zone]> {
    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [...inputData_card[], inputData_zone], [...inputData_card[], inputData_zone], inputData_standard, inputData_standard, inputData_standard[]> {
        const x = Request.allZones(s, c).cards().many(this.count, this)
        const y = Request.hand(s, c).once(this)
        return x.merge(y)
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[...inputData_card[], inputData_zone]>): Action[] {
        const n = input.next()
        const cards = n.splice(0, -1) as inputData_card[]
        const z = (n[0] as inputData_zone).data.zone

        return cards.map(c => 
            actionConstructorRegistry.a_pos_change(s, c.data.card)(
                z.top
            )(this.cause(s, c.data.card))
        )
    }
}

export class e_add_stat_change_diff extends Effect<inputData_card[]> {
    get maxAtk() : number | undefined {return this.attr.get("maxAtk")}
    get maxHp() : number | undefined {return this.attr.get("maxHp")}
    get level() : number | undefined {return this.attr.get("level")}

    get statObj(){
        const k : {
            maxAtk? : number,
            maxHp? : number,
            level? : number
        } = {}

        if(this.maxAtk !== undefined) k.maxAtk = this.maxAtk
        if(this.maxHp !== undefined) k.maxHp = this.maxHp
        if(this.level !== undefined) k.level = this.level
        return k
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.field(s, c).cards().many(this.count, this)
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cards = input.next()
        const cause = this.cause(s, c)
        
        return cards.map(c => 
            actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c.data.card)(
            cause, this.statObj)
        )
    }
}

export class e_add_stat_change_override extends e_add_stat_change_diff {
    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cause = this.cause(s, c)
        return input.next().map(c => 
            actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_override", true)(s, c.data.card)(cause, this.statObj)
        )
    }
}

export class e_deal_dmg_ahead extends e_attack {
    override activate_final(c: dry_card, s: dry_system, a: Action): Action_class<identificationInfo[], any, any>[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []
        const cause = this.cause(s, c)

        let res : Action[] = []
        while(t > 0){
            res.push(
                actionConstructorRegistry.a_deal_damage_ahead(s, c)(cause, {
                    dmg : (this.dmg === undefined) ? c.atk : this.dmg,
                    dmgType : this.dmgType
                })
            )
            t--;
        }
        return res;
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
    override activate_final(c: dry_card, system: dry_system, a: Action, i : any){
        const attr = (a as Action<"a_deal_damage_internal">).flatAttr()
        this.dmg = attr.dmg
        return super.activate_final(c, system, a, i);
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
        const cause = this.cause(system, c)
        return [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(system, a as any)(cause)({
                dmg : newDmg
            })
        ]
    }
}

export class e_add_counter extends Effect {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times > 0
    }

    override activate_final(c: dry_card, system: dry_system, a: Action) {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []
        const cause = this.cause(system, c)

        let res : Action[] = []
        while(t > 0){
            res.push(
                actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(system, c)(
                    cause, {}
                )
            )
            t--;
        }
        return res;
    }
}

export class e_add_counter_to_targets extends Effect<inputData_card[]> {
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.allZones(s, c).cards().many(this.count, this)
    }
    
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times > 0 && this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        let t = this.times
        if(!t || isNaN(t) || !isFinite(t)) return []
        const cause = this.cause(s, c)

        let res : Action[] = []
        while(t > 0){
            input.next().forEach(c => {
                res.push(
                    actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(s, c.data.card)(
                        cause, {}
                    )
                )
            })
            t--;
        }
        return res;
    }
}

export class e_revive extends Effect<[inputData_card, inputData_pos]> {
    //condition: card in grave, pos on field=

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card, inputData_pos], [inputData_card, inputData_pos], inputData_standard, inputData_card, [inputData_pos]> {
        const z = s.getZoneOf(c)!
        const s1 = Request.grave(s, c).ofSamePlayer(z).cards().once(this)
        const s2 = Request.field(s, c).ofSamePlayer(z).pos().isEmpty().once(this)
        return s1.merge(s2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_card, inputData_pos]>): Action[] {
        const tc = input.next()[0].data.card
        const tp = input.next()[1].data.pos
        const cause = actionFormRegistry.effect(s, c, this)

        return [
            actionConstructorRegistry.a_pos_change(s, tc)(tp)(cause)
        ]
    }
}

/**Remove this card when it leaves the field */
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

            return zFrom.is(zoneRegistry.z_field)
        }   
        return false
    }

    override activate_final(c: dry_card, s: dry_system, a: Action){
        const cause = this.cause(s, c)
        return [
            actionConstructorRegistry.a_replace_action(s, 
                actionConstructorRegistry.a_void(s, c)(cause)
            )(cause)
        ]
    }
}

/**Destroy self after attack */
export class e_fragile extends e_destroy.toThisCard() {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        //if this card attacks
        return (
            a.is("a_attack") &&
            a.targets[0].is(c)
        )
    }
}

export class e_draw extends Effect<[inputData_zone, inputData_zone]> {
    //deck, hand
    get times() {return this.attr.get("times") ?? 0}
    set times(val : number) {this.attr.set("times", val)}

    get cooldown() {return this.attr.get("cooldown") ?? NaN}
    set cooldown(val : number) {this.attr.set("cooldown", val)}

    get doTurnDraw() : boolean {return this.attr.get("doTurnDraw") != 0}
    set doTurnDraw(val : boolean) {this.attr.set("doTurnDraw", Number(val))}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.times > 0 && !isNaN(this.times) && isFinite(this.times)
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_zone, inputData_zone], [inputData_zone, inputData_zone], inputData_standard, inputData_zone, [inputData_zone]> {
        const z = s.getZoneOf(c)!
        const g1 = Request.deck(s, c).ofSamePlayerType(z).once(this);
        const g2 = Request.hand(s, c).ofSamePlayerType(z).once(this);
        return g1.merge(g2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, inputData_zone]>): Action[] {
        let t = this.times
        let res : Action[] = []

        const i = input.next()
        const hand = i[0].data.zone
        const deck = i[1].data.zone

        const cause = actionFormRegistry.effect(s, c, this)

        while(t > 0){
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
}

export class e_draw_until extends e_draw {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0;
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone, inputData_zone]>): Action[] {
        const i = input.next()
        const hand = i[0].data.zone

        let diff = this.count - hand.cardArr_filtered.length

        if(diff > 0){
            this.times = diff;
            return super.activate_final(c, s, a, input);
        }

        return []
    }
}

//Lock actually has 2 forms : 
// This implements the condition form
// There is another form as a forced negative effect, like decompiling X cards on your side of the field
// That...can just be added to the beginning of the Action arr tho
export class e_lock extends Effect {
    //delegates the actual condition to a sensible function rather than the inverses

    //return true to unlock
    protected key_condition : (c : dry_card, s : dry_system, a : Action, attr : this["attr"]) => boolean = () => true

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return !this.key_condition(c, system, a, this.attr);
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_standard[]>): Action[] {
        return [actionConstructorRegistry.a_negate_action(this.cause(s, c))]
    }

    static keyCondition(f: (...p: [dry_card, dry_system, Action, Effect["attr"]]) => boolean) {
        return class ExtendedEff extends this {
            constructor(...p : [any, any, any, any, any]){
                super(...p);
                this.key_condition = f.bind(this)
            }
        }
    }
}

export class e_bounce extends Effect<[...inputData_card[], inputData_zone]>{
    //target cards, deck
    get target_zone() : zoneRegistry {return this.attr.get("target_zone") ?? zoneRegistry.z_field}

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [...inputData_card[], inputData_zone], [...inputData_card[], inputData_zone], inputData_standard, inputData_standard, inputData_standard[]> {
        const z = s.getZoneOf(c)!
        const s1 = Request.specificType(s, c, this.target_zone).ofSamePlayerType(z).cards().many(this.count, this);
        const s2 = Request.deck(s, c).once(this)
        return s1.merge(s2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[...inputData_card[], inputData_zone]>): Action[] {
        const i = input.next();
        const deck = (i.pop() as inputData_zone).data.zone;
        const cards = i as inputData_card[];

        const cause = this.cause(s, c)

        const res :Action[] = cards.map(c_i => {
            return actionConstructorRegistry.a_add_top(s, c_i.data.card)(deck)(cause)
        })

        res.push(
            deck.getAction_shuffle(s, cause)
        )

        return res;
    }
}

export class e_delay extends Effect<inputData_card[]>{
    get delayCount() : number {return this.attr.get("delayCount") ?? 0}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0 && this.delayCount > 0
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.field(s, c).cards().hasAutomate().many(this.count, this)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cards = input.next().map(c => c.data.card);
        const res : Action[] = []
        const cause = this.cause(s, c)
        cards.forEach(c => {
            const automateEff = c.statusEffects.filter(e => e instanceof e_automate_base)
            automateEff.forEach(eff => {
                res.push(actionConstructorRegistry.a_delay(cause, {
                    delayAmmount : this.delayCount,
                    delayCID : c.id,
                    delayEID : eff.id
                }))
            })
        })
        return res;
    }
}

/**Add all cards of a particular dataID from the same zone too hand */
export class e_add_all_to_zone extends Effect<[inputData_card, inputData_zone]> {
    protected target_zone : zoneRegistry = zoneRegistry.z_system

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card, inputData_zone], [inputData_card, inputData_zone], inputData_standard, inputData_card, [inputData_zone]> {
        const x = Request.allZones(s, c).cards().once(this)
        const y = Request.specificType(s, c, this.target_zone).once(this)
        return x.merge(y)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_card, inputData_zone]>): Action[] {
        const n = input.next()
        const candidate = n[0].data.card
        const z = n[1].data.zone
        const cause = this.cause(s, c)

        const cards = z.cardArr_filtered.filter(c => c.dataID === candidate.dataID)

        return cards.map(c => 
            actionConstructorRegistry.a_pos_change(s, c)(
                z.top
            )(cause)
        )
    }

    static to(zType : zoneRegistry){
        return class extendedEff extends this {
            protected override target_zone: zoneRegistry = zType
        }
    }
}

export class e_remove_all_effects extends Effect<inputData_card[]>{

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.allZones(s, c).cards().many(this.count, this)
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cards = input.next()
        const cause = this.cause(s, c)

        return cards.map(c => 
            actionConstructorRegistry.a_remove_all_effects(s, c.data.card)(cause)
        )
    }
}

export class e_deal_dmg_card extends Effect<inputData_card[]>{
    get dmg(){return this.attr.get("dmg") ?? 0}
    get dmgType(){return this.attr.get("dmgType") ?? damageType.physical}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }
    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.field(s, c).cards().many(this.count, this);
    }
    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cards = input.next()
        const cause = this.cause(s, c)
        return cards.map(c => actionConstructorRegistry.a_deal_damage_card(s, c.data.card)(cause, {
            dmg : this.dmg, 
            dmgType : this.dmgType
        }))
    }
}

export class e_shuffle_into_deck extends Effect<[...inputData_card[], inputData_zone]> {

    get target_zone() : zoneRegistry {return this.attr.get("target_zone") ?? zoneRegistry.z_field}

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [...inputData_card[], inputData_zone], [...inputData_card[], inputData_zone], inputData_standard, inputData_standard, inputData_standard[]> {
        const z = s.getZoneOf(c)!
        const s1 = Request.specificType(s, c, this.target_zone).ofSamePlayerType(z).cards().many(this.count, this);
        const s2 = Request.deck(s, c).once(this)
        return s1.merge(s2)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[...inputData_card[], inputData_zone]>): Action[] {
        const data = input.next();
        const deck = data.pop() as inputData_zone
        const cards = data as inputData_card[]
        const cause = this.cause(s, c)

        const res : Action[] = cards.map(c => actionConstructorRegistry.a_pos_change(s, c.data.card)(deck.data.zone.top)(cause))
        const k = deck.data.zone.getAction_shuffle(s, cause)
        if(k instanceof error) return []
        res.push(k)
        return res
    }
}

export class e_send_all_to_grave extends Effect<[inputData_card, inputData_zone]> {
    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card, inputData_zone], [inputData_card, inputData_zone], inputData_standard, inputData_card, [inputData_zone]> {
        const x = Request.allZones(s, c).cards().once(this)
        const y = Request.grave(s, c).once(this)
        return x.merge(y)
    }
}

export const e_add_all_to_hand = e_add_all_to_zone.to(zoneRegistry.z_hand)
export const e_add_all_to_grave = e_add_all_to_zone.to(zoneRegistry.z_grave)

export class e_capacitor_1 extends Effect<[]> {
    override canRespondAndActivate_final(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_deal_damage_card") && !c.hasCounter
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        //if any card would take damage, add counter (max 3) instead
        if(!a.is("a_deal_damage_card")) return []
        const wouldBeDmg = a.flatAttr().dmg
        const cause = this.cause(s, c)

        const counter_count = Utils.clamp(wouldBeDmg, this.attr.get("maxCount") ?? 0, 0)

        const res : Action[] = [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(s, a)(cause)({
                dmg : 0
            })
        ]

        if(counter_count > 0){
            res.push(
                actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(s, c)(cause, {
                    count : counter_count
                })
            )
        }

        return res
    }
} 

export class e_capacitor_2 extends Effect<[]> {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return a.is("a_deal_damage_card") && c.hasCounter
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        if(!a.is("a_deal_damage_card")) return []
        const counterCount = c.numCounters
        const originalDmg = a.flatAttr().dmg
        const cause = this.cause(s, c)

        return [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(s, a)(cause)({
                dmg : originalDmg + counterCount
            }),
            actionConstructorRegistry.a_clear_all_counters(s, c)(cause)
        ]
    }
}

export class e_reset_all_once extends Effect<inputData_card[]> {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_card[], inputData_card[], inputData_standard, inputData_standard, inputData_standard[]> {
        return Request.field(s, c).ofSamePlayer(s.getZoneOf(c)).cards().many(this.count)
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_card[]>): Action[] {
        const cause = this.cause(s, c)
        const target = input.next()
        return target.map(c => actionConstructorRegistry.a_reset_all_once(s, c.data.card)(cause))
    }
}

export default {
    e_add_to_hand, 
    e_add_all_to_hand,
    e_add_all_to_grave,
    e_quick,
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
    e_draw_until,
    e_deal_dmg_card,
    e_deal_dmg_ahead,
    e_reset_all_once,
    e_remove_all_effects,
    
    e_delay, 
    e_delay_all : e_delay.toAllEnemies(),
    e_bounce,
    e_lock,

    e_void_this : e_void.toThisCard(),
    e_destroy_this : e_destroy.toThisCard(),
    e_clear_all_status_this : e_clear_all_status.toThisCard(),
    e_reactivate_this : e_reactivate.toThisCard(),
    e_deactivate_this : e_deactivate.toThisCard(),
    e_decompile_this : e_decompile.toThisCard(),
    e_execute_this : e_execute.toThisCard(),
    e_reset_all_once_this : e_reset_all_once.toThisCard(),

    //specific sections
    //afterburner is e_draw_until
    //avarice is e_shuffle_into_deck + e_draw
    e_avarice_1 : e_shuffle_into_deck.implyCondition("c", 
        function(c, oldc, s, a){
            const z = s.getZoneOf(c)!
            const z1 = s.getZoneOf(oldc)!
            return z.is(zoneRegistry.z_grave) && z.playerIndex === z1.playerIndex
        }
    ),
    //avraice_2 is e_draw
    //battery is e_draw with isTurnDraw = true

    //clawtrap is gravebound
    e_clawtrap : e_deal_dmg_card.toAllEnemies(),
    e_capacitor_1,
    e_capacitor_2,

    //** damage capacitor is just weird, implement later
    //cinder is e_delay
    //constant correction is e_add_stat_change_override
    //** crystal ball is less weird but also must be custom coded
    //double execute is just...e_execute switched to input mode
    //ember is e_draw
    //fireball is e_deal_damage_ahead
    //flash is e_deal_damage_card, change the effect to its smallest turn countdown
    //flashbang is e_destroy + e_delay (all enemies), 
    //e_force is .then to e_deal_damage_ahead
    //inferno is e_deal_damage_card with changed input, changed condition
    //magic ember is e_decompile signaling count to e_draw
    //magic flare is e_decompile and e_deal_damage_card both listen to numbe rof 0|1 card on field for input
    //rush mega is e_add_stat_change_diff
}