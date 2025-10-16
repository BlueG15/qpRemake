//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import Position from "../generics/position";
import { Zone } from "./zone";
import type Card from "./card";

import { playerOppositeMap, playerTypeID } from "../../../data/zoneRegistry";
import type { Positionable, Player_specific, HasTypesArr} from "../../misc";
import type { inputData } from "../../../data/systemRegistry";
import type { inputRequester, inputRequester_finalized } from "../../../_queenSystem/handler/actionInputGenerator";

class Zone_grid<
    T_cull_zone_res extends inputData[] | undefined = undefined,
    T_cull_interact extends inputData[] | undefined = undefined,
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

    override get lastPos() : Position {
        return new Position(this.id, this.name, ...Utils.indexToPosition(
            (this.isFull) ? this.capacity-1 : this.lastEmptyIndex, 
            this.shape
        ))
    }

    override get firstPos() : Position {
        return new Position(
            this.id, 
            this.name,
            ...Utils.indexToPosition(this.firstEmptyIndex, this.shape)
        )
    }

    override forceCardArrContent(newCardArr: Card[]): void {
        const oldLen = this.cardArr.length;
        this.cardArr = newCardArr;
        if(isNaN(this.capacity) || !isFinite(this.capacity)) return;
        
        if(this.cardArr.length < oldLen) this.cardArr = this.cardArr.concat(...(new Array(oldLen - this.cardArr.length).fill(undefined)))
        while(this.cardArr.length > oldLen) this.cardArr.pop();
    }

    override isOpposite(c1: Positionable, c2: Positionable): boolean;
    override isOpposite(z: Player_specific & HasTypesArr): boolean;
    override isOpposite(p1: Positionable | (Player_specific & HasTypesArr), p2?: Positionable): boolean {
        if(p2 === undefined){
            const z = p1 as Zone;
            const flag1 =  playerOppositeMap[playerTypeID[this.playerType] as keyof typeof playerOppositeMap].some(i => i === z.playerType);
            const flag2 =  this.types.join() === z.types.join();
            return flag1 && flag2
        } else {
            const c1 = p1 as Card;
            const c2 = p2 as Card;

            return  c1.pos.valid && 
                    c2.pos.valid && 
                    c1.pos.flat().length === 2 &&  
                    c2.pos.flat().length === 2 &&
                    c1.pos.x === c2.pos.x && 
                    c1.pos.y !== c2.pos.y
        }
    }
}

export default Zone_grid

