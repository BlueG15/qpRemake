import Action from "../baseClass/action";

class addStatusEffect extends Action {
    statusID : string
    constructor(
        isChain: boolean, 
        targetCardID : string, 
        statusID : string, 
        originateCardID? : string
    ){
        super("addStatusEffect", isChain, originateCardID, targetCardID)
        this.statusID = statusID
    }
}

export default addStatusEffect