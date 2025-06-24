import type { dry_card, dry_effect, dry_system } from "../../../data/systemRegistry";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "./card";
import type effectSubtype from "./effectSubtype";
import type { effectData } from "../../../data/cardRegistry";
import EffectType from "./effectType";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event

class Effect {
    id: string;
    dataID : string;
    type: EffectType;
    subTypes: effectSubtype[]
    readonly originalData : effectData

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
        return this.type.dataID
    }

    get signature_type_subtype() : string {
        let sep = "==="
        return this.signature_type + sep + this.subTypes.map(i => i.dataID).join(sep) 
    }

    //actual effects override these two
    canRespondAndActivate_final(c : dry_card, system : dry_system, a : Action) : boolean{return false}
    activate_final(c : dry_card, system : dry_system, a : Action) : Action[] {return []};

    canRespondAndActivate(c : Card, system : dry_system, a : Action) : boolean {
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
            // return new subTypeOverrideConflict(c.id, this.id, overrideIndexes)
            return false
        }
        if(trueForceFlag) return true;
        if(falseForceFlag) return false;

        if(!skipTypeCheck){
            res = this.type.canRespondAndActivate(c, system, a);
            if(res !== -1) return res;
        } 
        return this.canRespondAndActivate_final(c, system, a);
    }
    activate(c : Card, system : dry_system, a : Action) : Action[]{
        if(this.isDisabled) return []
        if(!c.canAct) return []
        let res : -1 | Action[] = -1;
        let appenddedRes : Action[] = [] 
        
        for(let i = 0; i < this.subTypes.length; i++){
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].onEffectActivate(c, this, system, a);
            if(res === -1) continue;
            appenddedRes.push(...res);
        }
        
        let final = this.activate_final(c, system, a).concat(appenddedRes)
        this.type.parseAfterActivate(c, system, final);
        this.subTypes.forEach(st => st.parseAfterActivate(c, this, system, final));
        return final;
    };

    //DO NOT OVERRIDE THESE
    getSubtypeidx(subtypeID : string){
        for(let i = 0; i > this.subTypes.length; i++){
            if(this.subTypes[i].dataID === subtypeID) return i;
        }
        return -1
    }

    //activateSubtypeSpecificFunc(subtypeID : string, c : card, system : dry_system, a : action) : action[] 
    //activateSubtypeSpecificFunc(subtypeidx : number, c : card, system : dry_system, a : action) : action[]
    activateSubtypeSpecificFunc(subtypeIdentifier : string | number, c : Card, system : dry_system, a : Action) : Action[]{
        if(typeof subtypeIdentifier === "string"){
            subtypeIdentifier = this.getSubtypeidx(subtypeIdentifier);
        }
        if(subtypeIdentifier < 0) return []
        return this.subTypes[subtypeIdentifier].activateSpecificFunctionality(c, this, system, a);
    }
 
    constructor(id : string, dataID : string, type : EffectType, subTypes: effectSubtype[] = [], data : effectData){
        this.id = id
        this.type = type
        this.subTypes = subTypes
        this.dataID = dataID;
        this.originalData = data;

        Object.entries(data).forEach(([key, val]) => {
            if(typeof val === "number"){
                this.attr.set(key, val)
            }
        })
    }

    get displayID() : string {return this.originalData.displayID_default ?? this.dataID}

    addSubType(st : effectSubtype){
        this.subTypes.push(st)
    }

    removeSubType(stid : string){
        this.subTypes = this.subTypes.filter(i => i.dataID !== stid)
    }
    
    toDry() : dry_effect {
        return this
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
    getDisplayInput(c : dry_card, system : dry_system) : (string | number)[] {return []}

    reset() : Action[] {
        let res : Action[] = []
        this.subTypes.forEach(i => res.push(...i.reset()))
        return res;
    }

    toString(spaces : number = 2){
        return JSON.stringify({
            dataID : this.dataID,
            subTypes : this.subTypes,
            // desc : this.desc,
            attr : JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces)
    }
}

export default Effect