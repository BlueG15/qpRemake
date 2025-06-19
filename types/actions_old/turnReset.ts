import action from "../abstract/gameComponents/action";

class turnReset extends action {
    constructor(
        isChain : boolean,
        doIncrementTurn : boolean = true, 
        doZoneRefresh : boolean = true, 
        originateCardID? : string
    ){
        super("a_turn_reset", isChain, originateCardID)
        this.attr.set("doIncrementTurn", doIncrementTurn)
        this.attr.set("doZoneRefresh", doZoneRefresh)
    }

    get doIncrementTurn() : boolean {return this.attr.get("doIncrementTurn")}
    get doZoneRefresh() : boolean {return this.attr.get("doZoneRefresh")}

    set doIncrementTurn(k : boolean) {this.modifyAttr("doIncrementTurn", k)}
    set doZoneRefresh(k : boolean) {this.modifyAttr("doZoneRefresh", k)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if((key === "doIncrementTurn" || key === "doZoneRefresh") && typeof newVal === "boolean") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default turnReset