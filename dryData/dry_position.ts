import type position from "../baseClass/position"
import zoneRegistry from "../data/zoneRegistry"

class dry_position {
    readonly zoneID : number
    readonly posArr : number[]

    constructor(pos : position){
        this.zoneID = pos.zoneID
        this.posArr = []
        this.posArr.push(...pos.flat())
    }

    get valid(){
        if(this.zoneID < 0) return false;
        if(!this.posArr.length) return false;
        this.posArr.forEach(i => {
            if(i < 0) return false;
        })
        return true;
    }

    toString(){
        if(this.valid) return `[${Object.keys(zoneRegistry)[this.zoneID]}, ${
            (this.posArr.length == 1) ? this.posArr[0] : 
            this.posArr.join(", ")
        }]`;
        return `[Invalid pos]`;
    }
}

export default dry_position