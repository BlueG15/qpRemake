import type position from "../baseClass/position";
import posChange from "./posChange";

class drawAction extends posChange {
    constructor(
        cid : string = "noID", 
        isChain : boolean,
        fromPos : position, 
        cooldown : number, 
        doTurnReset : boolean = true, 
        toPos? : position, 
        originateCardID? : string
    ){
        super(cid, isChain, fromPos, toPos, undefined, originateCardID)
        this.type = "draw"
        this.attr.set("cooldown", cooldown)
        this.attr.set("doTurnReset", doTurnReset)
    }

    //NaN means unchanged
    get cooldown() : number  {return this.attr.get("cooldown")}
    set cooldown(t : number) {this.modifyAttr("cooldown", t)} 

    get doTurnReset() : boolean  {return this.attr.get("doTurnReset")}
    set doTurnReset(t : boolean) {this.modifyAttr("doTurnReset", t)} 

    get doChangeCooldown() : boolean {return isNaN(this.cooldown)}
    get hasCard() : boolean {return Boolean(this.targetCardID) && this.targetCardID != "unknownID"}
}

export default drawAction