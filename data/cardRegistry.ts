export enum partitionActivationBehavior {
    "strict" = 0, //one reject, all reject
    "loose", //only reject if all reject, otherwise activates those that returns
    "first", //returns the first (in partition ordering) that accepts
    "last", //returns the last (in partition ordering) that accepts,
}

//unless otherwise state, all properties that are string are displayTokenID, NOT actual XML

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
    typeID : keyof typeof effectTypeRegistry,
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
}

import type { effectData_specific, effectName } from "./effectRegistry"
import effectTypeRegistry from "./effectTypeRegistry"

export type effectInfo = {
    effects : Partial<{
        [K in effectName] : Partial<effectData_specific<K>> & {
            __loadOptions? : {
                ___internalMultipleLoadCount? : number,
                __additionalPatches?: Partial<effectData_specific<K>>[]
            }
        }
    }>;
    partition : partitionData[],
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
    //for display only
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

function oldImgURL(oldID : string){
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png`
}

//TODO : change to const later
const cardDataRegistry : {[key : string] : Omit<cardData, "id">}
= {
    c_blank : {
        variantData : {
            base : {
                level : 0,
                rarityID : rarityRegistry.r_white,
                extensionArr : [],
                belongTo : ["other"],
                atk : 0,
                hp : 1,
                effects : {},
                imgURL : oldImgURL("puzzleBlank"),
                partition : [],
            },
        }
    },

    c_test : {
        variantData : {
            base : {
                level : 0, 
                rarityID : rarityRegistry.r_white,
                extensionArr : [],
                belongTo : ["other"],
                atk : 0,
                hp : 1,
                effects : {
                    e_test_input_num : {
                        __loadOptions : {
                            __additionalPatches : [{
                                count : 2
                            }, {
                                count : 1
                            }]
                        }
                    },
                },
                imgURL : oldImgURL("puzzleBlank"),
                partition : [{
                    behaviorID : partitionActivationBehavior.strict,
                    mapping : [0, 1],
                    displayID : "c_test",
                    typeID : type_and_or_subtype_inference_method.first,
                    subTypeID : type_and_or_subtype_inference_method.all
                }]
            }
        }

    },

    //generics

    //white

    //fruits 

    //white
    c_apple : {
        
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
                imgURL : oldImgURL("naturalApple"),
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
                imgURL : oldImgURL("naturalBanana"),
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
                imgURL : oldImgURL("naturalCherry"),
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
                imgURL : oldImgURL("naturalLemon"),
                partition : [defaultPartition("c_lemon")]
            },
            upgrade_1 : {
                atk : 2
            },
        }
    },
    c_pomegranate : {
        
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
                imgURL : oldImgURL("naturalPomegranate"),
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
        
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 3,
                hp : 2,
                imgURL : oldImgURL("naturalPumpkin"),
                partition : [
                    defaultPartition("c_pumpkin"),
                    defaultPartition("c_pumpkin", 1)
                ],
                effects : {
                    e_add_stat_change_diff : {
                        maxHp : 1,
                    },
                    e_fragile : {}
                }
            },
            upgrade_1 : {
                effects : {
                    e_add_stat_change_diff : {
                        maxHp : 2,
                    },
                    e_fragile : {}
                }
            }
        }
    },

    //green
    c_pollinate : {
        
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_green,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 1,
                imgURL : oldImgURL("naturalPollination"),
                partition : [
                    defaultPartition("c_pollinate")
                ],
                effects : {
                    e_pollinate : {
                        doFruitCheck : 1
                    },
                }
            },
            upgrade_1 : {
                effects : {
                    e_pollinate : {
                        doFruitCheck : 0
                    }
                }
            }
        }
    },
    c_greenhouse : {
        
        variantData : {
            base : {
                level : 2,
                rarityID : rarityRegistry.r_green,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 2,
                imgURL : oldImgURL("naturalGreenhouse"),
                partition : [
                    defaultPartition("c_greenhouse")
                ],
                effects : {
                    e_greenhouse : {
                        checkLevel : 1
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_greenhouse : {
                        checkLevel : 2
                    }
                }
            }
        }
    },

    //blue
    c_growth : {
        
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_blue,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 1,
                imgURL : oldImgURL("naturalGrowth"),
                partition : [
                    defaultPartition("c_growth")
                ],
                effects : {
                    e_growth : {
                        doFruitCheck : 1
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_growth : {
                        doFruitCheck : 0
                    }
                }
            }
        }
    },
    
    c_spring : {
        
        variantData : {
            base : {
                level : 2,
                rarityID : rarityRegistry.r_blue,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 1,
                hp : 2,
                imgURL : oldImgURL("naturalSpring"),
                partition : [
                    defaultPartition("c_spring")
                ],
                effects : {
                    e_spring : {
                        checkLevel : 1
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_spring : {
                        checkLevel : 2
                    }
                }
            }
        }
    },
    c_summer : {
        
        variantData : {
            base : {
                level : 2,
                rarityID : rarityRegistry.r_blue,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 1,
                hp : 2,
                imgURL : oldImgURL("naturalSummer"),
                partition : [
                    defaultPartition("c_summer")
                ],
                effects : {
                    e_summer : {
                        checkLevel : 1
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_summer : {
                        checkLevel : 3
                    }
                }
            }
        }
    },
    c_autumn : {
        
        variantData : {
            base : {
                level : 2,
                rarityID : rarityRegistry.r_blue,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 1,
                hp : 2,
                imgURL : oldImgURL("naturalFall"),
                partition : [
                    defaultPartition("c_autumn")
                ],
                effects : {
                    e_autumn : {
                        doIncAtk : 0
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_autumn : {
                        doIncAtk : 1
                    }
                }
            } 
        }
    },
    c_winter : {
        
        variantData : {
            base : {
                level : 2,
                rarityID : rarityRegistry.r_blue,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 1,
                hp : 2,
                imgURL : oldImgURL("naturalWinter"),
                partition : [
                    defaultPartition("c_winter"),
                    defaultPartition("c_winter", 1)
                ],
                effects : {
                    e_winter : {
                        HPinc : 1
                    },
                    e_dmg_reduction : {
                        reductionAmmount : Infinity,
                        minDmg : 1,
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_winter : {
                        HPinc : 2
                    },
                    e_dmg_reduction : {
                        reductionAmmount : Infinity,
                        minDmg : 1,
                    }
                }
            } 
        }
    },
    
    //red
    c_persephone : {
        
        variantData : {
            base : {
                level : 3,
                rarityID : rarityRegistry.r_red,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 0,
                hp : 5,
                imgURL : oldImgURL("naturalPersephone"),
                partition : [
                    defaultPartition("c_persephone"),
                    defaultPartition("c_persephone", 1),
                    defaultPartition("c_persephone", 2),
                ],
                effects : {
                    e_persephone_1 : {},
                    e_persephone_2 : {},
                    e_persephone_3 : {},
                }
            }
        }
    },
    c_demeter : {
        
        variantData : {
            base : {
                level : 3,
                rarityID : rarityRegistry.r_red,
                extensionArr : ["fruit"],
                belongTo : ["fruit"],
                atk : 2,
                hp : 8,
                imgURL : oldImgURL("naturalDemeter"),
                partition : [
                    defaultPartition("c_demeter"),
                    defaultPartition("c_demeter", 1),
                    defaultPartition("c_demeter", 2),
                ],
                effects : {
                    e_demeter_1 : {},
                    e_demeter_2 : {},
                    e_demeter_3 : {},
                }
            }
        }
    },
} as const

export { cardDataRegistry }