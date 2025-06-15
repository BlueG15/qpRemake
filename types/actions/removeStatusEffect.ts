import Action from "../abstract/gameComponents/action";

class removeStatusEffect extends Action {
    statusID : string
    constructor(
        isChain: boolean, 
        targetCardID : string, 
        statusID : string, 
        originateCardID? : string
    ){
        super("a_remove_status_effect", isChain, originateCardID, targetCardID)
        this.statusID = statusID
    }
}

export default removeStatusEffect