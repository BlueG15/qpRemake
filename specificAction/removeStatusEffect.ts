import Action from "../baseClass/action";

class removeStatusEffect extends Action {
    statusID : string
    constructor(
        isChain: boolean, 
        targetCardID : string, 
        statusID : string, 
        originateCardID? : string
    ){
        super("removeStatusEffect", isChain, originateCardID, targetCardID)
        this.statusID = statusID
    }
}

export default removeStatusEffect