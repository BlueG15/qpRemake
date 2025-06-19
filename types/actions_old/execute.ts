import Action_prototype from "../abstract/gameComponents/action";

class execute extends Action_prototype {
    //system level action
    //replace the current specicically
    constructor(
        target : string,
        cause? : string,
        isChain = false
    ){
        super(
            "a_execute", 
            isChain,
            cause,
            target,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
    }
}

export default execute