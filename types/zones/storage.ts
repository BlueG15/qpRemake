//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
// import card from "../baseClass/card";
import card from "../abstract/gameComponents/card";
import zone_stack from "../abstract/gameComponents/zone_stackBased";


class storage extends zone_stack {
    isEditting : boolean = false;
    maxCardCount = 9;

    // constructor(){
    //     super("storage");
    // }

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        return this.addToIndex(c, this.cardArr.length)
    }
}

export default storage