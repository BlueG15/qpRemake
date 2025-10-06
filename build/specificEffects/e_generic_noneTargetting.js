"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const actionGenrator_1 = require("../_queenSystem/handler/actionGenrator");
class e_generic_noneTargetting extends effect_1.default {
    constructor() {
        super(...arguments);
        this.resolutionAID = undefined;
    }
    canRespondAndActivate_final(c, system, a) {
        return this.resolutionAID !== undefined;
    }
    activate_final(c, system, a) {
        let r = this.resolutionAID;
        if (r === undefined)
            return [];
        const cause = this.cause(system, c);
        return [
            actionGenrator_1.actionConstructorRegistry[r](cause)
        ];
    }
}
exports.default = e_generic_noneTargetting;
