import type Action from "../abstract/gameComponents/action"
import type { Setting } from "../abstract/gameComponents/settings"
import type dry_zone from "./dry/dry_zone"
import type { operatorID } from "./operatorRegistry"

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