import action from "../abstract/gameComponents/action";

class resetEffect extends action {
    //system level action
    //cannot be triggered to
    //can be chain to tho
    constructor(
        cid : string,
        effectID : string,
        cause? : string,
        isChain = false,
    ){
        super(
            "a_reset_effect", 
            isChain,
            cause,
            cid,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
        this.attr.set("effectID", effectID);
    }

    get effectID() : string {return this.attr.get("effectID")}
    set effectID(val : string){this.attr.set("effectID", val)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "effectID" && typeof newVal === "string") return true;
        return super.verifyNewValue(key, newVal)
    }

}

export default resetEffect