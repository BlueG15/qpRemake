import Action from "../abstract/gameComponents/action";

class forcefullyEndTheGame extends Action {
    constructor(
        endWithALoss : boolean = true,
        fromID: string,
        isChain: boolean
    ){
        super(
            "forcefullyEndTheGame",
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

