import { type EffectTypeID, type EffectSubtypeID, type EffectModifier, EffectTypeRegistry, EffectSubtypeRegistry } from "../../core";
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
    Init
} from "../../game-components/effects";

type T_EffectTypeOrSubtypeConstructor = new (dataID : EffectTypeID | EffectSubtypeID) => EffectModifier 

export default class EffectTypeOrSubtypeLoader {

    private classCacheType    = new Map<EffectTypeID, {class : T_EffectTypeOrSubtypeConstructor, instance? : EffectModifier}>()
    private classCacheSubType = new Map<EffectSubtypeID, {class : T_EffectTypeOrSubtypeConstructor, instance? : EffectModifier}>()
    
    constructor(){
        //add default types
        this.loadType(EffectTypeRegistry.trigger, Trigger )
        this.loadType(EffectTypeRegistry.passive, Passive )
        this.loadType(EffectTypeRegistry.manual,  Manual  )
        this.loadType(EffectTypeRegistry.lock,    Lock    )
        this.loadType(EffectTypeRegistry.init,    Init    )

        //add default subtypes
        this.loadSubType(EffectSubtypeRegistry.unique,          Unique          )
        this.loadSubType(EffectSubtypeRegistry.once,            Once            )
        this.loadSubType(EffectSubtypeRegistry.instant,         Instant         )
        this.loadSubType(EffectSubtypeRegistry.chained,         Chained         )
        this.loadSubType(EffectSubtypeRegistry.delayed,         Delayed         )
        this.loadSubType(EffectSubtypeRegistry.fieldLock,       FieldLock       )
        this.loadSubType(EffectSubtypeRegistry.graveLock,       GraveLock       )
        this.loadSubType(EffectSubtypeRegistry.handOrFieldLock, HandOrFieldLock )
        this.loadSubType(EffectSubtypeRegistry.hardUnique,      HardUnique      )
    }

    loadType(key : EffectTypeID, c : T_EffectTypeOrSubtypeConstructor){
        this.classCacheType.set(key, {class : c});
    };

    loadSubType(key : EffectSubtypeID, c : T_EffectTypeOrSubtypeConstructor){
        this.classCacheSubType.set(key, {class : c});
    };

    getType(tid : EffectTypeID, s : Setting){
        const data = this.classCacheType.get(tid)
        if(!data) return;

        if(s.singleton_effect_type){
            if(data.instance) return data.instance;
            const res = new data.class(tid)
            data.instance = res
            return res
        }

        return new data.class(tid)
    }

    getSubType(tid : EffectSubtypeID, s : Setting){
        const data = this.classCacheSubType.get(tid)
        if(!data) return;

        if(s.singleton_effect_subtype){
            if(data.instance) return data.instance;
            const res = new data.class(tid)
            data.instance = res
            return res
        }

        return new data.class(tid)
    }
}