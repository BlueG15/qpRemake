//technically an enum
enum actionRegistry {
    //special
    "error" = -1,
    "null" = 0,
    
    //0xx = system signal actions
    "turnStart" = 1,
    "turnEnd",
    "turnReset",
    "freeUpStatusIDs",
    "internalActivateEffectSignal",
    "increaseTurnCount",
    "setThreatLevel",
    "doThreatLevelBurn",
    "forcefullyEndTheGame",

    //1xx = API related actions
    "activateEffect" = 100,
    "posChange",
    "draw",
    "shuffle",
    "execute", //not implemented
    "reprogramStart", //not implemented
    "reprogramEnd", //not implemented

    "addStatusEffect", //is implementng, unfinished
    "removeStatusEffect", //is implementing, unfinished
    
    "activateEffectSubtypeSpecificFunc",
    "modifyAnotherAction" //is implementing, unfinished
}

type actionName = keyof typeof actionRegistry
type actionID = (typeof actionRegistry)[actionName]

export default actionRegistry
export type {actionName, actionID}




