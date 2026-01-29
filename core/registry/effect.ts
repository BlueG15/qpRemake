import type { BrandedNumber, BrandedString } from ".."
import type { EffectData } from "../data-type"
import { IDRegistry, Registry } from "./base"

//control code
const enum EffectControlCode {
    ForceTrue,
    ForceFalse,
    DoNothingAndPass,
    DoNothingAndIgnoreType,
    DoNothingAndIgnoreSubType
}

//Effect Type section
const enum EffectType {
    none = -1,
    manual = 0,
    passive,
    trigger,
    init,
    lock,
    counter,
    status,
    defense,
    instant,
}

const EffectTypeArr = [
    "none",
    "manual",
    "passive",
    "trigger",
    "init",
    "lock",
    "counter",
    "status",
    "defense",
    "instant",
] as const

type EffectTypeName = BrandedString<EffectType>
type EffectTypeID = BrandedNumber<EffectType>

const EffectTypeRegistry = IDRegistry.from<EffectTypeID, EffectTypeName, typeof EffectTypeArr>(EffectTypeArr)

//Effect Subtype section
const enum EffectSubtype {
    chained = 0,
    delayed,
    fieldLock,
    handOrFieldLock,
    graveLock,
    unique,
    hardUnique,
    instant,
    once,
}

type EffectSubtypeID = BrandedNumber<EffectSubtype>
type EffectSubtypeName = BrandedString<EffectSubtype>

const EffectSubtypeArr = [
    "chained",
    "delayed",
    "fieldLock",
    "handOrFieldLock",
    "graveLock",
    "unique",
    "hardUnique",
    "instant",
    "once",
] as const

const EffectSubtypeRegistry = IDRegistry.from<EffectSubtypeID, EffectSubtypeName, typeof EffectSubtypeArr>(EffectSubtypeArr)

//Effect section
const enum Effect {
    e_generic_stat_change_diff,
    e_generic_stat_change_override
}

const DefaultEffectData : Record<string, EffectData> = {
    e_generic_stat_change_diff : {
        typeID : EffectTypeRegistry.status,
        subTypeIDs : [],

        maxAtk : 0,
        maxHp  : 0,
        level  : 0,
    },
    e_generic_stat_change_override : {
        typeID : EffectTypeRegistry.status,
        subTypeIDs : [],

        maxAtk : 0,
        maxHp  : 0,
        level  : 0,
    }, 
} as const


type EffectDataID = BrandedNumber<Effect>
type EffectDataName = BrandedString<Effect>

const EffectDataRegistry = Registry.from<EffectDataID, EffectDataName, EffectData, typeof DefaultEffectData>(DefaultEffectData)

export {
    EffectControlCode,

    EffectTypeID,
    EffectTypeName,
    EffectTypeRegistry,

    EffectSubtypeID,
    EffectSubtypeName,
    EffectSubtypeRegistry,

    EffectDataID,
    EffectDataName,
    EffectDataRegistry
}