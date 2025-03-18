import Action from "../baseClass/action";

class modifyAnotherAction extends Action {
    constructor(
        taretActionID : number,
        attrToModify : string,
        newAttrValue: any,
        isChain : boolean,
        fromID : string,
    ){
        super(
            "modifyAnotherAction", 
            isChain,
            fromID, 
            undefined, 
            taretActionID,
            true,
            true
        );
        this.attrToModify = attrToModify
        this.newAttrValue = newAttrValue
    }

    get attrToModify() : string {return this.attr.get("attrToModify")}
    set attrToModify(value: string) {this.modifyAttr("attrToModify", value)}

    get newAttrValue() : any {return this.attr.get("newAttrValue")}
    set newAttrValue(value: any) {this.modifyAttr("newAttrValue", value)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "attrToModify" && typeof newVal === "string") return true
        if(key === "newAttrValue") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default modifyAnotherAction