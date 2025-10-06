"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.effectDisplayItem_image = exports.effectDisplayItem_icon = exports.effectDisplayItem_text = exports.iconID = exports.effectText_tokenID = exports.effectText_sectionID = void 0;
//display data
var effectText_sectionID;
(function (effectText_sectionID) {
    effectText_sectionID[effectText_sectionID["error"] = -1] = "error";
    effectText_sectionID[effectText_sectionID["other"] = 0] = "other";
    effectText_sectionID[effectText_sectionID["effect"] = 1] = "effect";
    effectText_sectionID[effectText_sectionID["cost"] = 2] = "cost";
    effectText_sectionID[effectText_sectionID["condition"] = 3] = "condition";
})(effectText_sectionID || (exports.effectText_sectionID = effectText_sectionID = {}));
var effectText_tokenID;
(function (effectText_tokenID) {
    effectText_tokenID[effectText_tokenID["error"] = -1] = "error";
    effectText_tokenID[effectText_tokenID["text"] = 0] = "text";
    effectText_tokenID[effectText_tokenID["action"] = 1] = "action";
    effectText_tokenID[effectText_tokenID["target"] = 2] = "target";
    effectText_tokenID[effectText_tokenID["timing"] = 3] = "timing";
    //more later
})(effectText_tokenID || (exports.effectText_tokenID = effectText_tokenID = {}));
var iconID;
(function (iconID) {
    //arrows
    iconID[iconID["arrowUp"] = 0] = "arrowUp";
    iconID[iconID["arrowDown"] = 1] = "arrowDown";
    iconID[iconID["arrowLeft"] = 2] = "arrowLeft";
    iconID[iconID["arrowRight"] = 3] = "arrowRight";
    //double arrows
    iconID[iconID["doubleArrowDown"] = 10] = "doubleArrowDown";
    iconID[iconID["doubleArrowUp"] = 11] = "doubleArrowUp";
    iconID[iconID["doubleArrowLeft"] = 12] = "doubleArrowLeft";
    iconID[iconID["doubleArrowRight"] = 13] = "doubleArrowRight";
    //effect icon
    iconID[iconID["bonded"] = 100] = "bonded";
    iconID[iconID["cached"] = 101] = "cached";
    iconID[iconID["chain"] = 102] = "chain";
    iconID[iconID["consumable"] = 103] = "consumable";
    iconID[iconID["death"] = 104] = "death";
    iconID[iconID["defense"] = 105] = "defense";
    iconID[iconID["dragoonLink"] = 106] = "dragoonLink";
    iconID[iconID["effect_condition"] = 107] = "effect_condition";
    iconID[iconID["exclusive"] = 108] = "exclusive";
    iconID[iconID["execute"] = 109] = "execute";
    iconID[iconID["hardUnique"] = 110] = "hardUnique";
    iconID[iconID["init"] = 111] = "init";
    iconID[iconID["instant"] = 112] = "instant";
    iconID[iconID["lock"] = 113] = "lock";
    iconID[iconID["manual"] = 114] = "manual";
    iconID[iconID["once"] = 115] = "once";
    iconID[iconID["passive"] = 116] = "passive";
    iconID[iconID["preload"] = 117] = "preload";
    //^ after reprogram or start game, auto draw into hand, 
    // dont count towards the draw limit
    iconID[iconID["trigger"] = 118] = "trigger";
    iconID[iconID["unique"] = 119] = "unique";
    iconID[iconID["void"] = 120] = "void";
    //damage type
    iconID[iconID["dmg_magic"] = 200] = "dmg_magic";
    iconID[iconID["dmg_phys"] = 201] = "dmg_phys";
    //misc
    iconID[iconID["crash"] = 1000] = "crash";
    iconID[iconID["loot"] = 1001] = "loot";
    iconID[iconID["player_health"] = 1002] = "player_health";
})(iconID || (exports.iconID = iconID = {}));
class effectDisplayItem_text {
    constructor(str, sectionID, tokenID) {
        this.str = str,
            this.sectionID = sectionID,
            this.tokenID = tokenID;
    }
}
exports.effectDisplayItem_text = effectDisplayItem_text;
class effectDisplayItem_icon {
    constructor(id) { this.iconID = id; }
    get url() {
        return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/icons/${this.iconID}.png`;
    }
}
exports.effectDisplayItem_icon = effectDisplayItem_icon;
//unused but supported
class effectDisplayItem_image {
    constructor(url) {
        this.url = url;
    }
}
exports.effectDisplayItem_image = effectDisplayItem_image;
