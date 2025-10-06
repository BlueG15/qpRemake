"use strict";
//effects only used for testing
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_effect_require_number_input = get_effect_require_number_input;
const actionInputRequesterGenerator_1 = __importDefault(require("../_queenSystem/handler/actionInputRequesterGenerator"));
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
function get_effect_require_number_input(l, set = Utils.range(l)) {
    return class e_num_x extends effect_1.default {
        createInputObj(c, s, a) {
            console.log(`--------> From inside, e_num_${l}, input asked, set = ${set}`);
            return l === 1 ? actionInputRequesterGenerator_1.default.nums(s, set).once() : actionInputRequesterGenerator_1.default.nums(s, set).many(l);
        }
        activate_final(c, s, a, input) {
            console.log(`------------> From inside, e_num_${l}, input is : `, input.next().map(k => k.data));
            return [];
        }
    };
}
