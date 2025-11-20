import type { Action } from "../handler/actionGenrator";
import type { dry_system, gameState_stat, inputData, inputDataSpecific, inputType, TurnPhase, validSetFormat } from "../../data/systemRegistry";
import type { LocalizedSystem } from "../../types/abstract/serializedGameComponents/Localized";

export interface qpRenderer {
    gameStart(s : LocalizedSystem, callback : () => any) : void;
    turnStart(s : LocalizedSystem, callback : (a? : Action) => any) : void;
    update(phase : TurnPhase, s : LocalizedSystem, a : Action, callback : () => any) : void;
    requestInput<T extends inputType>(inputSet : inputDataSpecific<T>[] , phase : TurnPhase, s : LocalizedSystem, a : Action, callback : (input : inputDataSpecific<T>) => any) : void;
}