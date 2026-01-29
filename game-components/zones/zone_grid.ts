//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import { Zone } from "./zone";
import type { Card } from "../cards";
import type { Positionable, PositionDry } from "../../core";
import { Position } from "../positions";

class Zone_grid extends Zone {

    override cardArrInternal = (isFinite(this.capacity) && !isNaN(this.capacity)) ? new Array(this.capacity).fill(undefined) : []

    private get firstEmptyIndex() {return this.cardArr.indexOf(undefined)}
    private get lastEmptyIndex() {return this.cardArr.lastIndexOf(undefined)}

    override get isFull() {
        return (this.firstEmptyIndex === -1)
    }
    override get valid(){
        return this.id >= 0 && this.capacity !== Infinity && this.boundY >= 0 && this.boundX >= 0
    }

    getEmptyPosArr(){
        let res : Position[] = [];
        for(let i = 0; i < this.capacity; i++){
            if(this.cardArr[i]) continue;
            let p = new Position(this.id, ...this.indexToPosition(i))
            res.push(p);
        }
        return res;
    }

    getRandomEmptyPos(){
        let posArr = this.getEmptyPosArr()
        let idx = Utils.rng(posArr.length - 1, 0, true)
        return posArr[idx]
    }

    override getFrontPos(c: Positionable): PositionDry {
        return new Position(this.id, c.pos.x, c.pos.y - 1)
    }

    override getBackPos(c: Positionable): PositionDry {
        return new Position(this.id, c.pos.x, c.pos.y + 1)
    }

    override forceCardArrContent(newCardArr: Card[]): void {
        const oldLen = this.cardArr.length;
        this.cardArrInternal = newCardArr;
        if(isNaN(this.capacity) || !isFinite(this.capacity)) return;
        
        if(this.cardArr.length < oldLen) this.cardArrInternal = this.cardArr.concat(...(new Array(oldLen - this.cardArr.length).fill(undefined)))
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

