import Action from "../abstract/gameComponents/action";

class activateEffectSubtypeSpecificFunc extends Action {
    constructor(
        isChain: boolean, 
        targetCardID: string, 
        effectID: string, 
        subTypeID: string,
        originateCardID?: string
    ){
        super("a_activate_effect_subtype", isChain, originateCardID, targetCardID)
        this.effectID = effectID
        this.subTypeID = subTypeID
    }

    get effectID() : string {return this.attr.get("effectID")}
    set effectID(newID : string) {this.modifyAttr("effectID", newID)}

    get subTypeID() : string {return this.attr.get("subTypeID")}
    set subTypeID(newID : string) {this.modifyAttr("subTypeID", newID)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if((key === "effectID" || key === "subTypeID") && typeof newVal === "string") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default activateEffectSubtypeSpecificFunc