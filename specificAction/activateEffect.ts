import action from "../baseClass/action";

class activateEffect extends action {
    constructor(
        isChain: boolean, 
        targetCardID : string, 
        effectID : number, 
        originateCardID? : string
    ){
        super("activateEffect", isChain, originateCardID, targetCardID)
        this.attr.set("effectID", effectID)
    }

    get effectID() : number {return this.attr.get("effectID")}
    set effectID(newID : number) {this.modifyAttr("effectID", newID)}
}

export default activateEffect