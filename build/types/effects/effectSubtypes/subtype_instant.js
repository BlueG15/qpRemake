"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
class subtype_instant extends effectSubtype_1.default {
    onEffectActivate(c, e, system, a) {
        if (system.turnAction && system.turnAction.id !== a.id)
            return -1;
        // return [new modifyAnotherAction(system.rootID, "doIncreaseTurnCount", false, true, c.id)]
        return [
            actionGenrator_1.actionConstructorRegistry.a_modify_action("a_turn_end")(system, system.getRootAction())(actionGenrator_1.actionFormRegistry.subtype(system, c, e, this))({
                doIncreaseTurnCount: false
            })
        ];
    }
}
exports.default = subtype_instant;
