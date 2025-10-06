"use strict";
//For saving / loading
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serialized_system = exports.Serialized_player = exports.Serialized_zone = exports.Serialized_card = exports.Serialized_effect = void 0;
class Serialized_effect {
    constructor(
    // public id : string, //generated again
    dataID, typeID, subTypeIDs, displayID_default = dataID, //undefined means use effectID
    attr) {
        this.dataID = dataID;
        this.typeID = typeID;
        this.subTypeIDs = subTypeIDs;
        this.displayID_default = displayID_default;
        this.attr = {};
        attr.forEach((val, key) => {
            if (typeof val === "number")
                this.attr[key] = val;
        });
    }
}
exports.Serialized_effect = Serialized_effect;
class Serialized_card {
    constructor(
    // public id : string, //generated again
    dataID, variants = [], 
    //I have to save partition too ahhh
    effects, statusEffects, partitions, attr) {
        this.dataID = dataID;
        this.variants = variants;
        this.effects = effects;
        this.statusEffects = statusEffects;
        this.partitions = partitions;
        this.attr = {};
        attr.forEach((val, key) => {
            this.attr[key] = val; //Hopefully serializable
        });
    }
}
exports.Serialized_card = Serialized_card;
class Serialized_zone {
    constructor(classID, dataID, cardArr, types, attr) {
        this.classID = classID;
        this.dataID = dataID;
        this.cardArr = cardArr;
        this.types = types;
        this.attr = {};
        attr.forEach((val, key) => {
            this.attr[key] = val; //Hopefully serializable
        });
    }
}
exports.Serialized_zone = Serialized_zone;
class Serialized_player {
    constructor(pType, heart, operator, deckName) {
        this.pType = pType;
        this.heart = heart;
        this.operator = operator;
        this.deckName = deckName;
    }
}
exports.Serialized_player = Serialized_player;
class Serialized_system {
    constructor(players, zones, turn, wave) {
        this.players = players;
        this.zones = zones;
        this.turn = turn;
        this.wave = wave;
    }
}
exports.Serialized_system = Serialized_system;
