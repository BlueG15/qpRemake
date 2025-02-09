//import zone from "../baseClass/zone";
import zone_stack from "../baseClass/zone_stackBased";

class hand extends zone_stack {
    constructor(){
        super("hand");
    }

    setCapacity(newCapacity : number){this.posBound = [newCapacity];} 
}

export default hand