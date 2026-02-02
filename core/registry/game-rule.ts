import type QueenSystem from "../../queen-system";
import type { BrandedNumber, BrandedString } from "../misc";
import { ActionGenerator, ActionRegistry, ZoneRegistry, type Action, type ActionBase, type ActionID, type ActionName, type oneTarget, type ZoneTypeID } from ".";
import { IDRegistry, Registry } from "./base";
import { Target, TargetTypeID, type TargetCard, type TargetZone } from "../target-type";
import { DamageType, TurnPhase } from "../system";
import { Effect, StatusEffect_base } from "../../game-components/effects";
import type { Card } from "../../game-components/cards";
import type { Position } from "../../game-components/positions";
import type { Zone } from "../../game-components/zones";
import Request from "../../system-components/inputs/input-request-maker";
import type { CardDry, ZoneDry } from "../interface";

export type GameRuleID = BrandedNumber<GameRule>
export type GameRuleName = BrandedString<GameRule>

const GameRuleRegistry = Registry.from<GameRuleID, GameRuleName, GameRule, {}>({})
export {GameRuleRegistry}

interface GameRuleControlData {
    targetPhase? : TurnPhase,
    replacedActionArr? : Action[],
}

/**
 * Gamerule is neither a card or an effect
 * Think of them like field conditions
 * Traits:
 * + Gamerule can have modifiers/children gamerules that acts before or after they do, 
 *   these can deny the main gamerule from activating at all (similar to effect modifier)
 * + Gamerule activates in the resolve step, mapping from the active action -> action[], changes the game directly
 * + Gamerule employs singleton behaviors 
 * **/
export abstract class GameRule<T_expect_action extends ActionName | undefined | "a_all" = ActionName | undefined | "a_all"> {
    isDefaultGameRule = false
    group? : string
    negated = false
    static id : GameRuleID = -1 as any
    //If classification is not undef, we default checks for is(name)
    //else everything goes
    abstract classification : T_expect_action

    //inheritable singleton pattern
    private static instances = new Map<Function, GameRule>()
    constructor(){
        const constructor = this.constructor as typeof GameRule;
        
        if(GameRule.instances.has(constructor)) {
            return GameRule.instances.get(constructor)! as any;
        }
        
        GameRule.instances.set(constructor, this);
        constructor.id = GameRuleRegistry.add(constructor.name, this)
    }
    
    readonly phase : TurnPhase = TurnPhase.resolve

    is(p : "a_all") : this is GameRule<"a_all">;
    is<T extends ActionName>(p : ActionName) : this is GameRule<T>
    is(p : ActionName | "a_all"){
        return this.classification === p
    }

    abstract resolves(s : QueenSystem, a : T_expect_action extends "a_all" ? Action[] : Action<Exclude<T_expect_action, "a_all">>) : GameRuleControlData | Action[] | undefined | void;
    get displayID() : GameRuleName {return GameRuleRegistry.getKey((this.constructor as typeof GameRule).id)}
    get identity(){
        return Target.gameRule()
    }
    
    getDisplayInput?(s : QueenSystem, a : Action) : (number | string)[]
}

abstract class DefaultGameRule<T extends ActionName | undefined | "a_all" = undefined> extends GameRule<T> {
    override isDefaultGameRule = true
}

export class GameRule_allow_remove_status_effect extends DefaultGameRule<"a_remove_status_effect"> {
    override group = "effect"
    override classification = "a_remove_status_effect" as const;
    override resolves(s: QueenSystem, a: Action<"a_remove_status_effect">): Action[] | undefined | void {
        const e = a.targets[0].data
        const c = a.targets[1].data as Card
        c.removeStatusEffect(e.id)
    }
}

export class GameRule_allow_remove_all_status_effects extends DefaultGameRule<"a_clear_all_status_effect"> {
    override group = "effect"
    override classification = "a_clear_all_status_effect" as const;
    override resolves(s: QueenSystem, a: Action<"a_clear_all_status_effect">): Action[] | undefined | void {
        const c = a.targets[0].data as Card
        return c.statusEffects.map(e => ActionGenerator.a_remove_status_effect(e)(c)(this.identity))
    }
}

export class GameRule_allow_remove_all_effects extends DefaultGameRule<"a_remove_all_effects"> {
    override group = "effect"
    override classification = "a_remove_all_effects" as const;
    override resolves(s: QueenSystem, a: Action<"a_remove_all_effects">): Action[] | undefined | void {
        const c = a.targets[0].data as Card
        return c.statusEffects.map(e => ActionGenerator.a_remove_effect(c)(e)(this.identity))
    }
}


export class GameRule_allow_add_status_effect extends DefaultGameRule<"a_add_status_effect"> {
    override group = "effect"
    override classification = "a_add_status_effect" as const;
    override resolves(s: QueenSystem, a: Action<"a_add_status_effect">): Action[] | undefined | void {
        let statusString = a.getAttr("typeID")
        let eff = s.effectLoader.getEffect(statusString, s.setting);
        if(!eff || !(eff instanceof StatusEffect_base)) return;

        const c = a.targets[0].data as Card
        c.addStatusEffect(eff);
        return [];
    }
}

export class GameRule_allow_dealing_damage_ahead extends DefaultGameRule<"a_deal_damage_ahead"> {
    override group = "damage"
    override classification = "a_deal_damage_ahead" as const;
    override resolves(s: QueenSystem, a: Action<"a_deal_damage_ahead">): Action[] | undefined | void {
        const c = a.targets[0].data as Card
        const attackTarget = s.getWouldBeAttackTargets(c) as Card | undefined;
        if(!attackTarget) return;
        return [
            ActionGenerator.a_deal_damage_card(attackTarget)(this.identity, {
                dmg : a.getAttr("dmg") ?? c.atk,
                dmgType : a.getAttr("dmgType") ?? DamageType.physical
            })
        ]
    }
}

export class GameRule_dealing_damage_ahead_when_no_target_deals_heart_dmg_equals_to_atk extends DefaultGameRule<"a_deal_damage_ahead"> {
    override group = "damage"
    override classification = "a_deal_damage_ahead" as const;
    override resolves(s: QueenSystem, a: Action<"a_deal_damage_ahead">): Action[] | undefined | void {
        const c = a.targets[0].data as Card
        const z = s.getZoneOf(c) as ZoneDry
        const attackTarget = s.getWouldBeAttackTargets(c) as Card | undefined;
        if(!attackTarget) return [
            ActionGenerator.a_deal_heart_damage(z.playerIndex)(this.identity, {
                dmg : c.atk
            })
        ]
    }
}

export class GameRule_allow_dealing_damage_to_cards extends DefaultGameRule<"a_deal_damage_card"> {
    override group = "damage"
    override classification = "a_deal_damage_card" as const;
    override resolves(s: QueenSystem, a: Action<"a_deal_damage_card">): Action[] | undefined | void {
        let c = a.targets[0].data as Card;
        let dmg = a.getAttr("dmg");
        c.hp -= dmg;
    }
}

abstract class GameRule_allow_send_to_top_of_zone extends DefaultGameRule<any> {
    abstract toZoneType : ZoneTypeID
    abstract override classification : oneTarget<TargetCard>
    override resolves(s: QueenSystem, a: Action): Action[] | undefined | void {
        if(!a.is(this.classification)) return;
        const c = a.targets[0].data
        const cause = this.identity
        
        return [
            ActionGenerator.a_get_input(cause, {
                requester : Request.specificType(s, c, this.toZoneType).ofSamePlayer(s.getZoneOf(c)).once(),
                applicator(i) {
                    return [
                        ActionGenerator.a_move(c)(i[0].data.top)(cause)
                    ]
                },
            })
        ]
    }
}

export class GameRule_allow_destroy_card extends GameRule_allow_send_to_top_of_zone {
    override group = "card"
    override classification = "a_destroy" as const;
    override toZoneType = ZoneRegistry.grave;
}

export class GameRule_allow_decompile_card extends GameRule_allow_send_to_top_of_zone {
    override group = "card"
    override classification = "a_decompile" as const;
    override toZoneType = ZoneRegistry.grave;
} 

export class GameRule_allow_void_card extends GameRule_allow_send_to_top_of_zone {
    override group = "card"
    override classification = "a_void" as const;
    override toZoneType = ZoneRegistry.void;
}

export class GameRule_allow_execute_card extends GameRule_allow_send_to_top_of_zone {
    override group = "card"
    override classification = "a_execute" as const;
    override toZoneType = ZoneRegistry.grave;
}

export class GameRule_execute_also_do_physical_attack extends DefaultGameRule<"a_execute"> {
    override group = "card"
    override classification = "a_execute" as const;
    override resolves(s: QueenSystem, a: Action<"a_execute">): Action[] | undefined | void {
        const c = a.targets[0].data
        return [
            ActionGenerator.a_attack(c)(this.identity, {
                dmg : c.atk,
                dmgType : DamageType.physical
            })
        ]
    }
}

export class GameRule_allow_move_cards extends DefaultGameRule<"a_move"> {
    override group = "card"
    override classification = "a_move" as const;
    override resolves(s: QueenSystem, a: Action<"a_move">): Action[] | undefined | void {
        let k1 = a.targets[0];
        let k2 = a.targets[1];

        const pos = k2.data as Position
        const c = k1.data as Card
        
        // const zFrom = this.zoneArr[c.pos.zoneID]
        // if(!zFrom || !zFrom.validatePosition(c.pos)) return [];
        
        const zTo = s.getZoneWithID(pos.zoneID)
        if(!zTo) return;
        
        let res : Action[] = []
        let temp : Action[] | undefined

        if(pos && zTo.validatePosition(pos) && pos.zoneID === c.pos.zoneID){
            console.log("move is triggered")
            let idxTo = pos.zoneID
            temp = s.getZoneWithID(idxTo)?.move(this.identity, c, pos)
            if(!temp) return;
            //move within zone is prioritized
            res.push(...temp);
        } else {
            //move across zones
            temp = s.getZoneOf(c)?.remove(this.identity, c) 
            if(!temp) return;         
            res.push(...temp);
            temp = s.getZoneWithID(pos.zoneID)?.add(this.identity, c, pos) 
            if(!temp) return;
            res.push(...temp)
        }

        return res
    }
}

export class GameRule_turn_start_also_do_turn_reset extends DefaultGameRule<"a_turn_start"> {
    override group = "flow-control"
    override classification = "a_turn_start" as const;
    override resolves(s: QueenSystem, a: Action<"a_turn_start">): Action[] | undefined | void {
        return [
            ActionGenerator.a_turn_reset(this.identity)
        ]
    }
}

export class GameRule_turn_draw_also_do_turn_reset extends DefaultGameRule<"a_draw"> {
    override group = "flow-control"
    override classification = "a_draw" as const;
    override resolves(s: QueenSystem, a: Action<"a_draw">): Action[] | undefined | void {
        if(a.getAttr("isTurnDraw")){
            return [
                ActionGenerator.a_turn_reset(this.identity)
            ]
        }
    }
}

export class GameRule_allow_draw extends DefaultGameRule<"a_draw"> {
    override group = "zone"
    override classification = "a_draw" as const;
    override resolves(s: QueenSystem, a: Action<"a_draw">): Action[] | undefined | void {
        const [deck, hand] = a.targets
        if(!deck || !deck.data.is(ZoneRegistry.deck)) return;
        if(!hand || !hand.data.is(ZoneRegistry.hand)) return;

        const c = deck.data.cardArrFiltered[0]
        if(!c) return;

        return [
            ActionGenerator.a_move(c)(hand.data.top)(this.identity)
        ]
    }
}

export class GameRule_allow_shuffle extends DefaultGameRule<"a_shuffle"> {
    override group = "zone"
    override classification = "a_shuffle" as const;
    override resolves(s: QueenSystem, a: Action<"a_shuffle">): Action[] | undefined | void {
        let z = a.targets[0].data as Zone | undefined
        if(!z || !z.shuffle) return;
        return z.shuffle(this.identity, a.flatAttr().shuffleMap)
    }
}

export class GameRule_asks_effect_can_activate_twice extends DefaultGameRule<"a_internal_try_activate"> {
    override group = "flow-control"
    override classification = "a_internal_try_activate" as const;
    override resolves(s: QueenSystem, a: Action<"a_internal_try_activate">): Action[] | undefined | void {
        const log = a.getAttr("log")
        const targetPos = a.targets[0].data
        const z = s.getZoneWithID(targetPos.zoneID)
        if(!z) return [];
        const c : Card | undefined = z.getCardByPosition(targetPos as Position)
        if(!c) return [];
        return c.totalEffects.flatMap(e => {
            if(Effect.checkCanActivate(e, c, s, a)){
                log.responses[c.id].push(e.id)
                return [ActionGenerator.a_activate_effect(e)(c)(this.identity)]
            } 
            return []
        })
    }
}

export class GameRule_allow_card_reset extends DefaultGameRule<"a_reset_card"> {
    override group = "card"
    override classification = "a_reset_card" as const;
    override resolves(s: QueenSystem, a: Action<"a_reset_card">): Action[] | undefined | void {
        return (a.targets[0].data as Card).reset()
    }
}

export class GameRule_allow_effect_reset extends DefaultGameRule<"a_reset_effect"> {
    override group = "effect"
    override classification = "a_reset_effect" as const;
    override resolves(s: QueenSystem, a: Action<"a_reset_effect">): Action[] | undefined | void {
        return (a.targets[0].data as Effect).reset()
    }
}

export class GameRule_allow_turn_reset extends DefaultGameRule<"a_turn_reset"> {
    override group = "flow-control"
    override classification = "a_turn_reset" as const;
    override resolves(s: QueenSystem, a: Action<"a_turn_reset">): Action[] | undefined | void {
        return s.zoneArr.flatMap(i => i.turnReset(a))
    }
}

export class GameRule_effects_can_be_activated extends DefaultGameRule<"a_activate_effect"> {
    override group = "effect"
    override classification = "a_activate_effect" as const;
    override resolves(s: QueenSystem, a: Action<"a_activate_effect">): Action[] | undefined | void {
        const [eff, card] = a.targets
        const input = Effect.tryActivate(eff.data as Effect, card.data, s, a)
        
        if(!input) return [];
        if(!input[0]) return input[1]();
    
        return [
            ActionGenerator.a_get_input(a.cause, {
                requester : input[0],
                applicator : input[1]
            })
        ];
    } 
}

export class GameRule_actions_can_be_negated extends DefaultGameRule<"a_all"> {
    override group = "flow-control"
    override phase = TurnPhase.resolve;
    override classification = "a_all" as const;
    override resolves(s: QueenSystem, arr : Action[]): GameRuleControlData | void{
        const negateActions = arr.filter(a => a.is("a_negate_action")) as Action<"a_negate_action">[]
        if(negateActions.length) return {   
            targetPhase : TurnPhase.complete,
            replacedActionArr : arr.flatMap(a => {
                if(a.isCost) return a;
                if(a.is("a_negate_action")) return a.getAttr("replaceWith") ?? [];
                return []
            })
        };
    }
}

export class GameRule_actions_can_be_modified extends DefaultGameRule<"a_modify_action"> {
    override group = "action"
    override classification = "a_modify_action" as const;
    override resolves(s: QueenSystem, a : Action<"a_modify_action">): Action[] | undefined | void {
        let target = a.targets[0].data as Action
        let modifyObj = a.flatAttr()

        Object.entries(modifyObj).forEach(([key, val]) => {
            if(key !== "type") target.modifyAttr(key, val);
        })
    }
}

export class GameRule_attack_deals_damage_straight_ahead extends DefaultGameRule<"a_attack"> {
    override group = "damage"
    override classification = "a_attack" as const;
    override resolves(s: QueenSystem, a: Action<"a_attack">): Action[] | undefined | void {
        return [
            ActionGenerator.a_deal_damage_ahead(a.targets[0].data)(this.identity, a.flatAttr())
        ]
    }
}

export class GameRule_cards_on_field_destroy_at_0_hp extends DefaultGameRule {
    override group = "dead"
    classification = void 0;
    override resolves(s: QueenSystem, a: Action): Action[] | undefined | void {
        const cardTargets = a.targets.filter(val => val.type === TargetTypeID.card)
        cardTargets.forEach(i => {
            const c = i.data
            if(c.hp <= 0) return [
                ActionGenerator.a_destroy(c)(this.identity)
            ]
        })
    }
}

export class GameRule_force_loss_on_heart_at_0 extends DefaultGameRule {
    override group = "dead"
    override classification: undefined;
    override resolves(s: QueenSystem, a: ActionBase<Target[], any, any>): Action[] | undefined | void {
        const playerTargets = a.targets.filter(val => val.type === TargetTypeID.player)
        playerTargets.forEach(i => {
            const p = s.getPlayerWithID(i.data)
            if(p && p.heart <= 0) return [
                ActionGenerator.a_force_end_game(this.identity)
            ]
        })
    }
}

export class GameRule_allow_dealing_heart_damnage extends DefaultGameRule<"a_deal_heart_damage"> {
    override group = "damage"
    override classification = "a_deal_heart_damage" as const;
    override resolves(s : QueenSystem, a : Action<"a_deal_heart_damage">){
        let pid = a.targets[0].data
        const player = s.getPlayerWithID(pid)
        if(!player) return;

        let dmg = a.getAttr("dmg")
        player.heart -= dmg;
    }
}


//Threat system
export class GameRule_threat_burn extends DefaultGameRule<"a_do_threat_burn"> {
    override group = "threat"    
    override classification = "a_do_threat_burn" as const;
    override resolves(s: QueenSystem, a: Action<"a_do_threat_burn">): Action[] | undefined | void {
        //halves player's health, round up
        const player = s.getPlayerWithID(a.targets[0].data)
        if(!player) return;
        const dmg = Math.ceil(player.heart / 2);
        return [
            ActionGenerator.a_deal_heart_damage(player.playerIndex)(this.identity, {dmg})
        ]
    }
}

export class GameRule_allow_set_threat extends DefaultGameRule<"a_set_threat_level"> {
    override group = "threat"
    override classification = "a_set_threat_level" as const;
    override resolves(s: QueenSystem, a: Action<"a_set_threat_level">): Action[] | undefined | void {
        s.threatLevel = a.getAttr("newThreatLevel")
    }
}

export class GameRule_increment_threat_on_turn_end extends DefaultGameRule<"a_turn_end"> {
    override group = "threat"
    override classification = "a_turn_end" as const;
    override resolves(s: QueenSystem, a: Action<"a_turn_end">): Action[] | undefined | void {
        s.threatLevel++;
        if(s.threatLevel >= s.maxThreatLevel){
            s.threatLevel = 0;
            return [
                ActionGenerator.a_do_threat_burn(s.getCurrentPlayerID())(this.identity)
            ]
        }
    }
}