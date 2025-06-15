//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type { zoneID, zoneData } from "../../data/zoneRegistry";
import Position from "../generics/position";
import utils from "../../../utils";
import Zone from "./zone";
// import Card from "./card";

class Zone_grid extends Zone {

    constructor(id : number, dataID: string, data?: zoneData){
        super(id, dataID, data)
        //cant have infinite capacity
        this.cardArr = (this.valid) ? new Array(this.capacity).fill(undefined) : []
    }
    //helper properties

    private get firstEmptyIndex() {return this.cardArr.indexOf(undefined)}
    private get lastEmptyIndex() {return this.cardArr.lastIndexOf(undefined)}

    override get isFull() {
        return (this.firstEmptyIndex === -1)
    }
    override get valid(){
        return this.id >= 0 && this.capacity !== Infinity
    }

    override get lastPos() : Position {
        return new Position(this.id, this.name, ...utils.indexToPosition(
            (this.isFull) ? this.capacity-1 : this.lastEmptyIndex, 
            this.shape
        ))
    }

    override get firstPos() : Position {
        return new Position(
            this.id, 
            this.name,
            ...utils.indexToPosition(this.firstEmptyIndex, this.shape)
        )
    }
}

export default Zone_grid

