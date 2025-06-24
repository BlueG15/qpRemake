export enum partitionActivationBehavior {
    "strict" = 0, //one reject, all reject
    "loose", //only reject if all reject, otherwise activates those that returns, fills the rejects with nullAction()
    "first", //returns the first (in partition ordering) that accepts
    "last", //returns the last (in partition ordering) that accepts,
}

//unless otherwise state, all properties that are string are displaTokenID, NOT actual XML

/*
every effect has a default displayID, as well as every partition

default display style for an effect:
[effectType] [...effect subtypes] [fallback_displayID]

partition overrides this info, takes in effect display info (type, subtype, effect's displayID) -> maps it to new data
right now mapping IS required despite setting being auto

I...have no idea why 

consensus : card development NEEDS to specify a mapping
partition setting specify to use this or to use one of the auto ones

I granted the auto partitoning feature is a poorly coded one, not a great feature
but the oportunity to mash every effect of a card into one huge ass one is very very funny
*/


type effectData_fixxed = {
    typeID : string,
    subTypeIDs : subtypeName[],
    displayID_default? : string //undefined means use effectID
}

type effectData_variable = {
    [key : string] : number //just numbers, fight me, allow more leads to dum dum more redundant checks 
}

export type effectData = effectData_fixxed | (effectData_fixxed & effectData_variable)

export type statInfo = {
    level: number;
    rarityID: number;
    extensionArr: string[];
    belongTo : string[]; //supposed to be cardSetID[]
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
}

export type displayInfo = {
    //display stuff
    imgURL : string
    partition : partitionData[]
}

import type { effectData_specific, effectName } from "./effectRegistry"

export type effectInfo = {
    effects : Partial<{
        [K in effectName] : Partial<effectData_specific<K>>
        //once done, change this part back to string -> Partial<effectData>
    }>;
}

export type patchData_full = statInfo & effectInfo & displayInfo

export type patchData = Partial<patchData_full>

export type cardData = {
    id : string; //specifically dataID

    //no variant -> use base
    variantData: {
        //these 2 are mandatory entries
        base : patchData_full; //base needed to have all
        // enemy : patchData;
        [key : string] : patchData
    };
}

export type cardData_unified = {
    id : string,
    dataID : string,
    variants : string[],
} & patchData_full

export enum type_and_or_subtype_inference_method {
    "first" = 0, //use the first effect's data
    "most", //use the most
    "all", //concat all, 
}

export interface partitionData {
    behaviorID : partitionActivationBehavior
    mapping : number[]

    //override behavior:
    displayID : string
    typeID : string | type_and_or_subtype_inference_method.first | type_and_or_subtype_inference_method.most
    subTypeID : string | type_and_or_subtype_inference_method
}

import { rarityRegistry } from "./rarityRegistry";
import { subtypeName } from "./subtypeRegistry"

function defaultPartition(id : string, num : number[] | number = 0) : partitionData{
    num = Array.isArray(num) ? num : [num];
    return {
        behaviorID : partitionActivationBehavior.first,
        mapping : num,
        displayID : id,
        typeID : type_and_or_subtype_inference_method.first,
        subTypeID : type_and_or_subtype_inference_method.all
    }
}

const cardDataRegistry : Record<string, cardData> = {
    c_blank : {
        id : "c_blank", 
        variantData : {
            base : {
                level : 0,
                rarityID : rarityRegistry.r_white,
                extensionArr : [],
                belongTo : ["other"],
                atk : 0,
                hp : 1,
                effects : {},
                imgURL : "",
                partition : [],
            },
        }
    },
    c_apple : {
        id : "c_apple",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 2,
                hp : 2,
                effects : {
                    e_apple : {}
                },
                imgURL : "",
                partition : [defaultPartition("c_apple")],
            },
            upgrade_1 : {
                atk : 3,
                hp : 3,
                effects : {
                    e_apple : {
                        count : 2,
                    }
                }
            }
        }
    },
    c_banana : {
        id : "c_banana",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 1,
                effects : {
                    e_banana : {}
                },
                imgURL : "",
                partition : [defaultPartition("c_banana")]
            },
            upgrade_1 : {
                effects : {
                    e_banana : {
                        doFruitCheck : 0
                    }
                }
            },
        }
    },
    c_cherry : {
        id : "c_cherry",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 1,
                effects : {
                    e_draw : {
                        times : 1
                    }
                },
                imgURL : "",
                partition : [defaultPartition("c_cherry")]
            },
            upgrade_1 : {
                effects : {
                    e_draw : {
                        times : 2
                    }
                }
            },
        }
    },
    c_lemon : {
        id : "c_lemon",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 1,
                hp : 2,
                effects : {
                    e_lemon : {}
                },
                imgURL : "",
                partition : [defaultPartition("c_lemon")]
            },
            upgrade_1 : {
                atk : 2
            },
        }
    },
    c_pomegranate : {
        id : "c_pomegranate",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 1,
                effects : {
                    e_pomegranate : {
                        exposedDmg : 1,
                        coveredDmg : 1,
                    }
                },
                imgURL : "",
                partition : [defaultPartition("c_pomegranate")]
            },
            upgrade_1 : {
                effects : {
                    e_pomegranate : {
                        exposedDmg : 2,
                        coveredDmg : 1,
                    }
                }
            },
        }
    },
    c_pumpkin : {
        id : "c_pumpkin",
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 3,
                hp : 2,
                imgURL : "",
                partition : [
                    defaultPartition("c_pumpkin"),
                    defaultPartition("c_pumpkin", 1)
                ],
                effects : {
                    e_add_stat_change_diff : {
                        hp : 1,
                        maxHp : 1,
                    },
                    e_fragile : {}
                }
            },
            upgrade_1 : {
                effects : {
                    e_add_stat_change_diff : {
                        hp : 2,
                        maxHp : 2,
                    },
                    e_fragile : {}
                }
            }
        }
    }

}

export { cardDataRegistry }