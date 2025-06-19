import error from "./error"
import type Action_prototype from "../abstract/gameComponents/action";

class unregisteredAction extends error {
    constructor(a : Action_prototype){
        super();
        this.messege = `an unregistered action is being resolved with type = ${a.type}`;
    }
}

export default unregisteredAction

