enum operatorRegistry {
    o_aurora = 0,
    o_esper,
    o_idol,
    o_leo,
    o_queen,
    o_omega,
    o_kaia,
}

type operatorData_fixxed = {
    name : string, //display id
    realName : string, //display id
    abilityCard : string, //display id
    desc : string, //display id

    //images
    avatarURL : string,
    fullbodyURL : string,
}

type operatorData_variable = {
    [key : string] : string | number | boolean
}

type oparatorData = operatorData_fixxed | (operatorData_fixxed & operatorData_variable)

type operatorName = keyof typeof operatorRegistry
type operatorID = operatorRegistry

const operatorDataRegistry  = {
    o_aurora : {
        name : "o_aurora",
        realName : "o_real_aurora",
        abilityCard : "serenity",
        desc : "o_desc_aurora",

        avatarURL : "",
        fullbodyURL : "",
    },
    //TODO : finish this shit
}

export default operatorDataRegistry
export {
    operatorRegistry,
    oparatorData,
    operatorName,
    operatorID
}