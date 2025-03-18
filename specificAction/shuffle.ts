import action from "../baseClass/action";

class shuffle extends action {
    //WARNING : this is the only action to not properly record its changes through an attr
    //cause the purpose is setting "changedSinceLastAccessed" property 
    //but shuffleMap is a map, once user get it, its set method wont touch OUR methods
    //i havent found a way to do this yet, hold
    constructor(
        zoneID : number, 
        isChain : boolean,
        shuffleMap : Map<number, number>, 
        originateCardID? : string
    ){
        super("shuffle", isChain, originateCardID)
        this.shuffleMap = shuffleMap
        this.attr.set("zoneID", zoneID)
    }

    get zoneID() : number {return this.attr.get("zoneID")}
    set zoneID(id : number) {this.modifyAttr("zoneID", id)}

    get shuffleEncodedArr() : [number, number][] {return this.attr.get("shuffleEncodedArr")}
    set shuffleEncodedArr(newArr : [number, number][]) {this.modifyAttr("shuffleEncodedArr", newArr)}

    get shuffleMap(){
        return new Map(this.shuffleEncodedArr);
    }

    set shuffleMap(newShuffleMap : Map<number, number>){
        this.shuffleEncodedArr = [...newShuffleMap.entries()]
    }

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(
            key === "shuffleEncodedArr" && 
            typeof newVal === "object" &&
            Array.isArray(newVal)
        ){
            for(let i = 0; i < newVal.length; i++){
                if(
                    typeof newVal[i] === "object" &&
                    Array.isArray(newVal[i])
                ){
                    if(newVal[i].length !== 2) return false
                    if(typeof newVal[i][0] !== "number") return false
                    if(typeof newVal[i][1] !== "number") return false
                } else return false
            }
            return true
        }
        return super.verifyNewValue(key, newVal);
    }
}

export default shuffle