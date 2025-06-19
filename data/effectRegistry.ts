//use for loading effects

import { effectData } from "./cardRegistry"
import effectTypeRegistry from "./effectTypeRegistry"

const  effectDataRegistry : Record<string, effectData> = {
    //actual effects - specifics
    e_apple : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_init],
        subTypeIDs : []
    },

    //actual effects - generics
    e_dmg_reduction : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_passive],
        subTypeIDs : [],
        reductionAmmount : 0, //changable
        minDmg : 0, //chanagable
    },
    e_reactivate : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_trigger],
        subTypeIDs : ["e_fieldLock"],
    },
    e_destroy_self : {
        typeID : effectTypeRegistry[effectTypeRegistry.e_manual],
        subTypeIDs : ["e_fieldLock"],
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
    
}

export default effectDataRegistry