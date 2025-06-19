import action from "../abstract/gameComponents/action";

class negateAction extends action {
    //system level action
    //negate current specicically
    constructor(
        cause? : string,
        isChain = false
    ){
        super(
            "a_negate_action", 
            isChain,
            cause,
            undefined,
            undefined,
            false, //can be chained to
            false //can be triggered to
        )
    }

}

export default negateAction