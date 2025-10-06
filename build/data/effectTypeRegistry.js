"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var effectTypeRegistry;
(function (effectTypeRegistry) {
    effectTypeRegistry[effectTypeRegistry["e_t_none"] = -1] = "e_t_none";
    effectTypeRegistry[effectTypeRegistry["e_t_manual"] = 0] = "e_t_manual";
    effectTypeRegistry[effectTypeRegistry["e_t_passive"] = 1] = "e_t_passive";
    effectTypeRegistry[effectTypeRegistry["e_t_trigger"] = 2] = "e_t_trigger";
    effectTypeRegistry[effectTypeRegistry["e_t_init"] = 3] = "e_t_init";
    effectTypeRegistry[effectTypeRegistry["e_t_lock"] = 4] = "e_t_lock";
    effectTypeRegistry[effectTypeRegistry["e_t_counter"] = 5] = "e_t_counter";
    effectTypeRegistry[effectTypeRegistry["e_t_status"] = 6] = "e_t_status";
})(effectTypeRegistry || (effectTypeRegistry = {}));
exports.default = effectTypeRegistry;
