// import type { dry_card, dry_system, inputData } from "../../data/systemRegistry";
import type { EffectData, EffectModifier, IdAble,  TargetEffect, EffectDry, SystemDry, CardDry, Action, EffectDataID } from "../../core";
import type { InputRequest } from "../../system-components/inputs";
import { EffectControlCode, EffectDataRegistry, Target } from "../../core";

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

export abstract class Effect<T_InputTuple extends Target[] = Target[] | []> implements EffectDry {
    id: string;
    private _dataID : EffectDataID;
    get dataID(){return this._dataID}
    type: EffectModifier;
    subTypes: EffectModifier[]
    originalData : EffectData

    canAct: boolean = true
    
    attr : EffectAttr;

    constructor(id : string, dataID : EffectDataID, type : EffectModifier, subTypes: EffectModifier[] = [], data : EffectData){
        this.id = id
        this.type = type
        this.subTypes = subTypes
        this._dataID = dataID;
        this.originalData = data;

        const k = Object.entries(data).filter(([_, val]) => typeof val === "number") as [string, number][]

        this.attr = new EffectAttr(new Map<string, number>(k))
    }

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
    protected abstract canRespondAndActivate(c : CardDry, s : SystemDry, a : Action) : boolean
    //get input should be deterministic
    //activate once per activate call
    protected abstract getInputObj(c : CardDry, s : SystemDry, a : Action) : T_InputTuple extends [] ? (void | undefined) 
    : InputRequest<T_InputTuple>
    protected abstract activate(c : CardDry, s : SystemDry, a : Action, input : T_InputTuple extends [] ? (void | undefined) 
    : {
        [K in keyof T_InputTuple] : T_InputTuple[K]["data"]
    }) : Action[];

    static getEffData?() : {base : EffectData, upgrade? : Partial<EffectData>}

    private static getInputIfCanActivate(e : Effect<Target[]>, c : CardDry, s : SystemDry, a : Action){
        //preliminary canActivate check
        let _resSubTypeResult : EffectControlCode | boolean = EffectControlCode.DoNothingAndPass;
        let _resTypeResult : EffectControlCode | boolean = EffectControlCode.DoNothingAndPass;
        
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
        trueForceFlag_type = (_resTypeResult === EffectControlCode.ForceTrue)
        falseForceFlag_type = (_resTypeResult === EffectControlCode.ForceFalse)
        skipSubtypeCheck = (_resTypeResult === EffectControlCode.DoNothingAndIgnoreSubType) 

        for(let i = 0; i < e.subTypes.length; i++){
            //if any non-disabled subtype returns returns that instead
            if(e.subTypes[i].isDisabled) continue
            _resSubTypeResult = e.subTypes[i].canRespondAndActivate(e, c, s, a);
            if(_resSubTypeResult === EffectControlCode.DoNothingAndPass) continue;
            if(_resSubTypeResult === EffectControlCode.DoNothingAndIgnoreType) {skipTypeCheck = true; continue;}
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

    static checkCanActivate(e : Effect<Target[]>, c : CardDry, s : SystemDry, a : Action){
        return Effect.getInputIfCanActivate(e, c, s, a) !== false
    }

    /**
     * Run canActivate then getInput 
     * Returns undefif cannot activate
     * Returns tuple [input, callback] if can
     * */
    static tryActivate(e : Effect<Target[]>, c : CardDry, s : SystemDry, a : Action) : 
    undefined | 
    [undefined, () => Action[]] | 
    [InputRequest<Target[]>, (i : Target[]) => Action[]] 
    {
        const input = Effect.getInputIfCanActivate(e, c, s, a)
        if(input === false) return;

        function onAfterActivate(res : Action[]){
            res = e.type.overrideActivateResults(e, c, s, res)
            return e.subTypes.reduce((res, st) => st.overrideActivateResults(e, c, s, res), res)
        }

        if(input === undefined){
            return [undefined, () => 
                onAfterActivate( (e as Effect<[]>).activate(c, s, a, undefined) )
            ]
        } else {
            return [input, i => 
                onAfterActivate( e.activate(c, s, a, i.map(i => i.data)) )
            ];
        }
    }

    getSubtypeidx(subtypeID : number){
        return this.subTypes.findIndex(st => st.dataID === subtypeID);
    }

    get displayID() : string {return this.originalData.localizationKey ?? EffectDataRegistry.getKey(this.dataID)}

    addSubType(st : EffectModifier){
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
    is(p : IdAble) : boolean;
    is(p : IdAble | Function ){
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

    abstract getDisplayInput(c : CardDry, system : SystemDry) : (string | number)[];

    reset() : Action[] {
        this.enable()
        // return this.subTypes.flatMap(i => i.reset())
        return []
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
    get identity() : TargetEffect {
        return Target.effect(this)
    }
}
