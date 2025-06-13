import type Position from "../../abstract/generics/position"

class dry_position {
    readonly zoneID : number
    readonly zoneName : string
    readonly posArr : ReadonlyArray<number>
    private str : string

    constructor(pos : Position){
        this.zoneID = pos.zoneID
        this.zoneName = String(pos.zoneName)
        this.posArr = pos.flat()
        this.str = pos.toString()
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
        return this.str
    }
}

export default dry_position