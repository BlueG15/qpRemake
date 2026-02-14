import { BrandedString, Callable } from "./misc"
import { CardVariantName } from "./registry"
import { EffectTypeRegistry, type EffectTypeID, type EffectSubtypeID, EffectSubtypeRegistry } from "./registry/effect"
// import { EffectDataRegistry } from "../../core/registry/effect"

//Data
type EffectDataFixxed = {
    typeID : EffectTypeID,
    subTypeIDs : EffectSubtypeID[],
    localizationKey? : string //used for looking up texts in localizer, undef = use effect dataID
}

type EffectDataVariable = Record<string, number>

export type EffectData = EffectDataFixxed | (EffectDataFixxed & EffectDataVariable)
export type EffectDataPartial = Partial<EffectDataFixxed> | (Partial<EffectDataFixxed> & {[key : string] : number | undefined})

export type EffectDataWithVariantKeys = {
    base : EffectData,
    [K : string] : EffectDataPartial
}

type Flatten<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

class EffectDataGenerator extends Callable<EffectDataWithVariantKeys> {
    override onCall(){
        const base = this.full()
        return {base, ...this.storedVariants}
    }
    storedVariants : Record<string, EffectDataPartial> = {}
    data : EffectDataPartial = {} //tretaed as base
    private constructor(){super()}

    localizationKey(s : string){
        this.data.localizationKey = s
        return this.T
    }

    type(type : EffectTypeID){
        this.data.typeID = type
        return this.T
    }

    sub(...subType : EffectSubtypeID[]){
        const arr = this.data.subTypeIDs ?? []
        arr.push(...subType)
        this.data.subTypeIDs = []
        return this.T
    }

    num<T_Key extends string>(key : T_Key, def : number = 0){
        return this.specificTyped(key, def)
    }

    bool<T_Key extends string>(key : T_Key, def : 0 | 1 = 0){
        return this.specificTyped(key, def)
    }

    tri<T_Key extends string>(key : T_Key, def : 0 | 1 | 2 = 0){
        return this.specificTyped(key, def)
    }

    optional<T_Key extends string>(key : T_Key, def : number | undefined = undefined){
        return this.specificTyped(key, def)
    }

    specificTyped<T_Key extends string, T_Typed extends number | undefined>(
        key: T_Key, def: T_Typed
    ) {
        (this.data as any)[key] = def;
        return this.T
    }

    count(def : number = 0){return this.num("count", def)}

    variant(name : string, data : EffectDataVariable | EffectDataGenerator){
        this.storedVariants[name] = data instanceof EffectDataGenerator ? data.partial() : data as any
        return this.T
    }

    upgrade(data : EffectDataVariable | EffectDataGenerator){
        return this.variant(CardVariantName.upgrade_1, data)
    }

    //final functions
    full() : EffectData {
        const full : EffectData = {
            typeID : EffectTypeRegistry.none,
            subTypeIDs : [] as EffectSubtypeID[],
        }
        return Utils.patch(full, this.data)
    }

    partial(){
        return this.data
    }

    static get partial(){
        return new EffectDataGenerator().T
    }

    get fieldLock(){  return this.sub(EffectSubtypeRegistry.fieldLock) }
    get graveLock(){  return this.sub(EffectSubtypeRegistry.graveLock) }
    get chained(){    return this.sub(EffectSubtypeRegistry.chained)   }
    get instant(){    return this.sub(EffectSubtypeRegistry.instant)   }
    get delayed(){    return this.sub(EffectSubtypeRegistry.delayed)   }
    get unique(){     return this.sub(EffectSubtypeRegistry.unique)    }
    get once(){       return this.sub(EffectSubtypeRegistry.once)      }

    static get counter() { return new EffectDataGenerator().type(EffectTypeRegistry.counter ) }
    static get trigger() { return new EffectDataGenerator().type(EffectTypeRegistry.trigger ) }
    static get passive() { return new EffectDataGenerator().type(EffectTypeRegistry.passive ) }
    static get defense() { return new EffectDataGenerator().type(EffectTypeRegistry.defense ) }
    static get instant() { return new EffectDataGenerator().type(EffectTypeRegistry.instant ) }
    static get manual()  { return new EffectDataGenerator().type(EffectTypeRegistry.manual  ) }
    static get status()  { return new EffectDataGenerator().type(EffectTypeRegistry.status  ) }
    static get init()    { return new EffectDataGenerator().type(EffectTypeRegistry.init    ) }
    static get lock()    { return new EffectDataGenerator().type(EffectTypeRegistry.lock    ) }
    static get def()     { return { base : { typeID : "e_t_none" as const, subTypeIDs : [] }} }
}

export const EffectData = EffectDataGenerator