//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import { Zone } from "./zone";
import type Card from "./card";
import type { Positionable, Player_specific, HasTypesArr} from "../misc";
import type { inputData } from "../../data/systemRegistry";

class Zone_grid<
    T_cull_zone_res extends inputData[] | [] = [],
    T_cull_interact extends inputData[] | [] = [],
> extends Zone<T_cull_zone_res, T_cull_interact> {

    override cardArr = (isFinite(this.capacity) && !isNaN(this.capacity)) ? new Array(this.capacity).fill(undefined) : []

    private get firstEmptyIndex() {return this.cardArr.indexOf(undefined)}
    private get lastEmptyIndex() {return this.cardArr.lastIndexOf(undefined)}

    override get isFull() {
        return (this.firstEmptyIndex === -1)
    }
    override get valid(){
        return this.id >= 0 && this.capacity !== Infinity
    }

    override forceCardArrContent(newCardArr: Card[]): void {
        const oldLen = this.cardArr.length;
        this.cardArr = newCardArr;
        if(isNaN(this.capacity) || !isFinite(this.capacity)) return;
        
        if(this.cardArr.length < oldLen) this.cardArr = this.cardArr.concat(...(new Array(oldLen - this.cardArr.length).fill(undefined)))
        while(this.cardArr.length > oldLen) this.cardArr.pop();
    }

    override isOpposite(c1: Positionable, c2: Positionable): boolean {
        return  (
                this.validatePosition(c1.pos) && 
                this.validatePosition(c2.pos) && 
                c1.pos.x === c2.pos.x && 
                c1.pos.y !== c2.pos.y
            )
    }
}

export default Zone_grid

