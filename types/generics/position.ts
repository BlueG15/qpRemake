import type { dry_position } from "../../data/systemRegistry";
// import type { zoneRegistry } from "../../../data/zoneRegistry";

class Position {
    zoneID : number
    zoneName : string 
    get x(){
        return this._x
    }
    get y(){
        return this._y
    }
    moveTo(x : number, y : number){
        this._x = x
        this._y = y
    }
    map(func : (value: number, index: number) => number){
        return this.arr.map(func)
    }
    forEach(func : (value: number, index: number) => void){
        this.arr.forEach(func)
    }
    flat() : ReadonlyArray<number> {return [this.x, this.y]}
    private get arr(){
        return this.flat()
    }
    private get length() {
        return Math.max(this.x, 0) + Math.max(this.y, 0) 
    }
    constructor(
        zoneID?: number, //runtime ID, NOT data id, the index of the zone in the zone loader
        zoneName?: string, 
        ...args : number[]
    );
    constructor(drypos : dry_position);
    constructor(param1 : number | dry_position = -1, zoneName : string = "unknown", protected _x : number = -1, protected _y : number = 0){
        if(typeof param1 == "number"){
            this.zoneID = param1;
            this.zoneName = zoneName;
        } else {
            this.zoneID = param1.zoneID
            this.zoneName = param1.zoneName,
            this._x = param1.x,
            this._y = param1.y
        }
    }
    invalidate(){
        this.zoneID = -1;
        this.zoneName = "unknown"
        this._x = -1
        this._y = -1
    }
    toString(){
        if(this.zoneName) return `[${this.zoneName}, ${
            (this.length == 1) ? this.x : 
            `${this.x},${this.y}`
        }]`;
        return `[Invalid pos]`;
    }
    randomizeSelf(pArr : dry_position[]) : void;
    randomizeSelf(max : number, min : number) : void;
    randomizeSelf(param1 : number | dry_position[], param2 : number = 0) : void{
        if(typeof param1 == 'number'){
            //overload 2
            let max = param1;
            let min = param2;
            this._x = Utils.rng(max, min, true);
            this._y = Utils.rng(max, min, true);
        } else {
            //overload 1
            let max = param1.length;
            let min = 0;
            let i = Utils.rng(max, min, true);

            this._x = param1[i].x
            this._y = param1[i].x
            this.zoneID = param1[i].zoneID
        }
    }
    is(pos : dry_position){
        if(Object.is(this, pos)) return true;
        if (pos.zoneID !== this.zoneID) return false;
        if (this.arr.length !== pos.flat().length) return false;
        for(let i = 0; i < this.arr.length; i++){
            if(this.arr[i] !== pos.flat()[i]) return false;
        }
        return true;
    }
}

export default Position