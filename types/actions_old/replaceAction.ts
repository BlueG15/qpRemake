import Action_prototype from "../abstract/gameComponents/action";

class replaceAction extends Action_prototype {
    //system level action
    //replace the current specicically
    constructor(
        newAction : Action_prototype,
        cause? : string,
        isChain = false
    ){
        super(
            "a_negate_action", 
            isChain,
            cause,
            undefined,
            undefined,
            false, //can be chained to
            false //can be triggered to
        )
        this.attr.set("newAction", newAction)
    }

    get newAction() {return this.attr.get("newAction") as Action_prototype}
    set newAction(val : Action_prototype) {this.attr.set("newAction", val)}

    protected override verifyNewValue(key: string, val: any): boolean {
        if(key === "newAction") return val instanceof Action_prototype;
        return super.verifyNewValue(key, val);
    }
}

export default replaceAction