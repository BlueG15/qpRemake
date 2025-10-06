"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
const zoneRegistry_1 = require("../../../data/zoneRegistry");
class subtype_hand_or_fieldLock extends effectSubtype_1.default {
    onEffectCheckCanActivate(c, e, system, a) {
        //fieldLock effects can only be activated on field
        //jkong say this is by default how a trigger works
        //i dont like it, so i make it a new subtype
        let zone = system.getZoneWithID(c.pos.zoneID);
        if (!zone)
            return false;
        if (zone.types.includes(zoneRegistry_1.zoneRegistry.z_field) || zone.types.includes(zoneRegistry_1.zoneRegistry.z_hand))
            return -1;
        return false;
    }
}
exports.default = subtype_hand_or_fieldLock;
