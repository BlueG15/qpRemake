import Action_prototype from "../abstract/gameComponents/action";

class a_disable_card extends Action_prototype {
    //system level action
    //replace the current specicically
    constructor(
        target : string,
        cause? : string,
        isChain = false
    ){
        super(
            "a_disable_card", 
            isChain,
            cause,
            target,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
    }
}

export default a_disable_card