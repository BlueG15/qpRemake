import type Position from "../../types/abstract/generics/position"

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

    equal(pos : dry_position){
        if(Object.is(this, pos)) return true;
        if (pos.zoneID !== this.zoneID) return false;
        if (this.posArr.length !== pos.posArr.length) return false;
        for(let i = 0; i < this.posArr.length; i++){
            if(this.posArr[i] !== pos.posArr[i]) return false;
        }
        return true;
    }

    get x() {return this.posArr[0] ?? NaN}
    get y() {return this.posArr[1] ?? NaN}
}

export default dry_position