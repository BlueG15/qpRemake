import dry_effect from "../dryData/dry_effect";
import type dry_system from "../dryData/dry_system";
import type action from "./action"
import type card from "./card";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event

class Effect {
    type: string = "";
    subTypes: string[] = []
    desc: string = "";

    canRespondDuringChain : boolean
    canRespondDuringTrigger : boolean
    //note to self: may make a modifier array
    //solely for checking purposes
    //see, my original plan was for like once and unique and such to
    //inherit this and modifies something here to implement their functionality
    //ima still do that since thats is easier to immagine and bullshit like once unique dont happen
    //but we need to keep track of what sub-types we have for display / checking purposes
    
    attr: Map<string, number> = new Map(); //position and stuff is in here

    canRespondAndActivate(c : card, system : dry_system, a : action){return false}

    activate(c : card, system : dry_system) : action[] //normal activate, no passing in action since action is ..activate this effect
    activate(c : card, system : dry_system, a : action) : action[] //passive activate
    activate(c : card, system : dry_system, a? : action) : action[] {return []};
 
    constructor(type : string, canRespondDuringChain : boolean = false, canRespondDuringTrigger : boolean = false){
        this.type = type
        this.canRespondDuringChain = canRespondDuringChain
        this.canRespondDuringTrigger = canRespondDuringTrigger
    }

    addSubType(str : string){
        this.subTypes.push(str)
    }

    removeSubType(str : string){
        this.subTypes = this.subTypes.filter(i => i !== str)
    }
    
    toDry() : dry_effect {
        return new dry_effect(this)
    }

    //effect types:

    // + trigger : 
    // responds to "effect resolution"
    // adds each action return as a new tree

    // + chained trigger : 
    // responds to "effect activation"
    // adds a "activate effect" action as a child node to the current node, which activates this one

    // + passive :
    // responds to "effect activation"
    // may modifies the action it responds to
    // adds the effect to the current node as a child node to the current node
}

export default Effect