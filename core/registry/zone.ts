import type { BrandedNumber, BrandedString, safeSimpleTypes } from ".."
import { IDRegistry, Registry } from "./base"
import { PlayerTypeID } from "."
import { ZoneData } from "../data-type"

const enum ZoneType {
    null,
    system,
    drop,
    void,
    deck,
    field,
    grave,
    hand,
    storage,
    ability,
}

const enum ZoneAttribute {
    canReorderSelf = 0,
    canMoveFrom,
    canMoveTo,
    moveToNeedPosition,
}

const ZoneAttributeArr = [
    "canReorderSelf",
    "canMoveFrom",
    "canMoveTo",
    "moveToNeedPosition",
] as const

type ZoneTypeID = BrandedNumber<ZoneType>
type ZoneTypeName = BrandedString<ZoneType>

type ZoneAttrID = BrandedNumber<ZoneAttribute>
type ZoneAttrName = BrandedString<ZoneAttribute>

const ZoneAttrRegistry = IDRegistry.from<ZoneAttrID, ZoneAttrName, typeof ZoneAttributeArr>(ZoneAttributeArr)

const DefaultZoneData = {
    null : {
        priority: Infinity,
        minCapacity : -Infinity,
        attriutesArr: [],
        instancedFor: [], 
    },
    system : {
        priority: Infinity,
        minCapacity : -Infinity,
        attriutesArr: [],
        instancedFor: [],

        startThreat : 0,
        maxThreat : 20,
        clearThreatWhenBurn : false,
    },
    drop : {
        priority: Infinity,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            ZoneAttrRegistry.canReorderSelf, 
            ZoneAttrRegistry.canMoveTo, 
            ZoneAttrRegistry.canMoveFrom, 
        ],
        instancedFor : [],
    },
    void : {
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -2,
        boundX : Infinity,
        attriutesArr:[
            ZoneAttrRegistry.canMoveTo,
        ],
        instancedFor : [],
        minCapacity : 0,
    },
    deck : {
        priority: 1,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            ZoneAttrRegistry.canReorderSelf, 
            ZoneAttrRegistry.canMoveTo, 
            ZoneAttrRegistry.canMoveFrom, 
            ZoneAttrRegistry.moveToNeedPosition,
        ],
        instancedFor : [
            PlayerTypeID.player
        ],

        startCoolDown : 10,
        maxCooldown : 10,
        maxLoad : 20,
        minLoad : 1,
    },
    field : {
        priority: 5,
        boundX : 5,
        boundY : 2,

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,

        minCapacity : 0,
        attriutesArr:[
            ZoneAttrRegistry.canReorderSelf,
            ZoneAttrRegistry.canMoveFrom,
            ZoneAttrRegistry.canMoveTo,
            ZoneAttrRegistry.moveToNeedPosition,
        ],
        instancedFor : [
            PlayerTypeID.player,
            PlayerTypeID.enemy,
        ]
    },
    grave : {
        priority: 2,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            ZoneAttrRegistry.canMoveTo,
            ZoneAttrRegistry.canMoveFrom,
        ],
        instancedFor : [
            PlayerTypeID.player,
            PlayerTypeID.enemy,
        ]
    },
    hand : {
        priority: 4,
        boundX : 7,

        minCapacity : 0,
        attriutesArr:[
            ZoneAttrRegistry.canReorderSelf,
            ZoneAttrRegistry.canMoveFrom,
            ZoneAttrRegistry.canMoveTo,
            ZoneAttrRegistry.moveToNeedPosition,
        ],
        instancedFor : [
            PlayerTypeID.player,
        ],
    },
    storage : {
        priority: 0,
        boundX : Infinity,
        minCapacity: 0,
        attriutesArr:[
            ZoneAttrRegistry.canMoveFrom,
        ],
        instancedFor : [
            PlayerTypeID.player
        ],
    },
    ability : {
        priority: -1,
        boundX : 1,

        canMoveFrom : true,
        minCapacity : 0,
        attriutesArr:[],
        instancedFor : [
            PlayerTypeID.player
        ],

        maxCoolDown : 10,
    },
}

const ZoneRegistry = Registry.from<ZoneTypeID, ZoneTypeName, ZoneData, typeof DefaultZoneData>(DefaultZoneData)

export {
    ZoneAttrID,
    ZoneAttrName,
    ZoneAttrRegistry,

    ZoneTypeID,
    ZoneTypeName,
    ZoneRegistry
}