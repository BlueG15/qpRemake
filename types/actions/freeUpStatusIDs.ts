//UNUSED
import Action from "../abstract/gameComponents/action";

class freeUpStatusIDs extends Action {
    constructor(idToClear : string[]){
        super("error", true, undefined, undefined, undefined, false)
        this.idToClear = idToClear
    }

    get idToClear() : string[] {return this.attr.get("idToClear")}
    set idToClear(newIDs : string[]) {this.modifyAttr("idToClear", newIDs)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(
            key === "idToClear" && 
            typeof newVal === "object" &&
            Array.isArray(newVal)
        ) {
            for(let i = 0; i < newVal.length; i++){
                //i have to do this stupid bs to check if it is a STRING array specifically
                if(typeof newVal[i] !== "string") return false
            }
            return true
        }
        return super.verifyNewValue(key, newVal);
    }
}

export default freeUpStatusIDs


