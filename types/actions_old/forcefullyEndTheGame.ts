import Action_prototype from "../abstract/gameComponents/action";

class forcefullyEndTheGame extends Action_prototype {
    constructor(
        endWithALoss : boolean = true,
        isChain: boolean,
        fromID?: string,
    ){
        super(
            "a_force_end_game",
            isChain,
            fromID,
            undefined,
            undefined,
            false,
            false
        )
        this.endWithALoss = endWithALoss
    }

    get endWithALoss() : boolean {return this.attr.get("endWithALoss")}
    set endWithALoss(newEnd : boolean) {this.modifyAttr("endWithALoss", newEnd)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(
            key === "endWithALoss" && 
            typeof newVal === "boolean"
        ) {
            return true
        }
        return super.verifyNewValue(key, newVal);
    }
}

export default forcefullyEndTheGame

