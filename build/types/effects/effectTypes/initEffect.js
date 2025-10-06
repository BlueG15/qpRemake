"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const triggerEffect_1 = __importDefault(require("./triggerEffect"));
const actionRegistry_1 = __importDefault(require("../../../data/actionRegistry"));
const zoneRegistry_1 = require("../../../data/zoneRegistry");
class initEffect extends triggerEffect_1.default {
    canRespondAndActivate(e, c, system, a) {
        if (a.typeID !== actionRegistry_1.default.a_pos_change && a.typeID !== actionRegistry_1.default.a_pos_change_force)
            return false;
        let targets = a.targets;
        let zone = system.getZoneWithID(targets[1].pos.zoneID);
        if (!zone)
            return false;
        if (targets[0].is(c) &&
            zone.types.includes(zoneRegistry_1.zoneRegistry.z_field))
            return super.canRespondAndActivate(e, c, system, a);
        return false;
    }
}
exports.default = initEffect;
