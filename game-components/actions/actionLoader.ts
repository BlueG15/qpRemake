import type { Action } from "../../core/registry/action"
import type QueenSystem from "../_queenSystem/queenSystem"

import { actionID, actionName } from "../../core/registry/action"

//TODO : remove this, make action handlers literal GameRule objects (extends card), more fun that way
type handlerFunc<T extends undefined | actionName = undefined, A extends Action = T extends undefined ? Action : Action<T>> = ((system: QueenSystem, a: A) => undefined | void | Action[])
export default class HandlerLoader {
    private funcCache = new Map<number, handlerFunc>()

    ___ObtainFunc(actionTypeID : number){
        return this.funcCache.get(actionTypeID)
    }

    delete(actionTypeID : number){
        this.funcCache.delete(actionTypeID)
    }

    load<T extends actionName>(actionType : T, handlerFunc : handlerFunc<T>){
        this.funcCache.set(actionID[actionType], handlerFunc as any)
    }

    handle(actionTypeID : number, a : Action, s : QueenSystem) : undefined | Action[] {
        let func = this.funcCache.get(actionTypeID);
        if(!func) return;
        else return func(s, a) as undefined | Action[];
    }

    getNotHandledActions(){
        return (
            Object.keys(actionID)
            .filter(x => !Number.isNaN(+x))
            .filter(key => !this.funcCache.has(+key))
        )
    }
}