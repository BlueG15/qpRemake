import effect from "./effect";
import action from "./action";
import type res from "./universalResponse";

import wrongEffectIdx from "../errors/wrongEffectIdx";
// import effectCondNotMet from "../errors/effectCondNotMet";

import position from "./position";
import type turnReset from "../specificAction/turnReset";

import activateEffect from "../specificAction/activateEffect";

//qp has cards that are able to tranfer / inherit effects of something else
//this...should still works?
import dry_card from "../dryData/dry_card";
import type dry_system from "../dryData/dry_system";

class Card {
    baseID : string;
    creationIndex : number;

    effects : effect[] = [];
    pos : position = new position(0);
    img : string = "";
    attr : Map<string, number> = new Map();
    canAct : boolean = true

    constructor(baseID : string = "", n : number){
        this.baseID = baseID
        this.creationIndex = n
    }

    get id() {return this.baseID + "_" + this.creationIndex}

    toDry(){
        return new dry_card(this)
    }

    getResponseIndexArr(system : dry_system, a : action) : number[]{
        //returns the effect ids that respond
        let res : number[] = []
        this.effects.forEach((i, index) => {
            if(i.canRespondAndActivate(this, system, a)) res.push(index)
        })
        return res
    }; 
    activateEffect(idx : number, system : dry_system, a : action) : res {
        if(!this.effects[idx]){
            let err = new wrongEffectIdx(idx, this.id)
            err.add("card.ts", "activateEffect", 25)
            return [err, undefined]
        }
        //assumes can activate
        //fix later
        if(a instanceof activateEffect)
            return [undefined, this.effects[idx].activate(this, system)];
        else 
            return [undefined, this.effects[idx].activate(this, system, a)]
    }
    turnReset(a : turnReset) : action[]{
        this.canAct = true
        //refresh once here
        //should override
        return []
    }
}

export default Card