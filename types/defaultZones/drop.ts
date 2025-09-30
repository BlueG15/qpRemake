import zone_stack from "../abstract/gameComponents/zone_stackBased";

class drop extends zone_stack {
    // constructor(){
    //     super("drop");
    // }

    setCapacity(newCapacity : number){this.posBound = [newCapacity];} 
}

export default drop