import { ActionRegistry, type Action, type ActionID, type ActionName } from "../../core/registry/action"
import type QueenSystem from "../../queen-system"

//TODO : remove this, make action handlers literal GameRule objects (extends card), more fun that way
type handlerFunc<T extends undefined | ActionName = undefined, A extends Action = T extends undefined ? Action : Action<T>> = ((system: QueenSystem, a: A) => undefined | void | Action[])
export default class HandlerLoader {
    private funcCache = new Map<ActionName, handlerFunc>()

    delete(id : ActionID | ActionName){
        if(typeof id === "number") id = ActionRegistry.getKey(id);
        this.funcCache.delete(id)
    }

    load<T extends ActionName>(id : T, handlerFunc : handlerFunc<T>){
        this.funcCache.set(id, handlerFunc as any)
    }

    handle(a : Action, s : QueenSystem) : undefined | Action[] {
        let func = this.funcCache.get(ActionRegistry.getKey(a.type));
        if(!func) return;
        else return func(s, a) as undefined | Action[];
    }


}