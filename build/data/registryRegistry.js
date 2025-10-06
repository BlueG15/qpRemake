"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryRegistry = void 0;
var registryRegistry;
(function (registryRegistry) {
    registryRegistry[registryRegistry["card"] = 0] = "card";
    registryRegistry[registryRegistry["effect"] = 1] = "effect";
    registryRegistry[registryRegistry["effectSubType"] = 2] = "effectSubType";
    registryRegistry[registryRegistry["effectType"] = 3] = "effectType";
    registryRegistry[registryRegistry["rarity"] = 4] = "rarity";
    registryRegistry[registryRegistry["operator"] = 5] = "operator";
    registryRegistry[registryRegistry["zone"] = 6] = "zone";
    registryRegistry[registryRegistry["mod"] = 7] = "mod";
})(registryRegistry || (exports.registryRegistry = registryRegistry = {}));
