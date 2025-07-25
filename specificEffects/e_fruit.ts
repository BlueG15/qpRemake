// import type { dry_card, dry_system, dry_position, dry_zone, inputData_card, inputData_pos, inputData, identificationInfo_card, identificationInfo_pos, identificationInfo_zone, identificationInfo, dry_effect, inputData_zone, inputType } from "../data/systemRegistry";
// import { Action_class, actionConstructorRegistry, actionFormRegistry, type Action } from "../_queenSystem/handler/actionGenrator";
// import actionRegistry from "../data/actionRegistry";
// import Effect from "../types/abstract/gameComponents/effect";
// import { Action_final_generatorType, Action_final_generatorType_recur } from "../data/systemRegistry";
// import { zoneRegistry } from "../data/zoneRegistry";
// import { e_draw, e_generic_lock, e_revive } from "./e_generic_effects";
// import { damageType } from "../types/misc";

// export class e_apple extends Effect {
//     //add one card apple from deck to hand, if any

//     get count() {return this.attr.get("count") ?? 0};
//     set count(val : number) {this.attr.set("count", val)};

//     override *activate_final(c: dry_card, system: dry_system, a: Action) : Action_final_generatorType_recur<inputType.zone>{
        
//         const target_hand = yield system.requestInput_zone_default(c, zoneRegistry.z_hand)

//         //get the card with the same dataID as C in the deck
//         const z = system.getZoneWithID(c.pos.zoneID);
//         if(!z) return [];

//         const data = system.getAllZonesOfPlayer(z.playerIndex);

//         const decks = data[zoneRegistry.z_deck];
//         //const hands = data[zoneRegistry.z_hand];

//         if(!decks || !decks.length) return []

//         let target : dry_card[] = []

//         for(let i = 0; i < decks.length; i++){
//             target = decks[i].cardArr_filtered.filter(i =>i.dataID === c.dataID)
//             if(!target.length) continue;
//             break;
//         }

//         if(!target.length) return []

//         let res : Action[] = []
//         for(let i = 0; i < this.count; i++){
//             res.push(actionConstructorRegistry.a_pos_change(system, target[i])(target_hand.data.zone.top)(actionFormRegistry.effect(system, c, this)))
//         }
//         return res
//     }

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return this.count !== 0;
//     }

//     override getDisplayInput(c : dry_card, system : dry_system): (string | number)[] {
//         //how many targets there are in the deck
//         const z = system.getZoneWithID(c.pos.zoneID);
//         if(!z) return [];
//         return system.getAllZonesOfPlayer(z.playerIndex)[
//             zoneRegistry.z_deck
//         ].map(z => z.count(i => i.dataID === c.dataID))
//     }
// }

// export class e_banana extends e_revive {
//     get doFruitCheck() : 0 | 1 {return this.attr.get("doFruitCheck") === 1 ? 1 : 0}
//     set doFruitCheck(val : boolean) {this.attr.set("doFruitCheck", Number(val))}

//     protected override card_input_condition(thisCard : dry_card) {
//         const res = super.card_input_condition(thisCard);
//         res[1] = (
//             (system: dry_system, c: dry_card): boolean => {
//             //extra condition the targetted card is a fruit and is not a banana
//                 return (!this.doFruitCheck || c.extensionArr.includes("fruit")) && c.dataID !== thisCard.dataID && c.level === 1
//             }
//         )
//         return res;
//     }
// }

// export class e_lemon extends Effect {

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return true;
//     }

//     override *activate_final(c: dry_card, system: dry_system, a: Action): Action_final_generatorType_recur {

//         const zone = system.getZoneOf(c)
//         if(!zone) return [];

//         let cards = system.filter(1, (c_find, zid) => {
//             let z = system.getZoneWithID(zid)!
//             return z.types.includes(zoneRegistry.z_field) && c.dataID === c_find.dataID && z.playerIndex === zone.playerIndex
//         })

//         return cards.map(c_element => 
//             actionConstructorRegistry.a_attack(system, c_element)(actionFormRegistry.effect(system, c, this), {
//                 dmg : c_element.atk,
//                 dmgType : damageType.physical
//             })
//         )
//     }
// }

// export class e_pomegranate extends Effect {

//     get exposedDmg() : number {return this.attr.get("exposedDmg") ?? 0};
//     get coveredDmg() : number {return this.attr.get("coveredDmg") ?? 0};

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         if(
//             a.typeID === actionRegistry.a_pos_change ||
//             a.typeID === actionRegistry.a_pos_change_force
//         ) {
//             const target = (a as Action<"a_pos_change">).targets;

//             if(target[0].card.id !== c.id) return false;

//             const zone = system.getZoneWithID(target[1].pos.zoneID)
//             if(!zone) return false;

//             return zone.types.includes(zoneRegistry.z_grave);
//         }
//         return false;
//     }

//     override *activate_final(c: dry_card, system: dry_system, a: Action): Action_final_generatorType_recur {

//         const zone = system.getZoneWithID(c.pos.zoneID);
//         if(!zone) return [];

//         // const targets = system.map(1, (z : dry_zone, c_ele : dry_card) => {
//         //     if(z.isExposed !== undefined && z.isOpposite(zone) && z.isOpposite(c_ele, c)) return [z, c_ele];
//         //     else return undefined
//         // }).filter(i => i !== undefined) as [dry_zone, dry_card][]

//         const targets = system.map(1, (c_ele, zid) => {
//             let z = system.getZoneWithID(zid)!
//             if(z.isCardExposed !== undefined && z.isOpposite(zone) && z.isOpposite(c_ele, c)) return [z, c_ele];
//             else return undefined
//         }).filter(i => i !== undefined) as [dry_zone, dry_card][]

//         return targets.map(([zone, target]) => {
//             return actionConstructorRegistry.a_deal_damage_card(system, target)(actionFormRegistry.effect(system, c, this), {
//                 dmg : (zone.isCardExposed!(target)) ? this.exposedDmg : this.coveredDmg,
//                 dmgType : damageType.magic,
//             })
//         })

//     }

//     override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
//         return [this.exposedDmg]
//     }
// } 

// export class e_pollinate extends Effect {
//     get doFruitCheck() : 0 | 1 {return this.attr.get("doFruitCheck") === 1 ? 1 : 0}
//     set doFruitCheck(val : boolean) {this.attr.set("doFruitCheck", Number(val))}

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(
//             c, zoneRegistry.z_deck,
//             (s : dry_system, c : dry_card) => c.is("fruit") && c.level === 1 && c.effects.length != 0
//         )

//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_grave)
//         const input3 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand)

//         const target_card = (input1 as inputData_card).data.card
//         const target_grave = (input2 as inputData_zone).data.zone
//         const target_hand = (input3 as inputData_zone).data.zone

//         const cause = actionFormRegistry.effect(s, c, this)
        
//         const res : Action[] = [
//             actionConstructorRegistry.a_pos_change(s, target_card)(target_grave.top)(cause)
//         ]

//         const subTypeIDs = target_card.effects[0].subTypes.map(st => st.dataID);
//         if(!subTypeIDs.includes("e_once")) subTypeIDs.push("e_once")

//         if(c.effects[0]) res.push(
//             ...target_hand.cardArr_filtered
//             .filter(c => c.level === 1 && (!this.doFruitCheck || c.is("fruit")))
//             .map(c_ele => actionConstructorRegistry.a_duplicate_effect(s, c_ele)(target_card, target_card.effects[0])(cause, {
//                 overrideData : {
//                     subTypeIDs : subTypeIDs as any[]
//                 }
//             }))
//         )

//         //I didnt implement the effect limit, go nuts
//         return res;
//     }
    
// }

// export class e_growth extends Effect {
//     get doFruitCheck() : 0 | 1 {return this.attr.get("doFruitCheck") === 1 ? 1 : 0}
//     set doFruitCheck(val : boolean) {this.attr.set("doFruitCheck", Number(val))}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return true;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {

//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_grave, 
//             (this.doFruitCheck) ? (_ : any, c : dry_card, z : dry_zone) => c.is("fruit") : undefined
//         );
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_deck);
//         const input3 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand);

//         const target_card = (input1 as inputData_card).data.card
//         const target_deck = (input2 as inputData_zone).data.zone
//         const target_hand = (input3 as inputData_zone).data.zone
//         const target_zone = s.getZoneOf(target_card)!;

//         //return all copies of target in grave to deck
//         const return_targets = target_zone.cardArr_filtered.filter(c => c.dataID === target_card.dataID);
//         let n = return_targets.length;
        
//         const cause = actionFormRegistry.effect(s, c, this);
        
//         const res : Action[] = return_targets.map(c => 
//             actionConstructorRegistry.a_add_top(s, c)(target_deck)(cause),
//         )
//         res.push(
//             target_deck.getAction_shuffle(s, cause)
//         )
//         while(n !== 0){
//             res.push(
//                 target_deck.getAction_draw!(s, target_hand, cause)
//             )
//             n--;
//         }
//         return res;
//     }
// }

// export class e_greenhouse extends Effect {

//     get checkLevel() : number {return this.attr.get("checkLevel") ?? -1}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {

//         const thisZone = system.getZoneOf(c);

//         return (
//             //valid condition
//             this.checkLevel >= 0 &&

//             //action condition
//             (a.is("a_pos_change") ||
//             a.is("a_pos_change_force")) &&

//             //zone condition
//             thisZone !== undefined &&
//             thisZone.is(zoneRegistry.z_field) &&
//             a.targets[1].pos.zoneID === thisZone.id &&

//             //card condition
//             thisZone.isBehind(a.targets[1], c) &&
//             a.targets[0].card.dataID !== this.dataID &&
//             a.targets[0].card.level <= this.checkLevel
//         )
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action<"a_pos_change">): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_grave, (s : any, c : dry_card) => c.dataID === a.targets[0].card.dataID);
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand);

//         const target_card = (input1 as inputData_card).data.card
//         const target_hand = (input2 as inputData_zone).data.zone

//         return [
//             actionConstructorRegistry.a_add_top(s, target_card)(target_hand)(actionFormRegistry.effect(s, c, this))
//         ]
//     }

//     override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
//         return [this.checkLevel]
//     }
// }

// export class e_spring extends Effect {
//     get checkLevel() : number {return this.attr.get("checkLevel") ?? -1}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return this.checkLevel >= 0;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_grave, (s : any, c_ele : dry_card) => c_ele.is("fruit") && c_ele.dataID !== c.dataID && c_ele.level <= this.checkLevel);
//         const input2 = yield s.requestInput_pos_default(c, zoneRegistry.z_field, true);

//         const target_card = (input1 as inputData_card).data.card;
//         const target_pos = (input2 as inputData_pos).data.pos;

//         const target_grave = s.getZoneOf(target_card)!;
//         let increaseAmmount = target_grave.cardArr_filtered.filter(c => c.dataID === target_card.dataID).length;
//         if(increaseAmmount > 3) increaseAmmount = 3

//         const cause = actionFormRegistry.effect(s, c, this)

//         return [
//             actionConstructorRegistry.a_duplicate_card(s, target_pos)(target_card)(cause, {
//                 followUp : [
//                     actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(s, s.NULLCARD)(cause, {
//                         maxAtk : increaseAmmount
//                     })
//                 ]
//             })   
//         ]
//     }

//     override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
//         return [this.checkLevel]
//     }
// }

// export class e_winter extends Effect {
//     get HPinc() : number {return this.attr.get("HPinc") ?? -1}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return this.HPinc >= 0
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_deck, (s : any, c_ele : dry_card) => c_ele.is("fruit") && c_ele.dataID !== c.dataID)
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_grave)
//         const input3 = yield s.requestInput_zone_default(c, zoneRegistry.z_field)


//         const target_card = (input1 as inputData_card).data.card
//         const target_grave = (input2 as inputData_zone).data.zone
//         const target_field = (input3 as inputData_zone).data.zone
//         const target_deck = s.getZoneOf(target_card)!

//         let targets = target_deck.cardArr_filtered.filter(c => c.dataID === target_card.dataID)
//         const healAmmount = this.HPinc * targets.length;
//         const cause = actionFormRegistry.effect(s, c, this);

//         let res : Action[] = []

//         targets.forEach(c => {
//             res.push(
//                 actionConstructorRegistry.a_add_top(s, c)(target_grave)(cause)
//             )   
//         })

//         targets = target_field.cardArr_filtered

//         targets.forEach(c => {
//             res.push(
//                 actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(s, c)(cause, {
//                     maxHp : healAmmount
//                 })
//             )
//         })

//         return res;
//     }

//     override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
//         return [this.HPinc]
//     }
// }

// export class e_summer extends Effect {
//     get checkLevel() : number {return this.attr.get("checkLevel") ?? -1}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return this.checkLevel >= 0;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_grave, (s : any, c_ele : dry_card) => c_ele.is("fruit") && c_ele.dataID !== c.dataID && c_ele.level <= this.checkLevel);
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand);

//         const target_card = (input1 as inputData_card).data.card;
//         const target_hand = (input2 as inputData_zone).data.zone;

//         const cause = actionFormRegistry.effect(s, c, this)

//         return [
//             actionConstructorRegistry.a_add_top(s, target_card)(target_hand)(cause)
//         ]
//     }

//     override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
//         return [this.checkLevel]
//     }
// }

// export class e_autumn extends Effect {
//     get doIncAtk() : 0 | 1 {return this.attr.get("doIncAtk") ? 1 : 0}

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return true;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_zone_default(c, zoneRegistry.z_field);
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_deck);
//         const input3 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand)

//         const target_field = (input1 as inputData_zone).data.zone
//         const target_deck = (input2 as inputData_zone).data.zone
//         const target_hand = (input3 as inputData_zone).data.zone
//         const cause = actionFormRegistry.effect(s, c, this)

//         const targets = target_field.cardArr_filtered.filter(c => c.is("fruit") && c.level === 1)

//         let count = targets.length;
//         if(count === 0) return []

//         let res : Action[] = []
//         targets.forEach(c => {
//             res.push(
//                 actionConstructorRegistry.a_remove_all_effects(s, c)(cause)
//             )
//             if(this.doIncAtk){
//                 res.push(
//                     actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(s, c)(cause, {
//                         maxAtk : 1
//                     })
//                 )
//             }
//         })

//         while(count !== 0){
//             res.push( target_deck.getAction_draw!(s, target_hand, cause) );
//             count--;
//         }

//         return res;
//     }
// }

// export class e_persephone_1 extends Effect {
//     //void all other cards on <this card's entry field>, add status effect that override this card's maxAtk to voided targets * 2
//     //I have doubts how this effects work with multiple fields?, ima make it work with just this one field for now

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return true;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const z = s.getZoneOf(c);
//         if(!z) return []

//         let res : Action[] = []
//         const cause = actionFormRegistry.effect(s, c, this);

//         z.cardArr_filtered.forEach(c => {
//             res.push(
//                 actionConstructorRegistry.a_void(s, c)(cause)
//             )
//         })

//         const count = res.length * 2;
//         if(count === 0) return []

//         res.push(
//             actionConstructorRegistry.a_add_status_effect("generic_stat_change_override", true)(s, c)(cause, {
//                 maxAtk : count
//             })
//         )
        
//         return res;
//     }
// }

// export class e_persephone_2 extends Effect {
//     //after attacking, (atk -= 2, max 0), deal the actual reduction as magic damage to all enemies

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return a.is("a_attack") && a.targets[0].is(c)
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         let dmg = 2;
//         if(c.atk < 1) return []
//         if(c.atk === 1) dmg = 1;
        
//         //deal damage to ALL ENEMIES
//         //in all zones that is classified as enemies

//         const thisZone = s.getZoneOf(c)!;
//         const zones = s.filter(0, z => z.is(zoneRegistry.z_field) && z.playerType !== thisZone.playerType);
//         const cards = zones.map(z => z.cardArr_filtered).reduce((c, ele) => c.concat(ele), [] as dry_card[]);

//         const cause = actionFormRegistry.effect(s, c, this);

//         let res : Action[] = cards.map(c => 
//             actionConstructorRegistry.a_deal_damage_card(s, c)(cause, {
//                 dmg : dmg,
//                 dmgType : damageType.magic
//             })
//         )

//         res.unshift(
//             actionConstructorRegistry.a_add_status_effect("generic_stat_change_diff", true)(s, c)(cause, {
//                 maxAtk : dmg * -1
//             })
//         )

//         return res;
//     }
// }

// export class e_persephone_3 extends e_generic_lock {
//     //checks if there are 3 level 1 fruit with different dataIDs on the field
//     //again, same as e_persephone_1, ima check for just 1 field instead of across all fields
//     override key_condition(c: dry_card, system: dry_system, a: Action<"a_pos_change">): boolean {
//         const temp = new Set<string>();

//         const zone = system.getZoneWithID(a.targets[1].pos.zoneID)!
//         const cards = zone.cardArr_filtered

//         for(let i = 0; i < cards.length; i++){
//             const c_ele = cards[i];
//             if(c_ele.is("fruit") && c.level === 1) temp.add(c.dataID);
//             if(temp.size >= 3) return true;
//         }

//         return false;
//     }
// }

// export class e_demeter_1 extends Effect {
//     //add one lv1 card from grave to hand

//     override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
//         return true;
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const input1 = yield s.requestInput_card_default(c, zoneRegistry.z_grave, (_, c) => c.level === 1)
//         const input2 = yield s.requestInput_zone_default(c, zoneRegistry.z_hand)

//         const target_card = (input1 as inputData_card).data.card
//         const target_hand = (input2 as inputData_zone).data.zone

//         const cause = actionFormRegistry.effect(s, c, this)

//         return [
//             actionConstructorRegistry.a_add_top(s, target_card)(target_hand)(cause)
//         ]
//     }
// } 

// export class e_demeter_2 extends Effect {
//     //"attack" ahead with magic damage whenever a card is played from hand to any field

//     override canRespondAndActivate_final(c: dry_card, s: dry_system, a: Action): boolean {
//         if(!(a.is("a_pos_change") || a.is("a_pos_change_force"))) return false;
//         const zoneTo = s.getZoneWithID(a.targets[1].pos.zoneID)
//         const zoneFrom = s.getZoneOf(a.targets[0].card)
//         return (
//             zoneTo !== undefined && zoneFrom !== undefined &&
//             zoneTo.is(zoneRegistry.z_field) &&
//             zoneFrom.is(zoneRegistry.z_hand)
//         )
//     }

//     override *activate_final(c: dry_card, s: dry_system, a: Action): Action_final_generatorType_recur {
//         const cause = actionFormRegistry.effect(s, c, this)
//         return [
//             actionConstructorRegistry.a_deal_damage_ahead(s, c)(cause, {
//                 dmg : c.atk,
//                 dmgType : damageType.magic
//             })
//         ]
//     }
// }

// export class e_demeter_3 extends e_generic_lock {
//     //at least 3 lv1 fruit card available in grave
//     //which grave?, ahhhh
//     //executive decision : at least 1 grave fulfills the decision
//     override key_condition(c: dry_card, s: dry_system, a: Action): boolean {
//         return s.zoneArr.some(z => {
//             const cards_filtered = z.cardArr_filtered.filter(c => c.level === 1 && c.is("fruit"))
//             return (
//                 z.is(zoneRegistry.z_grave) &&
//                 cards_filtered.length >= 3
//             )
//         })
//     }
// }

// export default {
//     //white
//     e_apple,
//     e_banana,
//     e_lemon,
//     e_pomegranate,
//     //cherry has the generic draw effect

//     //green
//     e_pollinate,
//     e_greenhouse,
    

//     //blue
//     e_growth,

//     e_spring,
//     e_winter,
//     e_summer,
//     e_autumn,

//     //red
//     e_persephone_1,
//     e_persephone_2,
//     e_persephone_3,

//     e_demeter_1,
//     e_demeter_2,
//     e_demeter_3,
// }