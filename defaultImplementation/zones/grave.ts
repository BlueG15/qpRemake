//import zone from "../baseClass/zone";
import type res from "../../types/generics/universalResponse";
import type card from "../../types/gameComponents/card";
import zone_stack from "../../types/gameComponents/zone_stackBased";

class Grave extends zone_stack {
    // constructor(isPlayerGrave : boolean);
    // constructor(keyStr : string);
    // constructor(param : boolean | string = true){
    //     if(typeof param == "string") super(param);
    //     else if(param) super("playerGrave");
    //     else super("enemyGrave");
    // }

    setCapacity(newCapacity : number){this.attr.set("boundX", newCapacity);} 

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line)
    }
}

export default Grave