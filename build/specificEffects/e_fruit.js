"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("../_queenSystem/handler/actionGenrator");
const actionInputRequesterGenerator_1 = __importDefault(require("../_queenSystem/handler/actionInputRequesterGenerator"));
const zoneRegistry_1 = require("../data/zoneRegistry");
const actionGenrator_2 = require("../_queenSystem/handler/actionGenrator");
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const e_generic_1 = require("./e_generic");
const misc_1 = require("../types/misc");
const e_generic_cardTargetting_1 = require("./e_generic_cardTargetting");
class e_autumn extends effect_1.default {
    activate_final(c, s, a, input) {
        const cards = actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofArchtype("fruit").ofLevel(1).clean();
        const cause = actionGenrator_2.actionFormRegistry.effect(s, c, this);
        c.addShareMemory(this, "count", cards.length);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_remove_all_effects(s, c)(cause));
    }
}
class e_greenhouse extends e_generic_1.e_add_to_hand {
    constructor() {
        super(...arguments);
        this.___target_data_id = "";
    }
    canRespondAndActivate_final(c, s, a) {
        var _a;
        if (s.isPlayAction(a) && //a card is played
            a.targets[0].card.level <= ((_a = this.attr.get("checkLevel")) !== null && _a !== void 0 ? _a : 1) && //that card level is this eff's checkLevel attr
            a.targets[0].card.dataID !== c.dataID && //that card is not "GreenHouse"
            a.targets[1].pos.zoneID === c.pos.zoneID && //the target pos is in the same zone as this card
            s.getZoneOf(c).isC2Behind(c, a.targets[1]) //the target pos is behind this card
        ) {
            this.___target_data_id = a.targets[0].card.dataID;
            return true;
        }
        return false;
    }
    createInputObj(c, s, a) {
        //one card from grave with the same name as the saved name
        const r1 = actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofDataID(this.___target_data_id).once();
        const r2 = actionInputRequesterGenerator_1.default.hand(s, c).once();
        return r1.merge(r2);
    }
}
class e_lemon extends effect_1.default {
    activate_final(c, s, a, input) {
        const cards = actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofSameDataID(c).clean();
        const cause = actionGenrator_2.actionFormRegistry.effect(s, c, this);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_attack(s, c)(cause, {
            dmg: c.atk,
            dmgType: misc_1.damageType.physical
        }));
    }
}
class e_pomegranate extends effect_1.default {
    get exposedDmg() { var _a; return (_a = this.attr.get("exposedDmg")) !== null && _a !== void 0 ? _a : 0; }
    get coveredDmg() { var _a; return (_a = this.attr.get("coveredDmg")) !== null && _a !== void 0 ? _a : 0; }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.oppositeZoneTo(s, c).once();
    }
    activate_final(c, s, a, input) {
        const zone = input.next();
        const cards = zone[0].data.zone.cardArr_filtered;
        const cause = actionGenrator_2.actionFormRegistry.card(s, c);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_deal_damage_card(s, c)(cause, {
            dmg: s.getZoneOf(c).isExposed(c) ? this.exposedDmg : this.coveredDmg,
            dmgType: misc_1.damageType.magic
        }));
    }
    getDisplayInput(c, system) {
        return [this.exposedDmg, this.coveredDmg];
    }
}
class e_pollinate extends effect_1.default {
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.deck(s, c).cards().ofLevel(1).ofArchtype("fruit").filter(c => c.getFirstActualPartitionIndex() >= 0).once();
    }
    activate_final(c, s, a, input) {
        const card = input.next()[0].data.card;
        const cards = this.doArchtypeCheck ?
            actionInputRequesterGenerator_1.default.hand(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofLevel(1).ofArchtype("fruit").clean() :
            actionInputRequesterGenerator_1.default.hand(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofLevel(1).clean();
        const cause = actionGenrator_2.actionFormRegistry.effect(s, c, this);
        const pid = card.getFirstActualPartitionIndex();
        return [
            ...cards.map(c => actionGenrator_1.actionConstructorRegistry.a_duplicate_effect(s, c)(card)(pid)(cause, {
                addedSubtype: ["subtype_once"]
            })),
        ];
    }
}
class e_spring extends effect_1.default {
    createInputObj(c, s, a) {
        const r1 = actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").once();
        const r2 = actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).pos().isEmpty().once();
        return r1.merge(r2);
    }
    activate_final(c, s, a, input) {
        const n = input.next();
        const target_c = n[0].data.card;
        const target_pos = n[1].data.pos;
        const cause = this.cause(s, c);
        const l = actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").filter(c_ => c.id !== c_.id).clean().length - 1;
        if (l < 0)
            return [];
        const a1 = actionGenrator_1.actionConstructorRegistry.a_duplicate_card(s, target_c)(target_pos)(cause, {
            followUp: (c) => ((l) => [
                actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(cause, {
                    maxAtk: Math.max(l, 3),
                })
            ])(l),
        });
        return [a1];
    }
}
exports.default = {
    //white
    e_apple: e_generic_1.e_add_to_hand.implyCondition("c", (c, oldc, s) => c.dataID === "c_apple" && //selection is c_apple
        s.getZoneOf(c).is(zoneRegistry_1.zoneRegistry.z_deck) //selction is from deck
    ),
    e_banana: e_generic_1.e_revive.implyCondition("c", function (c, oldC, _, _2) {
        return c.dataID !== oldC.dataID && //selection is NOT same name as this card
            c.level === 1 && //selection is lv1
            (!this.doArchtypeCheck || //either dont do archtypecheck or
                c.is("fruit") //selection has to be fruit
            //this condition is upgrade and not upgrade in one
            );
    }),
    e_lemon,
    e_pomegranate,
    e_pumpkin: e_generic_1.e_add_stat_change_diff.implyCondition("c", (c, c2) => c.dataID === c2.dataID),
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
    e_summer: e_generic_1.e_add_to_hand.retarget(function (c, s, a) {
        const r1 = actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(s.getZoneOf(c)).cards().ofAtLeastLevel(this.checkLevel).ofArchtype("fruit").filter(c => c.dataID !== "c_summer").once(this);
        const r2 = actionInputRequesterGenerator_1.default.hand(s, c).ofSamePlayer(s.getZoneOf(c)).once(this);
        return r1.merge(r2);
    }, (res) => res),
    e_winter_1: e_generic_1.e_add_all_to_grave.implyCondition("c", function (c, oldC, s, a) {
        return c.is("fruit") && c.dataID !== "c_winter" && c.level === 1;
    }).thenShares(function (res, c, s, a, input) {
        return ["MaxHp", res.length * this.mult];
    }),
    e_winter_2: e_generic_1.e_add_stat_change_diff.toAllOfZone(function (c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).once();
    }),
    //e_winter_3 is e_dmg_reduction
    e_growth: e_generic_1.e_add_all_to_hand.implyCondition("c", function (c1, c, s, a) {
        return (!this.doArchtypeCheck ||
            c.is("fruit")) && (s.getZoneOf(c).is(zoneRegistry_1.zoneRegistry.z_grave));
    }).thenShares(res => ["count", res.length]),
    //red
    e_demeter_1: e_generic_1.e_add_all_to_hand.implyCondition("c", (c, _, s) => c.level === 1 && c.isFrom(s, zoneRegistry_1.zoneRegistry.z_grave)),
    e_demeter_2: e_generic_1.e_deal_dmg_ahead.listen((c, s, a) => s.isPlayAction(a)),
    e_demeter_3: e_generic_1.e_lock.keyCondition((c, s, a) => {
        const z = s.getZoneOf(c);
        if (!z)
            return false;
        return actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(z).cards().ofArchtype("fruit").ofLevel(1).clean().length > 0;
    }),
    e_persephone_1: e_generic_cardTargetting_1.e_void.toAllOfZone((c, s, a) => actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).once()).then((res, c, s, a) => {
        const l = res.length * 2;
        res.push(actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c)(actionGenrator_2.actionFormRegistry.effect(s, c, this), {
            maxAtk: l,
        }));
        return res;
    }),
    e_persephone_2: e_generic_1.e_add_stat_change_diff.listen((c, s, a) => a.is("a_attack") && a.targets[0].is(c)),
    // e_persephone_2_2 : e_deal_damage_card.retargetToAllEnemies(),
    e_persephone_3: e_generic_1.e_lock.keyCondition((c, s, a) => {
        const z = s.getZoneOf(c);
        if (!z)
            return false;
        const cardsInField = actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(z).cards().ofArchtype("fruit").ofLevel(1).clean();
        return (new Set(cardsInField.map(c => c.dataID))).size >= 3;
    })
};
