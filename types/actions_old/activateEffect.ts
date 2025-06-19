import Action_prototype from "../abstract/gameComponents/action"

class activateEffect extends Action_prototype {
    constructor(
        isChain: boolean, 
        targetCardID: string, 
        effectID: string, 
        originateCardID?: string
    ){
        super("a_activate_effect", isChain, originateCardID, targetCardID)
        this.attr.set("effectID", effectID)
    }

    get effectID() : string {return this.attr.get("effectID")}
    set effectID(newID : string) {this.modifyAttr("effectID", newID)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "effectID" && typeof newVal === "string") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default activateEffect