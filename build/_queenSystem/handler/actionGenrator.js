"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionFormRegistry = exports.actionConstructorRegistry = exports.Action_class = void 0;
exports.getDefaultObjContructionObj = getDefaultObjContructionObj;
const actionRegistry_1 = __importDefault(require("../../data/actionRegistry"));
const systemRegistry_1 = require("../../data/systemRegistry");
const zoneRegistry_1 = require("../../data/zoneRegistry");
const position_1 = __importDefault(require("../../types/abstract/generics/position"));
class Action_class {
    cost() {
        this.isCost = true;
        this.attr.set("canBeChainedTo", false);
        this.attr.set("canBeTriggeredTo", false);
    }
    deleteInputObj() {
        this.attr.delete("input");
    }
    clone() {
        return Utils.clone(this);
    }
    copy(a) {
        this.id = a.id;
        this.typeID = a.typeID;
        this.isDisabled = a.isDisabled;
        this.targets = a.targets;
        this.cause = a.cause;
        this.originalCause = a.originalCause;
        this.originalTargets = a.originalTargets;
        this.modifiedSinceLastAccessed = true;
        this.checkers = a.checkers;
        this.__inputs = a.__inputs;
        // this.isInputsApplied_internal = a.isInputsApplied_internal;
        this.attr = a.attr;
    }
    // protected isInputsApplied_internal = false;
    // get isInputsApplied() {
    //     return this.inputs === undefined || this.isInputsApplied_internal
    // }
    // isChain: boolean; //if false, attach as new tree, if not, attach to curr action
    //isChain is not up to the action, its up to whatever type and subtype is attached
    //somewhat
    //if no trigger, no passive, no chained subtype, isChain here is used instead
    //so isChain here is a default
    flat() {
        let x = {
            targets: this.targets,
            cause: this.cause,
            originalTargets: this.originalTargets,
            originalCause: this.originalCause,
            modifiedSinceLastAccessed: this.modifiedSinceLastAccessed,
            isDisabled: this.isDisabled,
            id: this.id,
            typeID: this.typeID,
            isChain: this.isChain,
            canBeChainedTo: this.canBeChainedTo,
            canBeTriggeredTo: this.canBeTriggeredTo,
            attr: {}
        };
        this.attr.forEach((val, key) => {
            x.attr[key] = val;
        });
        return x;
    }
    flatAttr() {
        let x = {};
        this.attr.forEach((val, key) => {
            x[key] = val;
        });
        return x;
    }
    resolvable(s, z, c, eff, subtype) {
        //Oct 5th, i forgor what this is for but it breaks for stuff with multiple of the same type
        //like a_draw
        //no way the id check matches 2 times for 2 different zones man
        //this now checks for at least 1 one per type thats in the target
        //i.e if target has 2 zones, only 1 zone needs to match teh condition
        //TODO : figure out what i was trying to do here
        const seenTypes = new Set();
        return this.targets.every(target => {
            if (seenTypes.has(target.type))
                return true;
            seenTypes.add(target.type);
            switch (target.type) {
                case systemRegistry_1.identificationType.zone: return z ? this.checkers.zone(target, z) : false;
                case systemRegistry_1.identificationType.card: return (c && z) ? this.checkers.card(target, c, z) : false;
                case systemRegistry_1.identificationType.effect: return (eff && c && z) ? this.checkers.effect(target, eff, c, z) : false;
                case systemRegistry_1.identificationType.effectSubtype: return (subtype && eff && c && z) ? this.checkers.effectSubtype(target, subtype, eff, c, z) : false;
                default: return true;
            }
        });
    }
    get isChain() {
        let t = this.attr.get("isChain");
        if (typeof t === "boolean")
            return t;
        else
            this.isChain = true;
        return true;
    }
    set isChain(newVal) {
        this.attr.set("isChain", newVal);
    }
    get canBeChainedTo() { return Boolean(this.attr.get("canBeChainedTo")); }
    ;
    get canBeTriggeredTo() { return Boolean(this.attr.get("canBeTriggeredTo")); }
    ;
    get firstCardTarget() {
        return this.targets.find(i => i.type === systemRegistry_1.identificationType.card);
    }
    get firstPosTarget() {
        return this.targets.find(i => i.type === systemRegistry_1.identificationType.position);
    }
    get firstZoneTarget() {
        return this.targets.find(i => i.type === systemRegistry_1.identificationType.zone);
    }
    constructor(o) {
        var _a, _b;
        this.id = NaN;
        this.isDisabled = false;
        this.isCost = false;
        this.attr = new Map();
        this.__inputs = [];
        this.typeID = o.type;
        this.isChain = (o.isChainDefault === false) ? false : true;
        this.targets = ((_a = o.targets) !== null && _a !== void 0 ? _a : []);
        this.cause = ((_b = o.cause) !== null && _b !== void 0 ? _b : {
            type: systemRegistry_1.identificationType.none
        });
        this.originalCause = this.cause;
        this.originalTargets = this.targets;
        this.modifyAttr("canBeChainedTo", (o.canBeChainTo === false) ? false : true);
        this.modifyAttr("canBeTriggeredTo", (o.canBeTriggeredTo === false) ? false : true);
        this.modifiedSinceLastAccessed = false;
        //binding checker
        this.checkers = defaultChecker;
        if (o.checkers) {
            Utils.patchGeneric(this.checkers, o.checkers);
        }
        Object.entries(o).forEach(([key, val]) => {
            if (key !== "type" &&
                key !== "targets" &&
                key !== "cause" &&
                val !== undefined) {
                this.attr.set(key, val);
            }
        });
    }
    dontchain() {
        this.isChain = false;
        return this;
    }
    chain() {
        this.isChain = true;
        return this;
    }
    assignID(n) {
        this.id = n;
    }
    get hasCardTarget() {
        return this.targets.length !== 0 && this.targets.some(i => i.type === systemRegistry_1.identificationType.card);
    }
    get hasActionTarget() {
        return this.targets.length !== 0 && this.targets.some(i => i.type === systemRegistry_1.identificationType.action);
    }
    get hasCause() {
        return this.cause.type !== systemRegistry_1.identificationType.none;
    }
    //dont have cause -> cause is from playerAction
    // get fromPlayer() {
    //     return this.hasCause;
    // }
    get fromCard() {
        return this.cause.type === systemRegistry_1.identificationType.card;
    }
    get type() {
        return actionRegistry_1.default[this.typeID];
    }
    // get requireInput() {
    //     return this.inputs !== undefined
    // }
    verifyNewValue(key, newVal) {
        if (key === "target")
            return true; //handled later
        if (key === "canBeChainedTo" && typeof newVal === "boolean")
            return true;
        if (key === "canBeTriggeredTo" && typeof newVal === "boolean")
            return true;
        let oldVal = this.attr.get(key);
        if (Utils.getTypeSigature(oldVal) === Utils.getTypeSigature(newVal))
            return true;
        return false;
    }
    modifyAttr(key, newVal) {
        if (newVal === this.attr.get(key))
            return;
        //check type
        if (!this.verifyNewValue(key, newVal))
            return;
        if (key === "target") {
            if (Array.isArray(newVal)) {
                if (this.targets.length !== newVal.length)
                    return;
                newVal = newVal.map((i, index) => this.verifyTarget(i, this.targets[index].type));
                if (newVal.some((i) => i === undefined))
                    return;
                this.targets = newVal;
                this.modifiedSinceLastAccessed = true;
                return;
            }
            else {
                if (this.targets.length !== 1)
                    return;
                newVal = this.verifyTarget(newVal, this.targets[0].type);
                if (!newVal)
                    return;
                this.targets = [newVal];
                this.modifiedSinceLastAccessed = true;
                return;
            }
        }
        this.modifiedSinceLastAccessed = true;
        this.attr.set(key, newVal);
    }
    verifyTarget(val, compareType) {
        if (typeof val !== "object")
            return undefined;
        if (typeof val.type !== "number")
            return undefined;
        if (val.type !== compareType)
            return undefined;
        switch (val.type) {
            case systemRegistry_1.identificationType.none: return val;
            case systemRegistry_1.identificationType.player:
            case systemRegistry_1.identificationType.zone: {
                if (typeof val.id === "number")
                    return val;
                else
                    return undefined;
            }
            case systemRegistry_1.identificationType.card: {
                if (typeof val.id === "string")
                    return val;
                else
                    return undefined;
            }
            case systemRegistry_1.identificationType.effect: {
                if (typeof val.cid === "string" && typeof val.eid === "string")
                    return val;
                return undefined;
            }
            case systemRegistry_1.identificationType.position: {
                if (val.pos instanceof position_1.default)
                    return val;
                return undefined;
            }
            case systemRegistry_1.identificationType.action: {
                if (val.action instanceof Action_class)
                    return val;
                return undefined;
            }
            case systemRegistry_1.identificationType.effectSubtype: {
                if (typeof val.cid === "string" && typeof val.eid === "string" && typeof val.stid === "string")
                    return val;
                return undefined;
            }
            default: return undefined;
        }
    }
    // private verifyInput_all(input : inputData[]){
    //     const obj = this.inputs
    //     if(!obj) return false
    //     return input.length === obj.inputs.length && input.every((i, index) => i.type === obj.inputs[index])
    // }
    verifyInput_target_all(input) {
        return (input.length === this.targets.length &&
            input.every((i, index) => (typeof i.data === "object" && (!Array.isArray(i.data)) && i.data.type === this.targets[index].type)));
    }
    //false : no restriction
    //true : completed
    //inputData[] : restricted to this set
    // applyUserInput(system : dry_system, input?: inputData): boolean | inputData[]{
    //     const obj = this.inputs
    //     if(!obj) return true
    //     let v : inputData[] | -1 | void = obj.getValid.next(input as any).value
    //     let nextInputType = obj.inputs[this.__inputs.length]
    //     if(input === undefined){
    //         if(Array.isArray(v)) return v;
    //         return this.__getAllInputs(system, nextInputType);
    //     } //first next
    //     if(this.__inputs.length >= obj.inputs.length) return true;
    //     this.__inputs.push(input);
    //     if(this.__inputs.length === obj.inputs.length) {
    //         this.isInputsApplied_internal = true;
    //         obj.applyInput(system, this, this.__inputs);
    //         return true;
    //     } else {
    //         if(v === undefined) throw new Error(`try to apply input when input is finished taking`)
    //         if(Array.isArray(v)) return v;
    //         return this.__getAllInputs(system, nextInputType);
    //     }
    // }
    disable() {
        this.isDisabled = true;
    }
    enable() {
        this.isDisabled = false;
    }
    is(type) {
        return this.typeID === actionRegistry_1.default[type];
    }
}
exports.Action_class = Action_class;
function defaultChecker_zone(target, currZone) {
    return target.zone.id === currZone.id;
}
function defaultCheker_card(target, currCard, currZone, strict = false) {
    return target.card.id === currCard.id && (!strict || target.card.pos.is(currCard.pos));
}
function defaultChecker_effect(target, currEffect, currCard, currZone, recur = true, strict = false) {
    return target.eff.id === currEffect.id && (!recur || defaultCheker_card(target, currCard, currZone, strict));
}
function defaultChecker_effectSubtype(target, currSubtype, currEffect, currCard, currZone, recur = false, strict = false) {
    return target.subtype.dataID === currSubtype.dataID && defaultChecker_effect(target, currEffect, currCard, currZone, recur, strict);
}
const defaultChecker = {
    zone: defaultChecker_zone,
    card: defaultCheker_card,
    effect: defaultChecker_effect,
    effectSubtype: defaultChecker_effectSubtype
};
function form_card(s) {
    return (card) => {
        return {
            type: systemRegistry_1.identificationType.card,
            sys: s,
            card: card,
            is(card) {
                return card.id === this.card.id;
            }
        };
    };
}
function form_action(s) {
    return (a) => {
        return {
            type: systemRegistry_1.identificationType.action,
            sys: s,
            action: a,
            is(type) {
                return this.action.is(type);
            }
        };
    };
}
function form_effect(s) {
    return (card, eff) => {
        return {
            type: systemRegistry_1.identificationType.effect,
            sys: s,
            card: card,
            eff: eff,
            is(card, eff) {
                return this.card.is(card) && this.eff.is(eff);
            },
        };
    };
}
function form_zone(s) {
    return (zone) => {
        return {
            type: systemRegistry_1.identificationType.zone,
            sys: s,
            zone: zone,
            is(p) {
                return this.zone.is(p);
            },
            of(p) {
                return this.zone.of(p);
            }
        };
    };
}
function form_position(s) {
    return (pos) => {
        return {
            type: systemRegistry_1.identificationType.position,
            sys: s,
            pos: pos,
            is(pos) {
                return this.pos.is(pos);
            },
        };
    };
}
function form_player(s) {
    return (pid) => {
        return {
            type: systemRegistry_1.identificationType.player,
            sys: s,
            id: pid,
            is(player_owned_obj) {
                return player_owned_obj.playerIndex === this.id;
            },
        };
    };
}
function form_partition(s) {
    return (pid) => {
        return {
            type: systemRegistry_1.identificationType.partition,
            sys: s,
            pid,
            is(n) {
                return n === pid;
            }
        };
    };
}
function form_subtype(s) {
    return (card, eff, subtype) => {
        return {
            type: systemRegistry_1.identificationType.effectSubtype,
            sys: s,
            card: card,
            eff: eff,
            subtype: subtype,
            is(card, eff, subtype) {
                return this.card.is(card) && this.eff.is(eff) && this.subtype.dataID === subtype.dataID;
            },
        };
    };
}
function form_none() {
    return {
        type: systemRegistry_1.identificationType.none
    };
}
function form_system() {
    return {
        type: systemRegistry_1.identificationType.system
    };
}
function ActionAssembler_base(name, targets, cause, info) {
    const o1 = getDefaultObjContructionObj(actionRegistry_1.default[name]);
    const o2 = Object.assign(Object.assign({ targets: targets, cause: cause }, o1), info);
    return new Action_class(o2);
}
//end overload-with info section
function ActionAssembler(name, ...f) {
    //for a general solution, we curried up to f[len - 2], if that last element is an object, we stop
    //so the standard calls is (s, ...p) => ...ps
    //we pre-curried the first param, then reuse s for the rest
    if (f.length === 0)
        return (cause, infoObj = {}) => ActionAssembler_base(name, [form_none()], cause, infoObj);
    const extractLast = (typeof (f[f.length - 1]) === "object");
    if (f.length === 1 && extractLast)
        return (cause, infoObj = {}) => ActionAssembler_base(name, [form_none()], cause, infoObj);
    if (extractLast)
        f.splice(-1, 1);
    // console.log("DEBUG1: " + name + " -- " + f.map(i => (typeof i === "object") ? Object.keys(i).join("==") : typeof i).join("_") + extractLast);
    return (s, ...p) => {
        const [first, ...rest] = f.map(i => i(s));
        // console.log("DEBUG2: " + name + " -- " + f.map(i => (typeof i === "object") ? Object.keys(i).join("==") : typeof i).join("_") + extractLast);
        return Utils.genericCurrier(rest, (resArr) => {
            resArr.unshift(first(...p));
            return (cause, infoObj = {}) => ActionAssembler_base(name, resArr, cause, infoObj);
        });
    };
}
function modifyActionContructor(type) {
    return (s, action) => (cause) => (p) => ActionAssembler_base("a_modify_action", [form_action(s)(action)], cause, p);
}
function addEffectContructor(type, isStatus) {
    return (s, card) => (cause, p) => ActionAssembler_base((isStatus ? "a_add_status_effect" : "a_add_effect"), [form_card(s)(card)], cause, Object.assign(Object.assign({}, p), { typeID: type }));
}
//default restriction is the loosest possible restriction
//card : none (practically)
//zone : none (practically)
//effect : same card
//effect subtype : same effect
function getDefaultObjContructionObj(id) {
    let o = {
        type: id
    };
    switch (id) {
        case actionRegistry_1.default.a_activate_effect_internal: {
            o.canBeChainTo = false,
                o.canBeTriggeredTo = true;
            break;
        }
        case actionRegistry_1.default.a_turn_end: {
            o.canBeTriggeredTo = false;
            break;
        }
        case actionRegistry_1.default.error: {
            o.canBeChainTo = false,
                o.canBeTriggeredTo = false;
            break;
        }
        case actionRegistry_1.default.a_deal_damage_internal: {
            o.canBeChainTo = false,
                o.canBeTriggeredTo = true;
            break;
        }
        case actionRegistry_1.default.a_deal_damage_card: {
            o.checkers = {
                card: (target, currCard, currZone) => {
                    //move whereever you want, if its still on the field, its damagable
                    if (!defaultCheker_card(target, currCard, currZone))
                        return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry_1.zoneRegistry.z_deck || i === zoneRegistry_1.zoneRegistry.z_field || i === zoneRegistry_1.zoneRegistry.z_hand;
                    });
                }
            };
            break;
        }
        case actionRegistry_1.default.a_destroy: {
            o.checkers = {
                card: (target, currCard, currZone) => {
                    //move whereever you want, if its not in grave, its destroyable
                    if (!defaultCheker_card(target, currCard, currZone))
                        return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry_1.zoneRegistry.z_deck || i === zoneRegistry_1.zoneRegistry.z_field || i === zoneRegistry_1.zoneRegistry.z_hand;
                    });
                }
            };
            break;
        }
        case actionRegistry_1.default.a_execute: {
            o.checkers = {
                card: (target, currCard, currZone) => {
                    //move whereever you want, if its still on the field, its damagable
                    if (!defaultCheker_card(target, currCard, currZone))
                        return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry_1.zoneRegistry.z_deck || i === zoneRegistry_1.zoneRegistry.z_field || i === zoneRegistry_1.zoneRegistry.z_hand;
                    });
                }
            };
            break;
        }
        case actionRegistry_1.default.a_pos_change: {
            o.checkers = {
                card: (target, currCard, currZone) => {
                    //pos_change default is strict
                    return defaultCheker_card(target, currCard, currZone, true);
                }
            };
            break;
        }
    }
    return o;
}
const actionConstructorRegistry = {
    error: ActionAssembler("error"),
    a_null: ActionAssembler("a_null"),
    a_negate_action: ActionAssembler("a_negate_action"),
    a_do_threat_burn: ActionAssembler("a_do_threat_burn"),
    a_force_end_game: ActionAssembler("a_force_end_game"),
    a_increase_turn_count: ActionAssembler("a_increase_turn_count"),
    a_set_threat_level: ActionAssembler("a_set_threat_level", {
        newThreatLevel: 0
    }),
    a_turn_end: ActionAssembler("a_turn_end", {
        doIncreaseTurnCount: true
    }),
    a_turn_reset: ActionAssembler("a_turn_reset"),
    a_turn_start: ActionAssembler("a_turn_start"),
    a_reprogram_start: ActionAssembler("a_reprogram_start"),
    a_reprogram_end: ActionAssembler("a_reprogram_end"),
    a_clear_all_status_effect: ActionAssembler("a_clear_all_status_effect", form_card),
    a_clear_all_counters: ActionAssembler("a_clear_all_counters", form_card),
    a_deal_damage_card: ActionAssembler("a_deal_damage_card", form_card, {
        dmg: 0,
        dmgType: 0
    }),
    a_deal_damage_position: ActionAssembler("a_deal_damage_position", form_position, {
        dmg: 0,
        dmgType: 0
    }),
    a_deal_damage_internal: ActionAssembler("a_deal_damage_internal", form_card, {
        dmg: 0,
        dmgType: 0
    }),
    a_deal_heart_damage: ActionAssembler("a_deal_heart_damage", form_player, {
        dmg: 0,
    }),
    a_destroy: ActionAssembler("a_destroy", form_card),
    a_disable_card: ActionAssembler("a_disable_card", form_card),
    a_enable_card: ActionAssembler("a_enable_card", form_card),
    a_execute: ActionAssembler("a_execute", form_card),
    a_pos_change: ActionAssembler("a_pos_change", form_card, form_position),
    a_pos_change_force: ActionAssembler("a_pos_change_force", form_card, form_position),
    a_attack: ActionAssembler("a_attack", form_card, {}),
    a_deal_damage_ahead: ActionAssembler("a_deal_damage_ahead", form_card, {}),
    a_reset_card: ActionAssembler("a_reset_card", form_card),
    a_decompile: ActionAssembler("a_decompile", form_card),
    a_void: ActionAssembler("a_void", form_card),
    a_reset_all_once: ActionAssembler("a_reset_all_once", form_card),
    a_declare_activation: ActionAssembler("a_declare_activation", form_effect),
    a_reset_effect: ActionAssembler("a_reset_effect", form_effect),
    a_activate_effect: ActionAssembler("a_activate_effect", form_card, form_partition),
    a_activate_effect_internal: ActionAssembler("a_activate_effect_internal", form_card, form_partition),
    a_add_status_effect: addEffectContructor,
    a_add_effect: addEffectContructor,
    a_duplicate_effect: ActionAssembler("a_duplicate_effect", form_card, form_card, form_partition, {}), //duplicate partition of card[1] into card[0]
    a_duplicate_card: ActionAssembler("a_duplicate_card", form_card, form_position, {}), //duplicate card onto position
    a_remove_status_effect: ActionAssembler("a_remove_status_effect", form_effect),
    a_remove_effect: ActionAssembler("a_remove_effect", form_card, form_partition),
    a_remove_all_effects: ActionAssembler("a_remove_all_effects", form_card),
    a_activate_effect_subtype: ActionAssembler("a_activate_effect_subtype", form_subtype, {
        newEffectData: 0
    }),
    a_modify_action: modifyActionContructor,
    a_replace_action: ActionAssembler("a_replace_action", form_action),
    a_zone_interact: ActionAssembler("a_zone_interact", form_zone),
    a_shuffle: ActionAssembler("a_shuffle", form_zone, {
        shuffleMap: {}
    }),
    a_draw: ActionAssembler("a_draw", form_zone, form_zone, {
        cooldown: 0,
        doTurnReset: true,
        actuallyDraw: true,
    }),
    a_add_top: ActionAssembler("a_add_top", form_card, form_zone),
    a_get_input: ActionAssembler("a_get_input", {}),
    a_delay: ActionAssembler("a_delay", {}),
};
exports.actionConstructorRegistry = actionConstructorRegistry;
const actionFormRegistry = {
    action: (s, a) => form_action(s)(a),
    card: (s, c) => form_card(s)(c),
    effect: (s, c, eff) => form_effect(s)(c, eff),
    subtype: (s, c, eff, subtype) => form_subtype(s)(c, eff, subtype),
    position: (s, pos) => form_position(s)(pos),
    zone: (s, zone) => form_zone(s)(zone),
    player: (s, pid) => form_player(s)(pid),
    none: form_none,
    system: form_system
};
exports.actionFormRegistry = actionFormRegistry;
