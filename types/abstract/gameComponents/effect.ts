import dry_effect from "../../data/dry/dry_effect";
import type dry_system from "../../data/dry/dry_system";
import type action from "./action"
import type card from "./card";
import type effectSubtype from "./effectSubtype";
import { subTypeOverrideConflict } from "../../errors";
import type { effectData } from "../../data/cardRegistry";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event

class Effect {
    id: string;
    type: string = "";
    subTypes: effectSubtype[]
    displayID: string

    isDisabled: boolean = false //I DO NOT LIKE THIS NAME

    //note to self: may make a modifier array
    //solely for checking purposes
    //see, my original plan was for like once and unique and such to
    //inherit this and modifies something here to implement their functionality
    //ima still do that since thats is easier to immagine and bullshit like once unique dont happen
    //but we need to keep track of what sub-types we have for display / checking purposes
    //^ done, status effect and subType is a thing
    
    attr: Map<string, number> = new Map(); //position and stuff is in here

    get signature_type() : string {
        return this.type
    }

    get signature_type_subtype() : string {
        let sep = "==="
        return this.signature_type + sep + this.subTypes.map(i => i.id).join(sep) 
    }

    //actual effects override these two
    canRespondAndActivate_proto(c : card, system : dry_system, a : action) : boolean{return true}
    activate_proto(c : card, system : dry_system, a : action) : action[] {return []};

    //effectTypes override these
    canRespondAndActivate_type(c : card, system : dry_system, a : action) : -1 | boolean{return -1}

    canRespondAndActivate(c : card, system : dry_system, a : action) : boolean | subTypeOverrideConflict{
        let res : -1 | -2 | boolean = -1;
        
        let trueForceFlag = false
        let falseForceFlag = false

        let overrideIndexes : number[] = []
        let skipTypeCheck = false

        if(this.isDisabled) return false
        if(!c.canAct) return false
        for(let i = 0; i < this.subTypes.length; i++){
            //if any non-disabled subtype returns returns that instead
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].onEffectCheckCanActivate(c, this, system, a);
            if(res === -1) continue;
            if(res === -2) { skipTypeCheck = true; continue;}
            if(res) trueForceFlag = true;
            else falseForceFlag = true
            overrideIndexes.push(i)
        }
        //resolvin conflict
        if(trueForceFlag && falseForceFlag){
            //conflict exists
            //false is prioritized
            return new subTypeOverrideConflict(c.id, this.id, overrideIndexes)
        }
        if(trueForceFlag) return true;
        if(falseForceFlag) return false;

        if(!skipTypeCheck){
            res = this.canRespondAndActivate_type(c, system, a);
            //if(system.isInTriggerPhase) console.log(" type check occurs, res is ", res);
            if(res !== -1) return res;
        } 
        return this.canRespondAndActivate_proto(c, system, a);
    }
    activate(c : card, system : dry_system, a : action) : action[]{
        if(this.isDisabled) return []
        if(!c.canAct) return []
        let res : -1 | action[] = -1;
        let appenddedRes : action[] = [] 
        
        for(let i = 0; i < this.subTypes.length; i++){
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].onEffectActivate(c, this, system, a);
            if(res === -1) continue;
            appenddedRes.push(...res);
        }
        
        return this.activate_proto(c, system, a).concat(appenddedRes)
    };

    //DO NOT OVERRIDE THESE
    getSubtypeidx(subtypeID : string){
        for(let i = 0; i > this.subTypes.length; i++){
            if(this.subTypes[i].id === subtypeID) return i;
        }
        return -1
    }

    //activateSubtypeSpecificFunc(subtypeID : string, c : card, system : dry_system, a : action) : action[] 
    //activateSubtypeSpecificFunc(subtypeidx : number, c : card, system : dry_system, a : action) : action[]
    activateSubtypeSpecificFunc(subtypeIdentifier : string | number, c : card, system : dry_system, a : action) : action[]{
        if(typeof subtypeIdentifier === "string"){
            subtypeIdentifier = this.getSubtypeidx(subtypeIdentifier);
        }
        if(subtypeIdentifier < 0) return []
        return this.subTypes[subtypeIdentifier].activateSpecificFunctionality(c, this, system, a);
    }
 
    constructor(id : string, subTypes: effectSubtype[] = [], displayID? : string){
        this.id = id
        this.type = "default"
        this.subTypes = subTypes
        this.displayID = displayID ? displayID : id
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

    // + passive :
    // responds to "effect activation"
    // may modifies the action it responds to
    // adds the effect to the current node as a child node to the current node

    // + chained trigger : 
    // responds to "effect activation"
    // adds a "activate effect" action as a child node to the current node, which activates this one

    //^ implemented

    //should override
    getDisplayInput() : (string | number)[] {return []}
}

export default Effect