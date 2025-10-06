"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EffectType {
    constructor(dataID) { this.dataID = dataID; }
    canRespondAndActivate(eff, c, system, a) { return -1; }
    parseAfterActivate(eff, c, system, res) { }
}
exports.default = EffectType;
