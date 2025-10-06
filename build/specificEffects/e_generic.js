"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.e_reset_all_once = exports.e_capacitor_2 = exports.e_capacitor_1 = exports.e_add_all_to_grave = exports.e_add_all_to_hand = exports.e_send_all_to_grave = exports.e_shuffle_into_deck = exports.e_deal_dmg_card = exports.e_remove_all_effects = exports.e_add_all_to_zone = exports.e_delay = exports.e_bounce = exports.e_lock = exports.e_draw_until = exports.e_draw = exports.e_fragile = exports.e_volatile = exports.e_revive = exports.e_add_counter_to_targets = exports.e_add_counter = exports.e_dmg_reduction = exports.e_reflect = exports.e_revenge = exports.e_deal_dmg_ahead = exports.e_add_stat_change_override = exports.e_add_stat_change_diff = exports.e_add_to_hand = exports.e_attack = exports.e_quick = void 0;
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const subtype_instant_1 = __importDefault(require("../types/effects/effectSubtypes/subtype_instant"));
const subtypeRegistry_1 = __importDefault(require("../data/subtypeRegistry"));
const systemRegistry_1 = require("../data/systemRegistry");
const actionRegistry_1 = __importDefault(require("../data/actionRegistry"));
const actionGenrator_1 = require("../_queenSystem/handler/actionGenrator");
const misc_1 = require("../types/misc");
const zoneRegistry_1 = require("../data/zoneRegistry");
const e_status_1 = require("./e_status");
const actionInputRequesterGenerator_1 = __importDefault(require("../_queenSystem/handler/actionInputRequesterGenerator"));
const error_1 = __importDefault(require("../types/errors/error"));
const e_generic_cardTargetting_1 = require("./e_generic_cardTargetting");
/**
 * All typical effects should have 3 versions
 * - target c or this
 * - target inputs
 * - target all of a higher order input (card -> zone, eff -> card)
 *
 */
class e_quick extends effect_1.default {
    constructor() {
        super(...arguments);
        this.instant_subtype = new subtype_instant_1.default(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_instant]);
    }
    canRespondAndActivate_final(c, system, a) {
        return system.turnAction !== undefined && system.turnAction.id === a.id;
    }
    activate_final(c, system, a) {
        return [
            actionGenrator_1.actionConstructorRegistry.a_modify_action("a_turn_end")(system, system.getRootAction())(this.cause(system, c))({
                doIncreaseTurnCount: false
            })
        ];
    }
}
exports.e_quick = e_quick;
class e_attack extends effect_1.default {
    get times() { var _a; return (_a = this.attr.get("times")) !== null && _a !== void 0 ? _a : 0; }
    set times(val) { this.attr.set("times", val); }
    get dmg() { return this.attr.get("dmg"); }
    set dmg(val) { this.attr.set("dmg", val); }
    get dmgType() { var _a; return (_a = this.attr.get("dmgType")) !== null && _a !== void 0 ? _a : misc_1.damageType.physical; }
    set dmgType(val) { this.attr.set("dmgType", val); }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).cards().many(this.count, this);
    }
    canRespondAndActivate_final(c, system, a) {
        return this.times > 0 && this.count > 0;
    }
    activate_final(c, s, a, input) {
        let t = this.times;
        if (!t || isNaN(t) || !isFinite(t))
            return [];
        const cards = input.next();
        const cause = this.cause(s, c);
        let res = [];
        while (t > 0) {
            res.push(...cards.map(c => actionGenrator_1.actionConstructorRegistry.a_attack(s, c.data.card)(cause, {
                dmg: (this.dmg === undefined) ? c.data.card.atk : this.dmg,
                dmgType: this.dmgType
            })));
            t--;
        }
        return res;
    }
}
exports.e_attack = e_attack;
class e_add_to_hand extends effect_1.default {
    createInputObj(c, s, a) {
        const x = actionInputRequesterGenerator_1.default.allZones(s, c).cards().many(this.count, this);
        const y = actionInputRequesterGenerator_1.default.hand(s, c).once(this);
        return x.merge(y);
    }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    activate_final(c, s, a, input) {
        const n = input.next();
        const cards = n.splice(0, -1);
        const z = n[0].data.zone;
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c.data.card)(z.top)(this.cause(s, c.data.card)));
    }
}
exports.e_add_to_hand = e_add_to_hand;
class e_add_stat_change_diff extends effect_1.default {
    get maxAtk() { return this.attr.get("maxAtk"); }
    get maxHp() { return this.attr.get("maxHp"); }
    get level() { return this.attr.get("level"); }
    get statObj() {
        const k = {};
        if (this.maxAtk !== undefined)
            k.maxAtk = this.maxAtk;
        if (this.maxHp !== undefined)
            k.maxHp = this.maxHp;
        if (this.level !== undefined)
            k.level = this.level;
        return k;
    }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).cards().many(this.count, this);
    }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    activate_final(c, s, a, input) {
        const cards = input.next();
        const cause = this.cause(s, c);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_diff", true)(s, c.data.card)(cause, this.statObj));
    }
}
exports.e_add_stat_change_diff = e_add_stat_change_diff;
class e_add_stat_change_override extends e_add_stat_change_diff {
    activate_final(c, s, a, input) {
        const cause = this.cause(s, c);
        return input.next().map(c => actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_stat_change_override", true)(s, c.data.card)(cause, this.statObj));
    }
}
exports.e_add_stat_change_override = e_add_stat_change_override;
class e_deal_dmg_ahead extends e_attack {
    activate_final(c, s, a) {
        let t = this.times;
        if (!t || isNaN(t) || !isFinite(t))
            return [];
        const cause = this.cause(s, c);
        let res = [];
        while (t > 0) {
            res.push(actionGenrator_1.actionConstructorRegistry.a_deal_damage_ahead(s, c)(cause, {
                dmg: (this.dmg === undefined) ? c.atk : this.dmg,
                dmgType: this.dmgType
            }));
            t--;
        }
        return res;
    }
}
exports.e_deal_dmg_ahead = e_deal_dmg_ahead;
class e_revenge extends e_attack {
    canRespondAndActivate_final(c, system, a) {
        if (a.typeID !== actionRegistry_1.default.a_deal_damage_card &&
            a.typeID !== actionRegistry_1.default.a_deal_damage_internal &&
            a.typeID !== actionRegistry_1.default.a_deal_damage_position)
            return false;
        if (a.targets[0].type === systemRegistry_1.identificationType.card &&
            a.targets[0].card.id !== c.id)
            return false;
        if (a.targets[0].type === systemRegistry_1.identificationType.position &&
            !a.targets[0].pos.is(c.pos))
            return false;
        return super.canRespondAndActivate_final(c, system, a);
    }
}
exports.e_revenge = e_revenge;
class e_reflect extends e_revenge {
    activate_final(c, system, a, i) {
        const attr = a.flatAttr();
        this.dmg = attr.dmg;
        return super.activate_final(c, system, a, i);
    }
}
exports.e_reflect = e_reflect;
class e_dmg_reduction extends effect_1.default {
    get reductionAmmount() { var _a; return (_a = this.attr.get("reductionAmmount")) !== null && _a !== void 0 ? _a : 0; }
    ;
    set reductionAmmount(val) { this.attr.set("reductionAmmount", val); }
    ;
    get minDmg() { var _a; return (_a = this.attr.get("minDmg")) !== null && _a !== void 0 ? _a : 0; }
    ;
    set minDmg(val) { this.attr.set("minDmg", val); }
    ;
    get reductionDmgType() { return this.attr.get("reductionDmgType"); } //undefined is all damage
    set reductionDmgType(val) {
        if (val === undefined)
            this.attr.delete("reductionDmgType");
        else
            this.attr.set("reductionDmgType", val);
    }
    canRespondAndActivate_final(c, system, a) {
        //all dmg
        if (a.typeID === actionRegistry_1.default.a_deal_damage_card ||
            a.typeID === actionRegistry_1.default.a_deal_damage_internal ||
            a.typeID === actionRegistry_1.default.a_deal_damage_position) {
            if (this.reductionDmgType === undefined)
                return true;
            return a.flatAttr().dmgType === this.reductionDmgType;
        }
        return false;
    }
    activate_final(c, system, a) {
        var _a;
        const attr = a.flatAttr();
        let oldDmg = (_a = attr.dmg) !== null && _a !== void 0 ? _a : 0;
        let newDmg = oldDmg - this.reductionAmmount;
        if (newDmg < this.minDmg)
            newDmg = this.minDmg;
        const cause = this.cause(system, c);
        return [
            actionGenrator_1.actionConstructorRegistry.a_modify_action("a_deal_damage_card")(system, a)(cause)({
                dmg: newDmg
            })
        ];
    }
}
exports.e_dmg_reduction = e_dmg_reduction;
class e_add_counter extends effect_1.default {
    get times() { var _a; return (_a = this.attr.get("times")) !== null && _a !== void 0 ? _a : 0; }
    set times(val) { this.attr.set("times", val); }
    canRespondAndActivate_final(c, system, a) {
        return this.times > 0;
    }
    activate_final(c, system, a) {
        let t = this.times;
        if (!t || isNaN(t) || !isFinite(t))
            return [];
        const cause = this.cause(system, c);
        let res = [];
        while (t > 0) {
            res.push(actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(system, c)(cause, {}));
            t--;
        }
        return res;
    }
}
exports.e_add_counter = e_add_counter;
class e_add_counter_to_targets extends effect_1.default {
    get times() { var _a; return (_a = this.attr.get("times")) !== null && _a !== void 0 ? _a : 0; }
    set times(val) { this.attr.set("times", val); }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.allZones(s, c).cards().many(this.count, this);
    }
    canRespondAndActivate_final(c, system, a) {
        return this.times > 0 && this.count > 0;
    }
    activate_final(c, s, a, input) {
        let t = this.times;
        if (!t || isNaN(t) || !isFinite(t))
            return [];
        const cause = this.cause(s, c);
        let res = [];
        while (t > 0) {
            input.next().forEach(c => {
                res.push(actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(s, c.data.card)(cause, {}));
            });
            t--;
        }
        return res;
    }
}
exports.e_add_counter_to_targets = e_add_counter_to_targets;
class e_revive extends effect_1.default {
    //condition: card in grave, pos on field=
    createInputObj(c, s, a) {
        const z = s.getZoneOf(c);
        const s1 = actionInputRequesterGenerator_1.default.grave(s, c).ofSamePlayer(z).cards().once(this);
        const s2 = actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(z).pos().isEmpty().once(this);
        return s1.merge(s2);
    }
    activate_final(c, s, a, input) {
        const tc = input.next()[0].data.card;
        const tp = input.next()[1].data.pos;
        const cause = actionGenrator_1.actionFormRegistry.effect(s, c, this);
        return [
            actionGenrator_1.actionConstructorRegistry.a_pos_change(s, tc)(tp)(cause)
        ];
    }
}
exports.e_revive = e_revive;
/**Remove this card when it leaves the field */
class e_volatile extends effect_1.default {
    canRespondAndActivate_final(c, system, a) {
        //activate cond : when this card is removed from field
        if ((a.typeID === actionRegistry_1.default.a_pos_change ||
            a.typeID === actionRegistry_1.default.a_pos_change_force) &&
            a.targets[0].card.id === c.id) {
            let zid1 = a.targets[1].pos.zoneID;
            let zid2 = c.pos.zoneID;
            if (zid1 === zid2)
                return false;
            let zFrom = system.getZoneWithID(zid2);
            if (!zFrom)
                return false;
            return zFrom.is(zoneRegistry_1.zoneRegistry.z_field);
        }
        return false;
    }
    activate_final(c, s, a) {
        const cause = this.cause(s, c);
        return [
            actionGenrator_1.actionConstructorRegistry.a_replace_action(s, actionGenrator_1.actionConstructorRegistry.a_void(s, c)(cause))(cause)
        ];
    }
}
exports.e_volatile = e_volatile;
/**Destroy self after attack */
class e_fragile extends e_generic_cardTargetting_1.e_destroy.toThisCard() {
    canRespondAndActivate_final(c, system, a) {
        //if this card attacks
        return (a.is("a_attack") &&
            a.targets[0].is(c));
    }
}
exports.e_fragile = e_fragile;
class e_draw extends effect_1.default {
    //deck, hand
    get times() { var _a; return (_a = this.attr.get("times")) !== null && _a !== void 0 ? _a : 0; }
    set times(val) { this.attr.set("times", val); }
    get cooldown() { var _a; return (_a = this.attr.get("cooldown")) !== null && _a !== void 0 ? _a : NaN; }
    set cooldown(val) { this.attr.set("cooldown", val); }
    get doTurnDraw() { return this.attr.get("doTurnDraw") != 0; }
    set doTurnDraw(val) { this.attr.set("doTurnDraw", Number(val)); }
    canRespondAndActivate_final(c, system, a) {
        return this.times > 0 && !isNaN(this.times) && isFinite(this.times);
    }
    createInputObj(c, s, a) {
        const z = s.getZoneOf(c);
        const g1 = actionInputRequesterGenerator_1.default.deck(s, c).ofSamePlayerType(z).once(this);
        const g2 = actionInputRequesterGenerator_1.default.hand(s, c).ofSamePlayerType(z).once(this);
        return g1.merge(g2);
    }
    activate_final(c, s, a, input) {
        let t = this.times;
        let res = [];
        const i = input.next();
        const hand = i[0].data.zone;
        const deck = i[1].data.zone;
        const cause = actionGenrator_1.actionFormRegistry.effect(s, c, this);
        while (t > 0) {
            res.push(deck.getAction_draw(s, hand, cause, this.doTurnDraw));
            t--;
        }
        res.unshift(deck.getAction_shuffle(s, cause));
        return res;
    }
}
exports.e_draw = e_draw;
class e_draw_until extends e_draw {
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    activate_final(c, s, a, input) {
        const i = input.next();
        const hand = i[0].data.zone;
        let diff = this.count - hand.cardArr_filtered.length;
        if (diff > 0) {
            this.times = diff;
            return super.activate_final(c, s, a, input);
        }
        return [];
    }
}
exports.e_draw_until = e_draw_until;
//Lock actually has 2 forms : 
// This implements the condition form
// There is another form as a forced negative effect, like decompiling X cards on your side of the field
// That...can just be added to the beginning of the Action arr tho
class e_lock extends effect_1.default {
    constructor() {
        //delegates the actual condition to a sensible function rather than the inverses
        super(...arguments);
        //return true to unlock
        this.key_condition = () => true;
    }
    canRespondAndActivate_final(c, system, a) {
        return !this.key_condition(c, system, a, this.attr);
    }
    activate_final(c, s, a, input) {
        return [actionGenrator_1.actionConstructorRegistry.a_negate_action(this.cause(s, c))];
    }
    static keyCondition(f) {
        return class ExtendedEff extends this {
            constructor(...p) {
                super(...p);
                this.key_condition = f.bind(this);
            }
        };
    }
}
exports.e_lock = e_lock;
class e_bounce extends effect_1.default {
    //target cards, deck
    get target_zone() { var _a; return (_a = this.attr.get("target_zone")) !== null && _a !== void 0 ? _a : zoneRegistry_1.zoneRegistry.z_field; }
    createInputObj(c, s, a) {
        const z = s.getZoneOf(c);
        const s1 = actionInputRequesterGenerator_1.default.specificType(s, c, this.target_zone).ofSamePlayerType(z).cards().many(this.count, this);
        const s2 = actionInputRequesterGenerator_1.default.deck(s, c).once(this);
        return s1.merge(s2);
    }
    activate_final(c, s, a, input) {
        const i = input.next();
        const deck = i.pop().data.zone;
        const cards = i;
        const cause = this.cause(s, c);
        const res = cards.map(c_i => {
            return actionGenrator_1.actionConstructorRegistry.a_add_top(s, c_i.data.card)(deck)(cause);
        });
        res.push(deck.getAction_shuffle(s, cause));
        return res;
    }
}
exports.e_bounce = e_bounce;
class e_delay extends effect_1.default {
    get delayCount() { var _a; return (_a = this.attr.get("delayCount")) !== null && _a !== void 0 ? _a : 0; }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0 && this.delayCount > 0;
    }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).cards().hasAutomate().many(this.count, this);
    }
    activate_final(c, s, a, input) {
        const cards = input.next().map(c => c.data.card);
        const res = [];
        const cause = this.cause(s, c);
        cards.forEach(c => {
            const automateEff = c.statusEffects.filter(e => e instanceof e_status_1.e_automate_base);
            automateEff.forEach(eff => {
                res.push(actionGenrator_1.actionConstructorRegistry.a_delay(cause, {
                    delayAmmount: this.delayCount,
                    delayCID: c.id,
                    delayEID: eff.id
                }));
            });
        });
        return res;
    }
}
exports.e_delay = e_delay;
/**Add all cards of a particular dataID from the same zone too hand */
class e_add_all_to_zone extends effect_1.default {
    constructor() {
        super(...arguments);
        this.target_zone = zoneRegistry_1.zoneRegistry.z_system;
    }
    createInputObj(c, s, a) {
        const x = actionInputRequesterGenerator_1.default.allZones(s, c).cards().once(this);
        const y = actionInputRequesterGenerator_1.default.specificType(s, c, this.target_zone).once(this);
        return x.merge(y);
    }
    activate_final(c, s, a, input) {
        const n = input.next();
        const candidate = n[0].data.card;
        const z = n[1].data.zone;
        const cause = this.cause(s, c);
        const cards = z.cardArr_filtered.filter(c => c.dataID === candidate.dataID);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(z.top)(cause));
    }
    static to(zType) {
        return class extendedEff extends this {
            constructor() {
                super(...arguments);
                this.target_zone = zType;
            }
        };
    }
}
exports.e_add_all_to_zone = e_add_all_to_zone;
class e_remove_all_effects extends effect_1.default {
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.allZones(s, c).cards().many(this.count, this);
    }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    activate_final(c, s, a, input) {
        const cards = input.next();
        const cause = this.cause(s, c);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_remove_all_effects(s, c.data.card)(cause));
    }
}
exports.e_remove_all_effects = e_remove_all_effects;
class e_deal_dmg_card extends effect_1.default {
    get dmg() { var _a; return (_a = this.attr.get("dmg")) !== null && _a !== void 0 ? _a : 0; }
    get dmgType() { var _a; return (_a = this.attr.get("dmgType")) !== null && _a !== void 0 ? _a : misc_1.damageType.physical; }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).cards().many(this.count, this);
    }
    activate_final(c, s, a, input) {
        const cards = input.next();
        const cause = this.cause(s, c);
        return cards.map(c => actionGenrator_1.actionConstructorRegistry.a_deal_damage_card(s, c.data.card)(cause, {
            dmg: this.dmg,
            dmgType: this.dmgType
        }));
    }
}
exports.e_deal_dmg_card = e_deal_dmg_card;
class e_shuffle_into_deck extends effect_1.default {
    get target_zone() { var _a; return (_a = this.attr.get("target_zone")) !== null && _a !== void 0 ? _a : zoneRegistry_1.zoneRegistry.z_field; }
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    createInputObj(c, s, a) {
        const z = s.getZoneOf(c);
        const s1 = actionInputRequesterGenerator_1.default.specificType(s, c, this.target_zone).ofSamePlayerType(z).cards().many(this.count, this);
        const s2 = actionInputRequesterGenerator_1.default.deck(s, c).once(this);
        return s1.merge(s2);
    }
    activate_final(c, s, a, input) {
        const data = input.next();
        const deck = data.pop();
        const cards = data;
        const cause = this.cause(s, c);
        const res = cards.map(c => actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c.data.card)(deck.data.zone.top)(cause));
        const k = deck.data.zone.getAction_shuffle(s, cause);
        if (k instanceof error_1.default)
            return [];
        res.push(k);
        return res;
    }
}
exports.e_shuffle_into_deck = e_shuffle_into_deck;
class e_send_all_to_grave extends effect_1.default {
    createInputObj(c, s, a) {
        const x = actionInputRequesterGenerator_1.default.allZones(s, c).cards().once(this);
        const y = actionInputRequesterGenerator_1.default.grave(s, c).once(this);
        return x.merge(y);
    }
}
exports.e_send_all_to_grave = e_send_all_to_grave;
exports.e_add_all_to_hand = e_add_all_to_zone.to(zoneRegistry_1.zoneRegistry.z_hand);
exports.e_add_all_to_grave = e_add_all_to_zone.to(zoneRegistry_1.zoneRegistry.z_grave);
class e_capacitor_1 extends effect_1.default {
    canRespondAndActivate_final(c, s, a) {
        return a.is("a_deal_damage_card") && !c.hasCounter;
    }
    activate_final(c, s, a, input) {
        var _a;
        //if any card would take damage, add counter (max 3) instead
        if (!a.is("a_deal_damage_card"))
            return [];
        const wouldBeDmg = a.flatAttr().dmg;
        const cause = this.cause(s, c);
        const counter_count = Utils.clamp(wouldBeDmg, (_a = this.attr.get("maxCount")) !== null && _a !== void 0 ? _a : 0, 0);
        const res = [
            actionGenrator_1.actionConstructorRegistry.a_modify_action("a_deal_damage_card")(s, a)(cause)({
                dmg: 0
            })
        ];
        if (counter_count > 0) {
            res.push(actionGenrator_1.actionConstructorRegistry.a_add_status_effect("e_generic_counter", true)(s, c)(cause, {
                count: counter_count
            }));
        }
        return res;
    }
}
exports.e_capacitor_1 = e_capacitor_1;
class e_capacitor_2 extends effect_1.default {
    canRespondAndActivate_final(c, system, a) {
        return a.is("a_deal_damage_card") && c.hasCounter;
    }
    activate_final(c, s, a, input) {
        if (!a.is("a_deal_damage_card"))
            return [];
        const counterCount = c.numCounters;
        const originalDmg = a.flatAttr().dmg;
        const cause = this.cause(s, c);
        return [
            actionGenrator_1.actionConstructorRegistry.a_modify_action("a_deal_damage_card")(s, a)(cause)({
                dmg: originalDmg + counterCount
            }),
            actionGenrator_1.actionConstructorRegistry.a_clear_all_counters(s, c)(cause)
        ];
    }
}
exports.e_capacitor_2 = e_capacitor_2;
class e_reset_all_once extends effect_1.default {
    canRespondAndActivate_final(c, system, a) {
        return this.count > 0;
    }
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.field(s, c).ofSamePlayer(s.getZoneOf(c)).cards().many(this.count);
    }
    activate_final(c, s, a, input) {
        const cause = this.cause(s, c);
        const target = input.next();
        return target.map(c => actionGenrator_1.actionConstructorRegistry.a_reset_all_once(s, c.data.card)(cause));
    }
}
exports.e_reset_all_once = e_reset_all_once;
exports.default = {
    e_add_to_hand,
    e_add_all_to_hand: exports.e_add_all_to_hand,
    e_add_all_to_grave: exports.e_add_all_to_grave,
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
    e_delay_all: e_delay.toAllEnemies(),
    e_bounce,
    e_lock,
    e_void_this: e_generic_cardTargetting_1.e_void.toThisCard(),
    e_destroy_this: e_generic_cardTargetting_1.e_destroy.toThisCard(),
    e_clear_all_status_this: e_generic_cardTargetting_1.e_clear_all_status.toThisCard(),
    e_reactivate_this: e_generic_cardTargetting_1.e_reactivate.toThisCard(),
    e_deactivate_this: e_generic_cardTargetting_1.e_deactivate.toThisCard(),
    e_decompile_this: e_generic_cardTargetting_1.e_decompile.toThisCard(),
    e_execute_this: e_generic_cardTargetting_1.e_execute.toThisCard(),
    e_reset_all_once_this: e_reset_all_once.toThisCard(),
    //specific sections
    //afterburner is e_draw_until
    //avarice is e_shuffle_into_deck + e_draw
    e_avarice_1: e_shuffle_into_deck.implyCondition("c", function (c, oldc, s, a) {
        const z = s.getZoneOf(c);
        const z1 = s.getZoneOf(oldc);
        return z.is(zoneRegistry_1.zoneRegistry.z_grave) && z.playerIndex === z1.playerIndex;
    }),
    //avraice_2 is e_draw
    //battery is e_draw with isTurnDraw = true
    //clawtrap is gravebound
    e_clawtrap: e_deal_dmg_card.toAllEnemies(),
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
};
