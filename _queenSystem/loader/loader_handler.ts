import type { Action } from "../handler/actionGenrator"
import type queenSystem from "../queenSystem"

type handlerFunc = ((a: Action, system: queenSystem) => undefined | Action[])
export default class customHandlerLoader {
    private funcCache = new Map<number, handlerFunc>()

    load(actionID : number, handlerFunc : handlerFunc){
        this.funcCache.set(actionID, handlerFunc)
    }

    handle(actionID : number, a : Action, s : queenSystem){
        let func = this.funcCache.get(actionID);
        if(!func) return;
        else return func(a, s);
    }
}