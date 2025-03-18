import action from "../baseClass/action";

class turnEnd extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(doIncreaseTurnCount : boolean = true){
        super(
            "turnEnd", 
            false,
            undefined,
            undefined,
            undefined,
            true, //can be chained to
            false //can be triggered to
        )
        this.doIncreaseTurnCount = doIncreaseTurnCount
    }

    get doIncreaseTurnCount() : boolean {return this.attr.get("doIncreaseTurnCount")}
    set doIncreaseTurnCount(newValue : boolean) {this.modifyAttr("doIncreaseTurnCount", newValue)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "doIncreaseTurnCount" && typeof newVal === "boolean") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default turnEnd