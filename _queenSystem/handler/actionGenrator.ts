import actionRegistry, { actionID, actionName } from "../../data/actionRegistry";
import type dry_card from "../../data/dry/dry_card";
import type dry_zone from "../../data/dry/dry_zone";
import type dry_effect from "../../data/dry/dry_effect";
import type dry_effectSubType from "../../data/dry/dry_effectSubType";
import dry_system from "../../data/dry/dry_system";
import dry_position from "../../data/dry/dry_position";

import {
    safeSimpleTypes,
    singleTypedArray,
    ExtractArgs,
    ExtractReturn,
    Fn,
    Fn_any,
    ExtractReturn_any,
    OnlyWritableProps,
} from "../../data/misc";

import { 
    identificationInfo, 
    identificationInfo_action, 
    identificationInfo_card, 
    identificationInfo_effect, 
    identificationInfo_none,
    identificationInfo_player,
    identificationInfo_pos,
    identificationInfo_subtype,
    identificationInfo_zone,
    identificationType,
    inputType,
    inputData,
    identificationInfo_system,
} from "../../data/systemRegistry";

import utils from "../../utils";
import { zoneAttributes, zoneRegistry } from "../../data/zoneRegistry";

export class Action_class<
    TargetType extends identificationInfo[] = identificationInfo[], 
    mapElementType extends any = any,
    constructionObjType extends actionConstructionObj_variable<mapElementType> = any,  
>{

    id: number = NaN;
    typeID: actionID;
    isDisabled : boolean = false;

    targets : TargetType
    cause : identificationInfo

    originalCause : identificationInfo
    originalTargets : TargetType | []

    inputTypeArr: inputType[];
    protected attr = new Map<keyof constructionObjType, mapElementType>()
    modifiedSinceLastAccessed: boolean;

    protected checkers : Required<checkerType>

    protected isInputsApplied_internal = false;
    get isInputsApplied() {
        return this.inputTypeArr.length === 0 || this.isInputsApplied_internal
    }

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
            originalCause : this.originalCause,

            inputTypeArr : this.inputTypeArr,
            modifiedSinceLastAccessed : this.modifiedSinceLastAccessed,
            isDisabled : this.isDisabled,

            id : this.id,
            typeID : this.typeID,

            isChain : this.isChain,
            canBeChainedTo : this.canBeChainedTo,
            canBeTriggeredTo : this.canBeTriggeredTo,

            attr : {} as constructionObjType
        }

        this.attr.forEach((val, key) => {
            x.attr[key] = val as any
        })

        return x;
    }

    flatAttr(){
        let x = {} as constructionObjType;
        this.attr.forEach((val, key) => {
            x[key] = val as any
        })
        return x
    }

    resolvable(s : dry_system, z? : dry_zone, c? : dry_card, eff? : dry_effect, subtype? : dry_effectSubType) : boolean{
        return this.isInputsApplied && this.targets.every(target => {
            switch(target.type){
                case identificationType.zone : return z ? this.checkers.zone(target, z) : false;
                case identificationType.card : return (c && z) ? this.checkers.card(target, c, z) : false;
                case identificationType.effect : return (eff && c && z) ? this.checkers.effect(target, eff, c, z) : false;
                case identificationType.effectSubtype : return (subtype && eff && c && z) ? this.checkers.effectSubtype(target, subtype, eff, c, z) : false;
                default : return true;
            }
        })
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

    get firstCardTarget() : identificationInfo | undefined {
        return this.targets.find(i => i.type === identificationType.card)
    }

    get firstPosTarget() : identificationInfo | undefined {
        return this.targets.find(i => i.type === identificationType.position)
    }

    get firstZoneTarget() : identificationInfo | undefined {
        return this.targets.find(i => i.type === identificationType.zone)
    }

    constructor(
        o : actionConstructionObj<mapElementType>
    ) {
        this.typeID = o.type;
        this.isChain = (o.isChainDefault === false) ? false : true;
        this.inputTypeArr = o.inputs ?? [];
        this.targets = (o.targets ?? []) as TargetType
        this.cause = (o.cause ?? {
            type : identificationType.none
        })

        this.originalCause = this.cause
        this.originalTargets = this.targets as TargetType | []

        this.modifyAttr("canBeChainedTo", (o.canBeChainTo === false) ? false : true)
        this.modifyAttr("canBeTriggeredTo", (o.canBeTriggeredTo === false) ? false : true)
        this.modifiedSinceLastAccessed = false;

        //binding checker

        this.checkers = defaultChecker

        if(o.checkers) {
            utils.patchGeneric(this.checkers, o.checkers);
        }

        Object.entries(o).forEach(([key, val]) => {
            if(key !== "type" && key !== "targets" && key !== "cause"){
                this.attr.set(key, val as any)
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
        return this.targets.length !== 0 && this.targets.some(i => i.type === identificationType.card);
    }
    get hasActionTarget() {
        return this.targets.length !== 0 && this.targets.some(i => i.type === identificationType.action);
    }
    get hasCause() {
        return this.cause.type !== identificationType.none;
    } 
    //dont have cause -> cause is from playerAction
    // get fromPlayer() {
    //     return this.hasCause;
    // }
    get fromCard() {
        return this.cause.type === identificationType.card;
    }
    get type() : string {
        return actionRegistry[this.typeID]
    }
    get requireInput() {
        return this.inputTypeArr.length !== 0
    }

    protected verifyNewValue(key: string, newVal: any){
        if(key === "target") return true //handled later
        if(key === "canBeChainedTo" && typeof newVal === "boolean") return true
        if(key === "canBeTriggeredTo" && typeof newVal === "boolean") return true
        let oldVal = this.attr.get(key);
        if(utils.getTypeSigature(oldVal) === utils.getTypeSigature(newVal)) return true;
        return false;
    }

    modifyAttr(key : "target", newVal : TargetType) : void;
    modifyAttr(key : "canBeChainedTo", newVal : boolean) : void;
    modifyAttr(key : "canBeTriggeredTo", newVal : boolean) : void;
    modifyAttr(key : keyof constructionObjType, newVal : constructionObjType[typeof key]) : void;
    modifyAttr(key: string, newVal: any){
        if (newVal === this.attr.get(key)) return;
        //check type
        if(!this.verifyNewValue(key, newVal)) return;

        if(key === "target"){
            if(Array.isArray(newVal)){
                if(this.targets.length !== newVal.length) return;
                newVal = newVal.map((i, index) => this.verifyTarget(i, this.targets[index].type));
                if(newVal.some((i : identificationInfo | undefined) => i === undefined)) return;
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
        this.attr.set(key, newVal)
    }

    protected verifyTarget(val : any, compareType : identificationType) : identificationInfo | undefined {
        if(typeof val !== "object") return undefined;
        if(typeof val.type !== "number") return undefined;
        if(val.type !== compareType) return undefined;
        switch(val.type){
            case identificationType.none : return val;
            case identificationType.player:
            case identificationType.zone: {
                if(typeof val.id === "number") return val;
                else return undefined
            }
            case identificationType.card : {
                if(typeof val.id === "string") return val;
                else return undefined
            }
            case identificationType.effect : {
                if(typeof val.cid === "string" && typeof val.eid === "string") return val;
                return undefined
            }
            case identificationType.position : {
                if(val.pos instanceof dry_position) return val;
                return undefined
            }
            case identificationType.action : {
                if(val.action instanceof Action_class) return val;
                return undefined
            }
            case identificationType.effectSubtype : {
                if(typeof val.cid === "string" && typeof val.eid === "string" && typeof val.stid === "string") return val;
                return undefined
            }
            default : return undefined
        }
    }

    applyUserInput(input: inputData[]): void {
        
    }

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
    }
}

export type actionAttrType<T> = safeSimpleTypes | singleTypedArray<T> | T

export type actionConstructionObj_fixxed_unstaged = {
    type : actionID,
    isChainDefault? : boolean,
    canBeChainTo? : boolean,
    canBeTriggeredTo? : boolean,
    inputs? : inputType[],

    //so grounded check is if the state of the action's target has changed
    //level is 0th indexing, here are details
    // action -> target modified
    // card -> same zone check -> same position check
    // effect -> same card -> same zone check -> same position check
    // effect subtype -> same effect -> same card -> same zone -> same position
    // zone -> <none>
    // position -> <none>
    
    //notes : any number not in range 0 -> inf is 0
    // inf is the highest for that type
    // a single number is the same level for everything
    checkers? : checkerType
}

type checkerType = Partial<{
        zone : (target : identificationInfo_zone, currZone : dry_zone) => boolean,
        card : (target : identificationInfo_card, currCard : dry_card, currZone : dry_zone) => boolean,
        effect : (target : identificationInfo_effect, currEffect : dry_effect, currCard : dry_card, currZone : dry_zone) => boolean,
        effectSubtype : (target : identificationInfo_subtype, currSubtype : dry_effectSubType, currEffect : dry_effect, currCard : dry_card, currZone : dry_zone) => boolean
    }>

function defaultChecker_zone(target : identificationInfo_zone, currZone : dry_zone) : boolean {
    return target.zone.id === currZone.id;
}

function defaultCheker_card(target : identificationInfo_card | identificationInfo_effect | identificationInfo_subtype, currCard : dry_card, currZone : dry_zone, strict = false){
    return target.card.id === currCard.id && (!strict || target.card.pos.equal(currCard.pos))
}

function defaultChecker_effect(target : identificationInfo_effect | identificationInfo_subtype, currEffect : dry_effect, currCard : dry_card, currZone : dry_zone, recur = true, strict = false){
    return target.eff.id === currEffect.id && (!recur || defaultCheker_card(target, currCard, currZone, strict))
}

function defaultChecker_effectSubtype(target : identificationInfo_subtype, currSubtype : dry_effectSubType, currEffect : dry_effect, currCard : dry_card, currZone : dry_zone, recur = false, strict = false){
    return target.subtype.dataID === currSubtype.dataID && defaultChecker_effect(target, currEffect, currCard, currZone, recur, strict)
}

const defaultChecker = {
    zone : defaultChecker_zone,
    card : defaultCheker_card,
    effect : defaultChecker_effect,
    effectSubtype : defaultChecker_effectSubtype
}

export type actionConstructionObj_fixxed = {
    type : actionID
    targets : identificationInfo[] //depends on type, target could be a creation order, like with addStatusEffect
    cause : identificationInfo,
} & actionConstructionObj_fixxed_unstaged

export type actionConstructionObj_variable<T> = {
    [key : string] : T | undefined
}

export type actionConstructionObj<T> = actionConstructionObj_fixxed | (actionConstructionObj_fixxed & actionConstructionObj_variable<T>)

function form_card(s : dry_system) {return (card : dry_card) => {return {
    type : identificationType.card,
    sys : s,
    card : card,
} as identificationInfo_card }}

function form_action(s : dry_system){return (a : Action_class | Action) => {return {
    type : identificationType.action,
    sys : s,
    action : a
} as identificationInfo_action }}

function form_effect(s : dry_system){return (card : dry_card, eff : dry_effect) => {return {
    type : identificationType.effect,
    sys : s,
    card : card,
    eff : eff
} as identificationInfo_effect }}

function form_zone(s : dry_system) {return (zone : dry_zone) => {return {
    type : identificationType.zone,
    sys : s,
    zone : zone
} as identificationInfo_zone }}

function form_position(s : dry_system) {return (pos : dry_position) => {return {
    type : identificationType.position,
    sys : s,
    pos : pos
} as identificationInfo_pos }}

function form_player(s : dry_system) {return (pid : number) => {return {
    type : identificationType.player,
    sys : s,
    id : pid
} as identificationInfo_player }}

function form_subtype(s : dry_system) {return (card : dry_card, eff : dry_effect, subtype : dry_effectSubType) => {return {
    type : identificationType.effectSubtype,
    sys : s,
    card : card,
    eff : eff,
    subtype : subtype
} as identificationInfo_subtype }}

function form_none() : identificationInfo_none {return {
    type : identificationType.none
}}

function form_system() : identificationInfo_system {return {
    type : identificationType.system
}}

type formFuncs = typeof form_none | typeof form_card | typeof form_action | typeof form_effect | typeof form_zone | typeof form_position | typeof form_player | typeof form_subtype

type ExtractInnerType<A> = A extends actionConstructionObj_variable<infer B> ? B : never

function ActionAssembler_base<
    infoArr extends identificationInfo[],
    T extends actionConstructionObj_variable<any>, 
>(name : actionName, targets : infoArr, cause : identificationInfo, info : T){
    const o1 = getDefaultObjContructionObj(actionRegistry[name]);
    const o2 = {
        targets : targets,
        cause : cause,
        ...o1,
        ...info
    }
    return new Action_class<infoArr, ExtractInnerType<T>, T>(o2);
}

//0
function ActionAssembler(name : actionName) : (cause : identificationInfo) => Action_class<[identificationInfo_none], never, {}>;
//1
function ActionAssembler<P1 extends any[], R1 extends identificationInfo>
(name : actionName, f : (s : dry_system) => (...p : P1) => R1) : 
(s : dry_system, ...p : P1) => (cause : identificationInfo) => Action_class<[R1], never, {}>;
//2
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
>(name : actionName, f : (s : dry_system) => (...p : P1) => R1, f2 : (s : dry_system) => (...p : P2) => R2) : 
(s : dry_system, ...p1 : P1) => (...p2 : P2) => (cause : identificationInfo) => Action_class<[R1, R2], never, {}>
//3
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
    P3 extends any[], R3 extends identificationInfo,
>(
    name : actionName, 
    f : (s : dry_system) => (...p : P1) => R1, 
    f2 : (s : dry_system) => (...p : P2) => R2, 
    f3 : (s : dry_system) => (...p : P3) => R3,
) : (s : dry_system, ...p1 : P1) => (...p2 : P2) => (...p3 : P3) => 
    (cause : identificationInfo) => Action_class<[R1, R2, R3], never, {}>
//4
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
    P3 extends any[], R3 extends identificationInfo,
    P4 extends any[], R4 extends identificationInfo,
>(
    name : actionName, 
    f : (s : dry_system) => (...p : P1) => R1, 
    f2 : (s : dry_system) => (...p : P2) => R2, 
    f3 : (s : dry_system) => (...p : P3) => R3,
    f4 : (s : dry_system) => (...p : P4) => R4,
) : (s : dry_system, ...p1 : P1) => (...p2 : P2) => (...p3 : P3) => (...p4 : P4) =>
    (cause : identificationInfo) => Action_class<[R1, R2, R3, R4], never, {}>
//end overload-no info section

// 0 with info
function ActionAssembler<T extends actionConstructionObj_variable<any>>(name : actionName, format : T) : 
(cause : identificationInfo, infoObj : T) => Action_class<[], ExtractInnerType<T>, T>;
//1 with info
function ActionAssembler<P1 extends any[], R1 extends identificationInfo, T extends actionConstructionObj_variable<any>>
(name : actionName, f : (s : dry_system) => (...p : P1) => R1, format : T) : 
(s : dry_system, ...p : P1) => (cause : identificationInfo, infoObj : T) => Action_class<[R1], ExtractInnerType<T>, T>;
//2 with info
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
    T extends actionConstructionObj_variable<any>
>(name : actionName, f : (s : dry_system) => (...p : P1) => R1, f2 : (s : dry_system) => (...p : P2) => R2, format : T) : 
(s : dry_system, ...p1 : P1) => (...p2 : P2) => (cause : identificationInfo, infoObj : T) => Action_class<[R1, R2], ExtractInnerType<T>, T>
//3 with info
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
    P3 extends any[], R3 extends identificationInfo,
    T extends actionConstructionObj_variable<any>
>(
    name : actionName, 
    f : (s : dry_system) => (...p : P1) => R1, 
    f2 : (s : dry_system) => (...p : P2) => R2, 
    f3 : (s : dry_system) => (...p : P3) => R3,
    format : T
) : (s : dry_system, ...p1 : P1) => (...p2 : P2) => (...p3 : P3) => 
    (cause : identificationInfo, infoObj : T) => Action_class<[R1, R2, R3], ExtractInnerType<T>, T>
//4 with info
function ActionAssembler<
    P1 extends any[], R1 extends identificationInfo,
    P2 extends any[], R2 extends identificationInfo,
    P3 extends any[], R3 extends identificationInfo,
    P4 extends any[], R4 extends identificationInfo,
    T extends actionConstructionObj_variable<any>
>(
    name : actionName, 
    f : (s : dry_system) => (...p : P1) => R1, 
    f2 : (s : dry_system) => (...p : P2) => R2, 
    f3 : (s : dry_system) => (...p : P3) => R3,
    f4 : (s : dry_system) => (...p : P4) => R4,
) : (s : dry_system, ...p1 : P1) => (...p2 : P2) => (...p3 : P3) => (...p4 : P4) =>
    (cause : identificationInfo, infoObj : T) => Action_class<[R1, R2, R3, R4], ExtractInnerType<T>, T>
//end overload-with info section

function ActionAssembler(name : actionName, ...f : any[]){
    //for a general solution, we curried up to f[len - 2], if that last element is an object, we stop

    //so the standard calls is (s, ...p) => ...ps
    //we pre-curried the first param, then reuse s for the rest

    if(f.length === 0) return (cause : identificationInfo) => ActionAssembler_base(name, [form_none()], cause, {});
    const extractLast = (typeof f.at(-1) === "object")
    if(f.length === 1 && extractLast) return (cause : identificationInfo, infoObj : any) => ActionAssembler_base(name, [form_none()], cause, infoObj);
    if(extractLast) f.pop(); 

    return (s : dry_system, ...p : any[]) => {
        f = f.map(i => i(s))
        const [first, ...rest] = f

        return utils.genericCurrier(rest, (resArr : identificationInfo[]) => {
            resArr.unshift(first(...p));
            return (cause : identificationInfo, infoObj? : any) => ActionAssembler_base(name, resArr, cause, infoObj);
        })
    }
}

function modifyActionContructor<
    targetType extends Exclude<actionName, "a_modify_action">,
>(type : targetType){
    return (s : dry_system, action : Action<targetType>) => (cause : identificationInfo) => 
        (p : Partial<ConstructionExtraParamsType<targetType>> & Partial<{
                targets : TargetType<targetType>,
                cause : identificationInfo,

                canBeChainedTo : boolean,
                canBeTriggeredTo : boolean
            }>) => ActionAssembler_base<
                [identificationInfo_action], 
                Partial<ConstructionExtraParamsType<targetType>> & Partial<{
                    targets : TargetType<targetType>,
                    cause : identificationInfo,

                    canBeChainedTo : boolean,
                    canBeTriggeredTo : boolean
                }>
            >("a_modify_action", [form_action(s)(action)], cause, p)
}


//default restriction is the loosest possible restriction
//card : none (practically)
//zone : none (practically)
//effect : same card
//effect subtype : same effect

export function getDefaultObjContructionObj(id : actionID) : actionConstructionObj_fixxed_unstaged{
    let o : actionConstructionObj_fixxed_unstaged = {
        type : id
    }
    switch(id){
        case actionRegistry.a_activate_effect_internal : {
            o.canBeChainTo = false,
            o.canBeTriggeredTo = false
            break;
        }
        case actionRegistry.a_turn_end : {
            o.canBeTriggeredTo = false
            break;
        }
        case actionRegistry.error : {
            o.canBeChainTo = false,
            o.canBeTriggeredTo = false
            break;
        }
        case actionRegistry.a_deal_damage_internal : {
            o.canBeChainTo = false,
            o.canBeTriggeredTo = false;
            break;
        }
        case actionRegistry.a_deal_damage_card : {
            o.checkers = {
                card : (target : identificationInfo_card, currCard : dry_card, currZone : dry_zone) => {
                    //move whereever you want, if its still on the field, its damagable
                    if(!defaultCheker_card(target, currCard, currZone)) return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry.z_deck || i === zoneRegistry.z_field || i === zoneRegistry.z_hand
                    })
                }
            }
            break;
        }
        case actionRegistry.a_destroy : {
            o.checkers = {
                card : (target : identificationInfo_card, currCard : dry_card, currZone : dry_zone) => {
                    //move whereever you want, if its not in grave, its destroyable
                    if(!defaultCheker_card(target, currCard, currZone)) return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry.z_deck || i === zoneRegistry.z_field || i === zoneRegistry.z_hand
                    })
                }
            }
            break;
        }
        case actionRegistry.a_execute : {
            o.checkers = {
                card : (target : identificationInfo_card, currCard : dry_card, currZone : dry_zone) => {
                    //move whereever you want, if its still on the field, its damagable
                    if(!defaultCheker_card(target, currCard, currZone)) return false;
                    return currZone.types.some(i => {
                        return i === zoneRegistry.z_deck || i === zoneRegistry.z_field || i === zoneRegistry.z_hand
                    })
                }
            }
            break;
        }
        case actionRegistry.a_pos_change : {
            o.checkers = {
                card : (target : identificationInfo_card, currCard : dry_card, currZone : dry_zone) => {
                    //pos_change default is strict
                    return defaultCheker_card(target, currCard, currZone, true)
                }
            }
            break;
        }
    }
    return o
}


const actionConstructorRegistry = {
    error: ActionAssembler("error"),
    a_null: ActionAssembler("a_null"),
    a_do_threat_burn: ActionAssembler("a_do_threat_burn"),
    a_force_end_game: ActionAssembler("a_force_end_game"),
    a_increase_turn_count: ActionAssembler("a_increase_turn_count"),
    a_set_threat_level: ActionAssembler("a_set_threat_level", {
        newThreatLevel : 0 as number | number[]
    }),
    a_turn_end: ActionAssembler("a_turn_end", {
        doIncreaseTurnCount : true
    }),
    a_turn_reset: ActionAssembler("a_turn_reset"),
    a_turn_start: ActionAssembler("a_turn_start"),
    a_reprogram_start: ActionAssembler("a_reprogram_start"),
    a_reprogram_end: ActionAssembler("a_reprogram_end"),

    a_clear_all_status_effect: ActionAssembler("a_clear_all_status_effect", form_card),
    a_deal_damage_card: ActionAssembler("a_deal_damage_card", form_card, {
        dmg : 0,
        dmgType : 0
    }),
    a_deal_damage_position: ActionAssembler("a_deal_damage_position", form_position, {
        dmg : 0,
        dmgType : 0
    }),
    a_deal_damage_internal: ActionAssembler("a_deal_damage_internal", form_card, {
        dmg : 0,
        dmgType : 0
    }),
    a_deal_heart_damage : ActionAssembler("a_deal_heart_damage", form_player, {
        dmg : 0,
    }),
    a_destroy: ActionAssembler("a_destroy", form_card),
    a_disable_card: ActionAssembler("a_disable_card", form_card),
    a_enable_card: ActionAssembler("a_enable_card", form_card),
    a_execute: ActionAssembler("a_execute", form_card),
    a_pos_change: ActionAssembler("a_pos_change", form_card, form_position),  
    a_pos_change_force : ActionAssembler("a_pos_change_force", form_card, form_position),
    a_attack: ActionAssembler("a_attack", {
        dmg : 0 as number | undefined,
        dmgType : 0 as number | undefined
    }),
    a_reset_card: ActionAssembler("a_reset_card", form_card),

    a_reset_effect: ActionAssembler("a_reset_effect", form_effect),
    a_activate_effect: ActionAssembler("a_activate_effect", form_effect),
    a_activate_effect_internal: ActionAssembler("a_activate_effect_internal", form_effect),
    a_add_status_effect: ActionAssembler("a_add_status_effect", form_card, {
        statusID : "",
    }),
    a_remove_status_effect: ActionAssembler("a_remove_status_effect", form_effect),

    a_activate_effect_subtype: ActionAssembler("a_activate_effect_subtype", form_subtype),
    
    a_modify_action: modifyActionContructor,
    a_negate_action: ActionAssembler("a_negate_action", form_action),
    a_replace_action: ActionAssembler("a_replace_action", form_action),
    
    a_zone_interact: ActionAssembler("a_zone_interact", form_zone),
    a_shuffle: ActionAssembler("a_shuffle", form_zone, {
        shuffleMap : {} as Map<number, number>
    }),
    a_draw: ActionAssembler("a_draw", form_zone, {
        cooldown : 0,
        doTurnReset : true,
        actuallyDraw : true,
    }),
} as const;

export type ConstructionExtraParamsType<name extends actionName> = 
    name extends "a_modify_action" ? {} :
    ExtractReturn_any<typeof actionConstructorRegistry[name]> extends Action_class<any, any, infer T0> ? T0 : {}

export type AttrType<name extends actionName> = 
    name extends "a_modify_action" ? any :
    ExtractReturn_any<typeof actionConstructorRegistry[name]> extends Action_class<any, infer T0, any> ? T0 : any

export type TargetType<name extends actionName> = 
    name extends "a_modify_action" ? [identificationInfo_action] :
    ExtractReturn_any<typeof actionConstructorRegistry[name]> extends Action_class<infer T0, any, any> ? T0 : never

const actionFormRegistry = {
    action : (s : dry_system, a : Action | Action_class) => form_action(s)(a),
    card : (s : dry_system, c : dry_card) => form_card(s)(c),
    effect : (s : dry_system, c : dry_card, eff : dry_effect) => form_effect(s)(c, eff),
    subtype : (s : dry_system, c : dry_card, eff : dry_effect, subtype : dry_effectSubType) => form_subtype(s)(c, eff, subtype),
    position : (s : dry_system, pos: dry_position) => form_position(s)(pos),
    zone : (s : dry_system, zone: dry_zone) => form_zone(s)(zone),
    player : (s : dry_system, pid: number) => form_player(s)(pid),
    none : form_none,
    system : form_system
} as const 

export type Action<name extends actionName | undefined = undefined, name2 extends Exclude<actionName, "a_modify_action"> = "a_null"> = 
    name extends actionName ? (name extends "a_modify_action" ? 
    Action_class<
        TargetType<name>, 
        ExtractInnerType<ConstructionExtraParamsType<name2>> | TargetType<name2> | identificationInfo | boolean, 
        Partial<ConstructionExtraParamsType<name2>> & Partial<{
            targets : TargetType<name2>,
            cause : identificationInfo,

            canBeChainedTo : boolean,
            canBeTriggeredTo : boolean
        }>
    > : Action_class<TargetType<name>, AttrType<name>, ConstructionExtraParamsType<name>>) : Action_class

export type ExtractActionName<A> = A extends Action<infer name> ? name : never

export {actionConstructorRegistry, actionFormRegistry}