//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type card from "./card";
import type res from "../generics/universalResponse";
//import position from "./position";
//import utils from "./util";
import Zone from "./zone";

class Zone_stack extends Zone {
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

    override remove(c : card) : res{
        if (!this.canMoveFrom) return this.handleNoMoveFrom(c, "remove_stack", 24)
        
        let index = this.findIndex(c.id);
        if(index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos)) 
            return this.handleCardNotInApplicableZone(c, "remove_stack", 28)

        //slice the last index
        this.cardArr.splice(index, 1)

        if(c.pos.zoneID == this.id) c.pos.invalidate()

        return [undefined, []]
    }
}

export default Zone_stack

