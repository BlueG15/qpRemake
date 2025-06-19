import type { Action } from "../_queenSystem/handler/actionGenrator"
import type { Setting } from "../types/abstract/gameComponents/settings"
import type dry_zone from "./dry/dry_zone"
import type { operatorID } from "./operatorRegistry"
import type dry_position from "./dry/dry_position"
import type dry_card from "./dry/dry_card"
import type dry_effect from "./dry/dry_effect"
import type dry_effectSubType from "./dry/dry_effectSubType"
import type dry_system from "./dry/dry_system"

type cardID = string
type effectID = string

export interface logInfoNormal {
    currentPhase : TurnPhase.declare | TurnPhase.input | TurnPhase.recur | TurnPhase.complete,
    currentAction : Action,
}

export interface logInfoHasResponse {
    currentPhase : TurnPhase.chain | TurnPhase.trigger,
    currentAction : Action,
    responses : Record<cardID, effectID[]>
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

export type identificationInfo_action = {
    type : identificationType.action
    sys : dry_system
    action : Action
} 
export type identificationInfo_card = {
    type : identificationType.card
    sys : dry_system
    card : dry_card
}
export type identificationInfo_effect = {
    type : identificationType.effect
    sys : dry_system
    card : dry_card
    eff : dry_effect
}
export type identificationInfo_zone = {
    type : identificationType.zone
    sys : dry_system
    zone : dry_zone
}
export type identificationInfo_pos = {
    type : identificationType.position
    sys : dry_system
    pos : dry_position
}
export type identificationInfo_none = {
    type : identificationType.none
}
export type identificationInfo_player = {
    type : identificationType.player
    sys : dry_system,
    id : number
} 
export type identificationInfo_subtype = { 
    type : identificationType.effectSubtype
    sys : dry_system
    card : dry_card,
    eff : dry_effect,
    subtype : dry_effectSubType
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
    "position",
    
    "string",
    "boolean",
    "number",
}

export type inputData = {
    type : inputType.string
    data : string
} | {
    type : inputType.boolean
    data : boolean
} | {
    type : inputType.number
    data : number
} | {
    type : inputType.position
    data : dry_position
} | {
    type : inputType.zone
    data : dry_zone
} | {
    type : inputType.card
    data : dry_card
} | {
    type : inputType.effect
    edata : dry_effect
    cdata : dry_card
}