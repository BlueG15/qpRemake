"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
//some effects can modify event data 
//so in general, activate takes in an event and spits out an event
const actionInputGenerator_1 = require("../../../_queenSystem/handler/actionInputGenerator");
const actionInputRequesterGenerator_1 = __importDefault(require("../../../_queenSystem/handler/actionInputRequesterGenerator"));
class Effect {
    get signature_type() {
        return this.type.dataID;
    }
    get signature_type_subtype() {
        const sep = "===";
        return this.signature_type + sep + this.subTypes.map(i => i.dataID).join(sep);
    }
    //actual effects override these two
    canRespondAndActivate_final(c, system, a) { return this.constructor.name !== "Effect"; }
    activate_final(c, s, a, input) { return []; }
    ;
    /** @final */
    getInputObj(c, s, a) {
        if (this.__cached_input.hasValue)
            return this.__cached_input.value;
        this.__cached_input = {
            hasValue: true,
            value: this.createInputObj(c, s, a)
        };
        return this.__cached_input.value;
    }
    //createInputObj should be deterministic
    //activate once per activate call
    createInputObj(c, s, a) {
        return undefined;
    }
    //Update 1.2.6 : Move the condition closer to the activate, i.e inside it
    //to avoid condition conflicts
    //can repond -> 2 functions, canRespond_prelim and canRespond_final
    /** @final */
    canRespondAndActivate_prelim(c, system, a) {
        let res = -1;
        let trueForceFlag = false;
        let falseForceFlag = false;
        const overrideIndexes = [];
        let skipTypeCheck = false;
        if (this.isDisabled)
            return false;
        if (!c.canAct)
            return false;
        for (let i = 0; i < this.subTypes.length; i++) {
            //if any non-disabled subtype returns returns that instead
            if (this.subTypes[i].isDisabled)
                continue;
            res = this.subTypes[i].onEffectCheckCanActivate(c, this, system, a);
            if (res === -1)
                continue;
            if (res === -2) {
                skipTypeCheck = true;
                continue;
            }
            if (res)
                trueForceFlag = true;
            else
                falseForceFlag = true;
            overrideIndexes.push(i);
        }
        //resolvin conflict
        if (trueForceFlag && falseForceFlag) {
            //conflict exists
            //false is prioritized
            // return new subTypeOverrideConflict(c.id, this.id, overrideIndexes)
            return false;
        }
        if (trueForceFlag)
            return true;
        if (falseForceFlag)
            return false;
        if (!skipTypeCheck) {
            res = this.type.canRespondAndActivate(this, c, system, a);
            if (res !== -1)
                return res;
        }
        //has input check
        const gen = this.getInputObj(c, system, a);
        if (gen !== undefined && !gen.hasInput())
            return false;
        // return this.canRespondAndActivate_final(c, system, a);
        return true;
    }
    /** @final */
    activate(c, system, a, input) {
        this.__cached_input = {
            hasValue: false
        };
        if (this.overrideActivationCondition && !this.overrideActivationCondition.bind(this)(c, system, a)) {
            return [];
        }
        if (!this.canRespondAndActivate_final(c, system, a)) {
            return [];
        }
        if (this.isDisabled)
            return [];
        if (!c.canAct)
            return [];
        let res = -1;
        const appenddedRes = [];
        for (let i = 0; i < this.subTypes.length; i++) {
            if (this.subTypes[i].isDisabled)
                continue;
            res = this.subTypes[i].onEffectActivate(c, this, system, a);
            if (res === -1)
                continue;
            appenddedRes.push(...res);
        }
        const final = this.activate_final(c, system, a, input);
        this.type.parseAfterActivate(this, c, system, final);
        this.subTypes.forEach(st => st.parseAfterActivate(c, this, system, final));
        return final;
    }
    ;
    /** @final */
    getSubtypeidx(subtypeID) {
        for (let i = 0; i > this.subTypes.length; i++) {
            if (this.subTypes[i].dataID === subtypeID)
                return i;
        }
        return -1;
    }
    activateSubtypeSpecificFunc(subtypeIdentifier, c, system, a) {
        if (typeof subtypeIdentifier === "string") {
            subtypeIdentifier = this.getSubtypeidx(subtypeIdentifier);
        }
        if (subtypeIdentifier < 0)
            return [];
        return this.subTypes[subtypeIdentifier].activateSpecificFunctionality(c, this, system, a);
    }
    constructor(id, dataID, type, subTypes = [], data) {
        this.isDisabled = false; //I DO NOT LIKE THIS NAME
        this.__cached_input = {
            hasValue: false
        };
        //@unmodifiable
        this.addedInputConditionMap = {};
        this.id = id;
        this.type = type;
        this.subTypes = subTypes;
        this.dataID = dataID;
        this.originalData = data;
        const k = Object.entries(data).filter(([_, val]) => typeof val === "number");
        this.attr = new Map(k);
    }
    get displayID() { var _a; return (_a = this.originalData.displayID_default) !== null && _a !== void 0 ? _a : this.dataID; }
    addSubType(st) {
        this.subTypes.push(st);
    }
    removeSubType(stid) {
        this.subTypes = this.subTypes.filter(i => i.dataID !== stid);
    }
    /** @final */
    disable() {
        this.isDisabled = true;
    }
    /** @final */
    toDry() {
        return this;
    }
    /** @final */
    enable() {
        this.isDisabled = false;
    }
    is(p) {
        return typeof p === "function" ? this instanceof p : this.id === p.id;
    }
    //common variables
    get count() { var _a; return (_a = this.attr.get("count")) !== null && _a !== void 0 ? _a : 0; }
    get doArchtypeCheck() { return this.attr.get("doArchtypeCheck") != 0; } //!= is intentional to allow undefine = 0
    get checkLevel() { var _a; return (_a = this.attr.get("checkLevel")) !== null && _a !== void 0 ? _a : 0; }
    get mult() { var _a; return (_a = this.attr.get("mult")) !== null && _a !== void 0 ? _a : 1; }
    //effect types:
    // + trigger : 
    // responds to "effect resolution"
    // adds each action return as a new tree
    // + passive :
    // responds to "effect activation"
    // may modifies the action it responds to
    // adds the effect to the current node as a child node to the current node
    // + chained trigger : 
    // responds to "effect activation"
    // adds a "activate effect" action as a child node to the current node, which activates this one
    //^ implemented
    getDisplayInput(c, system) {
        return Object.keys(this.originalData).sort().map(k => { var _a; return (_a = this.attr.get(k)) !== null && _a !== void 0 ? _a : 0; });
    }
    reset() {
        const res = [];
        this.subTypes.forEach(i => res.push(...i.reset()));
        return res;
    }
    toString(spaces = 2) {
        return JSON.stringify({
            dataID: this.dataID,
            subTypes: this.subTypes,
            // desc : this.desc,
            attr: JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces);
    }
    cause(s, c) {
        return actionGenrator_1.actionFormRegistry.effect(s, c, this);
    }
    static listen(f) {
        return class ExtendedEff extends this {
            constructor(...p) {
                super(...p);
                this.overrideActivationCondition = f.bind(this);
            }
        };
    }
    static beforeActivate(f) {
        return class ExtendedEff extends this {
            activate_final(...p) {
                const k = p;
                (f.bind(this))(...k);
                return super.activate_final(...k);
            }
        };
    }
    /**then
     * Allows the quick creation of a new effect class
     * overriding the original action[] result
     * Does NOT asks for more input
     * */
    static then(f) {
        return class ExtendedEff extends this {
            activate_final(...p) {
                const k = p;
                const res = super.activate_final(...k);
                return (f.bind(this))(res, ...k);
            }
        };
    }
    static thenShares(f) {
        return class ExtendedEff extends this {
            activate_final(...p) {
                const k = p;
                const res = super.activate_final(...k);
                const [key, val] = f.bind(this)(res, ...p, this);
                p[0].addShareMemory(this, key, val);
                return res;
            }
        };
    }
    static implyCondition(type, cond) {
        return class ExtendedEff extends this {
            createInputObj(c, s, a) {
                this.addedInputConditionMap[type] =
                    ((c, s, a) => (target) => cond.bind(this)(target, c, s, a))(c, s, a);
                const res = super.createInputObj(c, s, a);
                delete this.addedInputConditionMap[type];
                return res;
            }
        };
    }
    static removeInput(converter) {
        const originalClass = this; //type dance to convert old -> new
        return class ExtendedEff extends originalClass {
            createInputObj(c, s, a) {
                return undefined;
            }
            activate_final(c, s, a) {
                const oldInput = converter.bind(this)(c, s, a);
                const testObj = oldInput[0];
                if (!testObj || !Array.isArray(testObj))
                    return super.activate_final(c, s, a, { next: () => oldInput });
                return testObj.flatMap(o => super.activate_final(c, s, a, { next: () => o }));
            }
        };
    }
    static retarget(newInputFunc, converter) {
        const originalClass = this; //type dance to convert old -> new
        return class ExtendedEff extends originalClass {
            createInputObj(c, s, a) {
                return newInputFunc.bind(this)(c, s, a);
            }
            activate_final(c, s, a, input) {
                const r = input === null || input === void 0 ? void 0 : input.next();
                if (!r)
                    return [];
                const oldInput = converter.bind(this)(r, c, s, a);
                const testObj = oldInput[0];
                if (!testObj || !Array.isArray(testObj))
                    return super.activate_final(c, s, a, { next: () => oldInput });
                return testObj.flatMap(o => super.activate_final(c, s, a, { next: () => o }));
            }
        };
    }
    static toOthersOfSameField(filter) {
        return this.removeInput((c, s, a) => s.getZoneOf(c).cardArr_filtered.filter(c1 => c1.id !== c.id && (!filter || filter(c1, c, s, a))).map(c1 => actionInputGenerator_1.inputFormRegistry.card(s, c1)));
    }
    static toAllEnemies(filter) {
        return this.toAllOfZone((c, s, a) => actionInputRequesterGenerator_1.default.oppositeZoneTo(s, c).once(), filter);
    }
    static toAllOfZone(newInputFunc, filter) {
        return this.retarget(newInputFunc, (z, c, s, a) => filter ?
            z[0].data.zone.cardArr_filtered.filter(c1 => filter(c1, c, s, a)).map(c => actionInputGenerator_1.inputFormRegistry.card(s, c)) :
            z[0].data.zone.cardArr_filtered.map(c => actionInputGenerator_1.inputFormRegistry.card(s, c)));
    }
    static toAllOfSpecificZone(type, filter) {
        return this.toAllOfZone((c, s, a) => actionInputRequesterGenerator_1.default.specificType(s, c, type).once(), filter);
    }
    static toThisCard() {
        return this.removeInput((c, s, a) => [actionInputGenerator_1.inputFormRegistry.card(s, c)]);
    }
    static moreInput(moreInputFunc, handler) {
        const originalClass = this;
        return class ExtendedEff extends originalClass {
            createInputObj(c, s, a) {
                this.___input_original = super.createInputObj(c, s, a);
                return this.___input_original.merge(moreInputFunc.bind(this)(c, s, a));
            }
            activate_final(c, s, a, input) {
                const a1 = super.activate_final(c, s, a, this.___input_original);
                if (!handler)
                    return a1;
                return a1.concat(handler.bind(this)(c, s, a, input.next()));
            }
        };
    }
}
exports.default = Effect;
