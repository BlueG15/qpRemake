import action from "../abstract/gameComponents/action";

class increaseTurnCount extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(){
        super(
            "increaseTurnCount", 
            true,
            undefined,
            undefined,
            undefined,
            true, //can be chained to
            false //can be triggered to
        )
    }
}

export default increaseTurnCount