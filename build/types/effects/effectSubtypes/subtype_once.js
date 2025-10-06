"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
class subtype_once extends effectSubtype_1.default {
    constructor() {
        super(...arguments);
        this.triggered = false;
    }
    onEffectCheckCanActivate(c, e, system, a) {
        if (this.triggered)
            return false;
        return -1;
    }
    onEffectActivate(c, e, system, a) {
        this.triggered = true;
        return -1;
    }
    activateSpecificFunctionality(c, e, system, a) {
        //reset once
        this.triggered = false;
        return [];
    }
}
exports.default = subtype_once;
