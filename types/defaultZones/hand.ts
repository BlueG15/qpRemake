//import zone from "../baseClass/zone";
import zone_stack from "../abstract/gameComponents/zone_stackBased";

class Hand extends zone_stack {
    // constructor(){
    //     super("hand");
    // }

    setCapacity(newCapacity : number){this.posBound = [newCapacity];} 
}

export default Hand