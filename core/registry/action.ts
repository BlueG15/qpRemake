// import { ActionID as actionID, ActionName as actionName, ActionIDRegistry as ActionRegistry } from "./action";
import { errorID } from "./error";
import type { LogInfoHasResponse } from "../system";

import type { 
    PositionDry,
    CardDry,
    EffectDry, 
    ZoneDry,
    SystemDry,
} from "../interface"

// import type { effectName, effectData_specific } from "../data/effectRegistry";
import type { CardData, EffectData, CardPatchData } from "../data-type";

import type {
    safeSimpleTypes,
    singleTypedArray,
    ExtractReturn_any,
    BrandedSpecific,
    BrandedNumber,
    Fn_any,
} from "../misc";

import { 
    Target,
    TargetTypeID,

    TargetNull,
    TargetEffect,
    TargetPlayer,
    TargetPos,
    TargetCard,
    TargetZone,
    TargetAction,

    TargetBool,
    TargetNumber,
    TargetStr,
} from "../target-type";

// import Position from "../../_components/positions";
// import { inputApplicator, InputRequester } from "../inputs/actionInputGenerator";
import { ZoneRegistry, ZoneTypeID } from "./zone";
import { EffectDataID, EffectDataName } from ".";
import { Registry } from "./base";
import type { InputRequest } from "../../system-components/inputs";

class ActionBase<
    TargetType extends Target[] = Target[], 
    mapElementType extends any = any,
    constructionObjType extends actionConstructionObj_variable<mapElementType> = any,
>{

    id: number = NaN;
    type: ActionID;
    isDisabled : boolean = false;
    isCost : boolean = false;

    cost(){
        this.isCost = true;
        this.attr.set("canBeChainedTo", false);
        this.attr.set("canBeTriggeredTo", false);
    }

    targets : TargetType
    cause : Target

    resolvedFrom? : Action
    responsedFrom? : Action

    originalTargets : TargetType | []

    deleteInputObj(){
        this.attr.delete("input");
    }

    clone(){
        return Utils.clone(this)
    }

    copy(a : Action){
        this.id = a.id;
        this.type = a.type;
        this.isDisabled = a.isDisabled;
        this.targets = a.targets as any;
        this.cause = a.cause;
        this.originalTargets = a.originalTargets as any;
        this.modifiedSinceLastAccessed = true;
        this.attr = a.attr as any;
    }


    protected attr = new Map<
        keyof constructionObjType | "isChain" | "canBeChainedTo" | "canBeTriggeredTo" | "input", 
        mapElementType | boolean
    >()
    modifiedSinceLastAccessed: boolean;

    // protected isInputsApplied_internal = false;
    // get isInputsApplied() {
    //     return this.inputs === undefined || this.isInputsApplied_internal
    // }

    // isChain: boolean; //if false, attach as new tree, if not, attach to curr action

    //isChain is not up to the action, its up to whatever type and subtype is attached
    //somewhat
    //if no trigger, no passive, no chained subtype, isChain here is used instead
    //so isChain here is a default

    flat(){
        let x = {
            targets : this.targets,
            cause : this.cause,

            originalTargets : this.originalTargets,

            modifiedSinceLastAccessed : this.modifiedSinceLastAccessed,
            isDisabled : this.isDisabled,

            id : this.id,
            typeID : this.type,

            isChain : this.isChain,
            canBeChainedTo : this.canBeChainedTo,
            canBeTriggeredTo : this.canBeTriggeredTo,

            attr : {} as constructionObjType & {
                isChain? : boolean,
                canBeChainedTo? : boolean,
                canBeTriggeredTo? : boolean,
            }
        }

        this.attr.forEach((val, key) => {
            x.attr[key] = val as any
        })

        return x;
    }

    flatAttr(){
        let x = {} as constructionObjType & {
                isChain? : boolean,
                canBeChainedTo? : boolean,
                canBeTriggeredTo? : boolean,
            };
        this.attr.forEach((val, key) => {
            x[key] = val as any
        })
        return x
    }

    get isChain() : boolean {
        let t = this.attr.get("isChain")
        if (typeof t === "boolean") return t;
        else this.isChain = true;
        return true;
    }

    set isChain(newVal : boolean) {
        this.attr.set("isChain", newVal as mapElementType)
    }

    get canBeChainedTo(): boolean {return Boolean(this.attr.get("canBeChainedTo"))};
    get canBeTriggeredTo(): boolean {return Boolean(this.attr.get("canBeTriggeredTo"))};

    get firstCardTarget() : Target | undefined {
        return this.targets.find(i => i.type === TargetTypeID.card)
    }

    get firstPosTarget() : Target | undefined {
        return this.targets.find(i => i.type === TargetTypeID.position)
    }

    get firstZoneTarget() : Target | undefined {
        return this.targets.find(i => i.type === TargetTypeID.zone)
    }

    constructor(
        o : actionConstructionObj<mapElementType>
    ) {
        this.type = o.type;
        this.isChain = (o.isChainDefault === false) ? false : true;
        this.targets = (o.targets ?? []) as TargetType
        this.cause = (o.cause ?? {
            type : TargetTypeID.none
        })

        this.originalTargets = this.targets as TargetType | []

        this.modifyAttr("canBeChainedTo", (o.canBeChainTo === false) ? false : true)
        this.modifyAttr("canBeTriggeredTo", (o.canBeTriggeredTo === false) ? false : true)
        this.modifiedSinceLastAccessed = false;

        Object.entries(o).forEach(([key, val]) => {
            if(
                key !== "type" && 
                key !== "targets" && 
                key !== "cause" &&
                val !== undefined
            ){
                this.attr.set(key as any, val as any)
            }
        })
    }

    dontchain(){
        this.isChain = false;
        return this;
    }

    chain(){
        this.isChain = true;
        return this;
    }

    assignID(n : number){
        this.id = n
    }

    get hasCardTarget() {
        return this.targets.length !== 0 && this.targets.some(i => i.type === TargetTypeID.card);
    }
    get hasActionTarget() {
        return this.targets.length !== 0 && this.targets.some(i => i.type === TargetTypeID.action);
    }
    get hasCause() {
        return this.cause.type !== TargetTypeID.none;
    } 
    //dont have cause -> cause is from playerAction
    // get fromPlayer() {
    //     return this.hasCause;
    // }
    get fromCard() {
        return this.cause.type === TargetTypeID.card;
    }
    get name() : string {
        return ActionRegistry.getKey(this.type)
    }
    // get requireInput() {
    //     return this.inputs !== undefined
    // }

    protected verifyNewValue(key: string | symbol | number, newVal: any){
        if(key === "target") return true //handled later
        if(key === "canBeChainedTo" && typeof newVal === "boolean") return true
        if(key === "canBeTriggeredTo" && typeof newVal === "boolean") return true
        let oldVal = this.attr.get(key as any);
        if(Utils.getTypeSigature(oldVal) === Utils.getTypeSigature(newVal)) return true;
        return false;
    }

    modifyAttr(key : "target", newVal : TargetType) : void;
    modifyAttr(key : "canBeChainedTo", newVal : boolean) : void;
    modifyAttr(key : "canBeTriggeredTo", newVal : boolean) : void;
    modifyAttr(key : keyof constructionObjType, newVal : constructionObjType[typeof key]) : void;
    modifyAttr(key: string | symbol | number, newVal: any){
        if (newVal === this.attr.get(key as any)) return;
        //check type
        if(!this.verifyNewValue(key, newVal)) return;

        if(key === "target"){
            if(Array.isArray(newVal)){
                if(this.targets.length !== newVal.length) return;
                newVal = newVal.map((i, index) => this.verifyTarget(i, this.targets[index].type));
                if(newVal.some((i : Target | undefined) => i === undefined)) return;
                this.targets = newVal;
                this.modifiedSinceLastAccessed = true;
                return;
            } else {
                if(this.targets.length !== 1) return;
                newVal = this.verifyTarget(newVal, this.targets[0].type);
                if(!newVal) return;
                this.targets = [newVal] as TargetType;
                this.modifiedSinceLastAccessed = true;
                return;
            }
        }

        this.modifiedSinceLastAccessed = true;
        this.attr.set(key as any, newVal)
    }

    getAttr(key : "canBeChainedTo") : boolean;
    getAttr(key : "canBeTriggeredTo") : boolean;
    getAttr(key : keyof constructionObjType) : constructionObjType[typeof key];
    getAttr(key: string | symbol | number){
        return this.attr.get(key as any)
    }

    protected verifyTarget(val : any, compareType : TargetTypeID) : Target | undefined {
        if(typeof val !== "object") return undefined;
        if(typeof val.type !== "number") return undefined;
        if(val.type !== compareType) return undefined;
        switch(val.type){
            case TargetTypeID.none : return val;
            case TargetTypeID.player:
            case TargetTypeID.zone: {
                if(typeof val.id === "number") return val;
                else return undefined
            }
            case TargetTypeID.card : {
                if(typeof val.id === "string") return val;
                else return undefined
            }
            case TargetTypeID.effect : {
                if(typeof val.cid === "string" && typeof val.eid === "string") return val;
                return undefined
            }
            case TargetTypeID.position : {
                if(Utils.isPositionable(val)) return val as any as TargetPos;
                return undefined
            }
            case TargetTypeID.action : {
                if(val.action instanceof ActionBase) return val;
                return undefined
            }
            case TargetTypeID.effectSubtype : {
                if(typeof val.cid === "string" && typeof val.eid === "string" && typeof val.stid === "string") return val;
                return undefined
            }
            default : return undefined
        }
    }

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
    }

    is<T extends ActionName>(type : T) : this is Action<T>;
    is(name : "a_play", s: SystemDry, c : CardDry, from? : ZoneTypeID, to? : ZoneTypeID) : this is Action<"a_move"> 
    is(name : ActionName | "a_play", s? : SystemDry, c? : CardDry, from? : ZoneTypeID, to = ZoneRegistry.field){
        if(name === "a_play"){
            if(!this.is("a_move")) return false;
            if(!s || !c) return false;
            const ownZone = s.getZoneOf(c)
            const targetZone = s.getZoneWithID(this.targets[1].data.zoneID)
            if(from !== undefined){
                const fromZone = s.getZoneOf(this.targets[0].data)
                if(!(fromZone && fromZone.is(from) && fromZone.of(ownZone))) return false;
            }
            return targetZone && targetZone.is(to) && targetZone.of(ownZone);
        }
        else return this.name === name
    }
}

export type actionAttrType<T> = safeSimpleTypes | singleTypedArray<T> | T

export type actionConstructionObj_fixxed_unstaged = {
    type : ActionID,
    isChainDefault? : boolean,
    canBeChainTo? : boolean,
    canBeTriggeredTo? : boolean,
    // inputs? : inputType[],
}

export type actionConstructionObj_fixxed = {
    type : ActionID
    targets : Target[] //depends on type, target could be a creation order, like with addStatusEffect
    cause : Target,
} & actionConstructionObj_fixxed_unstaged

export type actionConstructionObj_variable<T> = {
    [key : string] : T | undefined
} 

export type actionConstructionObj<T> = actionConstructionObj_fixxed  | (actionConstructionObj_fixxed & actionConstructionObj_variable<T>)
type ExtractInnerType<A> = A extends actionConstructionObj_variable<infer B> ? B : never

function ActionAssembler_base<
    infoArr extends Target[],
    T extends actionConstructionObj_variable<any>, 
>(name : ActionName, targets : infoArr, cause : Target, info : T){
    const o2 = {
        type : ActionRegistry[name] ?? -1,
        targets : targets,
        cause : cause,
        ...info
    }
    return new ActionBase<infoArr, ExtractInnerType<T>, T>(o2);
}


//TODO : consider no curring
//0
function ActionAssembler(name : ActionName) : (cause : Target) => ActionBase<[TargetNull], never, {}>;
//1
function ActionAssembler<P1 extends any[], R1 extends Target>
(name : ActionName, f : (...p : P1) => R1) : 
(...p : P1) => (cause : Target) => ActionBase<[R1], never, {}>;
//2
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
>(name : ActionName, f : (...p : P1) => R1, f2 : (...p : P2) => R2) : 
(...p1 : P1) => (...p2 : P2) => (cause : Target) => ActionBase<[R1, R2], never, {}>
//3
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
    P3 extends any[], R3 extends Target,
>(
    name : ActionName, 
    f1 : (...p : P1) => R1, 
    f2 : (...p : P2) => R2, 
    f3 : (...p : P3) => R3,
) : (...p1 : P1) => (...p2 : P2) => (...p3 : P3) => 
    (cause : Target) => ActionBase<[R1, R2, R3], never, {}>
//4
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
    P3 extends any[], R3 extends Target,
    P4 extends any[], R4 extends Target,
>(
    name : ActionName, 
    f1 : (...p : P1) => R1, 
    f2 : (...p : P2) => R2, 
    f3 : (...p : P3) => R3,
    f4 : (...p : P4) => R4,
) : (...p1 : P1) => (...p2 : P2) => (...p3 : P3) => (...p4 : P4) =>
    (cause : Target) => ActionBase<[R1, R2, R3, R4], never, {}>
//end overload-no info section

// 0 with info
function ActionAssembler<T extends actionConstructionObj_variable<any>>(name : ActionName, format : T) : 
(cause : Target, infoObj : T) => ActionBase<[], ExtractInnerType<T>, T>;
//1 with info
function ActionAssembler<P1 extends any[], R1 extends Target, T extends actionConstructionObj_variable<any>>
(name : ActionName, f : (...p : P1) => R1, format : T) : 
(...p : P1) => (cause : Target, infoObj : T) => ActionBase<[R1], ExtractInnerType<T>, T>;
//2 with info
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
    T extends actionConstructionObj_variable<any>
>(name : ActionName, f : (...p : P1) => R1, f2 : (...p : P2) => R2, format : T) : 
(...p1 : P1) => (...p2 : P2) => (cause : Target, infoObj : T) => ActionBase<[R1, R2], ExtractInnerType<T>, T>
//3 with info
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
    P3 extends any[], R3 extends Target,
    T extends actionConstructionObj_variable<any>
>(
    name : ActionName, 
    f1 : (...p : P1) => R1, 
    f2 : (...p : P2) => R2,
    f3 : (...p : P3) => R3,
    format : T
) : (...p1 : P1) => (...p2 : P2) => (...p3 : P3) => 
    (cause : Target, infoObj : T) => ActionBase<[R1, R2, R3], ExtractInnerType<T>, T>
//4 with info
function ActionAssembler<
    P1 extends any[], R1 extends Target,
    P2 extends any[], R2 extends Target,
    P3 extends any[], R3 extends Target,
    P4 extends any[], R4 extends Target,
    T extends actionConstructionObj_variable<any>
>(
    name : ActionName, 
    f1 : (...p : P1) => R1, 
    f2 : (...p : P2) => R2, 
    f3 : (...p : P3) => R3,
    f4 : (...p : P4) => R4,
) : (...p1 : P1) => (...p2 : P2) => (...p3 : P3) => (...p4 : P4) =>
    (cause : Target, infoObj : T) => ActionBase<[R1, R2, R3, R4], ExtractInnerType<T>, T>
//end overload-with info section

function ActionAssembler(name : ActionName, ...f : ((...p : any) => Target)[]){
    //for a general solution, we curried up to f[len - 2], if that last element is an object, we stop

    //so the standard calls is (s, ...p) => ...ps
    //we pre-curried the first param, then reuse s for the rest

    if(f.length === 0) return (cause : Target, infoObj : any = {}) => ActionAssembler_base(name, [Target.none()], cause, infoObj);
    const extractLast = (typeof (f[f.length - 1]) === "object")
    if(f.length === 1 && extractLast) return (cause : Target, infoObj : any = {}) => ActionAssembler_base(name, [Target.none()], cause, infoObj);
    if(extractLast) f.splice(-1, 1); 

    // console.log("DEBUG1: " + name + " -- " + f.map(i => (typeof i === "object") ? Object.keys(i).join("==") : typeof i).join("_") + extractLast);

    return (...p : any[]) => {
        const [first, ...rest] = f
        
        // console.log("DEBUG2: " + name + " -- " + f.map(i => (typeof i === "object") ? Object.keys(i).join("==") : typeof i).join("_") + extractLast);
        return Utils.genericCurrier(rest, (resArr : Target[]) => {
            resArr.unshift(first(...p));
            return (cause : Target, infoObj : any = {}) => ActionAssembler_base(name, resArr, cause, infoObj);
        })
    }
}

function modifyActionContructor<
    targetType extends Exclude<ActionName, "a_modify_action">,
>(type : targetType){
    return (s : SystemDry, action : Action<targetType>) => (cause : Target) => 
        (p : Partial<ConstructionExtraParamsType<targetType>> & Partial<{
                targets : TargetType<targetType>,
                cause : Target,

                canBeChainedTo : boolean,
                canBeTriggeredTo : boolean
            }>) => ActionAssembler_base<
                [TargetAction], 
                Partial<ConstructionExtraParamsType<targetType>> & Partial<{
                    targets : TargetType<targetType>,
                    cause : Target,

                    canBeChainedTo : boolean,
                    canBeTriggeredTo : boolean
                }>
            >("a_modify_action", [Target.action(action)], cause, p)
}


function addEffectContructor<
    targetType extends EffectDataName,
    isStatus_t extends boolean,
>(type : targetType, isStatus : isStatus_t){
    return (s : SystemDry, card : CardDry) => 
        (cause : Target, p : Partial<Omit<EffectData, "typeID" | "subTypeIDs">>) => 
        ActionAssembler_base<
            [TargetCard],
            Partial<Omit<EffectData, "typeID" | "subTypeIDs">> & {typeID : string}
        >((isStatus ? "a_add_status_effect" : "a_add_effect"), [Target.card(card)], cause, {...p, typeID : type})
}

//Note : I tried to remove the prefix a_, it broke everything else
    // saying depth too deep in other files for the check a.is(...)
    // weird af

let DefaultActionGenerator = {
    error: function(cause : Target, errorType : errorID){
        return ActionAssembler_base<[], {
            errorType : errorID
        }>("error", [], cause, {
            errorType
        })
    },
    a_null: ActionAssembler("a_null"),
    a_negate_action: ActionAssembler("a_negate_action", {} as Partial<{
        replaceWith : Action[]
    }>),
    a_do_threat_burn: ActionAssembler("a_do_threat_burn", Target.player),
    a_force_end_game: ActionAssembler("a_force_end_game"),
    a_set_threat_level: ActionAssembler("a_set_threat_level", {
        newThreatLevel : 0 as number
    }),
    a_turn_end: ActionAssembler("a_turn_end", {
        doIncreaseTurnCount : true
    }),
    a_turn_reset: ActionAssembler("a_turn_reset"),
    a_turn_start: ActionAssembler("a_turn_start"),
    a_reprogram_start: ActionAssembler("a_reprogram_start"),
    a_reprogram_end: ActionAssembler("a_reprogram_end"),

    a_clear_all_status_effect: ActionAssembler("a_clear_all_status_effect", Target.card),
    a_clear_all_counters: ActionAssembler("a_clear_all_counters", Target.card),
    a_deal_damage_card: ActionAssembler("a_deal_damage_card", Target.card, {
        dmg : 0,
        dmgType : 0
    }),

    a_deal_heart_damage : ActionAssembler("a_deal_heart_damage", Target.player, {
        dmg : 0,
    }),
    a_destroy: ActionAssembler("a_destroy", Target.card),
    a_disable_card: ActionAssembler("a_disable_card", Target.card),
    a_enable_card: ActionAssembler("a_enable_card", Target.card),
    a_execute: ActionAssembler("a_execute", Target.card),
    a_move: ActionAssembler("a_move", Target.card, Target.pos),  
    a_attack: ActionAssembler("a_attack", Target.card, {} as {
        dmg : number | undefined,
        dmgType : number | undefined
    }),
    a_deal_damage_ahead: ActionAssembler("a_deal_damage_ahead", Target.card, {} as {
        dmg : number | undefined,
        dmgType : number | undefined
    }),
    a_reset_card: ActionAssembler("a_reset_card", Target.card),
    a_decompile : ActionAssembler("a_decompile", Target.card),
    a_void : ActionAssembler("a_void", Target.card),

    a_reset_once : ActionAssembler("a_reset_once", Target.effect),
    a_reset_all_once : ActionAssembler("a_reset_all_once", Target.card),

    a_reset_effect: ActionAssembler("a_reset_effect", Target.effect),
    a_activate_effect: ActionAssembler("a_activate_effect", Target.effect, Target.card),
    a_internal_try_activate: ActionAssembler("a_internal_try_activate", Target.pos, {} as {
        log : LogInfoHasResponse
    }),
    a_add_status_effect: addEffectContructor,
    a_add_effect : addEffectContructor,
    a_duplicate_effect : ActionAssembler("a_duplicate_effect", Target.effect, Target.card, {} as {
        addedSubtype : string[]
    }), //duplicate partition of card[1] into card[0]
    a_duplicate_card : ActionAssembler("a_duplicate_card", Target.card, Target.pos, {} as {
        variantIDs? : string[]
        overrideData? : CardPatchData,
        callback? : (c : CardDry) => Action[]
    }), //duplicate card onto position
    a_remove_status_effect: ActionAssembler("a_remove_status_effect", Target.effect, Target.card),
    a_remove_effect : ActionAssembler("a_remove_effect", Target.card, Target.effect),
    a_remove_all_effects : ActionAssembler("a_remove_all_effects", Target.card),
    
    a_modify_action: modifyActionContructor,
    
    a_shuffle: ActionAssembler("a_shuffle", Target.zone, {
        shuffleMap : {} as Map<number, number>
    }),
    a_draw: ActionAssembler(
        "a_draw", 
        Target.zone as (deck : ZoneDry) => TargetZone, 
        Target.zone as (hand : ZoneDry) => TargetZone, 
        { //the deck, then the hand
            isTurnDraw : true,
        }
    ),

    a_get_input : ActionAssembler("a_get_input", {} as {
        requester : InputRequest
        applicator : (i : Target[]) => Action[]
    }),

    a_delay : ActionAssembler("a_delay", {} as {
        delayAmmount : number,
        delayCID : string, //cid
        delayEID : string, //eid
    }),
} as const;

type ActionName = [
    //special
    "error",
    "a_null",
    
    // System signal actions
    "a_turn_start",
    "a_turn_end",
    "a_turn_reset",
    "a_internal_try_activate", //internal call to check can activate -> add a_activate (1st check)
    "a_set_threat_level",
    "a_do_threat_burn",
    "a_force_end_game",  
    "a_enable_card",
    "a_disable_card",
    "a_reset_card",
    "a_reset_effect",
    "a_get_input",

    // Control flow redirection
    "a_negate_action", //only resolves in the chain phase,  go straight to complete step

    // API related actions
    "a_activate_effect",
    "a_move",
    "a_draw",
    "a_shuffle",
    "a_execute", //not implemented
    "a_reprogram_start", //not implemented
    "a_reprogram_end", //not implemented

    "a_add_status_effect", //effect
    "a_add_effect", //effect

    "a_remove_all_effects", //card
    "a_duplicate_effect", //effect
    "a_remove_effect", //effect

    "a_remove_status_effect", 
    "a_clear_all_status_effect",
    "a_clear_all_counters",
    
    "a_reset_once",
    "a_reset_all_once",
    "a_modify_action",

    "a_attack",
    "a_deal_damage_ahead",
    "a_deal_damage_card",
    "a_deal_heart_damage",
    
    "a_destroy",
    "a_decompile",
    "a_void",

    "a_duplicate_card",

    "a_delay",
][number]

type ActionIDs = {[K in ActionName] : number}
type ActionID = BrandedNumber<ActionIDs>
const [ActionRegistry, ActionGenerator] = Registry.twoViews<ActionID, BrandedSpecific<ActionName, ActionIDs>, typeof DefaultActionGenerator>(DefaultActionGenerator)

export type ConstructionExtraParamsType<name extends ActionName> = 
    name extends "a_modify_action" ? {} :
    name extends "a_add_effect" | "a_add_status_effect" ? any :
    ExtractReturn_any<(typeof DefaultActionGenerator)[name]> extends ActionBase<any, any, infer T0> ? T0 : {}

export type AttrType<name extends ActionName> = 
    name extends "a_modify_action" ? any :
    name extends "a_add_effect" | "a_add_status_effect" ? {typeID : string, [key : string] : any} :
    ExtractReturn_any<(typeof DefaultActionGenerator)[name]> extends ActionBase<any, infer T0, any> ? T0 : any

export type TargetType<name extends ActionName> = 
    name extends "a_modify_action" ? [TargetAction] :
    name extends "a_add_effect" | "a_add_status_effect" ? [TargetCard] :
    ExtractReturn_any<(typeof DefaultActionGenerator)[name]> extends ActionBase<infer T0, any, any> ? T0 : never

export type Action<
    name extends ActionName | undefined = undefined, 
    name2 extends (name extends "a_modify_action" ? Exclude<ActionName, "a_modify_action"> : undefined) | 
                  (name extends "a_add_effect" | "a_add_status_effect" ? EffectDataName : undefined) | 
                  undefined = undefined
> = name extends ActionName ? (
    name extends "a_modify_action" ? (
        name2 extends ActionName ?
        ActionBase<
            TargetType<name>, 
            ExtractInnerType<ConstructionExtraParamsType<name2>> | TargetType<name2> | Target | boolean, 
            Partial<ConstructionExtraParamsType<name2>> & Partial<{
                targets : TargetType<name2>,
                cause : Target,

                canBeChainedTo : boolean,
                canBeTriggeredTo : boolean
            }>
        > : Action<"a_modify_action", "a_null">
    ) : name2 extends EffectDataName ? (
        ActionBase<
            [TargetCard], 
            ExtractInnerType<Partial<Omit<EffectData, "typeID" | "subTypeIDs">>> | string, 
            Partial<Omit<EffectData, "typeID" | "subTypeIDs">> & {typeID : string}
        >
    ) : ActionBase<TargetType<name>, AttrType<name>, ConstructionExtraParamsType<name>>
) : ActionBase

//filtering types
export type oneTarget<target extends Target, searchSet extends ActionName = ActionName> = {
    [K in searchSet] : TargetType<K> extends [target] ? K : never
}[searchSet]

export type noExtraParam<searchSet extends ActionName = ActionName> = {
    [K in searchSet] : {} extends ConstructionExtraParamsType<K> ? K : never
}[searchSet]

export type hasTarget<target extends Target, searchSet extends ActionName = ActionName> = {
    [K in searchSet] : TargetType<K> extends [target] ? K : TargetType<K> extends [target, ...any[]] ? K : never
}[searchSet]

export {
    ActionID,
    ActionName,
    ActionRegistry,
    ActionGenerator,
    ActionAssembler,
    ActionBase
}