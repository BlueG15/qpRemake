//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type { zoneData } from "../data/zoneRegistry";
import position from "./position";
import utils from "./util";
import Zone from "./zone";

class Zone_grid extends Zone {
    constructor(id : string, name: string, data? : Record<string, zoneData>){
        super(id, name, data)
        //cant have infinite capacity
        this.cardArr = (this.valid) ? new Array(this.capacity).fill(undefined) : []
    }
    //helper properties

    private get firstEmptyIndex() {return this.cardArr.indexOf(undefined)}
    private get lastEmptyIndex() {return this.cardArr.lastIndexOf(undefined)}

    override get isFull() {return (this.firstEmptyIndex !== -1)}
    override get valid(){return this.id >= 0 && this.capacity !== Infinity}

    override get lastPos() : position {
        return new position(this.id, ...utils.indexToPosition(
            (this.isFull) ? this.capacity-1 : this.lastEmptyIndex, 
            this.shape
        ))
    }

    override get firstPos() : position {
        return new position(
            this.id, 
            ...utils.indexToPosition(this.firstEmptyIndex, this.shape)
        )
    }
}

export default Zone_grid

