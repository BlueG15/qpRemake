//use for loading effects
// import { effectData } from "./cardRegistry"
import { damageType, isUnion } from "../types/misc"
import type { effectData } from "./cardRegistry"
import { zoneRegistry } from "./zoneRegistry"

//Super stupid implementation btw
// 1. this must extends fron Fucntion to work
// 2. toFunc overwrites the function call to returning the internal data
export class quickEffect<K extends effectData = {
    typeID : "e_none",
    subTypeIDs : []
}> extends Function {

    private constructor(){super()}
    data : effectData = {
            typeID : "e_none",
            subTypeIDs : []
        }


    type<T extends effectData["typeID"]>(type : T) : quickEffect<{
        [key in keyof K] : key extends "typeID" ? T : K[key]
    }>["T_this"]{
        this.data.typeID = type
        return this as any
    }

    sub<T extends effectData["subTypeIDs"][0]>(subType : T) : quickEffect<{
        [key in keyof K] : key extends "subTypeIDs" ? [...K[key], T] : K[key]
    }>["T_this"]{
        this.data.subTypeIDs.push(subType)
        return this as any
    }

    num<T1 extends string>(key : T1, def : number = 0) : quickEffect<K & {
        [k in T1] : number
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    bool<T1 extends string>(key : T1, def : 0 | 1 = 0) : quickEffect<K & {
        [k in T1] : 0 | 1
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    tri<T1 extends string>(key : T1, def : 0 | 1 | 2 = 0) : quickEffect<K & {
        [k in T1] : 0 | 1 | 2
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    optional<T2 extends number, T1 extends string>(key : T1, def : T2 | undefined = undefined) : quickEffect<K & {
        [k in T1] : T2 | undefined
    }>["T_this"]{
        if(def !== undefined) (this.data as any)[key] = def;
        return this as any
    }

    param<T2 extends number, T1 extends string>(key : T1, def : T2) : quickEffect<K & {
        [k in T1] : T2
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    count(def : number = 0){return this.num("count", def)}

    private T_this : (() => K) & this = 0 as any
    private toFunc(){
        return new Proxy(this, {
            apply(target){
                return target.data
            }
        }) as (() => K) & this
    }

    static get init(){return new quickEffect().toFunc().type("e_init")}
    static get manual(){return new quickEffect().type("e_manual").toFunc()}
    static get trigger(){return new quickEffect().type("e_trigger").toFunc()}
    static get passive(){return new quickEffect().type("e_passive").toFunc()}
    static get status(){return new quickEffect().type("e_status").toFunc()}
    static get counter(){return new quickEffect().type("e_counter").toFunc()}
    static get lock(){return new quickEffect().type("e_lock").toFunc()}
    static get def(){return {
            typeID : "e_none",
            subTypeIDs : []
        }}

    get chained(){return this.sub("e_chained")}
    get once(){return this.sub("e_once")}
    get unique(){return this.sub("e_unique")}
    get instant(){return this.sub("e_instant")}
    get fieldLock(){return this.sub("e_fieldLock")}
    get graveLock(){return this.sub("e_graveLock")}
    get delayed(){return this.sub("e_delayed")}
}

const effectDataRegistry //: { [K in string] : effectData} 
= {
    //test effects
    e_test_input_num : quickEffect.init.count(1)(),

    //actual effects - specifics
    //Update 1.2.8 : there shouldnt be any specific effect ngl, use the partition system

    // //fruits
    // e_apple : quickEffect.init.count(1)(),
    // e_banana : quickEffect.init.bool("doArchtypeCheck", 1)(),
    // e_lemon : quickEffect.init(),
    // e_pomegranate : quickEffect.trigger.num("exposedDmg", 1).num("coveredDmg", 2)(),
    // e_pollinate : quickEffect.init.bool("doArchtypeCheck", 1)(),
    // e_greenhouse : quickEffect.trigger.unique.num("checkLevel", 1)(),
    // e_growth : quickEffect.init.bool("doArchtypeCheck", 1)(),
    // e_spring : quickEffect.init.num("checkLevel", 1)(),
    // e_summer : quickEffect.init.num("checkLevel", 1)(),
    // e_winter : quickEffect.init(),
    // e_autumn : quickEffect.init(),
    // e_persephone_1 : quickEffect.init(),
    // e_persephone_2 : quickEffect.passive.delayed(),
    // e_persephone_3 : quickEffect.lock(),
    // e_demeter_1 : quickEffect.init(),
    // e_demeter_2 : quickEffect.trigger.unique(),
    // e_demeter_3 : quickEffect.lock(),

    //actual effects - generics
    e_dmg_reduction : quickEffect.passive.num("reductionAmmount").num("minDmg").optional("reductionDmgType", damageType.physical)(),
    e_delay : quickEffect.manual.count().num("delayCount")(),
    e_bounce : quickEffect.manual.count().num("target_zone", zoneRegistry.z_field)(),
    e_delay_all : quickEffect.manual.num("delayCount")(),
    // e_reactivate : quickEffect.manual.fieldLock(),

    e_reset_self : quickEffect.manual.fieldLock(),
    e_destroy_self : quickEffect.manual.fieldLock(),
    e_clear_all_status_self : quickEffect.manual.fieldLock(),
    e_reactivate_self : quickEffect.manual.fieldLock(),
    e_deactivate_self : quickEffect.manual.fieldLock(),
    e_decompile_self : quickEffect.manual.fieldLock(),
    e_execute_self : quickEffect.manual.fieldLock(),
    e_void_self : quickEffect.manual.fieldLock(),

    e_do_nothing : quickEffect.def,
        
    e_addToHand : quickEffect.manual(),
    e_add_counter : quickEffect.manual(),
    e_add_stat_change_diff : quickEffect.manual.num("maxAtk").num("maxHp").num("level")(),
    e_add_stat_change_override : quickEffect.manual.num("maxAtk").num("maxHp").num("level")(),
    e_attack : quickEffect.manual.count().num("dmg").param("dmgType", damageType.physical)(),
    e_quick : quickEffect.init.chained(),
    e_reflect : quickEffect.trigger(),
    e_revenge : quickEffect.trigger(),
    e_volatile : quickEffect.passive(),
    e_fragile : quickEffect.trigger(),
    e_draw : quickEffect.manual.count().num("cooldown")(), 
    e_draw_until : quickEffect.manual.count()(),
    e_revive : quickEffect.manual(),

    //status effects
    e_generic_counter : quickEffect.counter.count(1)(),
    e_generic_stat_change_diff : quickEffect.status.num("maxAtk").num("maxHp").num("level")(),
    e_generic_stat_change_override : quickEffect.status.num("maxAtk").num("maxHp").num("level")(),
    e_any_extension : quickEffect.status(),

    //condition effect
    e_on_atk_destroy : quickEffect.def,

    //lock effects
    e_generic_lock : quickEffect.lock()
    

    
} as const

type effectName = keyof typeof effectDataRegistry
type effectData_specific<T extends effectName, U = (typeof effectDataRegistry[T])> = {
    [K in keyof U] : K extends "typeID" | "subTypeIDs" ? U[K] : (isUnion<U[K]> extends true ? U[K] : number)
}

export default effectDataRegistry
export type {effectName, effectData_specific}