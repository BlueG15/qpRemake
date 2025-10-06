"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class effectSubtype {
    constructor(dataID) {
        this.isDisabled = false;
        this.dataID = dataID;
    }
    //the job of this bullshit is to do additonal stuff before the two main functions
    //of effect and may or may not override a forced return early
    //remember, what returns here is simply the extra functionality of the subtype
    //we do not care here what the fuck the effect do
    onEffectCheckCanActivate(c, e, system, a) {
        return -1;
    }
    onEffectActivate(c, e, system, a) {
        //I hereby declare that
        //subtypes cannot override effects
        //whatever returns here shall be appended
        return -1;
    }
    parseAfterActivate(c, e, system, res) { }
    //this is for subtype specific functionality
    activateSpecificFunctionality(c, e, system, a) { return []; }
    disable() {
        this.isDisabled = true;
    }
    enable() {
        this.isDisabled = false;
    }
    reset() {
        return [];
    }
    toDry() {
        return this;
    }
    is(p) {
        return p.dataID === this.dataID;
    }
}
exports.default = effectSubtype;
