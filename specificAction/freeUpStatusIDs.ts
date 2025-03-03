import Action from "../baseClass/action";

class freeUpStatusIDs extends Action {
    idToClear : string[]
    constructor(idToClear : string[]){
        super("freeUpStatusIDs", true, undefined, undefined, undefined, false)
        this.idToClear = idToClear
    }
}

export default freeUpStatusIDs

