//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
import type card from "../abstract/gameComponents/card";
import zone_stack from "../abstract/gameComponents/zone_stackBased";

class grave extends zone_stack {
    // constructor(isPlayerGrave : boolean);
    // constructor(keyStr : string);
    // constructor(param : boolean | string = true){
    //     if(typeof param == "string") super(param);
    //     else if(param) super("playerGrave");
    //     else super("enemyGrave");
    // }

    setCapacity(newCapacity : number){this.posBound = [newCapacity];} 

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line)
    }
}

export default grave