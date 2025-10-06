"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoneDataRegistry = exports.zoneRegistry = exports.playerOppositeMap = exports.playerTypeID = exports.zoneAttributes = void 0;
//dataID lookup
var zoneRegistry;
(function (zoneRegistry) {
    zoneRegistry[zoneRegistry["z_system"] = 0] = "z_system";
    zoneRegistry[zoneRegistry["z_drop"] = 1] = "z_drop";
    zoneRegistry[zoneRegistry["z_void"] = 2] = "z_void";
    zoneRegistry[zoneRegistry["z_deck"] = 3] = "z_deck";
    zoneRegistry[zoneRegistry["z_field"] = 4] = "z_field";
    zoneRegistry[zoneRegistry["z_grave"] = 5] = "z_grave";
    zoneRegistry[zoneRegistry["z_hand"] = 6] = "z_hand";
    zoneRegistry[zoneRegistry["z_storage"] = 7] = "z_storage";
    zoneRegistry[zoneRegistry["z_ability"] = 8] = "z_ability";
})(zoneRegistry || (exports.zoneRegistry = zoneRegistry = {}));
//booleans basically 
var zoneAttributes;
(function (zoneAttributes) {
    zoneAttributes[zoneAttributes["canReorderSelf"] = 0] = "canReorderSelf";
    zoneAttributes[zoneAttributes["canMoveFrom"] = 1] = "canMoveFrom";
    zoneAttributes[zoneAttributes["canMoveTo"] = 2] = "canMoveTo";
    zoneAttributes[zoneAttributes["moveToNeedPosition"] = 3] = "moveToNeedPosition";
})(zoneAttributes || (exports.zoneAttributes = zoneAttributes = {}));
var playerTypeID;
(function (playerTypeID) {
    playerTypeID[playerTypeID["player"] = 1] = "player";
    playerTypeID[playerTypeID["enemy"] = 2] = "enemy";
})(playerTypeID || (exports.playerTypeID = playerTypeID = {}));
const playerOppositeMap = {
    player: [playerTypeID.enemy],
    enemy: [playerTypeID.player],
};
exports.playerOppositeMap = playerOppositeMap;
//priority high = act first
const zoneDataRegistry = {
    z_system: {
        priority: Infinity,
        posBound: [],
        minCapacity: -Infinity,
        attriutesArr: [],
        instancedFor: [],
        startThreat: 0,
        maxThreat: 20,
        clearThreatWhenBurn: false,
    },
    z_drop: {
        priority: Infinity,
        posBound: [Infinity],
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveTo,
            zoneAttributes.canMoveFrom,
        ],
        instancedFor: [],
    },
    z_deck: {
        priority: 1,
        posBound: [Infinity],
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveTo,
            zoneAttributes.canMoveFrom,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor: [
            playerTypeID.player
        ],
        startCoolDown: 10,
        maxCooldown: 10,
        maxLoad: 20,
        minLoad: 1,
    },
    z_storage: {
        priority: 0,
        posBound: [Infinity],
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canMoveFrom,
        ],
        instancedFor: [
            playerTypeID.player
        ],
    },
    z_grave: {
        priority: 2,
        posBound: [Infinity],
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canMoveTo,
            zoneAttributes.canMoveFrom,
        ],
        instancedFor: [
            playerTypeID.player,
            playerTypeID.enemy,
        ]
    },
    z_hand: {
        priority: 4,
        posBound: [7],
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveFrom,
            zoneAttributes.canMoveTo,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor: [
            playerTypeID.player,
        ],
    },
    z_field: {
        priority: 5,
        posBound: [5, 2],
        canReorderSelf: true,
        canMoveTo: true,
        canMoveFrom: true,
        moveToNeedPosition: true,
        minCapacity: 0,
        attriutesArr: [
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveFrom,
            zoneAttributes.canMoveTo,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor: [
            playerTypeID.player,
            playerTypeID.enemy,
        ]
    },
    z_ability: {
        priority: -1,
        posBound: [1],
        canMoveFrom: true,
        minCapacity: 0,
        attriutesArr: [],
        instancedFor: [
            playerTypeID.player
        ],
        maxCoolDown: 10,
    },
    z_void: {
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -2,
        posBound: [Infinity],
        attriutesArr: [
            zoneAttributes.canMoveTo,
        ],
        instancedFor: [],
        minCapacity: 0,
    }
};
exports.zoneDataRegistry = zoneDataRegistry;
exports.default = zoneDataRegistry;
