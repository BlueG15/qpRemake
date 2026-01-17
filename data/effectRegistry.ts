//use for loading effects
// import { effectData } from "./cardRegistry"
import type { isUnion } from "../types/misc"
import type { effectData } from "./cardRegistry"

//Super stupid implementation btw
// 1. this must extends fron Fucntion to work
// 2. toFunc overwrites the function call to returning the internal data
// basically stupid hack top treat a class as a function
export class  quickEffectData<K extends effectData = {
    typeID : "e_t_none",
    subTypeIDs : [],
    localizationKey : undefined,
}> extends Function {

    private constructor(){super()}
    data : effectData = {
            typeID : "e_t_none",
            subTypeIDs : []
        }

    localizationKey<T extends string>(s : T) : quickEffectData<{
        [key in keyof K] : key extends "localizationKey" ? T : K[key]
    }>["T_this"]{
        this.data.localizationKey = s
        return this as any
    }

    type<T extends effectData["typeID"]>(type : T) : quickEffectData<{
        [key in keyof K] : key extends "typeID" ? T : K[key]
    }>["T_this"]{
        this.data.typeID = type
        return this as any
    }

    sub<T extends effectData["subTypeIDs"][0]>(subType : T) : quickEffectData<{
        [key in keyof K] : key extends "subTypeIDs" ? [...K[key], T] : K[key]
    }>["T_this"]{
        this.data.subTypeIDs.push(subType)
        return this as any
    }

    num<T1 extends string>(key : T1, def : number = 0) : quickEffectData<K & {
        [k in T1] : number
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    bool<T1 extends string>(key : T1, def : 0 | 1 = 0) : quickEffectData<K & {
        [k in T1] : 0 | 1
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    tri<T1 extends string>(key : T1, def : 0 | 1 | 2 = 0) : quickEffectData<K & {
        [k in T1] : 0 | 1 | 2
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    optional<T2 extends number, T1 extends string>(key : T1, def : T2 | undefined = undefined) : quickEffectData<K & {
        [k in T1] : T2 | undefined
    }>["T_this"]{
        if(def !== undefined) (this.data as any)[key] = def;
        return this as any
    }

    param<T2 extends number, T1 extends string>(key : T1, def : T2) : quickEffectData<K & {
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

    static get init(){return new quickEffectData().type("e_t_init").toFunc()}
    static get manual(){return new quickEffectData().type("e_t_manual").toFunc()}
    static get trigger(){return new quickEffectData().type("e_t_trigger").toFunc()}
    static get passive(){return new quickEffectData().type("e_t_passive").toFunc()}
    static get status(){return new quickEffectData().type("e_t_status").toFunc()}
    static get counter(){return new quickEffectData().type("e_t_counter").toFunc()}
    static get lock(){return new quickEffectData().type("e_t_lock").toFunc()}
    static get defense(){return new quickEffectData().type("e_t_defense").toFunc()}
    static get instant(){return new quickEffectData().type("e_t_instant").toFunc()}
    static get def(){return {
            typeID : "e_t_none" as const,
            subTypeIDs : []
        }}

    get chained(){return this.sub("e_st_chained")}
    get once(){return this.sub("e_st_once")}
    get unique(){return this.sub("e_st_unique")}
    get instant(){return this.sub("e_st_instant")}
    get fieldLock(){return this.sub("e_st_fieldLock")}
    get graveLock(){return this.sub("e_st_graveLock")}
    get delayed(){return this.sub("e_st_delayed")}
}

const effectDataRegistry = {
    e_generic_stat_change_diff : quickEffectData.status.num("maxAtk", 0).num("maxHp", 0).num("level", 0)(),
    e_generic_stat_change_override : quickEffectData.status.num("maxAtk").num("maxHp").num("level")(),
} as const

type T_effectDataRegistry = typeof effectDataRegistry & {[K : string] : effectData}

type effectName = string
type effectData_specific<T extends "e_generic_stat_change_diff" | "e_generic_stat_change_override" | string, U = T_effectDataRegistry[T]> = {
    [K in keyof U] : K extends "typeID" | "subTypeIDs" | "localizationKey" ? U[K] : (isUnion<U[K]> extends true ? U[K] : number)
}

export default effectDataRegistry
export type {effectName, effectData_specific}