import type { dry_card, dry_system, inputDataSpecific, inputType, inputData, inputData_standard, inputData_bool, inputData_num } from "../../../data/systemRegistry";
import { Action_class, type Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "./card";
import type effectSubtype from "./effectSubtype";
import type { effectData } from "../../../data/cardRegistry";
import EffectType from "./effectType";
import { id_able, StrictGenerator } from "../../misc";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event
import { inputRequester, inputRequester_finalized } from "../../../_queenSystem/handler/actionInputGenerator";

class Effect<inputTupleType extends inputData[] = inputData[]> {
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
        const sep = "==="
        return this.signature_type + sep + this.subTypes.map(i => i.dataID).join(sep) 
    }

    //actual effects override these two
    canRespondAndActivate_final(c : dry_card, system : dry_system, a : Action) : boolean{return false}
    activate_final(c : dry_card, s : dry_system, a : Action, input : inputTupleType extends [] ? undefined : inputRequester_finalized<inputTupleType>) : Action[] {return []};
    
    private __cached_input : {
        hasValue : false
    } | {
        hasValue : true
        value : inputTupleType extends [] ? undefined : inputRequester<any, inputTupleType>
    } = {
        hasValue : false
    }

    
    /** @final */
    getInputObj(c : dry_card, s : dry_system, a : Action) : inputTupleType extends [] ? undefined : inputRequester<any, inputTupleType> {
        if(this.__cached_input.hasValue) return this.__cached_input.value;
        this.__cached_input = {
            hasValue : true,
            value : this.createInputObj(c, s, a)
        }
        return this.__cached_input.value
    }

    //createInputObj should be deterministic
    //activate once per activate call
    createInputObj(c : dry_card, s : dry_system, a : Action) : inputTupleType extends [] ? undefined : inputRequester<any, inputTupleType> { 
        return undefined as any 
    }

    //Update 1.2.6 : Move the condition closer to the activate, i.e inside it
    //to avoid condition conflicts

    //can repond -> 2 functions, canRespond_prelim and canRespond_final
    /** @final */
    canRespondAndActivate_prelim(c : Card, system : dry_system, a : Action) : boolean {
        let res : -1 | -2 | boolean = -1;
        
        let trueForceFlag = false
        let falseForceFlag = false

        const overrideIndexes : number[] = []
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
            res = this.type.canRespondAndActivate(this, c, system, a);
            if(res !== -1) return res;
        } 

        //has input check
        const gen = this.getInputObj(c, system, a)
        if(gen !== undefined && !gen.hasInput()) return false;

        // return this.canRespondAndActivate_final(c, system, a);
        return true
    }

    /** @final */
    activate(c : Card, system : dry_system, a : Action, input : inputTupleType extends [] ? undefined : inputRequester_finalized<inputTupleType>) : Action[] {
        this.__cached_input = {
            hasValue : false
        }
        
        if(!this.canRespondAndActivate_final(c, system, a)){
            return [] 
        }
        
        if(this.isDisabled) return []
        if(!c.canAct) return []
        let res : -1 | Action[] = -1;
        const appenddedRes : Action[] = [] 
        
        for(let i = 0; i < this.subTypes.length; i++){
            if(this.subTypes[i].isDisabled) continue
            res = this.subTypes[i].onEffectActivate(c, this, system, a);
            if(res === -1) continue;
            appenddedRes.push(...res);
        }

        const final = this.activate_final(c, system, a, input)
        this.type.parseAfterActivate(this, c, system, final);
        this.subTypes.forEach(st => st.parseAfterActivate(c, this, system, final));
        return final;
    };

    /** @final */
    getSubtypeidx(subtypeID : string){
        for(let i = 0; i > this.subTypes.length; i++){
            if(this.subTypes[i].dataID === subtypeID) return i;
        }
        return -1
    }

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

    /** @final */
    disable(){
        this.isDisabled = true
    }

    /** @final */
    toDry(){
        return this
    }

    /** @final */
    enable() {
        this.isDisabled = false
    }

    /** @final */
    is(p : Function) : this is boolean;
    is(p : id_able) : boolean;
    is(p : id_able | Function ){
        return typeof p === "function" ? this instanceof p : this.id === p.id
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

    getDisplayInput(c : dry_card, system : dry_system) : (string | number)[] {return []}

    reset() : Action[] {
        const res : Action[] = []
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
