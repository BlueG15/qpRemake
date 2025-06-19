import action from "../abstract/gameComponents/action";

class clearAllStatusEffect extends action {
    //system level action
    constructor(
        target : string,
        cause? : string,
        isChain = false
    ){
        super(
            "a_clear_all_status_effect", 
            isChain,
            cause,
            target,
            undefined,
            false, //can be chained to
            false //can be triggered to
        )
    }

}

export default clearAllStatusEffect