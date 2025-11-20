//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
// import card from "../baseClass/card";
import card from "../abstract/gameComponents/card";
import zone_stack from "../abstract/gameComponents/zone_stackBased";


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