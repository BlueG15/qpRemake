"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var subtypeRegistry;
(function (subtypeRegistry) {
    subtypeRegistry[subtypeRegistry["e_st_chained"] = 0] = "e_st_chained";
    subtypeRegistry[subtypeRegistry["e_st_delayed"] = 1] = "e_st_delayed";
    subtypeRegistry[subtypeRegistry["e_st_fieldLock"] = 2] = "e_st_fieldLock";
    subtypeRegistry[subtypeRegistry["e_st_handOrFieldLock"] = 3] = "e_st_handOrFieldLock";
    subtypeRegistry[subtypeRegistry["e_st_graveLock"] = 4] = "e_st_graveLock";
    subtypeRegistry[subtypeRegistry["e_st_unique"] = 5] = "e_st_unique";
    subtypeRegistry[subtypeRegistry["e_st_hardUnique"] = 6] = "e_st_hardUnique";
    subtypeRegistry[subtypeRegistry["e_st_instant"] = 7] = "e_st_instant";
    subtypeRegistry[subtypeRegistry["e_st_once"] = 8] = "e_st_once";
})(subtypeRegistry || (subtypeRegistry = {}));
exports.default = subtypeRegistry;
