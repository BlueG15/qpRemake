import action from "../abstract/gameComponents/action";

class nullAction extends action {
    constructor(){super("a_null", true, undefined, undefined, undefined, false, false);}
}

export default nullAction