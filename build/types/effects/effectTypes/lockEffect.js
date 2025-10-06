"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
// import type { subTypeOverrideConflict } from "../../errors"
const passiveEffect_1 = __importDefault(require("./passiveEffect"));
class lockEffect extends passiveEffect_1.default {
    canRespondAndActivate(e, c, s, a) {
        //enforces only respond in the chain phase
        if (!a.is("a_pos_change") && !a.is("a_pos_change_force"))
            return false;
        if (!a.targets[0].is(c))
            return false;
        if (s.turnAction && s.turnAction.id !== a.id)
            return false;
        return super.canRespondAndActivate(e, c, s, a);
    }
    parseAfterActivate(e, c, system, res) {
        const cause = actionGenrator_1.actionFormRegistry.effect(system, c, e);
        res.unshift(actionGenrator_1.actionConstructorRegistry.a_negate_action(cause));
    }
}
exports.default = lockEffect;
