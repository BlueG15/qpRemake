"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.e_automate_base = exports.generic_stat_change_override = exports.generic_stat_change_diff = exports.genericCounter = exports.e_any_extension = exports.StatusEffect_base = void 0;
// import type Card from "./card";
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const actionRegistry_1 = __importDefault(require("../data/actionRegistry"));
class StatusEffect_base extends effect_1.default {
    // the existence of id neccessitates a handler
    // this handler is special tho, it need to create the Status effect first, apply later
    // unlike card or s.th, which creates and provide in the same function
    //merge behavior is automatic upon end of turn
    get mergeSignature() {
        return this.constructor.name;
    }
    //merge target is guaranteed to have the same signature of this
    merge(mergeTargets) { return mergeTargets; }
    parseStat(statObj) { }
    // ^ if this status effects allows for reproc using activateEffect action
    //normally that isnt fucking possible? 
    //its like forcefully activating a passive
    //makes no sense on paper
    //but in practice....yeh its for expandability
    canRespondAndActivate_final(c, system, a) {
        if (system.isInTriggerPhase && this.activateOnTurnStart && a.typeID === actionRegistry_1.default.a_turn_start) {
            return true;
        }
        if (system.isInChainPhase && this.activateOnTurnEnd && a.typeID === actionRegistry_1.default.a_turn_end) {
            return true;
        }
        if (system.isInTriggerPhase && this.activateOnApply && a.typeID === actionRegistry_1.default.a_add_status_effect && a.flatAttr().typeID === this.id) {
            return true;
        }
        if (system.isInChainPhase && this.activateOnRemove && a.typeID === actionRegistry_1.default.a_remove_status_effect && a.flatAttr().typeID === this.id) {
            return true;
        }
        return false;
    }
    activate_final(c, system, a) {
        let res = [];
        if (this.activateOnTurnStart && a.typeID === actionRegistry_1.default.a_turn_start) {
            res = this.activateOnTurnStart(c, system, a);
        }
        if (this.activateOnTurnEnd && a.typeID === actionRegistry_1.default.a_turn_end) {
            res = this.activateOnTurnEnd(c, system, a);
        }
        if (this.activateOnApply && a.typeID === actionRegistry_1.default.a_add_status_effect) {
            res = this.activateOnApply(c, system, a);
        }
        if (this.activateOnRemove && a.typeID === actionRegistry_1.default.a_remove_status_effect) {
            res = this.activateOnRemove(c, system, a);
        }
        if (this.activateOnReProc && (a.typeID === actionRegistry_1.default.a_activate_effect || a.typeID === actionRegistry_1.default.a_activate_effect_internal)) {
            res = this.activateOnReProc(c, system, a);
        }
        res.forEach(i => i.isChain = true);
        return res;
    }
}
exports.StatusEffect_base = StatusEffect_base;
class e_any_extension extends StatusEffect_base {
    parseStat(statObj) {
        statObj.extensionArr = ["*"];
    }
    merge(mergeTargets) {
        return [this];
    }
}
exports.e_any_extension = e_any_extension;
class genericCounter extends StatusEffect_base {
    merge(mergeTargets) {
        let c = this.count;
        mergeTargets.forEach(i => c += i.count);
        this.count = c;
        return [this];
    }
    get count() { var _a; return (_a = this.attr.get("count")) !== null && _a !== void 0 ? _a : 1; }
    set count(val) { this.attr.set("count", val); }
    getDisplayInput() {
        return [this.count];
    }
}
exports.genericCounter = genericCounter;
class generic_stat_change_diff extends StatusEffect_base {
    get maxAtk() { var _a; return (_a = this.attr.get("maxAtk")) !== null && _a !== void 0 ? _a : 0; }
    get maxHp() { var _a; return (_a = this.attr.get("maxHp")) !== null && _a !== void 0 ? _a : 0; }
    get level() { var _a; return (_a = this.attr.get("level")) !== null && _a !== void 0 ? _a : 0; }
    set maxAtk(val) { this.attr.set("maxAtk", val); }
    set maxHp(val) { this.attr.set("maxHp", val); }
    set level(val) { this.attr.set("level", val); }
    parseStat(statObj) {
        statObj.maxAtk += this.maxAtk;
        statObj.maxHp += this.maxHp;
        statObj.level += this.level;
    }
    merge(mergeTargets) {
        mergeTargets.forEach(i => {
            this.maxAtk += i.maxAtk;
            this.maxHp += i.maxHp;
            this.level += i.level;
        });
        return [this];
    }
}
exports.generic_stat_change_diff = generic_stat_change_diff;
class generic_stat_change_override extends StatusEffect_base {
    get maxAtk() { return this.attr.get("maxAtk"); }
    get maxHp() { return this.attr.get("maxHp"); }
    get level() { return this.attr.get("level"); }
    set maxAtk(val) { this.attr.set("maxAtk", val); }
    set maxHp(val) { this.attr.set("maxHp", val); }
    set level(val) { this.attr.set("level", val); }
    parseStat(statObj) {
        if (this.maxAtk !== undefined)
            statObj.maxAtk = this.maxAtk;
        if (this.maxHp !== undefined)
            statObj.maxHp = this.maxHp;
        if (this.level !== undefined)
            statObj.level = this.level;
    }
    merge(mergeTargets) {
        if (mergeTargets.length === 0)
            return [this];
        return [mergeTargets.at(-1)];
    }
}
exports.generic_stat_change_override = generic_stat_change_override;
class e_automate_base extends StatusEffect_base {
    get countdown() { var _a; return (_a = this.attr.get("countdown")) !== null && _a !== void 0 ? _a : 0; }
    ;
    set countdown(a) { this.attr.set("countdown", a); }
    ;
    act(c, system, a) { return []; }
    activateOnTurnEnd(c, system, a) {
        this.countdown--;
        if (this.countdown === 0) {
            //act
            return this.act(c, system, a);
        }
        return [];
    }
}
exports.e_automate_base = e_automate_base;
exports.default = {
    e_any_extension,
    e_generic_counter: genericCounter,
    e_generic_stat_change_diff: generic_stat_change_diff,
    e_generic_stat_change_override: generic_stat_change_override,
};
