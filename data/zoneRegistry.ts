interface zoneData {
    priority: number,
    posBound: number[], //posBound for each dimension

    canReorderSelf? : boolean,
    canMoveTo? : boolean,
    canMoveFrom? : boolean,
    moveToNeedPosition?: boolean,

    importURL : string
}
//on zone creation, 1 param will always be provided and it is the key here
//importURL will be executed from zoneHandler point of view
//i have no idea how i can force it to execute at main point of view
const zoneRegistry : Record<string, zoneData> =  {
    "system" : {
        priority: Infinity,
        posBound: [],
        importURL : "../zones/system"  
    },
    "deck" : {
        priority: 0,
        posBound: [Infinity],
        importURL : "../zones/deck", 

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true
    },
    "storage" : {
        priority: 1,
        posBound: [Infinity],
        importURL : "../zones/storage", 

        canMoveFrom : true
    },
    "enemyGrave" : {
        priority: 2,
        posBound: [Infinity],
        importURL : "../zones/grave", 

        canMoveTo : true,
        canMoveFrom : true
    },
    "playerGrave" : {
        priority: 3,
        posBound: [Infinity],
        importURL : "../zones/grave", 

        canMoveTo : true,
        canMoveFrom : true
    },
    "hand" : {
        priority: 4,
        posBound: [7],
        importURL : "../zones/hand", 

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true
    },
    "enemyField" : {
        priority: 5,
        posBound: [5, 2],
        importURL : "../zones/field", 

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true
    },
    "playerField" : {
        priority: 6,
        posBound: [5, 2],
        importURL : "../zones/field", 

        canReorderSelf : true,
        canMoveTo : true,
        canMoveFrom : true,
        moveToNeedPosition: true
    },
    "void" : {
        //void is temporary card storage when cards are voided
        //or "dissapear"
        priority: -Infinity,
        posBound: [Infinity],
        importURL : "../zones/void", 

        canMoveTo : true,
        canMoveFrom : true
    }
}

export default zoneRegistry
export type {zoneData, zoneRegistry}