//import zone from "../baseClass/zone";
import zone_stack from "../../types/gameComponents/zone_stackBased";

class Hand extends zone_stack {
    // constructor(){
    //     super("hand");
    // }

    setCapacity(newCapacity : number){this.attr.set("boundX", newCapacity);} 
}

export default Hand