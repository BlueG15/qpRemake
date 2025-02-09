import action from "../baseClass/action";

class shuffle extends action {
    //WARNING : this is the only action to not properly record its changes through an attr
    //cause the purpose is setting "changedSinceLastAccessed" property 
    //but shuffleMap is a map, once user get it, its set method wont touch OUR methods
    //i havent found a way to do this yet, hold
    shuffleMap : Map<number, number>
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
}

export default shuffle