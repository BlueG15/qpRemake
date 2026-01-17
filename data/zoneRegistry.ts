type zoneData_fixxed_entries = {
    id : number,
    priority: number,
    boundX? : number,
    boundY? : number,
    minCapacity : number, //defaults to 0
    attriutesArr: zoneAttributes[]
    instancedFor: playerType[]
    types? : number[] //zoneRegistry enum array
}

type zoneData_variable_entries = {
    [key : string] : string | number | boolean
}

type zoneData = (zoneData_fixxed_entries) | (zoneData_fixxed_entries & zoneData_variable_entries)

//dataID lookup
enum zoneRegistry {
    z_system = 0,
    z_drop,
    z_void,
    z_deck,
    z_field,
    z_grave,
    z_hand,
    z_storage,
    z_ability,
}

//booleans basically 
const enum zoneAttributes {
    canReorderSelf = 0,
    canMoveFrom,
    canMoveTo,
    moveToNeedPosition,
}

type zoneName = keyof typeof zoneRegistry
type zoneID = (typeof zoneRegistry)[zoneName] //data id

enum playerType {
    player = 1,
    enemy = 2,
}
type playerTypeName = keyof typeof playerType

const playerOppositeMap = {
    player : [playerType.enemy],
    enemy : [playerType.player],
} as const

//priority high = act first
const zoneDataRegistry : Record<zoneID, zoneData> =  {
    0 : {
        id : zoneRegistry.z_system,
        priority: Infinity,
        minCapacity : -Infinity,
        attriutesArr: [],
        instancedFor: [],

        startThreat : 0,
        maxThreat : 20,
        clearThreatWhenBurn : false,
    },
    1 : {
        id : zoneRegistry.z_drop,
        priority: Infinity,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            zoneAttributes.canReorderSelf, 
            zoneAttributes.canMoveTo, 
            zoneAttributes.canMoveFrom, 
        ],
        instancedFor : [],
    },
    2 : {
        id : zoneRegistry.z_void,
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -2,
        boundX : Infinity,
        attriutesArr:[
            zoneAttributes.canMoveTo,
        ],
        instancedFor : [],
        minCapacity : 0,
    },
    3 : {
        id : zoneRegistry.z_deck,
        priority: 1,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            zoneAttributes.canReorderSelf, 
            zoneAttributes.canMoveTo, 
            zoneAttributes.canMoveFrom, 
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor : [
            playerType.player
        ],

        startCoolDown : 10,
        maxCooldown : 10,
        maxLoad : 20,
        minLoad : 1,
    },
    4 : {
        id : zoneRegistry.z_field,
        priority: 5,
        boundX : 5,
        boundY : 2,

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,

        minCapacity : 0,
        attriutesArr:[
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveFrom,
            zoneAttributes.canMoveTo,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor : [
            playerType.player,
            playerType.enemy,
        ]
    },
    5 : {
        id : zoneRegistry.z_grave,
        priority: 2,
        boundX : Infinity,

        minCapacity : 0,
        attriutesArr : [
            zoneAttributes.canMoveTo,
            zoneAttributes.canMoveFrom,
        ],
        instancedFor : [
            playerType.player,
            playerType.enemy,
        ]
    },
    6 : {
        id : zoneRegistry.z_hand,
        priority: 4,
        boundX : 7,

        minCapacity : 0,
        attriutesArr:[
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveFrom,
            zoneAttributes.canMoveTo,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor : [
            playerType.player,
        ],
    },
    7 : {
        id : zoneRegistry.z_storage,
        priority: 0,
        boundX : Infinity,
        minCapacity: 0,
        attriutesArr:[
            zoneAttributes.canMoveFrom,
        ],
        instancedFor : [
            playerType.player
        ],
    },
    8 : {
        id : zoneRegistry.z_ability,
        priority: -1,
        boundX : 1,

        canMoveFrom : true,
        minCapacity : 0,
        attriutesArr:[],
        instancedFor : [
            playerType.player
        ],

        maxCoolDown : 10,
    },
}

export default zoneDataRegistry
export {
    zoneAttributes,
    playerType as playerTypeID,
    playerTypeName,
    playerOppositeMap,
    zoneData, 
    zoneRegistry, 
    zoneName, 
    zoneID, 
    zoneDataRegistry
}