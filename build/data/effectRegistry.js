"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickEffect = void 0;
//use for loading effects
// import { effectData } from "./cardRegistry"
const misc_1 = require("../types/misc");
const zoneRegistry_1 = require("./zoneRegistry");
//Super stupid implementation btw
// 1. this must extends fron Fucntion to work
// 2. toFunc overwrites the function call to returning the internal data
class quickEffect extends Function {
    constructor() {
        super();
        this.data = {
            typeID: "e_t_none",
            subTypeIDs: []
        };
        this.T_this = 0;
    }
    type(type) {
        this.data.typeID = type;
        return this;
    }
    sub(subType) {
        this.data.subTypeIDs.push(subType);
        return this;
    }
    num(key, def = 0) {
        this.data[key] = def;
        return this;
    }
    bool(key, def = 0) {
        this.data[key] = def;
        return this;
    }
    tri(key, def = 0) {
        this.data[key] = def;
        return this;
    }
    optional(key, def = undefined) {
        if (def !== undefined)
            this.data[key] = def;
        return this;
    }
    param(key, def) {
        this.data[key] = def;
        return this;
    }
    count(def = 0) { return this.num("count", def); }
    toFunc() {
        return new Proxy(this, {
            apply(target) {
                return target.data;
            }
        });
    }
    static get init() { return new quickEffect().toFunc().type("e_t_init"); }
    static get manual() { return new quickEffect().type("e_t_manual").toFunc(); }
    static get trigger() { return new quickEffect().type("e_t_trigger").toFunc(); }
    static get passive() { return new quickEffect().type("e_t_passive").toFunc(); }
    static get status() { return new quickEffect().type("e_t_status").toFunc(); }
    static get counter() { return new quickEffect().type("e_t_counter").toFunc(); }
    static get lock() { return new quickEffect().type("e_t_lock").toFunc(); }
    static get def() {
        return {
            typeID: "e_t_none",
            subTypeIDs: []
        };
    }
    get chained() { return this.sub("e_st_chained"); }
    get once() { return this.sub("e_st_once"); }
    get unique() { return this.sub("e_st_unique"); }
    get instant() { return this.sub("e_st_instant"); }
    get fieldLock() { return this.sub("e_st_fieldLock"); }
    get graveLock() { return this.sub("e_st_graveLock"); }
    get delayed() { return this.sub("e_st_delayed"); }
}
exports.quickEffect = quickEffect;
const effectDataRegistry //: { [K in string] : effectData} 
 = {
    //actual effects - specifics
    //fruits - white
    e_apple: quickEffect.init.count(1)(),
    e_banana: quickEffect.init.bool("doArchtypeCheck", 1)(),
    e_lemon: quickEffect.init(),
    e_pumpkin: quickEffect.init.num("maxAtk").num("maxHp").num("level")(),
    e_pomegranate: quickEffect.trigger.num("exposedDmg", 1).num("coveredDmg", 2)(),
    //fruit - green
    e_pollinate: quickEffect.init.bool("doArchtypeCheck", 1)(),
    e_greenhouse: quickEffect.trigger.unique.num("checkLevel", 1)(),
    //fruit - blue
    e_growth: quickEffect.init.bool("doArchtypeCheck", 1)(),
    e_spring: quickEffect.init.num("checkLevel", 1)(),
    e_summer: quickEffect.init.num("checkLevel", 1)(),
    e_autumn: quickEffect.init(),
    e_winter_1: quickEffect.init.num("mult")(),
    e_winter_2: quickEffect.def,
    //fruit - red
    e_persephone_1: quickEffect.init(),
    e_persephone_2: quickEffect.passive.delayed(),
    e_persephone_3: quickEffect.lock(),
    e_demeter_1: quickEffect.init(),
    e_demeter_2: quickEffect.trigger.unique(),
    e_demeter_3: quickEffect.lock(),
    //generic, specific
    e_capacitor_1: quickEffect.trigger.once.num("maxCount")(),
    e_capacitor_2: quickEffect.trigger.once(),
    e_avarice_1: quickEffect.init.count()(),
    e_clawtrap: quickEffect.manual.num("delayCount", 4).num("dmg", 1)(),
    //generic - generics
    e_dmg_reduction: quickEffect.passive.num("reductionAmmount").num("minDmg").optional("reductionDmgType", misc_1.damageType.physical)(),
    e_delay: quickEffect.manual.count().num("delayCount")(),
    e_bounce: quickEffect.manual.count().num("target_zone", zoneRegistry_1.zoneRegistry.z_field)(),
    e_delay_all: quickEffect.manual.num("delayCount")(),
    e_add_to_hand: quickEffect.manual.count()(),
    e_remove_all_effects: quickEffect.manual.count()(),
    e_add_all_to_hand: quickEffect.def,
    e_add_all_to_grave: quickEffect.def,
    e_attack: quickEffect.manual.count().num("dmg").param("dmgType", misc_1.damageType.physical)(),
    e_deal_dmg_card: quickEffect.manual.count().num("dmg").param("dmgType", misc_1.damageType.physical)(),
    e_deal_dmg_ahead: quickEffect.manual.count().num("dmg").param("dmgType", misc_1.damageType.physical)(),
    // e_reactivate : quickEffect.manual.fieldLock(),
    e_destroy_this: quickEffect.manual.fieldLock(),
    e_clear_all_status_this: quickEffect.manual.fieldLock(),
    e_reactivate_this: quickEffect.manual.fieldLock(),
    e_deactivate_this: quickEffect.manual.fieldLock(),
    e_decompile_this: quickEffect.manual.fieldLock(),
    e_execute_this: quickEffect.manual.fieldLock(),
    e_void_this: quickEffect.manual.fieldLock(),
    e_reset_all_once_this: quickEffect.manual.fieldLock(),
    e_reset_all_once: quickEffect.manual(),
    e_add_counter: quickEffect.manual(),
    e_add_stat_change_diff: quickEffect.manual.num("maxAtk").num("maxHp").num("level")(),
    e_add_stat_change_override: quickEffect.manual.num("maxAtk").num("maxHp").num("level")(),
    e_quick: quickEffect.init.chained(),
    e_reflect: quickEffect.trigger(),
    e_revenge: quickEffect.trigger(),
    e_volatile: quickEffect.passive(),
    e_fragile: quickEffect.trigger(),
    e_draw: quickEffect.manual.count().num("cooldown").bool("doTurnDraw")(),
    e_draw_until: quickEffect.manual.count()(),
    e_revive: quickEffect.manual(),
    //status effects
    e_generic_counter: quickEffect.counter.count(1)(),
    e_generic_stat_change_diff: quickEffect.status.num("maxAtk").num("maxHp").num("level")(),
    e_generic_stat_change_override: quickEffect.status.num("maxAtk").num("maxHp").num("level")(),
    e_any_extension: quickEffect.status(),
    //lock effects
    e_lock: quickEffect.lock(),
};
exports.default = effectDataRegistry;
