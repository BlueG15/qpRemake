"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.e_void = exports.e_reset = exports.e_reactivate = exports.e_execute = exports.e_destroy = exports.e_decompile = exports.e_deactivate = exports.e_clear_all_status = exports.e_generic_cardTargetting = void 0;
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const actionGenrator_1 = require("../_queenSystem/handler/actionGenrator");
const actionInputRequesterGenerator_1 = __importDefault(require("../_queenSystem/handler/actionInputRequesterGenerator"));
class e_generic_cardTargetting extends effect_1.default {
    createInputObj(c, s, a) {
        return actionInputRequesterGenerator_1.default.allZones(s, c).cards().once();
    }
    canRespondAndActivate_final(c, system, a) {
        return this.resolutionAID !== undefined;
    }
    activate_final(c, system, a, input) {
        let r = this.resolutionAID;
        if (r === undefined)
            return [];
        const cause = this.cause(system, c);
        const target = input.next().map(d => d.data.card);
        return target.map(c => actionGenrator_1.actionConstructorRegistry[r](system, c)(cause));
    }
}
exports.e_generic_cardTargetting = e_generic_cardTargetting;
class e_clear_all_status extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_clear_all_status_effect";
    }
}
exports.e_clear_all_status = e_clear_all_status;
class e_deactivate extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_disable_card";
    }
}
exports.e_deactivate = e_deactivate;
class e_decompile extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_enable_card";
    }
}
exports.e_decompile = e_decompile;
class e_destroy extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_destroy";
    }
}
exports.e_destroy = e_destroy;
class e_execute extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_execute";
    }
}
exports.e_execute = e_execute;
class e_reactivate extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_enable_card";
    }
}
exports.e_reactivate = e_reactivate;
class e_reset extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_reset_card";
    }
}
exports.e_reset = e_reset;
class e_void extends e_generic_cardTargetting {
    constructor() {
        super(...arguments);
        this.resolutionAID = "a_void";
    }
}
exports.e_void = e_void;
