"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
const effectType_1 = __importDefault(require("../../abstract/gameComponents/effectType"));
class manualEffect extends effectType_1.default {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it
    canRespondAndActivate(e, c, system, a) {
        return false;
    }
    parseAfterActivate(e, c, system, res) {
        res.push(actionGenrator_1.actionConstructorRegistry.a_disable_card(system, c)(actionGenrator_1.actionFormRegistry.card(system, c)));
    }
}
exports.default = manualEffect;
