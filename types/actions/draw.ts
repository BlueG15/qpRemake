import type Position from "../abstract/generics/position";
import posChange from "./posChange";

class drawAction extends posChange {
    constructor(
        cid : string = "", 
        isChain : boolean,
        fromPos : Position, 
        cooldown : number, 
        doTurnReset : boolean = true, 
        toPos? : Position, 
        originateCardID? : string
    ){
        super(cid, isChain, fromPos, toPos, undefined, originateCardID)
        this.type = "a_draw"
        this.attr.set("cooldown", cooldown)
        this.attr.set("doTurnReset", doTurnReset)
    }

    //NaN means unchanged
    get cooldown() : number  {return this.attr.get("cooldown")}
    set cooldown(t : number) {this.modifyAttr("cooldown", t)} 

    get doTurnReset() : boolean  {return this.attr.get("doTurnReset")}
    set doTurnReset(t : boolean) {this.modifyAttr("doTurnReset", t)} 

    get doChangeCooldown() : boolean {return isNaN(this.cooldown) && this.cooldown >= 0}
    get hasCard() : boolean {return Boolean(this.targetCardID)}

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "cooldown" && typeof newVal === "number") return true
        if(key === "doTurnReset" && typeof newVal === "boolean") return true
        return super.verifyNewValue(key, newVal);
    }
}

export default drawAction