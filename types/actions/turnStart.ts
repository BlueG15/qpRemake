import action from "../abstract/gameComponents/action";

class turnStart extends action {
    //system level action
    constructor(){
        super("a_turn_start", true)
    }
}

export default turnStart