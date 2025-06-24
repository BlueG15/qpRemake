type zoneData_fixxed_entries = {
    priority: number,
    posBound: number[], //posBound for each dimension, also acts as capacity
    minCapacity : number, //defaults to 0
    attriutesArr: zoneAttributes[]
    instancedFor: playerTypeID[]
    types? : number[] //zoneRegistry enum array
}

type zoneData_variable_entries = {
    [key : string] : string | number | boolean
}

type zoneData = (zoneData_fixxed_entries) | (zoneData_fixxed_entries & zoneData_variable_entries)

//dataID lookup
enum zoneRegistry {
    z_system = 0,
    z_void,
    z_deck,
    z_field,
    z_grave,
    z_hand,
    z_storage,
    z_ability,
}

//booleans basically 
enum zoneAttributes {
    canReorderSelf = 0,
    canMoveFrom,
    canMoveTo,
    moveToNeedPosition,
}

type zoneName = keyof typeof zoneRegistry
type zoneID = (typeof zoneRegistry)[zoneName] //data id

enum playerTypeID {
    player = 1,
    enemy = 2,
}
type playerTypeName = keyof typeof playerTypeID

const playerOppositeMap = {
    player : [playerTypeID.enemy],
    enemy : [playerTypeID.player],
} as const

//priority high = act first
const zoneDataRegistry : Record<zoneName, zoneData> =  {
    z_system : {
        priority: Infinity,
        posBound: [] as number[],
        minCapacity : -Infinity,
        attriutesArr: [],
        instancedFor: [],

        startThreat : 0,
        maxThreat : 20,
        clearThreatWhenBurn : false,
    },
    z_deck : {
        priority: 1,
        posBound: [Infinity],

        minCapacity : 0,
        attriutesArr : [
            zoneAttributes.canReorderSelf, 
            zoneAttributes.canMoveTo, 
            zoneAttributes.canMoveFrom, 
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor : [
            playerTypeID.player
        ],

        startCoolDown : 10,
        maxCooldown : 10,
        maxLoad : 20,
        minLoad : 1,
    },
    z_storage : {
        priority: 0,
        posBound: [Infinity],
        minCapacity: 0,
        attriutesArr:[
            zoneAttributes.canMoveFrom,
        ],
        instancedFor : [
            playerTypeID.player
        ],
    },
    z_grave : {
        priority: 2,
        posBound: [Infinity],

        minCapacity : 0,
        attriutesArr : [
            zoneAttributes.canMoveTo,
            zoneAttributes.canMoveFrom,
        ],
        instancedFor : [
            playerTypeID.player,
            playerTypeID.enemy,
        ]
    },
    z_hand : {
        priority: 4,
        posBound: [7],

        minCapacity : 0,
        attriutesArr:[
            zoneAttributes.canReorderSelf,
            zoneAttributes.canMoveFrom,
            zoneAttributes.canMoveTo,
            zoneAttributes.moveToNeedPosition,
        ],
        instancedFor : [
            playerTypeID.player,
        ],
    },
    z_field : {
        priority: 5,
        posBound: [5, 2],

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
            playerTypeID.player,
            playerTypeID.enemy,
        ]
    },
    z_ability : {
        priority: -1,
        posBound: [1],

        canMoveFrom : true,
        minCapacity : 0,
        attriutesArr:[],
        instancedFor : [
            playerTypeID.player
        ],

        maxCoolDown : 10,
    },
    z_void : {
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -2,
        posBound: [Infinity],
        attriutesArr:[
            zoneAttributes.canMoveTo,
        ],
        instancedFor : [],
        minCapacity : 0,
    }
}

export default zoneDataRegistry
export {
    zoneAttributes,
    playerTypeID,
    playerTypeName,
    playerOppositeMap,
    zoneData, 
    zoneRegistry, 
    zoneName, 
    zoneID, 
    zoneDataRegistry
}