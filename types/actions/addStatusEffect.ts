import Action from "../abstract/gameComponents/action";

class addStatusEffect extends Action {
    constructor(
        isChain: boolean, 
        targetCardID : string, 
        statusID : string, 
        originateCardID? : string
    ){
        super("a_add_status_effect", isChain, originateCardID, targetCardID)
        this.statusID = statusID
    }

    get statusID() : string {return this.attr.get("statusID")}
    set statusID(newID : string) {this.modifyAttr("statusID", newID)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "statusID" && typeof newVal === "string") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default addStatusEffect