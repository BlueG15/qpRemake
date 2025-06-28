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
import type effectSubtype from "../types/abstract/gameComponents/effectSubtype"

type universalOmit = "originalData" | "setting" | "toDry" | "arr" | 
                     "actionTree" | "cardHandler" | "modHandler" | "zoneHandler" | "localizer" | "registryFile" | "takenInput" |
                     keyof replacements
type replacements = {
    pos : dry_position,
    cardArr : ReadonlyArray<dry_card | undefined>,
    cardArr_filtered : dry_card[],
    effects : ReadonlyArray<dry_effect>,
    totalEffects : ReadonlyArray<dry_effect>,
    lastPos : dry_position,
    firstPos : dry_position,
    top : dry_position,
    bottom : dry_position,
    turnAction? : Action,
    NULLPOS : dry_position,
    NULLCARD : dry_card,
    setting : Readonly_recur<Setting>
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
export type dry_effectSubType = dry_parse<effectSubtype>
export type dry_effect = dry_parse<Effect, "getDisplayInput" | "toString" | "getSubtypeidx">
export type dry_card = dry_parse<Card, "is">
export type dry_zone = dry_parse<
    Zone, 
    "count" | "findIndex" | "getAction_add" | "getAction_move" | "getAction_shuffle" | "getAction_remove" | "getOppositeCards" | 
    "getCardByPosition" | "getOppositeZone" | "toString" | "validatePosition" | "isOpposite" | "isPositionOccupied" | "is" | "getAllPos"
> & {
    getEmptyPosArr? : () => dry_position[]
    getRandomEmptyPos? : () => dry_position
    isCardExposed? : (c : dry_card) => boolean
    getAction_draw? : () => Action
}
export type dry_system = dry_parse<
    queenSystem, 
    "count" | "filter" | "map" | "forEach" | "filter" | 
    "findSpecificChainOfAction_resolve" | "getActivatedCardIDs" | "getActivatedEffectIDs" |
    "getAllZonesOfPlayer" | "getResolvedActions" | "getWouldBeAttackTarget" | "getCardWithDataID" | "getCardWithID" |
    "getZoneOf" | "getZoneWithID" | "hasActionCompleted" | "getRootAction" | "is" | "getPIDof"
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
    playerIndex : number, //most times 0
    heart : number,
    maxHeart : number,
    operator : operatorID
    deckInfo : any //TODO : deck info
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
    "effect",
    "effectSubtype",
    "position",
    "action",
    "player",
    "none",
    "system",
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
    is(card : id_able) : boolean
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
    is(zone : dry_zone) : boolean
}
export type identificationInfo_pos = {
    type : identificationType.position
    sys : dry_system
    pos : dry_position
    is(pos : dry_position) : boolean
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
    "number",
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
}
export type inputData_zone = {
    type : inputType.zone
    data : Omit<identificationInfo_zone, "sys">
}
export type inputData_card = {
    type : inputType.card
    data : Omit<identificationInfo_card, "sys">
}
export type inputData_effect = {
    type : inputType.effect
    data : Omit<identificationInfo_effect, "sys">
}
export type inputData_subtype = {
    type : inputType.effectSubtype
    data : Omit<identificationInfo_subtype, "sys">
}
export type inputData_player = {
    type : inputType.player
    data : Omit<identificationInfo_player, "sys">
}

export type inputData = inputData_str |
                        inputData_num |
                        inputData_bool |
                        inputData_card |
                        inputData_effect |
                        inputData_subtype |
                        inputData_zone |
                        inputData_player | 
                        inputData_pos



