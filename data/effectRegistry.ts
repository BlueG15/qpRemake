//use for loading effects
// import { effectData } from "./cardRegistry"
import effectTypeRegistry from "./effectTypeRegistry"
import { damageType, Readonly_recur, isUnion } from "../types/misc"
import { effectData } from "./cardRegistry"

const effectDataRegistry = {
    //actual effects - specifics
    e_apple : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : [],

        count : 1,
    },
    e_banana : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : [],

        doFruitCheck : 1 as 0 | 1,        
    },
    e_lemon : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : []
    },
    e_pomegranate : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : [],

        exposedDmg : 1,
        coveredDmg : 2,
    },
    e_pollinate : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : [],

        doFruitCheck : 1 as 0 | 1,
    },

    //actual effects - generics
    e_dmg_reduction : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_passive],
        subTypeIDs : [],

        reductionAmmount : 0, //changable
        minDmg : 0, //chanagable
    },
    e_reactivate : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"],
    },
    e_destroy_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"],
    },
    e_clear_all_status_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_reactivate_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_deactivate_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_decompile_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_execute_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_void_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"]
    },
    e_do_nothing : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_none],
        subTypeIDs : []
    },
    e_addToHand : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual], //default is manual, could be others
        subTypeIDs : []
    },
    e_add_counter : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : []
    },
    e_add_stat_change_diff : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : [],

        atk : 0,
        hp : 0,
        maxAtk : 0,
        maxHp : 0,
        level : 0,
    },
    e_attack : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : [],

        times : 0,
        dmg : 0,
        dmgType : damageType.physical as damageType
    },
    e_quick : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : ["e_chained"]
    },
    e_reflect : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : []
    },
    e_revenge : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : []
    },
    e_volatile : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_passive],
        subTypeIDs : []
    },
    e_fragile : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : []
    },
    e_draw : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : [],

        times : 0,
        cooldown : NaN
    }, 
    e_revive : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : []
    },

    

    //still generics but very specifics
    e_reactivate_on_attack_destroy : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : ["e_fieldLock"],
    },



    //status effects
    generic_counter : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_counter],
        subTypeIDs : [],
        count : 1,
    },
    generic_stat_change_diff : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_status],
        subTypeIDs : [],

        atk : 0,
        hp : 0,
        maxAtk : 0,
        maxHp : 0,
        level : 0,
    },
    
} as const

type effectName = keyof typeof effectDataRegistry
type effectData_specific<T extends effectName, U = (typeof effectDataRegistry[T])> = {
    [K in keyof U] : K extends "typeID" | "subTypeIDs" ? U[K] : (isUnion<U[K]> extends true ? U[K] : number)
}

export default effectDataRegistry
export type {effectName, effectData_specific}