import Position from "../abstract/generics/position";
import Action from "../abstract/gameComponents/action";

//fromPos may do nothing, most zones just check the dang card with id
//its just there for responses i guess

class posChange extends Action {
    constructor(
        targetCardID : string, 
        isChain : boolean,
        fromPos : Position, 
        toPos? : Position, 
        swapTargetID? : string, 
        originateCardID? : string
    ){
        super("a_pos_change", isChain, originateCardID, targetCardID)
        this.attr.set("fromPos", fromPos);
        if(toPos) this.attr.set("toPos", toPos);
        if(swapTargetID) this.attr.set("swapTargetID", swapTargetID);
    }    

    get fromPos() : Position {return this.attr.get("fromPos")}
    set fromPos(value: Position) {this.modifyAttr("fromPos", value)}

    get toPos() : Position | undefined {return this.attr.get("toPos")}
    set toPos(value: Position | undefined) {this.modifyAttr("toPos", value)}

    get swapTargetID() : string | undefined {return this.attr.get("swapTargetID")}
    set swapTargetID(value: string | undefined) {this.modifyAttr("swapTargetID", value)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(
            key === "fromPos" && 
            typeof newVal === "object" &&
            newVal instanceof Position
        ) return true

        if(
            key === "toPos" && 
            (typeof newVal === "object" &&
            newVal instanceof Position) ||
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