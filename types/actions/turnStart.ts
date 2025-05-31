import action from "../abstract/gameComponents/action";

class turnStart extends action {
    //system level action
    constructor(){
        super("turnStart", true)
    }
}

export default turnStart