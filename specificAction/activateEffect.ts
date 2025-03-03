import action from "../baseClass/action";

class activateEffect extends action {
    constructor(
        isChain: boolean, 
        targetCardID: string, 
        effectID: string, 
        originateCardID?: string
    ){
        super("activateEffect", isChain, originateCardID, targetCardID)
        this.attr.set("effectID", effectID)
    }

    get effectID() : string {return this.attr.get("effectID")}
    set effectID(newID : string) {this.modifyAttr("effectID", newID)}
}

export default activateEffect