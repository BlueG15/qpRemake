import type { Action } from "../handler/actionGenrator";
import type { dry_system, gameState_stat, inputData, inputDataSpecific, inputType, TurnPhase, validSetFormat } from "../../data/systemRegistry";
import type { Localized_system } from "../../types/abstract/serializedGameComponents/Localized";

export interface qpRenderer {
    init(s : Localized_system, callback : () => any) : void;
    startTurn(s : Localized_system, callback : (a? : Action) => any) : void;
    update(phase : TurnPhase, s : Localized_system, a : Action, callback : () => any) : void;
    requestInput<T extends inputType>(inputSet : validSetFormat<T> , phase : TurnPhase, s : Localized_system, a : Action, callback : (input : inputDataSpecific<T>) => any) : void;
}