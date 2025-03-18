import action from "../baseClass/action";

class doThreatLevelBurn extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(){
        super(
            "doThreatLevelBurn", 
            true,
            undefined,
            undefined,
            undefined,
            true, //can be chained to
            false //can be triggered to
        )
    }

}

export default doThreatLevelBurn