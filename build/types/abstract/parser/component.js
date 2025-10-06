"use strict";
//specifies the general textComponent
Object.defineProperty(exports, "__esModule", { value: true });
exports.symbolComponent = exports.referenceComponent = exports.iconComponent = exports.imageComponent = exports.numberComponent = exports.textComponent = exports.component = exports.componentID = exports.iconID = void 0;
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
var componentID;
(function (componentID) {
    componentID[componentID["error"] = -1] = "error";
    componentID[componentID["number"] = 0] = "number";
    componentID[componentID["text"] = 1] = "text";
    componentID[componentID["image"] = 2] = "image";
    componentID[componentID["reference"] = 3] = "reference";
    componentID[componentID["symbol"] = 4] = "symbol";
})(componentID || (exports.componentID = componentID = {}));
class component {
    constructor(id = componentID.error, errMsg, fromCmd, raw) {
        this.sectionIDs = [];
        this.id = id;
        if (this.id == componentID.error || errMsg) {
            this.errorFlag = true;
            this.errorMsg = errMsg ? errMsg : "Unknown component";
        }
        else {
            this.errorFlag = false;
            this.errorMsg = "";
        }
        this.fromCmd = (fromCmd) ? fromCmd : "";
        this.raw = (raw) ? raw : "";
    }
    addSectionID(newID) {
        if (typeof newID == "string")
            this.sectionIDs.push(newID);
        else
            this.sectionIDs.push(...newID);
        return this;
    }
    is(id) {
        return this.id === componentID[id];
    }
}
exports.component = component;
class textComponent extends component {
    constructor(str, errMsg, fromCmd, raw) {
        super(componentID.text, errMsg, fromCmd, raw);
        this.str = str;
    }
}
exports.textComponent = textComponent;
class numberComponent extends component {
    constructor(num, errMsg, fromCmd, raw) {
        super(componentID.number, errMsg, fromCmd, raw);
        this.num = num;
    }
}
exports.numberComponent = numberComponent;
class imageComponent extends component {
    constructor(url, errMsg, fromCmd, raw) {
        super(componentID.image, errMsg, fromCmd, raw);
        this.url = url;
    }
}
exports.imageComponent = imageComponent;
class iconComponent extends imageComponent {
    constructor(id, errMsg, fromCmd, raw) {
        super(`https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/icons/${iconID[id]}.png`, errMsg, fromCmd, raw);
        this.iconID = id;
    }
}
exports.iconComponent = iconComponent;
class referenceComponent extends component {
    constructor(ref, errMsg, fromCmd, raw) {
        super(componentID.reference, errMsg, fromCmd, raw);
        this.ref = ref;
    }
}
exports.referenceComponent = referenceComponent;
class symbolComponent extends component {
    constructor(id, errMsg, fromCmd, raw) {
        super(componentID.symbol, errMsg, fromCmd, raw);
        this.symbolID = id;
    }
}
exports.symbolComponent = symbolComponent;
