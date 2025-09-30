import type { Action } from "../handler/actionGenrator";
import type { dry_system, gameState_stat, inputData, inputDataSpecific, inputType, TurnPhase, validSetFormat } from "../../data/systemRegistry";

export interface qpRenderer {
    init(s : dry_system, callback : () => any) : void;
    startTurn(s : dry_system, callback : (a? : Action) => any) : void;
    update(phase : TurnPhase, s : dry_system, a : Action, callback : () => any) : void;
    requestInput<T extends inputType>(inputSet : validSetFormat<T> , phase : TurnPhase, s : dry_system, a : Action, callback : (input : inputDataSpecific<T>) => any) : void;
}