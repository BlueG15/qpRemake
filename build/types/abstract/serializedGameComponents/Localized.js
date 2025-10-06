"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Localized_system = exports.Localized_player = exports.Localized_action = exports.Localized_zone = exports.Localized_card = exports.Localized_effect = void 0;
class Localized_effect {
    constructor(id, //pid technically
    text, type, subtypes) {
        this.id = id;
        this.text = text;
        this.type = type;
        this.subtypes = subtypes;
    }
}
exports.Localized_effect = Localized_effect;
class Localized_card {
    constructor(id, name, extensions, effects, statusEffects, zoneID, pos, 
    //stat
    atk, //display stat
    hp, //display stat
    maxAtk, maxHp, level, rarity, archtype) {
        this.id = id;
        this.name = name;
        this.extensions = extensions;
        this.effects = effects;
        this.statusEffects = statusEffects;
        this.zoneID = zoneID;
        this.pos = pos;
        this.atk = atk;
        this.hp = hp;
        this.maxAtk = maxAtk;
        this.maxHp = maxHp;
        this.level = level;
        this.rarity = rarity;
        this.archtype = archtype;
    }
}
exports.Localized_card = Localized_card;
class Localized_zone {
    constructor(id, pid, pType, name, cards, shape) {
        this.id = id;
        this.pid = pid;
        this.pType = pType;
        this.name = name;
        this.cards = cards;
        this.shape = shape;
        while (cards.length && cards.at(-1) === undefined)
            cards.splice(-1, 1);
        this.cards = cards;
    }
}
exports.Localized_zone = Localized_zone;
class Localized_action {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
exports.Localized_action = Localized_action;
class Localized_player {
    constructor(id, pType, heart, maxHeart, operator, deckName) {
        this.id = id;
        this.pType = pType;
        this.heart = heart;
        this.maxHeart = maxHeart;
        this.operator = operator;
        this.deckName = deckName;
    }
}
exports.Localized_player = Localized_player;
class Localized_system {
    constructor(players, zones, action, phase, turn, wave) {
        this.players = players;
        this.zones = zones;
        this.action = action;
        this.phase = phase;
        this.turn = turn;
        this.wave = wave;
    }
}
exports.Localized_system = Localized_system;
