import dry_effect from "../dryData/dry_effect";
import type dry_system from "../dryData/dry_system";
import type action from "./action"
import type card from "./card";
import type effectSubtype from "./effectSubtype";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event

class Effect {
    id: string
    type: string = "";
    subTypes: effectSubtype[] = []
    desc: string = "";

    isDisabled: boolean = false //I DO NOT LIKE THIS NAME

    //note to self: may make a modifier array
    //solely for checking purposes
    //see, my original plan was for like once and unique and such to
    //inherit this and modifies something here to implement their functionality
    //ima still do that since thats is easier to immagine and bullshit like once unique dont happen
    //but we need to keep track of what sub-types we have for display / checking purposes
    
    attr: Map<string, number> = new Map(); //position and stuff is in here

    //actual effects override these two
    canRespondAndActivate_proto(c : card, system : dry_system, a : action) : boolean{return false}
    activate_proto(c : card, system : dry_system, a : action) : action[] {return []};

    //effectTypes override these
    canRespondAndActivate_type(c : card, system : dry_system, a : action) : -1 | boolean{return -1}

    canRespondAndActivate(c : card, system : dry_system, a : action) : boolean{
        let res : -1 | boolean = -1;
        if(this.isDisabled) return false
        for(let i = 0; i < this.subTypes.length; i++){
            //if any non-disabled subtype returns returns that instead
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].canActivate(c, system, a);
            if(res === -1) continue;
            return res
        }
        res = this.canRespondAndActivate_type(c, system, a);
        if(res !== -1) return res;
        return this.canRespondAndActivate_proto(c, system, a)
    }
    activate(c : card, system : dry_system, a : action) : action[]{
        if(this.isDisabled) return []
        let res : -1 | [boolean, action[]] = -1;
        let final : action[] = []
        for(let i = 0; i < this.subTypes.length; i++){
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].activate(c, system, a);
            if(res === -1) continue;
            if(res[0] === true) final.push(...res[1]);
            else return res[1]
        }
        return final.concat(...this.activate_proto(c, system, a))
    };
 
    constructor(id: string, type : string){
        this.id = id
        this.type = type
    }

    //fix later
    // addSubType(str : string){
    //     this.subTypes.push(str)
    // }

    // removeSubType(str : string){
    //     this.subTypes = this.subTypes.filter(i => i !== str)
    // }
    
    toDry() : dry_effect {
        return new dry_effect(this)
    }

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
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