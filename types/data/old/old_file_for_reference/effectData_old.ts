interface effectDataItem {
    checkConditionDuringChain? : boolean,
    activateDuringChain? : boolean,
    modifiesAction? : boolean //only available if we activate during chain
}

const effectData : Record<string, effectDataItem> = {
    "trigger" : {}, //false to all 3
    "chainedTrigger" : {checkConditionDuringChain: true},
    "passive" : {
        checkConditionDuringChain : true,
        activateDuringChain : true,
        modifiesAction : true
    }
}