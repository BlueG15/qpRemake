import dry_position from "../../data/dry/dry_position";
import utils from "../../../utils";

class Position {
    arr : number[] = []
    zoneID : number
    zoneName : string 
    get length(){return this.arr.length}
    get x(){
        if(!this.arr[0]) return -1;
        return this.arr[0]
    }
    get y(){
        if(!this.arr[1]) return -1;
        return this.arr[1]
    }
    map(func : (value: number, index: number) => number){
        return this.arr.map(func)
    }
    forEach(func : (value: number, index: number) => void){
        this.arr.forEach(func)
    }
    flat(){return this.arr}
    constructor(
        zoneID?: number, //runtime ID, NOT data id, the index of the zone in the zone loader
        zoneName?: string, 
        ...args : number[]
    );
    constructor(drypos : dry_position);
    constructor(param1 : number | dry_position = -1, zoneName : string = "unknown", ...args : number[]){
        if(typeof param1 == "number"){
            this.zoneID = param1;
            this.zoneName = zoneName;
            this.arr = args;
        } else {
            this.zoneID = param1.zoneID
            this.zoneName = param1.zoneName,
            this.arr = param1.posArr.slice()
        }
    }
    get valid(){
        if(this.zoneID < 0) return false;
        if(!this.length) return false;
        this.arr.forEach(i => {
            if(i < 0) return false;
        })
        return true;
    }
    invalidate(){
        this.zoneID = -1;
        this.zoneName = "unknown"
        this.arr = new Array(this.length).fill(-1);
    }
    toString(){
        if(this.valid) return `[${this.zoneName}, ${
            (this.length == 1) ? this.arr[0] : 
            this.arr.join(", ")
        }]`;
        return `[Invalid pos]`;
    }
    randomizeSelf(pArr : Position[]) : void;
    randomizeSelf(max : number, min : number) : void;
    randomizeSelf(param1 : number | Position[], param2 : number = 0) : void{
        if(typeof param1 == 'number'){
            //overload 2
            let max = param1;
            let min = param2;
            for(let i = 0; i < this.length; i++){
                this.arr[i] = utils.rng(max, min, true);
            }
        } else {
            //overload 1
            let max = param1.length;
            let min = 0;
            let i = utils.rng(max, min, true);

            this.arr = param1[i].arr
            this.zoneID = param1[i].zoneID
        }
    }
    toDry() : dry_position {
        return new dry_position(this)
    }
}

export default Position