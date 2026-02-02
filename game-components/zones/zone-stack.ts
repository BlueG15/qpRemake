//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import { Zone } from "./zone";
import type { Card } from "../cards";
import type { Positionable } from "../../core";
import { Target } from "../../core";

class ZoneStack extends Zone {
    // constructor(dataID: string, data?: zoneData){
    //     super(dataID, data)
    //     this.cardArr = []
    // }
    //helper properties
    override get valid(){return this.id >= 0 && this.boundX >= 0}

    //zone functionality functions
    //zone has 2 jobs
    //1. provides an action if the player wanna do something
    //2. perform an action using API/func calls, not action (not enough info)

    //functions for step 2

    override remove(cause : Target, c : Card){
        if (!this.canMoveFrom) return this.handleNotAllow(cause)
        
        let index = this.findIndex(c.id);
        if(index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos)) 
            return this.handleInvalid(cause, this.cardArr[index])

        //slice the last index
        this.cardArr.splice(index, 1)

        if(c.pos.zoneID == this.id) c.pos.invalidate()

        return []
    }

    override isOpposite(c1: Positionable, c2: Positionable): boolean {
        return  (
                this.validatePosition(c1.pos) && 
                this.validatePosition(c2.pos) && 
                c1.pos.x === c2.pos.x 
            )
    }

    override handleOccupied(cause : Target, c: Card, index: number){
        //move everything else backwards
        return this.handleOccupiedPush(cause, c, index)
    }
}

export default ZoneStack

