import action from "../baseClass/action";

class turnEnd extends action {
    //system level action
    //turn end cannot be chained to
    constructor(){
        super("turnEnd", false, undefined, undefined, undefined, false)
    }
}

export default turnEnd