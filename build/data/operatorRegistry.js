"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operatorRegistry = void 0;
var operatorRegistry;
(function (operatorRegistry) {
    operatorRegistry[operatorRegistry["o_null"] = -1] = "o_null";
    operatorRegistry[operatorRegistry["o_aurora"] = 0] = "o_aurora";
    operatorRegistry[operatorRegistry["o_esper"] = 1] = "o_esper";
    operatorRegistry[operatorRegistry["o_idol"] = 2] = "o_idol";
    operatorRegistry[operatorRegistry["o_leo"] = 3] = "o_leo";
    operatorRegistry[operatorRegistry["o_queen"] = 4] = "o_queen";
    operatorRegistry[operatorRegistry["o_omega"] = 5] = "o_omega";
    operatorRegistry[operatorRegistry["o_kaia"] = 6] = "o_kaia";
})(operatorRegistry || (exports.operatorRegistry = operatorRegistry = {}));
const operatorDataRegistry = {
    //TODO : fill the images slot
    o_null: {
        name: "o_null",
        realName: "o_null",
        abilityCard: "c_null",
        desc: "o_null",
        avatarURL: "",
        fullbodyURL: ""
    },
    o_aurora: {
        name: "o_aurora",
        realName: "o_real_aurora",
        abilityCard: "c_serenity",
        desc: "o_desc_aurora",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_esper: {
        name: "o_esper",
        realName: "o_real_esper",
        abilityCard: "c_world_seed",
        desc: "o_desc_esper",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_idol: {
        name: "o_idol",
        realName: "o_real_idol",
        abilityCard: "c_encore",
        desc: "o_desc_idol",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_leo: {
        name: "o_leo",
        realName: "o_real_leo",
        abilityCard: "c_moutain",
        desc: "o_desc_leo",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_queen: {
        name: "o_queen",
        realName: "o_real_queen",
        abilityCard: "c_checkmate",
        desc: "o_desc_queen",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_omega: {
        name: "o_omega",
        realName: "o_real_omega",
        abilityCard: "c_paradox",
        desc: "o_desc_omega",
        avatarURL: "",
        fullbodyURL: "",
    },
    o_kaia: {
        name: "o_kaia",
        realName: "o_real_kaia",
        abilityCard: "c_imagination",
        desc: "o_desc_kaia",
        avatarURL: "",
        fullbodyURL: "",
    },
};
exports.default = operatorDataRegistry;
