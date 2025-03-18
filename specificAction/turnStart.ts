import action from "../baseClass/action";

class turnStart extends action {
    //system level action
    constructor(){
        super("turnStart", true)
    }
}

export default turnStart