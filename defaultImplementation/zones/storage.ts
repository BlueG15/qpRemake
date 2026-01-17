//import zone from "../baseClass/zone";
import type res from "../../types/generics/universalResponse";
// import card from "../baseClass/card";
import card from "../../types/gameComponents/card";
import zone_stack from "../../types/gameComponents/zone_stackBased";


class Storage extends zone_stack {
    isEditting : boolean = false;
    maxCardCount = 9;

    // constructor(){
    //     super("storage");
    // }

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        this.cardArr[index] = c;
        return [undefined, []]
    }
}

export default Storage