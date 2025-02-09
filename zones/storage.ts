//import zone from "../baseClass/zone";
import type res from "../baseClass/universalResponse";
// import card from "../baseClass/card";
import card from "../baseClass/card";
import zone_stack from "../baseClass/zone_stackBased";


class storage extends zone_stack {
    isEditting : boolean = false;
    maxCardCount = 9;

    constructor(){
        super("storage");
    }

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        return this.addToIndex(c, this.cardArr.length)
    }
}

export default storage