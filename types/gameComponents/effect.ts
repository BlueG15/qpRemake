import type { dry_card, dry_system, inputData, inputDataSpecific } from "../../data/systemRegistry";
import { actionFormRegistry, type Action } from "../../_queenSystem/handler/actionGenrator";
import type EffectSubtype from "./effectSubtype";
import type { effectData, patchData_full } from "../../data/cardRegistry";
import type EffectType from "./effectType";
import type { id_able } from "../misc";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event
import type { InputRequester, inputRequester_finalized } from "../../_queenSystem/handler/actionInputGenerator";
import registryAPI from "./API";

export enum controlCode {
    doNothingAndPass,
    doNothingAndSkipTypeCheck,
    doNothingAndSkipSubTypeCheck
}

class EffectAttr {
    constructor(
        public attr : Map<string, number>
    ){}
    get(key : string){
        return this.attr.get(key);
    }
    set(key : string, val : number){
        this.attr.set(key, val)
    }
    number(key : string){
        return this.get(key) ?? 0;
    }
    bool(key : string){
        return this.get(key) != 0
    }
}

export default abstract class Effect<T_InputTuple extends inputData[] = inputData[] | []> {
    id: string;
    dataID : string;
    type: EffectType;
    subTypes: EffectSubtype[]
    originalData : effectData

    canAct: boolean = true

    //note to self: may make a modifier array
    //solely for checking purposes
    //see, my original plan was for like once and unique and such to
    //inherit this and modifies something here to implement their functionality
    //ima still do that since thats is easier to immagine and bullshit like once unique dont happen
    //but we need to keep track of what sub-types we have for display / checking purposes
    //^ done, status effect and subType is a thing
    
    attr : EffectAttr;
    _setAttr(m : Map<string, number>){
        this.attr.attr = m
    }

    get signature_type() : string {
        return String(this.type.dataID)
    }

    get signature_type_subtype() : string {
        const sep = "==="
        return this.signature_type + sep + this.subTypes.map(i => i.dataID).join(sep) 
    }

    //actual effects override these two
    protected abstract canRespondAndActivate(c : dry_card, s : dry_system, a : Action) : boolean
    //get input should be deterministic
    //activate once per activate call
    protected abstract getInputObj(c : dry_card, s : dry_system, a : Action) : T_InputTuple extends [] ? (void | undefined) : InputRequester<any, T_InputTuple>
    protected abstract activate(c : dry_card, s : dry_system, a : Action, input : T_InputTuple extends [] ? undefined : {
        [K in keyof T_InputTuple] : T_InputTuple[K]["data"]
    }) : Action[];

    static getEffData?() : {base : effectData, upgrade? : Partial<effectData>}

    private static getInputIfCanActivate(e : Effect<inputData[]>, c : dry_card, s : dry_system, a : Action){
        //preliminary canActivate check
        let _resSubTypeResult : controlCode | boolean = controlCode.doNothingAndPass;
        let _resTypeResult : controlCode | boolean = controlCode.doNothingAndPass;
        
        let skipTypeCheck = false
        let skipSubtypeCheck = false
        
        let trueForceFlag = false
        let falseForceFlag = false

        let trueForceFlag_type = false
        let falseForceFlag_type = false
        let trueForceFlag_subtype = false
        let falseForceFlag_subtype = false

        if(!e.canAct || !c.canAct) return false;

        _resTypeResult = e.type.canRespondAndActivate(e, c, s, a)
        trueForceFlag_type = (_resTypeResult === true)
        falseForceFlag_type = (_resTypeResult === false)
        skipSubtypeCheck = (_resTypeResult === controlCode.doNothingAndSkipSubTypeCheck) 

        for(let i = 0; i < e.subTypes.length; i++){
            //if any non-disabled subtype returns returns that instead
            if(e.subTypes[i].isDisabled) continue
            _resSubTypeResult = e.subTypes[i].onEffectCheckCanActivate(c, e, s, a);
            if(_resSubTypeResult === controlCode.doNothingAndPass) continue;
            if(_resSubTypeResult === controlCode.doNothingAndSkipTypeCheck) {skipTypeCheck = true; continue;}
            if(_resSubTypeResult) trueForceFlag_subtype = true;
            else falseForceFlag_subtype = true
        }
        
        if(!skipTypeCheck || !skipSubtypeCheck){
            if(!skipTypeCheck && !skipSubtypeCheck){
                trueForceFlag = trueForceFlag_type || trueForceFlag_subtype
                falseForceFlag = falseForceFlag_type || falseForceFlag_subtype
            }
            else if(!skipTypeCheck){
                trueForceFlag = trueForceFlag_type
                falseForceFlag = falseForceFlag_type
            }
            else if(!skipSubtypeCheck){
                trueForceFlag = trueForceFlag_subtype
                falseForceFlag = falseForceFlag_subtype
            }
        }

        //resolving conflict
        if(falseForceFlag) return false;
        
        //actual condition check
        const cond = e.canRespondAndActivate(c, s, a)
        if(!cond) return false;

        const input = e.getInputObj(c, s, a)
        if(input && !input.hasInput()) return false;

        return input
    }

    static checkCanActivate(e : Effect<inputData[]>, c : dry_card, s : dry_system, a : Action){
        return Effect.getInputIfCanActivate(e, c, s, a) !== false
    }

    /**
     * Run canActivate then getInput 
     * Returns undefif cannot activate
     * Returns tuple [input, callback] if can
     * */
    static tryActivate(e : Effect<inputData[]>, c : dry_card, s : dry_system, a : Action) : 
    undefined | 
    [undefined, () => Action[]] | 
    [InputRequester<any, inputData[]>, (i : inputRequester_finalized<inputData[]>) => Action[]] 
    {
        const input = Effect.getInputIfCanActivate(e, c, s, a)
        if(input === false) return;

        function onAfterActivate(res : Action[]){
            res = e.type.overrideActivateResults(e, c, s, res)
            return e.subTypes.reduce((res, st) => st.overrideActivateResults(c, e, s, res), res)
        }

        if(input === undefined){
            return [undefined, () => 
                onAfterActivate( (e as Effect<[]>).activate(c, s, a, undefined) )
            ]
        } else {
            return [input, (i) => 
                onAfterActivate( e.activate(c, s, a, i.next().map(i => i.data)) )
            ];
        }
    }

    getSubtypeidx(subtypeID : number){
        return this.subTypes.findIndex(st => st.dataID === subtypeID);
    }
 
    constructor(id : string, dataID : string, type : EffectType, subTypes: EffectSubtype[] = [], data : effectData){
        this.id = id
        this.type = type
        this.subTypes = subTypes
        this.dataID = dataID;
        this.originalData = data;

        const k = Object.entries(data).filter(([_, val]) => typeof val === "number") as [string, number][]

        this.attr = new EffectAttr(new Map<string, number>(k))
    }

    get displayID() : string {return this.originalData.localizationKey ?? this.dataID}

    addSubType(st : EffectSubtype){
        this.subTypes.push(st)
    }

    removeSubType(stid : number){
        this.subTypes = this.subTypes.filter(i => i.dataID !== stid)
    }

    /** @final */
    disable(){
        this.canAct = true
    }

    /** @final */
    toDry(){
        return this
    }

    /** @final */
    enable() {
        this.canAct = false
    }

    /** @final */
    is<T extends new (...p : any) => any>(p : T) : this is T;
    is(p : id_able) : boolean;
    is(p : id_able | Function ){
        return typeof p === "function" ? this instanceof p : this.id === p.id
    }

    //common variables
    get count() {return this.attr.number("count")}
    get doArchtypeCheck() {return this.attr.bool("doArchtypeCheck")}
    get checkLevel() {return this.attr.number("checkLevel")}
    get mult() {return this.attr.number("mult")}

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

    abstract getDisplayInput(c : dry_card, system : dry_system) : (string | number)[];

    reset() : Action[] {
        this.enable()
        return this.subTypes.flatMap(i => i.reset())
    }

    toString(spaces : number = 2){
        return JSON.stringify({
            dataID : this.dataID,
            subTypes : this.subTypes,
            // desc : this.desc,
            attr : JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces)
    }

    /**Returns this effect as a "cause" object to be input to actions*/
    toCause(s : dry_system, c : dry_card){
        return actionFormRegistry.effect(s, c, this)
    }
}
