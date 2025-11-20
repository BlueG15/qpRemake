import type { Action } from "../_queenSystem/handler/actionGenrator"
import type { Setting } from "../types/abstract/gameComponents/settings"
import type { operatorID } from "./operatorRegistry"
import type { actionName } from "./actionRegistry"
import type { FunctionalKeys, id_able, Player_specific, UnFunctionalKeys } from "../types/misc"

import type Card from "../types/abstract/gameComponents/card"
import type Effect from "../types/abstract/gameComponents/effect"
import type Zone from "../types/abstract/gameComponents/zone"
import type Position from "../types/abstract/generics/position"
import type EffectType from "../types/abstract/gameComponents/effectType"
import type queenSystem from "../_queenSystem/queenSystem"

import type { Readonly_recur, Transplant } from "../types/misc"
import type EffectSubtype from "../types/abstract/gameComponents/effectSubtype"
import type { playerTypeID } from "./zoneRegistry"
import type { deckRegistry } from "./deckRegistry"

type universalOmit = "originalData" | "setting" | "toDry" | "arr" | "zoneArr" |
                     "actionTree" | "cardHandler" | "modHandler" | "zoneHandler" | "localizer" | "registryFile" | "takenInput" |
                     keyof replacements
type replacements = {
    pos : dry_position,
    cardArr : ReadonlyArray<dry_card | undefined>,
    cardArr_filtered : dry_card[],
    statusEffects : ReadonlyArray<dry_effect>,
    effects : ReadonlyArray<dry_effect>,
    totalEffects : ReadonlyArray<dry_effect>,
    lastPos : dry_position,
    firstPos : dry_position,
    top : dry_position,
    bottom : dry_position,
    turnAction? : Action,
    NULLPOS : dry_position,
    NULLCARD : dry_card,
    setting : Readonly_recur<Setting>,
    zoneArr : ReadonlyArray<dry_zone>
}

export type dry_parse<T extends Object, SafeFunctionKeys extends Exclude<FunctionalKeys<T>, universalOmit> = never> = Readonly_recur<
    Omit<T, universalOmit | FunctionalKeys<T>>
> & {
    [K in SafeFunctionKeys] : T[K]
} & {
    [K in keyof replacements as K extends keyof T ? K : never] : replacements[K]
}

export type dry_position = dry_parse<Position, "is" | "flat" | "map" | "toString">
export type dry_effectType = dry_parse<EffectType>
export type dry_effectSubType = dry_parse<EffectSubtype>
export type dry_effect = {
    [K in keyof Omit<Effect, universalOmit> as Effect[K] extends Function ? never : K] : Readonly_recur<Effect[K]>
} & {
    "getDisplayInput" : Effect["getDisplayInput"],
    "toString" : Effect["toString"],
    "getSubtypeidx" : Effect["getSubtypeidx"],
    "is" : Effect["is"]
}

export type dry_card = dry_parse<Card, "is" | "getAllPartitionsIDs" | "isInSamePartition" | "isFrom" | "addShareMemory" | "getFirstActualPartitionIndex">
export type dry_zone = dry_parse<
    Zone, 
    "count" | "findIndex" | "getAction_add" | "getAction_move" | "getAction_shuffle" | "getAction_remove" | "getOppositeCards" | 
    "getCardByPosition" | "getOppositeZone" | "toString" | "validatePosition" | "isOpposite" | "isPositionOccupied" | 
    "is" | "getAllPos" | "of" |"getBackPos" | "getFrontPos" | "isC2Behind" | "isC2Infront" | "isOccupied" | "isExposed"
> & {
    getEmptyPosArr? : () => dry_position[]
    getRandomEmptyPos? : () => dry_position
    getAction_draw? : (s : dry_system, hand : dry_zone, cause : identificationInfo, isTurnDraw? : boolean) => Action<"a_draw">
}
export type dry_system = dry_parse<
    Omit<queenSystem, "zoneArr">, 
    "count" | "filter" | "map" | "forEach" | "filter" | 
    "findSpecificChainOfAction_resolve" | "getActivatedCardIDs" | "getActivatedEffectIDs" |
    "getAllZonesOfPlayer" | "getResolvedActions" | "getWouldBeAttackTarget" | "getCardWithDataID" | "getCardWithID" |
    "getZoneOf" | "getZoneWithID" | "hasActionCompleted" | "getRootAction" | "is" | "getPIDof" | 
    "generateSignature" |
    "isNotActionArr" |
    "getAllInputs" |
    "isPlayAction"
>

export interface logInfoNormal {
    currentPhase : TurnPhase.declare | TurnPhase.input | TurnPhase.recur | TurnPhase.complete,
    currentAction : Action,
}

export interface logInfoHasResponse {
    currentPhase : TurnPhase.chain | TurnPhase.trigger,
    currentAction : Action,
    responses : Record<string, string[]> //cardID -> effectID[]
}

export interface logInfoResolve {
    currentPhase : TurnPhase.resolve,
    currentAction : Action,
    resolvedResult : Action[]
}

export type logInfo = logInfoNormal | logInfoHasResponse | logInfoResolve

export enum TurnPhase {
    declare = 1, 
    input,
    chain,
    recur,
    resolve,
    trigger,
    complete,
}

export enum GamePhase {
    idle = 0,
    resolving,
    infinite_loop,
    p1_win,
    p2_win,
}

export interface system_stat {
    threatLevel : number,
    maxThreatlevel : number,
}

export interface player_stat {
    playerType : playerTypeID
    playerIndex : number,
    heart : number,
    maxHeart : number,
    operator : operatorID
    deck? : deckRegistry,
    loadCardsInfo : {
        dataID : string,
        variant : string[],
        count : number,
    }[]
}

export interface gameState_stat {
    turn_count : number,
    turnActionID : number,
    gamePhase : GamePhase,
    turnPhase : TurnPhase,
    stat_player : player_stat,
    stat_system : system_stat
    zones : dry_zone[]
    setting : Setting
}

export enum suspensionReason {
    taking_input = 1,
    infinite_loop,
    game_finished,
}

export enum identificationType {
    "zone",
    "card",
    "partition",
    "effect",
    "effectSubtype",
    "position",
    "action",
    "player",
    "none",
    "system",
}

export interface identificationInfo_partition {
    type : identificationType.partition,
    sys : dry_system,
    pid : number,
    is(pid : number) : boolean
}

export interface identificationInfo_action {
    type : identificationType.action
    sys : dry_system
    action : Action
    is<T extends actionName>(type : T) : this is {type : identificationInfo_action, sys : dry_system, action : Action<T>}
} 
export type identificationInfo_card = {
    type : identificationType.card
    sys : dry_system
    card : dry_card
    is : Card["is"]
}
export type identificationInfo_effect = {
    type : identificationType.effect
    sys : dry_system
    card : dry_card
    eff : dry_effect
    is(card : id_able, eff : id_able) : boolean
}
export type identificationInfo_zone = {
    type : identificationType.zone
    sys : dry_system
    zone : dry_zone
    is : Zone["is"]
    of : Zone["of"]
}
export type identificationInfo_pos = {
    type : identificationType.position
    sys : dry_system
    pos : dry_position
    is : Position["is"]
}
export type identificationInfo_none = {
    type : identificationType.none
}
export type identificationInfo_player = {
    type : identificationType.player
    sys : dry_system,
    id : number,
    is(player_owned_obj : Player_specific) : boolean
} 
export type identificationInfo_subtype = { 
    type : identificationType.effectSubtype
    sys : dry_system
    card : dry_card,
    eff : dry_effect,
    subtype : dry_effectSubType
    is(card : id_able, eff : id_able, subtype : dry_effectSubType) : boolean
}
export type identificationInfo_system = {
    type : identificationType.system
}
export type identificationInfo = 
            identificationInfo_action | 
            identificationInfo_card | 
            identificationInfo_partition | 
            identificationInfo_effect | 
            identificationInfo_none |
            identificationInfo_player |
            identificationInfo_pos |
            identificationInfo_subtype |
            identificationInfo_zone | 
            identificationInfo_system 

export enum inputType {
    "zone",
    "card",
    "effect",
    "effectSubtype",
    "position",
    "player",
    
    "string",
    "boolean",
    "number"
}

export type inputData_str = {
    type : inputType.string
    data : string
}
export type inputData_bool = {
    type : inputType.boolean
    data : boolean
} 
export type inputData_num = {
    type : inputType.number
    data : number
}
export type inputData_pos = {
    type : inputType.position
    data : Omit<identificationInfo_pos, "sys">
    is : identificationInfo_pos["is"]
}
export type inputData_zone = {
    type : inputType.zone
    data : Omit<identificationInfo_zone, "sys">
    is : identificationInfo_zone["is"]
    of : identificationInfo_zone["of"]
}
export type inputData_card = {
    type : inputType.card
    data : Omit<identificationInfo_card, "sys">
    is : identificationInfo_card["is"]
}
export type inputData_effect = {
    type : inputType.effect
    data : Omit<identificationInfo_effect, "sys">
    is : identificationInfo_effect["is"]
}
export type inputData_subtype = {
    type : inputType.effectSubtype
    data : Omit<identificationInfo_subtype, "sys">
    is : identificationInfo_subtype["is"]
}
export type inputData_player = {
    type : inputType.player
    data : Omit<identificationInfo_player, "sys">
    is : identificationInfo_player["is"]
}

export type inputData_standard = inputData_str |
                        inputData_num |
                        inputData_bool |
                        inputData_card |
                        inputData_effect |
                        inputData_subtype |
                        inputData_zone |
                        inputData_player | 
                        inputData_pos

export type inputData = inputData_standard

export type inputDataSpecific<T extends inputType> =
T extends inputType.number ? inputData_num :
T extends inputType.string ? inputData_str :
T extends inputType.boolean ? inputData_bool :
T extends inputType.player ? inputData_player :
T extends inputType.position ? inputData_pos :
T extends inputType.zone ? inputData_zone : 
T extends inputType.card ? inputData_card :
T extends inputType.effect ? inputData_effect : 
T extends inputType.effectSubtype ? inputData_subtype : inputData

export type validSetFormat<T extends inputType = inputType> = Exclude<[T, inputDataSpecific<T>[] | undefined], []>
// import type { StrictGenerator } from "../types/misc"
// export type inputRequester_format<T extends inputType = inputType, T2 extends inputType = T> = [validSetFormat<T2>, StrictGenerator<validSetFormat<T>, validSetFormat<T> | void, inputDataSpecific<T>>]
// export type Action_final_generatorType<T extends inputType = inputType> = Generator<validSetFormat<T>, Action[], inputDataSpecific<T>>
// export type Action_final_generatorType_recur<T extends inputType = inputType> = Generator<inputRequester_format<T>, Action[] | Action_final_generatorType_recur<T>, inputDataSpecific<T>>



