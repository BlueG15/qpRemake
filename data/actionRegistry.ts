const actionRegistry : Record<string, number> = {
    //0xx : system signal actions
    "error" : -1,
    "null" : 0,

    "turnStart" : 1,
    "turnEnd" : 2,
    "turnReset" : 3,
    "freeUpStatusIDs" : 4,

    //1xx : API related actions
    "activateEffect" : 101,
    "posChange" : 102,
    "draw" : 103,
    "shuffle" : 104,
    "execute" : 105, //not implemented
    "reprogramStart" : 106, //not implemented
    "reprogramEnd" : 107, //not implemented

    "addStatusEffect" : 108, //is implementing, unfinished
    "removeStatusEffect" : 109 //is implementing, unfinished
}   

export default actionRegistry

