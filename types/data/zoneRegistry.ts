type zoneData_fixxed_entries = {
    priority: number,
    posBound: number[], //posBound for each dimension, also acts as capacity

    canReorderSelf? : boolean,
    canMoveFrom? : boolean,
    canMoveTo? : boolean,
    moveToNeedPosition?: boolean,
    minCapacity? : number, //defaults to 0
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
    z_p1_field,
    z_p2_field,  
    z_p1_grave,
    z_p2_grave,
    z_hand,
    z_storage,
    z_ability,
}

type zoneName = keyof typeof zoneRegistry
type zoneID = (typeof zoneRegistry)[zoneName] //data id

//priority high = act first
const zoneDataRegistry : Record<zoneName, zoneData> =  {
    z_system : {
        priority: Infinity,
        posBound: [] as number[],
        minCapacity : -Infinity,

        startThreat : 0,
        maxThreat : 20,
        clearThreatWhenBurn : false
    },
    z_deck : {
        priority: 1,
        posBound: [Infinity],

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,
        minCapacity : 0,

        startCoolDown : 10,
        maxCooldown : 10,
        maxLoad : 20,
        minLoad : 1,
    },
    z_storage : {
        priority: 0,
        posBound: [Infinity],

        canMoveFrom : true,
        minCapacity : 0,
    },
    z_p2_grave : {
        priority: 2,
        posBound: [Infinity],

        canMoveTo : true,
        canMoveFrom : true,

        minCapacity : 0,
    },
    z_p1_grave : {
        priority: 3,
        posBound: [Infinity],

        canMoveTo : true,
        canMoveFrom : true,

        minCapacity : 0,
    },
    z_hand : {
        priority: 4,
        posBound: [7],

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,

        minCapacity : 0,
    },
    z_p2_field : {
        priority: 5,
        posBound: [5, 2],

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,

        minCapacity : 0,
    },
    z_p1_field : {
        priority: 6,
        posBound: [5, 2],

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true,

        minCapacity : 0,
    },
    z_ability : {
        priority: -1,
        posBound: [1],

        canMoveFrom : true,
        minCapacity : 0,

        maxCoolDown : 10,
    },
    z_void : {
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -2,
        posBound: [Infinity],

        canMoveTo : true,
        canMoveFrom : true,

        minCapacity : -Infinity
    }
}

export default zoneDataRegistry
export {zoneData, zoneRegistry, zoneName, zoneID, zoneDataRegistry}