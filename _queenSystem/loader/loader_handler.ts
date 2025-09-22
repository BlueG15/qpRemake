import type { Action } from "../handler/actionGenrator"
import type queenSystem from "../queenSystem"

type handlerFunc = ((a: Action, system: queenSystem) => undefined | Action[])
export default class customHandlerLoader {
    private funcCache = new Map<number, handlerFunc>()

    ___ObtainFunc(actionTypeID : number){
        return this.funcCache.get(actionTypeID)
    }

    delete(actionTypeID : number){
        this.funcCache.delete(actionTypeID)
    }

    load(actionTypeID : number, handlerFunc : handlerFunc){
        this.funcCache.set(actionTypeID, handlerFunc)
    }

    handle(actionTypeID : number, a : Action, s : queenSystem){
        let func = this.funcCache.get(actionTypeID);
        if(!func) return;
        else return func(a, s);
    }
}