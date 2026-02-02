import type { safeSimpleTypes } from "./misc"
import type { EffectTypeID, EffectSubtypeID, DeckID, CardDataID, OperatorID, ZoneAttrID, PlayerTypeID, EffectDataID, RarityID, ExtensionID, ZoneTypeID } from "./registry"
import type { ArchtypeID } from "./registry/archtype"

//Effect
type EffectDataFixxed = {
    typeID : EffectTypeID,
    subTypeIDs : EffectSubtypeID[],
    localizationKey? : string //used for looking up texts in localizer, undef = use effect dataID
}

type EffectDataVariable = {
    [key : string] : number //just numbers, fight me, allow more leads to dum dum more redundant checks 
}

export type EffectData = EffectDataFixxed | (EffectDataFixxed & EffectDataVariable)


//Card 
export type CardStatInfo = {
    level: number;
    rarity: RarityID;
    extensionArr: ExtensionID[];
    archtype : ArchtypeID[];
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
}

export type CardDisplayInfo = {
    //display stuff
    imgURL? : string
}

export type CardEffectInfo = {
    effects : (EffectDataID | [EffectDataID, Partial<EffectData>])[];
}

export type CardPatchDataFull = CardStatInfo & CardEffectInfo & CardDisplayInfo
export type CardPatchData = Partial<CardPatchDataFull>

export interface CardData {
    //no variant -> use base
    variantData: {
        //base is a mandatory entry
        base : CardPatchDataFull; //base needed to have all
        upgrade_1? : CardPatchData;
        [key : string] : CardPatchData | undefined
    };
}

/**Unified is the result of merging relevant variants into base */
export type CardDataUnified = {
    id : string,
    dataID : CardDataID,
    variants : string[],
} & CardPatchDataFull

export type DeckData = {
    id : DeckID,
    cards : CardDataID[],
    operator : OperatorID,
    img? : CardDataID
}

type ZoneDataFixxed = {
    priority: number, //priority high = act first
    boundX? : number,
    boundY? : number,
    minCapacity : number, //defaults to 0
    attriutesArr: ZoneAttrID[]
    instancedFor: PlayerTypeID[]
    types? : ZoneTypeID[]
}

type ZoneDataVariable = {
    [key : string] : safeSimpleTypes
}

export type ZoneData = (ZoneDataFixxed) | (ZoneDataFixxed & ZoneDataVariable)