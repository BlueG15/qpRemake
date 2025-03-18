// import action from "../baseClass/action";
import activateEffect from "./activateEffect";

class internalActivateEffectSignal extends activateEffect {
    //system level action
    //only resolve the effect and cannot be chained or trigger to
    //used to redirect responses for system to know what to activate next
    //so it will chain to whatever action causes the responses
    constructor(
        targetCardID: string, 
        effectID: string, 
        originateCardID?: string
    ){
        super(true, targetCardID, effectID, originateCardID)
        this.type = "internalActivateEffectSignal";
        this.canBeChainedTo = false;
        this.canBeTriggeredTo = false;
    }
}

export default internalActivateEffectSignal