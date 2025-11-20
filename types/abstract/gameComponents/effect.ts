import type { dry_card, dry_system, inputDataSpecific, inputType, inputData, inputData_standard, inputData_bool, inputData_num, dry_effect, dry_zone, dry_position, inputData_card, inputData_zone } from "../../../data/systemRegistry";
import { Action_class, actionFormRegistry, type Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "./card";
import type EffectSubtype from "./effectSubtype";
import type { effectData } from "../../../data/cardRegistry";
import EffectType from "./effectType";
import { id_able, StrictGenerator } from "../../misc";

//some effects can modify event data 
//so in general, activate takes in an event and spits out an event
import { inputFormRegistry, inputRequester, inputRequester_finalized } from "../../../_queenSystem/handler/actionInputGenerator";
import Request from "../../../_queenSystem/handler/actionInputRequesterGenerator";
import { zoneRegistry } from "../../../data/zoneRegistry";

class Effect<inputTupleType extends inputData[] = inputData[]> {
    id: string;
    dataID : string;
    type: EffectType;
    subTypes: EffectSubtype[]
    readonly originalData : effectData

    isDisabled: boolean = false //I DO NOT LIKE THIS NAME

    //note to self: may make a modifier array
    //solely for checking purposes
    //see, my original plan was for like once and unique and such to
    //inherit this and modifies something here to implement their functionality
    //ima still do that since thats is easier to immagine and bullshit like once unique dont happen
    //but we need to keep track of what sub-types we have for display / checking purposes
    //^ done, status effect and subType is a thing
    
    attr: Map<string, number>; //position and stuff is in here

    get signature_type() : string {
        return this.type.dataID
    }

    get signature_type_subtype() : string {
        const sep = "==="
        return this.signature_type + sep + this.subTypes.map(i => i.dataID).join(sep) 
    }

    //actual effects override these two
    canRespondAndActivate_final(c : dry_card, system : dry_system, a : Action) : boolean{return this.constructor.name !== "Effect"}
    activate_final(c : dry_card, s : dry_system, a : Action, input : inputTupleType extends [] ? undefined : inputRequester_finalized<inputTupleType>) : Action[] {return []};

    private __cached_input : {
        hasValue : false
    } | {
        hasValue : true
        value : inputTupleType extends [] ? undefined : inputRequester<any, inputTupleType>
    } = {
        hasValue : false
    }

    //@unmodifiable
    addedInputConditionMap : Partial<{
        c(c : dry_card) : boolean,
        e(e : dry_effect) : boolean,
        z(z : dry_zone) : boolean,
        p(p : dry_position) : boolean,
        n(n : number) : boolean,
        //TODO : add more if needed
    }> = {}

    
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
    createInputObj(c : dry_card, s : dry_system, a : Action) 
    : inputTupleType extends [] ? undefined : inputRequester<any, inputTupleType> 
    { 
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

        if(this.overrideActivationCondition && !this.overrideActivationCondition.bind(this)(c, system, a)){
            return []
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
 
    constructor(id : string, dataID : string, type : EffectType, subTypes: EffectSubtype[] = [], data : effectData){
        this.id = id
        this.type = type
        this.subTypes = subTypes
        this.dataID = dataID;
        this.originalData = data;

        const k = Object.entries(data).filter(([_, val]) => typeof val === "number") as [string, number][]

        this.attr = new Map<string, number>(k)
    }

    get displayID() : string {return this.originalData.displayID_default ?? this.dataID}

    addSubType(st : EffectSubtype){
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

    //common variables
    get count() {return this.attr.get("count") ?? 0}
    get doArchtypeCheck() {return this.attr.get("doArchtypeCheck") != 0} //!= is intentional to allow undefine = 0
    get checkLevel() {return this.attr.get("checkLevel") ?? 0}
    get mult() {return this.attr.get("mult") ?? 1}

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

    getDisplayInput(c : dry_card, system : dry_system) : (string | number)[] {
        return Object.keys(this.originalData).sort().map(k => this.attr.get(k) ?? 0)
    }

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

    cause(s : dry_system, c : dry_card){
        return actionFormRegistry.effect(s, c, this)
    }

    //static section
    //an effect derived from Effect has 4 jobs
    // 1. overriding createInputObj
    // 2. overriding canRespondAndActivate_final
    // 3. overriding activate_final
    // 4. overriding getDisplayInput

    //a static quick class creation solution solves 1, 2 or 3
    private overrideActivationCondition? : (this : Effect<any>, ...p : [dry_card, dry_system, Action]) => boolean
    static listen(
        f : Exclude<Effect<any>["overrideActivationCondition"], undefined>
    ) : typeof Effect {
        return class ExtendedEff extends this {
            constructor(...p : [any, any, any, any, any]){
                super(...p);
                this.overrideActivationCondition = f.bind(this)
            }
        } as any
    }

    static beforeActivate<T extends new (...p : any[]) => Effect<any>>(
        this : T, 
        f : (this : Effect<any>, ...p : Parameters<ObjAfterConstructor<T>["activate_final"]>) => void
    ) : typeof Effect {
        return class ExtendedEff extends this {
            override activate_final(...p : Parameters<ObjAfterConstructor<T>["activate_final"]>): Action[] {
                const k = p as [any, any, any, any]
                (f.bind(this))(...k as any)
                return super.activate_final(...k);
            }
        } as any
    }  

    /**then 
     * Allows the quick creation of a new effect class
     * overriding the original action[] result
     * Does NOT asks for more input
     * */
    static then<T extends new (...p : any[]) => Effect<any>>(
        this : T, 
        f : (this : Effect<any>, res : Action[], ...p : Parameters<ObjAfterConstructor<T>["activate_final"]>) => Action[]
    ) : typeof Effect {
        return class ExtendedEff extends this {
            override activate_final(...p : Parameters<ObjAfterConstructor<T>["activate_final"]>): Action[] {
                const k = p as [any, any, any, any]
                const res = super.activate_final(...k);
                return (f.bind(this))(res, ...k as any)
            }
        } as any
    }  
    
    static thenShares<T extends new (...p : any[]) => Effect<any>>(
        this : T,
        f : (this : Effect<any>, res : Action[], ...p : [...Parameters<ObjAfterConstructor<T>["activate_final"]>, Effect<any>]) => [string, number]
    ) : typeof Effect {
        return class ExtendedEff extends this {
            override activate_final(...p : Parameters<ObjAfterConstructor<T>["activate_final"]>): Action[] {
                const k = p as [any, any, any, any]
                const res = super.activate_final(...k);
                const [key, val] = f.bind(this)(res, ...p, this);
                p[0].addShareMemory(this, key, val);
                return res
            }
        } as any
    }

    static implyCondition<
        T extends new (...p : any[]) => Effect<any>, 
        K extends keyof Effect["addedInputConditionMap"]
    >(
        this : T,
        type : K, 
        cond : (
            this : Effect<any>,
            p : Parameters<Exclude<Effect["addedInputConditionMap"][K], undefined>>[0], 
            ...p2 : Parameters<Exclude<Effect["overrideActivationCondition"], undefined>>
        ) => boolean){
        return class ExtendedEff extends this {
            override createInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_standard[], inputData_standard[], inputData_standard, inputData_standard, inputData_standard[]> {
                this.addedInputConditionMap[type] = 
                    ((c : dry_card, s : dry_system, a : Action) => 
                        (target : any) => 
                            cond.bind(this)(target, c, s, a))
                    (c, s, a);
                const res = super.createInputObj(c, s, a);
                delete this.addedInputConditionMap[type]
                return res as any;
            }
        } as T
    }

    static removeInput<
        T extends new (...p : any[]) => Effect<any>,
        oldInputType extends inputData[] = T extends new (...p : any[]) => Effect<infer X> ? (X extends [] ? never : X) : never
    >(
        this : T,
        converter : (this : Effect<any>, ...p : [dry_card, dry_system, Action]) => oldInputType | oldInputType[],
    ){
        const originalClass = this as unknown as new (...p : any[]) => Effect<[]> //type dance to convert old -> new
        return class ExtendedEff extends originalClass {
            override createInputObj(c: dry_card, s: dry_system, a: Action){
                return undefined
            }

            override activate_final(c: dry_card, s: dry_system, a: Action): Action[] {
                const oldInput = converter.bind(this)(c, s, a)
                const testObj = oldInput[0]
                if(!testObj || !Array.isArray(testObj)) return super.activate_final(c, s, a, {next : () => oldInput} as any);
                return testObj.flatMap(o => super.activate_final(c, s, a, {next : () => o} as any))
            }
        } as unknown as typeof Effect<[]>
    }

    static retarget<
        newInputType extends inputData[],
        T extends new (...p : any[]) => Effect<any>,
        oldInputType extends inputData[] = T extends new (...p : any[]) => Effect<infer X> ? (X extends [] ? never : X) : never
    >(
        this : T,
        newInputFunc : (this : Effect<any>, ...p : [dry_card, dry_system, Action]) => inputRequester<any, newInputType>,
        converter : (this : Effect<any>, newInput : newInputType, ...p : [dry_card, dry_system, Action]) => oldInputType | oldInputType[],
    ){
        const originalClass = this as unknown as new (...p : any[]) => Effect<newInputType> //type dance to convert old -> new
        return class ExtendedEff extends originalClass {
            override createInputObj(c: dry_card, s: dry_system, a: Action) : any {
                return newInputFunc.bind(this)(c, s, a) as any
            }

            override activate_final(c: dry_card, s: dry_system, a: Action, input: undefined | inputRequester_finalized<newInputType>): Action[] {
                const r = input?.next()
                if(!r) return []
                const oldInput = converter.bind(this)(r, c, s, a)
                
                const testObj = oldInput[0]
                if(!testObj || !Array.isArray(testObj)) return super.activate_final(c, s, a, {next : () => oldInput} as any);
                return testObj.flatMap(o => super.activate_final(c, s, a, {next : () => o} as any))
            }
        } as typeof Effect<newInputType>
    }

    static toOthersOfSameField(
        this : typeof Effect<inputData_card[]>,
        filter? : (c : dry_card, thisCard : dry_card, s : dry_system, a : Action) => boolean
    ) : typeof Effect {
        return this.removeInput(
            (c, s, a) => 
                s.getZoneOf(c)!.cardArr_filtered.filter(
                    c1 => c1.id !== c.id && (!filter || filter(c1, c, s, a))
                ).map(c1 => inputFormRegistry.card(s, c1))
        ) as any
    }

    static toAllEnemies(
        this : typeof Effect<inputData_card[]>,
        filter? : (c : dry_card, thisCard : dry_card, s : dry_system, a : Action) => boolean
    ) : typeof Effect {
        return this.toAllOfZone(
            (c, s, a) => Request.oppositeZoneTo(s, c).once(),
            filter
        ) as any
    }

    static toAllOfZone(
        this : typeof Effect<inputData_card[]>, 
        newInputFunc : Effect<[inputData_zone]>["createInputObj"],
        filter? : (c : dry_card, thisCard : dry_card, s : dry_system, a : Action) => boolean
    ) : typeof Effect {
        return this.retarget(
            newInputFunc, 
            (z, c, s, a) => 
                filter ? 
                z[0].data.zone.cardArr_filtered.filter(c1 => filter(c1, c, s, a)).map(c => inputFormRegistry.card(s, c)) :
                z[0].data.zone.cardArr_filtered.map(c => inputFormRegistry.card(s, c))
        ) as any
    }

    static toAllOfSpecificZone(
        this : typeof Effect<inputData_card[]>, 
        type : zoneRegistry,
        filter? : (c : dry_card, thisCard : dry_card, s : dry_system, a : Action) => boolean
    ){
        return this.toAllOfZone(
            (c, s, a) => Request.specificType(s, c, type).once(),
            filter
        )
    }

    static toThisCard(
        this : typeof Effect<inputData_card[]>
    ) : typeof Effect {
        return this.removeInput(
            (c, s, a) => [inputFormRegistry.card(s, c)]
        ) as any
    }

    static moreInput<originalInput extends Exclude<inputData[], []>, extraInput extends Exclude<inputData[], []>>(
        this : typeof Effect<originalInput>,
        moreInputFunc : (this : Effect<any>, c : dry_card, s : dry_system, a : Action) => inputRequester<any, extraInput>,
        handler? : (this : Effect<any>, c : dry_card, s : dry_system, a : Action, input : [...originalInput, ...extraInput]) => Action[]
    ) : typeof Effect<[...originalInput, ...extraInput]> {
        const originalClass = this as unknown as typeof Effect<[...originalInput, ...extraInput]>
        return class ExtendedEff extends originalClass {
            ___input_original? : inputRequester<any, originalInput>
            override createInputObj(c: dry_card, s: dry_system, a: Action) : any {
                this.___input_original = super.createInputObj(c, s, a) as any
                return this.___input_original!.merge(moreInputFunc.bind(this)(c, s, a)) as any
            }

            override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[...originalInput, ...extraInput]> | undefined): Action[] {
                const a1 = super.activate_final(c, s, a, this.___input_original as any);
                if(!handler) return a1;
                return a1.concat(handler.bind(this)(c, s, a, input!.next()))
            }
        }
    }

}
type ObjAfterConstructor<T> = T extends new (...p : any[]) => infer K ? K : never
export default Effect
