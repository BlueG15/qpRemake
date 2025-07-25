//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type Card from "./card";
import type res from "../generics/universalResponse";
//import position from "./position";
//import utils from "./util";
import { Zone_base } from "./zone";
import Position from "../generics/position";
import utils from "../../../utils";

import { playerOppositeMap, playerTypeID } from "../../../data/zoneRegistry";
import { HasTypesArr, Player_specific, Positionable } from "../../misc";

import type { inputData } from "../../../data/systemRegistry";
import type { inputRequester, inputRequester_finalized } from "../../../_queenSystem/handler/actionInputGenerator";

class Zone_stack<
    T_cull_zone_res extends inputData[] | undefined = undefined,
    T_cull_interact extends inputData[] | undefined = undefined,
    
    Requester_T_zone_res extends (T_cull_zone_res extends Array<inputData> ? inputRequester<any, any, T_cull_zone_res> : undefined) | undefined = T_cull_zone_res extends Array<inputData> ? inputRequester<T_cull_zone_res[0]["type"], T_cull_zone_res, T_cull_zone_res> : undefined,
    Requester_T_interact extends (T_cull_interact extends Array<inputData> ? inputRequester<any, any, T_cull_interact> : undefined) | undefined = T_cull_interact extends Array<inputData> ? inputRequester<T_cull_interact[0]["type"], T_cull_interact, T_cull_interact> : undefined
> extends Zone_base<T_cull_zone_res, T_cull_interact, Requester_T_zone_res, Requester_T_interact> {
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

    override get lastPos(): Position {
        return new Position(
            this.id,
            this.name,
            ...utils.indexToPosition(
                (this.cardArr.length === 0) ? 0 : this.cardArr.length - 1,
                this.shape
            )
        );
    }

    override isOpposite(c1: Positionable, c2: Positionable): boolean;
    override isOpposite(z: Player_specific & HasTypesArr): boolean;
    override isOpposite(p1: Positionable | (HasTypesArr & Player_specific), p2?: Positionable): boolean {
        if(p2 === undefined){
            const z = p1 as Zone_base;
            const flag1 =  playerOppositeMap[playerTypeID[this.playerType] as keyof typeof playerOppositeMap].some(i => i === z.playerType);
            const flag2 =  this.types.join() === z.types.join();
            return flag1 && flag2
        } else {
            const c1 = p1 as Card;
            const c2 = p2 as Card;

            return  c1.pos.valid && 
                    c2.pos.valid && 
                    c1.pos.flat().length === 1 &&  
                    c2.pos.flat().length === 1 &&
                    c1.pos.x === c2.pos.x
        }
    }
}

export default Zone_stack

