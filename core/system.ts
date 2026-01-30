import type { ZoneDry } from "./interface";
import type { Action } from "./registry/action";
import type { StatPlayer } from "./interface";
import type { Setting } from "./settings";

export interface LogInfoNormal {
    currentPhase : TurnPhase.declare | TurnPhase.input | TurnPhase.recur | TurnPhase.complete,
    currentAction : Action,
}

export interface LogInfoHasResponse {
    currentPhase : TurnPhase.chain | TurnPhase.trigger,
    currentAction : Action,
    responses : Record<string, string[]> //cardID -> effectID[]
}

export interface LogInfoResolve {
    currentPhase : TurnPhase.resolve,
    currentAction : Action,
    resolvedResult : Action[]
}

export type LogInfo = LogInfoNormal | LogInfoResolve | LogInfoHasResponse

export const enum DamageType {
    "physical" = 0,
    "magic",
}

export const enum TurnPhase {
    declare = 1, 
    input,
    chain,
    recur,
    resolve,
    trigger,
    complete,
}

export const enum GamePhase {
    idle = 0,
    resolving,
    infinite_loop,
    p1_win,
    p2_win,
}

export const enum SuspensionReason {
    taking_input = 1,
    infinite_loop,
    turn_finished,
    game_ended,
}

export interface StatSystem {
    threatLevel : number,
    maxThreatlevel : number,
}

export interface StatGameState {
    turn_count : number,
    turnactionID : number,
    gamePhase : GamePhase,
    turnPhase : TurnPhase,
    stat_player : StatPlayer,
    stat_system : StatSystem
    zones : ZoneDry[]
    setting : Setting
}
