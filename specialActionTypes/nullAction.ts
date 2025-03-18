import action from "../baseClass/action";

class nullAction extends action {
    constructor(){super("null", true, undefined, undefined, undefined, false, false);}
}

export default nullAction