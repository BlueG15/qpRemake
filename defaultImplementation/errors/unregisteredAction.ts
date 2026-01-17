import error from "./error"
import type { Action } from "../../_queenSystem/handler/actionGenrator";

class unregisteredAction extends error {
    constructor(a : Action){
        super();
        this.messege = `an unregistered action is being resolved with type = ${a.type}`;
    }
}

export default unregisteredAction

