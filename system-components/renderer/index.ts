import type { Action, Target, TargetTypeID } from "../../core";
import type { SystemDry, TurnPhase } from "../../core";
import type { LocalizedSystem } from "../../core/localized";
import type { TargetSpecific } from "../../core";
import type { InputRequestData } from "../inputs";

export interface qpRenderer {
    //**game start is called upon game start, call callback() to continue */
    gameStart(s : LocalizedSystem, callback : () => any) : void;

    //**
    // turn start is called upon turn start
    // call callback() with the turn action of the player to continue 
    // create action via actionGenerator of systemComponents
    // */
    turnStart(s : LocalizedSystem, callback : (a? : Action) => any) : void;
    
    /**
     * update is called upon every game update for every phase for whatever reason
     * right after applying the action to the game states
     * call callback() to conttinue */
    update(phase : TurnPhase, s : LocalizedSystem, a : Action, callback : () => any) : void;

    /**
     * request input is called wheever the system is processing an action and wants a user input
     * @param inputrq : a array of allowed inputs, has specifications on how many to take too
     * @param phase : phase
     * @param s : system state
     * @param a : action
     * @param callback : callback function, call to continue
     */
    requestInput(inputrq : InputRequestData<Target> , phase : TurnPhase, s : LocalizedSystem, a : Action, callback : (input : Target[]) => any) : void;
}

export class DefaultRenderer implements qpRenderer {
    gameStart(s: LocalizedSystem, callback: () => any): void {
        console.log("Game start called")
        return callback();
    }
    turnStart(s: LocalizedSystem, callback: (a?: Action) => any): void {
        console.log(`Turn start called`)
        return callback();
    }
    update(phase: TurnPhase, s: LocalizedSystem, a: Action, callback: () => any): void {
        console.log(`Update called on phase ${s.phase}, on action ${a.name}`)
        return callback();
    }
    requestInput(inputSet : any, phase : TurnPhase, s : LocalizedSystem, a : Action, callback : (input : Target[]) => any) : void {
        console.log(`Input requested, continue with 1st input`)
        return callback(inputSet[0]);
    }
    
}