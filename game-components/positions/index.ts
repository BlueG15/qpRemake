import { PositionDry, PositionLike, Target, TargetPos } from '../../core'

function toLength(x : number, y : number){
    return Math.max(x, 0) + Math.max(y, 0)
}

export class Position implements PositionDry, PositionLike {
    zoneID : number
    protected set(property : "x" | "y", n : number){
        (this[property] as any) = n
    }
    moveTo(x : number, y : number){
        this.set("x", x)
        this.set("y", y)
    }
    flat() : ReadonlyArray<number> {return [this.x, this.y]}
    get length() {return toLength(this.x, this.y)}
    constructor(
        zoneID?: number, //runtime ID, NOT data id, the index of the zone in the zone loader
        ...args : number[]
    );
    constructor(p : PositionDry);
    constructor(param1 : number | PositionDry = -1, public readonly x : number = -1, public readonly y : number = 0){
        this.zoneID = (typeof param1 == "number") ? param1 : param1.zoneID
    }
    invalidate(){
        this.zoneID = -1;
        this.set("x", -1)
        this.set("y", -1)
    }
    toString(){
        if(this.length) return `[zoneID=${this.zoneID}, ${
            (this.length == 1) ? this.x : 
            `${this.x},${this.y}`
        }]`;
        return `[Invalid pos]`;
    }
    randomizeSelf(pArr : PositionDry[]) : void;
    randomizeSelf(max : number, min : number) : void;
    randomizeSelf(param1 : number | PositionDry[], param2 : number = 0) : void{
        if(typeof param1 == 'number'){
            //overload 2
            let max = param1;
            let min = param2;
            this.set("x", Utils.rng(max, min, true));
            this.set("y", Utils.rng(max, min, true));
        } else {
            //overload 1
            let max = param1.length;
            let min = 0;
            let i = Utils.rng(max, min, true);

            this.set("x", param1[i].x)
            this.set("y", param1[i].y)
            this.zoneID = param1[i].zoneID
        }
    }
    is(pos : PositionLike){
        if(Object.is(this, pos)) return true;
        if (pos.zoneID !== this.zoneID) return false;
        if (this.length !== toLength(pos.x, pos.y)) return false;
        return (this.x === pos.x) && (this.length === 1 || this.y === pos.y)
    }

    get identity() : TargetPos {
        return Target.pos(this)
    }
}