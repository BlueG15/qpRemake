import action from "../abstract/gameComponents/action";

class resetCard extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(
        target : string,
        cause? : string,
        isChain = false
    ){
        super(
            "a_reset_card", 
            isChain,
            cause,
            target,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
    }

}

export default resetCard