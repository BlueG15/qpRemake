import position from "../baseClass/position";
import action from "../baseClass/action";

//fromPos may do nothing, most zones just check the dang card with id
//its just there for responses i guess

class posChange extends action {
    constructor(
        targetCardID : string, 
        isChain : boolean,
        fromPos : position, 
        toPos? : position, 
        swapTargetID? : string, 
        originateCardID? : string
    ){
        super("posChange", isChain, originateCardID, targetCardID)
        this.attr.set("fromPos", fromPos);
        if(toPos) this.attr.set("toPos", toPos);
        if(swapTargetID) this.attr.set("swapTargetID", swapTargetID);
    }    

    get fromPos() : position {return this.attr.get("fromPos")}
    set fromPos(value: position) {this.modifyAttr("fromPos", value)}

    get toPos() : position | undefined {return this.attr.get("toPos")}
    set toPos(value: position | undefined) {this.modifyAttr("toPos", value)}

    get swapTargetID() : string | undefined {return this.attr.get("swapTargetID")}
    set swapTargetID(value: string | undefined) {this.modifyAttr("swapTargetID", value)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(
            key === "fromPos" && 
            typeof newVal === "object" &&
            newVal instanceof position
        ) return true

        if(
            key === "toPos" && 
            (typeof newVal === "object" &&
            newVal instanceof position) ||
            (typeof newVal === "undefined")
        ) return true

        if(
            key === "swapTargetID" && 
            typeof newVal === "string" ||
            typeof newVal === "undefined"
        ) return true
        return super.verifyNewValue(key, newVal);
    }
}

export default posChange