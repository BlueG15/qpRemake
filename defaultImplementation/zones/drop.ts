import zone_stack from "../../types/gameComponents/zone_stackBased";

class Drop extends zone_stack {
    // constructor(){
    //     super("drop");
    // }

    setCapacity(newCapacity : number){this.attr.set("boundX", newCapacity);} 
}

export default Drop