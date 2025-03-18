import action from "../baseClass/action";

class setThreatLevel extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(newThreatLevel : number){
        super(
            "setThreatLevel", 
            true,
            undefined,
            undefined,
            undefined,
            true, //can be chained to
            false //can be triggered to
        )
        this.newThreatLevel = newThreatLevel
    }

    get newThreatLevel() : number {return this.attr.get("newThreatLevel")}
    set newThreatLevel(_newThreatLevel : number) {this.modifyAttr("newThreatLevel", _newThreatLevel)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "newThreatLevel" && typeof newVal === "number") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default setThreatLevel