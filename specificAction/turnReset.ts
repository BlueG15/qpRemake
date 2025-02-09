import action from "../baseClass/action";

class turnReset extends action {
    constructor(
        isChain : boolean,
        doIncrementTurn : boolean = true, 
        doFieldRefresh : boolean = true, 
        originateCardID? : string
    ){
        super("turnReset", isChain, originateCardID)
        this.attr.set("doIncrementTurn", doIncrementTurn)
        this.attr.set("doFieldRefresh", doFieldRefresh)
    }

    get doIncrementTurn() : boolean {return this.attr.get("doIncrementTurn")}
    get doFieldRefresh() : boolean {return this.attr.get("doFieldRefresh")}

    set doIncrementTurn(k : boolean) {this.modifyAttr("doIncrementTurn", k)}
    set doFieldRefresh(k : boolean) {this.modifyAttr("doFieldRefresh", k)}
}

export default turnReset