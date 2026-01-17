//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import { Zone } from "./zone";
import type Card from "./card";
import type res from "../generics/universalResponse";
import type { Positionable } from "../misc";
import type { inputData } from "../../data/systemRegistry";

class Zone_stack<
    T_cull_zone_res extends inputData[] | [] = [],
    T_cull_interact extends inputData[] | [] = [],
> extends Zone<T_cull_zone_res, T_cull_interact> {
    // constructor(dataID: string, data?: zoneData){
    //     super(dataID, data)
    //     this.cardArr = []
    // }
    //helper properties
    //override get valid(){return this.id >= 0 && this.moveToNeedPosition === false}

    //zone functionality functions
    //zone has 2 jobs
    //1. provides an action if the player wanna do something
    //2. perform an action using API/func calls, not action (not enough info)

    //functions for step 2

    override remove(c : Card) : res{
        if (!this.canMoveFrom) return this.handleNoMoveFrom(c, "remove_stack", 24)
        
        let index = this.findIndex(c.id);
        if(index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos)) 
            return this.handleCardNotInApplicableZone(c, "remove_stack", 28)

        //slice the last index
        this.cardArr.splice(index, 1)

        if(c.pos.zoneID == this.id) c.pos.invalidate()

        return [undefined, []]
    }

    override isOpposite(c1: Positionable, c2: Positionable): boolean {
        return  (
                this.validatePosition(c1.pos) && 
                this.validatePosition(c2.pos) && 
                c1.pos.x === c2.pos.x 
            )
    }
}

export default Zone_stack

