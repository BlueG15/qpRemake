//use for loading effects
// import { effectData } from "./cardRegistry"
import type effectTypeRegistry from "./effectTypeRegistry"
import { damageType, Readonly_recur, isUnion } from "../types/misc"
import type { effectData } from "./cardRegistry"

const effectDataRegistry //: { [K in string] : effectData} 
= {
    //test effects
    e_test_input_num : {
        typeID : "e_init",
        subTypeIDs : [],

        count : 1,
    },

    //actual effects - specifics

    //fruits
    e_apple : {
        typeID : "e_init",
        subTypeIDs : [],

        count : 1,
    },
    e_banana : {
        typeID : "e_init",
        subTypeIDs : [],

        doFruitCheck : 1 as 0 | 1,        
    },
    e_lemon : {
        typeID : "e_init",
        subTypeIDs : []
    },
    e_pomegranate : {
        typeID : "e_trigger",
        subTypeIDs : [],

        exposedDmg : 1,
        coveredDmg : 2,
    },
    e_pollinate : {
        typeID : "e_init",
        subTypeIDs : [],

        doFruitCheck : 1 as 0 | 1,
    },
    e_greenhouse : {
        typeID : "e_trigger",
        subTypeIDs : ["e_unique"],

        checkLevel : 1,
    },
    e_growth : {
        typeID : "e_init",
        subTypeIDs : [],

        doFruitCheck : 1 as 0 | 1,
    },
    e_spring : {
        typeID : "e_init",
        subTypeIDs : [],

        checkLevel : 1,
    },
    e_summer : {
        typeID : "e_init",
        subTypeIDs : [],

        checkLevel : 1,
    },
    e_winter : {
        typeID : "e_init",
        subTypeIDs : [],

        HPinc : 1,
    },
    e_autumn : {
        typeID : "e_init",
        subTypeIDs : [],

        doIncAtk : 0 as 0 | 1
    },
    e_persephone_1 : {
        typeID : "e_init",
        subTypeIDs : [],
    },
    e_persephone_2 : {
        typeID : "e_passive",
        subTypeIDs : ["e_delayed"],
    },
    e_persephone_3 : {
        typeID : "e_lock",
        subTypeIDs : [],
    },
    e_demeter_1 : {
        typeID : "e_init",
        subTypeIDs : [],
    },
    e_demeter_2 : {
        typeID : "e_trigger",
        subTypeIDs : ["e_unique"],
    },
    e_demeter_3 : {
        typeID : "e_lock",
        subTypeIDs : [],
    },

    //actual effects - generics
    e_dmg_reduction : {
        typeID : "e_passive",
        subTypeIDs : [],

        reductionAmmount : 0, //changable
        minDmg : 0, //chanagable
        reductionDmgType : undefined as damageType | undefined
    },
    e_reactivate : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"],
    },
    e_destroy_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"],
    },
    e_clear_all_status_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_reactivate_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_deactivate_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_decompile_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_execute_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_void_self : {
        typeID : "e_manual",
        subTypeIDs : ["e_fieldLock"]
    },
    e_do_nothing : {
        typeID : "e_none",
        subTypeIDs : []
    },
    e_addToHand : {
        typeID : "e_manual", //default is manual, could be others
        subTypeIDs : []
    },
    e_add_counter : {
        typeID : "e_manual",
        subTypeIDs : []
    },
    e_add_stat_change_diff : {
        typeID : "e_manual",
        subTypeIDs : [],

        maxAtk : 0,
        maxHp : 0,
        level : 0,
    },
    e_attack : {
        typeID : "e_manual",
        subTypeIDs : [],

        times : 0,
        dmg : 0,
        dmgType : damageType.physical as damageType
    },
    e_quick : {
        typeID : "e_init",
        subTypeIDs : ["e_chained"]
    },
    e_reflect : {
        typeID : "e_trigger",
        subTypeIDs : []
    },
    e_revenge : {
        typeID : "e_trigger",
        subTypeIDs : []
    },
    e_volatile : {
        typeID : "e_passive",
        subTypeIDs : []
    },
    e_fragile : {
        typeID : "e_trigger",
        subTypeIDs : []
    },
    e_draw : {
        typeID : "e_manual",
        subTypeIDs : [],

        times : 0,
        cooldown : NaN
    }, 
    e_revive : {
        typeID : "e_manual",
        subTypeIDs : []
    },

    

    //still generics but very specifics
    e_reactivate_on_attack_destroy : {
        typeID : "e_trigger",
        subTypeIDs : ["e_fieldLock"],
    },



    //status effects
    generic_counter : {
        typeID : "e_counter",
        subTypeIDs : [],
        count : 1,
    },
    generic_stat_change_diff : {
        typeID : "e_status",
        subTypeIDs : [],

        maxAtk : 0,
        maxHp : 0,
        level : 0,
    },
    generic_stat_change_override : {
        typeID : "e_status",
        subTypeIDs : [],

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