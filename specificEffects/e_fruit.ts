import { Action, actionConstructorRegistry } from "../_queenSystem/handler/actionGenrator"
import type { inputRequester, inputRequester_finalized } from "../_queenSystem/handler/actionInputGenerator"
import Request from "../_queenSystem/handler/actionInputRequesterGenerator"
import { inputType, type dry_card, type dry_system, type inputData_card, type inputData_pos, type inputData_standard, type inputData_zone } from "../data/systemRegistry"
import { zoneRegistry } from "../data/zoneRegistry"
import { actionFormRegistry } from "../_queenSystem/handler/actionGenrator"
import Effect from "../types/abstract/gameComponents/effect"
import { e_add_all_to_grave, e_add_all_to_hand, e_add_stat_change_diff, e_add_to_hand, e_deal_dmg_card, e_deal_dmg_ahead, e_draw, e_lock, e_remove_all_effects, e_revive } from "./e_generic"
import { damageType } from "../types/misc"
import { e_void } from "./e_generic_cardTargetting"

class e_autumn extends Effect {
    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_standard[]>): Action[] {
        const cards = Request.field(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofArchtype("fruit").ofLevel(1).clean()
        const cause = actionFormRegistry.effect(s, c, this)
        c.addShareMemory(this, "count", cards.length)

        return cards.map(c => 
            actionConstructorRegistry.a_remove_all_effects(s, c)(cause)
        )
    }
}

class e_greenhouse extends e_add_to_hand {
    ___target_data_id : string = ""

    override canRespondAndActivate_final(c: dry_card, s: dry_system, a: Action): boolean {
        if(
            s.isPlayAction(a) && //a card is played
            a.targets[0].card.level <= (this.attr.get("checkLevel") ?? 1) && //that card level is this eff's checkLevel attr
            a.targets[0].card.dataID !== c.dataID && //that card is not "GreenHouse"
            a.targets[1].pos.zoneID === c.pos.zoneID && //the target pos is in the same zone as this card
            s.getZoneOf(c)!.isC2Behind(c, a.targets[1])//the target pos is behind this card
        ){
            this.___target_data_id = a.targets[0].card.dataID
            return true
        }
        return false;
    }

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card, inputData_zone], [...inputData_card[], inputData_zone], inputData_standard, inputData_standard, inputData_standard[]> {
        //one card from grave with the same name as the saved name
        const r1 = Request.grave(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofDataID(this.___target_data_id).once()
        const r2 = Request.hand(s, c).once()
        return r1.merge(r2)
    }
}

class e_lemon extends Effect {
    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_standard[]>): Action[] {
        const cards = Request.field(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofSameDataID(c).clean()
        const cause = actionFormRegistry.effect(s, c, this)
        return cards.map(c => 
            actionConstructorRegistry.a_attack(s, c)(cause, {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        )
    }
}

class e_pomegranate extends Effect<[inputData_zone]> {
    get exposedDmg() {return this.attr.get("exposedDmg") ?? 0}
    get coveredDmg() {return this.attr.get("coveredDmg") ?? 0}

    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_zone], [inputData_zone], inputData_standard, inputData_zone, []> {
        return Request.oppositeZoneTo(s, c).once()
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_zone]>): Action[] {
        const zone = input.next()
        const cards = zone[0].data.zone.cardArr_filtered
        const cause = actionFormRegistry.card(s, c)

        return cards.map(c => actionConstructorRegistry.a_deal_damage_card(s, c)(cause, {
            dmg : s.getZoneOf(c)!.isExposed(c) ? this.exposedDmg : this.coveredDmg,
            dmgType : damageType.magic
        }))
    }

    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.exposedDmg, this.coveredDmg]
    }
}

class e_pollinate extends Effect<[inputData_card]> {
    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card], [inputData_card], inputData_standard, inputData_card, []> {
        return Request.deck(s, c).cards().ofLevel(1).ofArchtype("fruit").filter(c => c.getFirstActualPartitionIndex() >= 0).once()
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_card]>): Action[] {
        const card = input.next()[0].data.card
        const cards = 
            this.doArchtypeCheck ? 
            Request.hand(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofLevel(1).ofArchtype("fruit").clean() :
            Request.hand(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofLevel(1).clean()
        const cause = actionFormRegistry.effect(s, c, this)

        const pid = card.getFirstActualPartitionIndex()

        return [
            ...cards.map(c => actionConstructorRegistry.a_duplicate_effect(s, c)(card)(pid)(cause, {
                addedSubtype : ["subtype_once"]
            })), 
        ]
    }
}

class e_spring extends Effect<[inputData_card, inputData_pos]> {
    override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, [inputData_card, inputData_pos], [inputData_card, inputData_pos], inputData_standard, inputData_card, [inputData_pos]> {
        const r1 = Request.grave(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").once()
        const r2 = Request.field(s, c).ofSamePlayer(s.getZoneOf(c)!).pos().isEmpty().once()
        return r1.merge(r2)
    }


    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_card, inputData_pos]>): Action[] {
        const n = input.next()
        const target_c = n[0].data.card
        const target_pos = n[1].data.pos
        const cause = this.cause(s, c)

        const l = Request.grave(s, c).ofSamePlayer(s.getZoneOf(c)!).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").filter(c_ => c.id !== c_.id).clean().length - 1
        if(l < 0) return []

        const a1 = actionConstructorRegistry.a_duplicate_card(s, target_c)(target_pos)(cause, {
            followUp: (c) => ((l : number) => [
                    actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(
                    cause, {
                        maxAtk : Math.max(l, 3),
                    })
                ]
            )(l),
        })

        return [a1]
    }

}


export default {

    //white

    e_apple : e_add_to_hand.implyCondition("c", 
        (c, oldc, s) => 
            c.dataID === "c_apple" && //selection is c_apple
            s.getZoneOf(c)!.is(zoneRegistry.z_deck) //selction is from deck
    ),
    e_banana : e_revive.implyCondition("c", 
        function(c, oldC, _, _2) {
            return c.dataID !== oldC.dataID &&  //selection is NOT same name as this card
            c.level === 1 && //selection is lv1
            (
                !this.doArchtypeCheck || //either dont do archtypecheck or
                c.is("fruit") //selection has to be fruit
                //this condition is upgrade and not upgrade in one
            )
        }
    ),
    e_lemon,
    e_pomegranate,
    e_pumpkin : e_add_stat_change_diff.implyCondition("c", (c, c2) => c.dataID === c2.dataID),
    //e_cherry is e_draw 
    
    //green
    
    e_greenhouse,
    e_pollinate, 

    //blue

    e_autumn,
    //e_autumn also has these 2 in its partition:
    //e_draw
    //e_add_stat_change_diff (if upgraded)

    e_spring,
    e_summer : e_add_to_hand.retarget(
        function(c, s, a){
            const r1 = Request.grave(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").filter(c => c.dataID !== "c_summer").once(this)
            const r2 = Request.hand(s, c).ofSamePlayer(s.getZoneOf(c)).once(this)
            return r1.merge(r2) as any
        },
        (res) => res
    ),

    e_winter_1 : e_add_all_to_grave.implyCondition("c", 
        function(c, oldC, s, a){
            return c.is("fruit") && c.dataID !== "c_winter" && c.level === 1
        }
    ).thenShares(
        function(res, c, s, a, input){
            return ["MaxHp", res.length * this.mult]
        }
    ),
    e_winter_2 : e_add_stat_change_diff.toAllOfZone(
        function(c, s, a){
            return Request.field(s, c).ofSamePlayer(s.getZoneOf(c)).once()
        }
    ),
    //e_winter_3 is e_dmg_reduction

    e_growth : e_add_all_to_hand.implyCondition("c", 
        function(c1, c, s, a){
            return (
                !this.doArchtypeCheck ||
                c.is("fruit")
            )   && (
                s.getZoneOf(c)!.is(zoneRegistry.z_grave)        
            )
        }
    ).thenShares(res => ["count", res.length]),

    //red

    e_demeter_1 : e_add_all_to_hand.implyCondition("c", (c, _, s) => c.level === 1 && c.isFrom(s, zoneRegistry.z_grave)),
    e_demeter_2 : e_deal_dmg_ahead.listen((c, s, a) => s.isPlayAction(a)),
    e_demeter_3 : e_lock.keyCondition((c, s, a) => {
        const z = s.getZoneOf(c)
        if(!z) return false
        return Request.grave(s, c).ofSamePlayer(z).cards().ofArchtype("fruit").ofLevel(1).clean().length > 0
    }),

    e_persephone_1 : e_void.toAllOfZone(
        (c, s, a) => Request.field(s, c).ofSamePlayer(s.getZoneOf(c)!).once()
    ).then((res, c, s, a) => {
        const l = res.length * 2
        res.push(
            actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(actionFormRegistry.effect(s, c, this as any), {
                maxAtk : l,
            })
        )
        return res
    }),

    e_persephone_2 : e_add_stat_change_diff.listen((c, s, a) => a.is("a_attack") && a.targets[0].is(c)),
    // e_persephone_2_2 : e_deal_damage_card.retargetToAllEnemies(),

    e_persephone_3 : e_lock.keyCondition((c, s, a) => {
        const z = s.getZoneOf(c)
        if(!z) return false
        const cardsInField = Request.field(s, c).ofSamePlayer(z).cards().ofArchtype("fruit").ofLevel(1).clean()
        return (new Set(cardsInField.map(c => c.dataID))).size >= 3
    })
}