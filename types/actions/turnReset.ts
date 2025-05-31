import action from "../abstract/gameComponents/action";

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

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if((key === "doIncrementTurn" || key === "doFieldRefresh") && typeof newVal === "boolean") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default turnReset