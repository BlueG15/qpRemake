import { type EffectTypeID, type EffectSubtypeID, EffectModifier, EffectTypeRegistry, EffectSubtypeRegistry } from "../../core";
import { IDRegistry } from "../../core/registry/base";
import type { Setting } from "../../core/settings";

import { 
    Unique,
    Once,
    Instant,
    Chained,
    Delayed,
    FieldLock,
    GraveLock,
    HandOrFieldLock,
    HardUnique,

    //type
    Trigger,
    Passive,
    Manual,
    Lock,
    Init,
    BlankEffectModifier
} from "../../game-components/effects";

type T_EffectTypeOrSubtypeConstructor = new (...p : ConstructorParameters<typeof EffectModifier>) => EffectModifier 

export default class EffectTypeOrSubtypeLoader {

    private classCacheType    = new Map<EffectTypeID, {class : T_EffectTypeOrSubtypeConstructor, instance? : EffectModifier, count? : number}>()
    private classCacheSubtype = new Map<EffectSubtypeID, {class : T_EffectTypeOrSubtypeConstructor, instance? : EffectModifier, count? : number}>()
    
    constructor(){
        //add default types
        this.loadType(EffectTypeRegistry.trigger, Trigger )
        this.loadType(EffectTypeRegistry.passive, Passive )
        this.loadType(EffectTypeRegistry.manual,  Manual  )
        this.loadType(EffectTypeRegistry.lock,    Lock    )
        this.loadType(EffectTypeRegistry.init,    Init    )
        this.loadType(EffectTypeRegistry.defense, Passive )
        this.loadType(EffectTypeRegistry.instant, Instant )
        this.loadType(EffectTypeRegistry.status,  BlankEffectModifier )
        this.loadType(EffectTypeRegistry.counter, BlankEffectModifier )
        this.loadType(EffectTypeRegistry.none,    BlankEffectModifier )

        //add default subtypes
        this.loadSubtype(EffectSubtypeRegistry.unique,          Unique          )
        this.loadSubtype(EffectSubtypeRegistry.once,            Once            )
        this.loadSubtype(EffectSubtypeRegistry.instant,         Instant         )
        this.loadSubtype(EffectSubtypeRegistry.chained,         Chained         )
        this.loadSubtype(EffectSubtypeRegistry.delayed,         Delayed         )
        this.loadSubtype(EffectSubtypeRegistry.fieldLock,       FieldLock       )
        this.loadSubtype(EffectSubtypeRegistry.graveLock,       GraveLock       )
        this.loadSubtype(EffectSubtypeRegistry.handOrFieldLock, HandOrFieldLock )
        this.loadSubtype(EffectSubtypeRegistry.hardUnique,      HardUnique      )
    }

    loadType(key : EffectTypeID | string, c : T_EffectTypeOrSubtypeConstructor){
        if(typeof key === "number") {
            this.classCacheType.set(key, {class : c}); 
            return key;
        }
        const id = IDRegistry.add(EffectTypeRegistry, key)
        this.classCacheType.set(id, {class : c}); 
        return id
    };

    loadSubtype(key : EffectSubtypeID | string, c : T_EffectTypeOrSubtypeConstructor){
        if(typeof key === "number") {
            this.classCacheSubtype.set(key, {class : c}); 
            return key;
        }
        const id = IDRegistry.add(EffectSubtypeRegistry, key)
        this.classCacheSubtype.set(id, {class : c}); 
        return id
    };

    getType(tid : EffectTypeID, s : Setting){
        const data = this.classCacheType.get(tid)
        if(!data) return;

        const c = (data.count ?? 0) + 1
        if(s.singleton_effect_type){
            if(data.instance) return data.instance;
            const res = new data.class(c, tid)
            data.instance = res
            return res
        }

        data.count = c
        return new data.class(c, tid)
    }

    getSubType(tid : EffectSubtypeID, s : Setting){
        const data = this.classCacheSubtype.get(tid)
        if(!data) return;

        const c = (data.count ?? 0) + 1
        if(s.singleton_effect_subtype){
            if(data.instance) return data.instance;
            const res = new data.class(c, tid)
            data.instance = res
            return res
        }

        data.count = c
        return new data.class(c, tid)
    }
}