import type { BrandedNumber, BrandedString, safeSimpleTypes } from ".."
import { Registry } from "./base"

const enum Operator {
    null = -1,
    aurora = 0,
    esper,
    idol,
    leo,
    queen,
    omega,
    kaia,
}

type OperatorDataFixxed = {
    name : string, //display id
    abilityCardID : string, //display id

    //images
    //TODO : add these to the default data, they r empty rn
    avatarURL : string,
    fullbodyURL : string,
}

type OperatorDataVariable = {
    [key : string] : safeSimpleTypes
}

type OperatorData = OperatorDataFixxed | (OperatorDataFixxed & OperatorDataVariable)

type OperatorID = BrandedNumber<Operator>
type OperatorName = BrandedString<Operator>

function getOperatorData(name : keyof typeof Operator, abilityCardID : string, avatarURL = "", fullbodyURL = "", extraData : OperatorDataVariable = {}){
    return {
        name,
        abilityCardID,
        avatarURL,
        fullbodyURL,
        ...extraData
    }
}

const DefaultOperatorData : Record<keyof typeof Operator, OperatorData> = {
    null   : getOperatorData("null",   "blank"),
    aurora : getOperatorData("null",   "serenity"),
    esper  : getOperatorData("esper",  "world_seed"),
    idol   : getOperatorData("idol",   "encore"),
    kaia   : getOperatorData("kaia",   "imagination"),
    leo    : getOperatorData("leo",    "moutain"),
    omega  : getOperatorData("omega",  "paradox"),
    queen  : getOperatorData("queen",  "checkmate"),
    
}

const OperatorRegistry = Registry.from<OperatorID, OperatorName, OperatorData, typeof DefaultOperatorData>(DefaultOperatorData)

export {
    OperatorID,
    OperatorName,
    OperatorData,
    OperatorRegistry
}