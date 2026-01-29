import { EffectData } from "../../core"
import { EffectTypeRegistry, type EffectTypeID, type EffectSubtypeID, EffectSubtypeRegistry } from "../../core/registry/effect"

export class  EffectDataGenerator<
    K extends EffectData = {
        typeID : EffectTypeID,
        subTypeIDs : [],
        localizationKey : undefined,
    }
> extends Function {

    private constructor(){super()}
    data : EffectData = {
            typeID : EffectTypeRegistry.none,
            subTypeIDs : []
        }

    localizationKey<T extends string>(s : T) : EffectDataGenerator<{
        [key in keyof K] : key extends "localizationKey" ? T : K[key]
    }>["T_this"]{
        this.data.localizationKey = s
        return this as any
    }

    type<T extends EffectData["typeID"]>(type : T) : EffectDataGenerator<{
        [key in keyof K] : key extends "typeID" ? T : K[key]
    }>["T_this"]{
        this.data.typeID = type
        return this as any
    }

    sub<T extends EffectData["subTypeIDs"][0]>(subType : T) : EffectDataGenerator<{
        [key in keyof K] : key extends "subTypeIDs" ? [...K[key], T] : K[key]
    }>["T_this"]{
        this.data.subTypeIDs.push(subType)
        return this as any
    }

    num<T1 extends string>(key : T1, def : number = 0) : EffectDataGenerator<K & {
        [k in T1] : number
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    bool<T1 extends string>(key : T1, def : 0 | 1 = 0) : EffectDataGenerator<K & {
        [k in T1] : 0 | 1
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    tri<T1 extends string>(key : T1, def : 0 | 1 | 2 = 0) : EffectDataGenerator<K & {
        [k in T1] : 0 | 1 | 2
    }>["T_this"]{
        (this.data as any)[key] = def
        return this as any
    }

    optional<T2 extends number, T1 extends string>(key : T1, def : T2 | undefined = undefined) : EffectDataGenerator<K & {
        [k in T1] : T2 | undefined
    }>["T_this"]{
        if(def !== undefined) (this.data as any)[key] = def;
        return this as any
    }

    param<T2 extends number, T1 extends string>(key : T1, def : T2) : EffectDataGenerator<K & {
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

    static get counter(){  return new EffectDataGenerator().type(EffectTypeRegistry.counter ).toFunc() }
    static get trigger(){  return new EffectDataGenerator().type(EffectTypeRegistry.trigger ).toFunc() }
    static get passive(){  return new EffectDataGenerator().type(EffectTypeRegistry.passive ).toFunc() }
    static get defense(){  return new EffectDataGenerator().type(EffectTypeRegistry.defense ).toFunc() }
    static get instant(){  return new EffectDataGenerator().type(EffectTypeRegistry.instant ).toFunc() }
    static get manual(){   return new EffectDataGenerator().type(EffectTypeRegistry.manual  ).toFunc() }
    static get status(){   return new EffectDataGenerator().type(EffectTypeRegistry.status  ).toFunc() }
    static get init(){     return new EffectDataGenerator().type(EffectTypeRegistry.init    ).toFunc() }
    static get lock(){     return new EffectDataGenerator().type(EffectTypeRegistry.lock    ).toFunc() }
    static get def(){return {
            typeID : "e_t_none" as const,
            subTypeIDs : []
        }}

    get fieldLock(){  return this.sub(EffectSubtypeRegistry.fieldLock) }
    get graveLock(){  return this.sub(EffectSubtypeRegistry.graveLock) }
    get chained(){    return this.sub(EffectSubtypeRegistry.chained)   }
    get instant(){    return this.sub(EffectSubtypeRegistry.instant)   }
    get delayed(){    return this.sub(EffectSubtypeRegistry.delayed)   }
    get unique(){     return this.sub(EffectSubtypeRegistry.unique)    }
    get once(){       return this.sub(EffectSubtypeRegistry.once)      }
}