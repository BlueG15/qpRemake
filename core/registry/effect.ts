import { CardVariantName, type BrandedNumber, type BrandedString } from ".."
import type { EffectData, EffectDataPartial } from "../effectData"
import { DoubleKeyRegistry, IDRegistry, Registry } from "./base"
import type { Effect } from "../../game-components/effects"

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

type EffectDataID = BrandedNumber<Effect>
type EffectName = BrandedString<Effect>

const EffectDataRegistry = DoubleKeyRegistry.from<
    EffectDataID, EffectName, EffectData, EffectDataPartial, {}, [CardVariantName.upgrade_1]
>({}, CardVariantName.base, CardVariantName.upgrade_1)

export {
    EffectControlCode,

    EffectTypeID,
    EffectTypeName,
    EffectTypeRegistry,

    EffectSubtypeID,
    EffectSubtypeName,
    EffectSubtypeRegistry,

    EffectDataID,
    EffectName,
    EffectDataRegistry
}