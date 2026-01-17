import type { Action } from "../handler/actionGenrator";
import type { dry_system, gameState_stat, inputData, inputDataSpecific, inputType, TurnPhase, validSetFormat } from "../../data/systemRegistry";
import type { LocalizedSystem } from "../../types/serializedGameComponents/Localized";

export abstract class qpRenderer {
    //**game start is called upon game start, call callback() to continue */
    abstract gameStart(s : LocalizedSystem, callback : () => any) : void;

    //**
    // turn start is called upon turn start
    // call callback() with the turn action of the player to continue 
    // create action via actionGenerator of systemComponents
    // */
    abstract turnStart(s : LocalizedSystem, callback : (a? : Action) => any) : void;
    
    /**
     * update is called upon every game update for every phase for whatever reason
     * right after applying the action to the game states
     * call callback() to conttinue */
    abstract update(phase : TurnPhase, s : LocalizedSystem, a : Action, callback : () => any) : void;

    /**
     * request input is called wheever the system is processing an action and wants a user input
     * @param inputSet : a array of allowed inputs
     * @param phase : phase
     * @param s : system state
     * @param a : action
     * @param callback : callback function, call to continue
     */
    abstract requestInput<T extends inputType>(inputSet : inputDataSpecific<T>[] , phase : TurnPhase, s : LocalizedSystem, a : Action, callback : (input : inputDataSpecific<T>) => any) : void;
}

export class sampleRenderer extends qpRenderer {
    override gameStart(s: LocalizedSystem, callback: () => any): void {
        console.log("Game start called")
        return callback();
    }
    override turnStart(s: LocalizedSystem, callback: (a?: Action) => any): void {
        console.log(`Turn start called`)
        return callback();
    }
    override update(phase: TurnPhase, s: LocalizedSystem, a: Action, callback: () => any): void {
        console.log(`Update called on phase ${phase}, on action ${a.type}`)
        return callback();
    }
    override requestInput<T extends inputType>(inputSet: inputDataSpecific<T>[], phase: TurnPhase, s: LocalizedSystem, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        console.log(`Input requested, continue with 1st input`)
        return callback(inputSet[0]);
    }
    
}