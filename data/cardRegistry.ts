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

export function defaultPartition(id : string, num : number[] | number = 0) : partitionData{
    num = Array.isArray(num) ? num : [num];
    return {
        behaviorID : partitionActivationBehavior.first,
        mapping : num,
        displayID : id,
        typeID : type_and_or_subtype_inference_method.first,
        subTypeID : type_and_or_subtype_inference_method.all
    }
}

type oldDataURL = "https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/"
export function oldImgURL(oldID : string){
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png`
}

import { Transplant } from "../types/misc"
type k = Transplant<cardData["variantData"]["base"], "atk", 5>

import type { oldCardNames } from "./old/oldData/cards"

//Welp am creating another system for this stuff
class quickCardData<K extends Omit<cardData, "id"> = {
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : [],
                belongTo : [],
                atk : 0,
                hp : 1,
                effects : {},
                imgURL : "",
                partition : [],
            }
        }
    }>{

    data : Omit<cardData, "id"> = {
        variantData : {
            base : {
                level : 1,
                rarityID : rarityRegistry.r_white,
                extensionArr : [],
                belongTo : [],
                atk : 0,
                hp : 1,
                effects : {},
                imgURL : "",
                partition : [],
            }
        }
    }

    //Adding belong to others if belongTo is empty
    fin() : K["variantData"]["base"]["belongTo"] extends [] ? {
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "belongTo"
                    ? ["other"]
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    } : K 
    {
        if(this.data.variantData.base.belongTo.length === 0) 
            this.data.variantData.base.belongTo = ["other"] 
        return this.data as any
    }

    //effects are added to the last partition

    rarity<T extends rarityRegistry>(rarity : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "rarityID"
                    ? T
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.rarityID = rarity
        return this as any
    }

    img<T extends oldCardNames>(oldCardName : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "imgURL"
                    ? `${oldDataURL}${T}.png`
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.imgURL = oldImgURL(oldCardName)
        return this as any
    }

    archtype<T extends string>(archtype : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "extensionArr" | "belongTo" 
                    ? [...K["variantData"]["base"][key2], T]
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.belongTo.push(archtype);
        this.data.variantData.base.extensionArr.push(archtype);
        return this as any
    }

    atk<T extends number>(atk : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "atk"
                    ? T
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.atk = atk
        return this as any
    }

    hp<T extends number>(hp : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "hp"
                    ? T
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.hp = hp
        return this as any
    }

    level<T extends number>(level : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "level"
                    ? T
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>{
        this.data.variantData.base.level = level
        return this as any
    }

    //quickhand stat, tailwind inspired

    get green(){return this.rarity(rarityRegistry.r_green)}
    get blue(){return this.rarity(rarityRegistry.r_blue)}
    get red(){return this.rarity(rarityRegistry.r_red)}
    get algo(){return this.rarity(rarityRegistry.r_algo)}
    get ability(){return this.rarity(rarityRegistry.r_ability)}

    get l1(){return this.level(1)}
    get l2(){return this.level(2)}
    get l3(){return this.level(3)}

    get atk1(){return this.atk(1)}
    get atk2(){return this.atk(2)}
    get atk3(){return this.atk(3)}
    get atk4(){return this.atk(4)}
    get atk5(){return this.atk(5)}

    get hp2(){return this.hp(2)}
    get hp3(){return this.hp(3)}
    get hp4(){return this.hp(4)}
    get hp5(){return this.hp(5)}
    get hp6(){return this.hp(6)}
    get hp7(){return this.hp(7)}
    get hp8(){return this.hp(8)}
    get hp9(){return this.hp(9)}
    get hp10(){return this.hp(10)}

    stat<ATK extends number, HP extends number>(stat0 : ATK, stat1 : HP){
        return this.atk(stat0).hp(stat1)
    }
}

//TODO : change to const later
const cardDataRegistry : {[key : string] : Omit<cardData, "id">}
= {

    //zero eff stuff
    //Code generated, hand cleaned
    //removed the 2 unused nova card that wont work anyway

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
    "c_knife": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".hck"
                ],
                "belongTo": [
                    "other"
                ],
                "atk": 3,
                "hp": 5,
                "effects": {},
                "imgURL": oldImgURL("quantumKnifeTutorial"),
                "partition": []
            }
        }
    },
    "c_quantum_sigil": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("quantumSigil"),
                "partition": []
            }
        }
    },
    "c_sentry": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".sc"
                ],
                "belongTo": [
                    "enemy"
                ],
                "atk": 1,
                "hp": 2,
                "effects": {},
                "imgURL": oldImgURL("enemySentry"),
                "partition": []
            }
        }
    },
    "c_stagemarker": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("stageMarker"),
                "partition": []
            }
        }
    },
    "c_security": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 1,
                "extensionArr": [
                    ".x"
                ],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("securityLock"),
                "partition": []
            }
        }
    },
    "c_objective_data": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".txt"
                ],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("objectiveData1"),
                "partition": []
            }
        }
    },
    "c_active": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 2,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("openingDungeonMark"),
                "partition": []
            }
        }
    },
    "c_dummy": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("puzzleDummy"),
                "partition": []
            }
        }
    },
    "c_loot_dummy": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("lootDummy"),
                "partition": []
            }
        }
    },
    "c_lock_core": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 3,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("queenLockCore"),
                "partition": []
            }
        }
    },
    "c_machine_block": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 2,
                "effects": {},
                "imgURL": oldImgURL("machineBlock"),
                "partition": []
            },
            "2" : {
                "atk": 0,
                "hp": 3,
                "imgURL": oldImgURL("machineBlock2")
            }
        }
    },
    "c_machine_coin": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("machineCoin"),
                "partition": []
            }
        }
    },
    "c_brain_queen": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("brainQueen"),
                "partition": []
            }
        }
    },
    "c_story_oxygen": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("storyOxygen"),
                "partition": []
            }
        }
    },
    "c_story_hydrogen": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("storyHydrogen"),
                "partition": []
            }
        }
    },
    "c_story_backdoor": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("storyBackdoor"),
                "partition": []
            }
        }
    },
    "c_flower_hologram": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "other"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("flowerHologram"),
                "partition": []
            }
        }
    },
    "c_dark_power": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "boss"
                ],
                "atk": 2,
                "hp": 2,
                "effects": {},
                "imgURL": oldImgURL("bossB10MinionSpawn"),
                "partition": []
            }
        }
    },
    "c_zira_defeat": {
        "variantData": {
            "base": {
                "level": 3,
                "rarityID": 3,
                "extensionArr": [
                    ".z"
                ],
                "belongTo": [
                    "boss"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("bossCometDefeat"),
                "partition": []
            }
        }
    },
    "c_bug_passive": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".mw"
                ],
                "belongTo": [
                    "enemy"
                ],
                "atk": 0,
                "hp": 4,
                "effects": {},
                "imgURL": oldImgURL("enemyPassiveBug"),
                "partition": []
            }
        }
    },
    "c_stagemark": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "enemy"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("enemyStageTarget"),
                "partition": []
            }
        }
    },
    "c_strong_bug": {
        "variantData": {
            "base": {
                "level": 2,
                "rarityID": 1,
                "extensionArr": [
                    ".mw"
                ],
                "belongTo": [
                    "enemy"
                ],
                "atk": 2,
                "hp": 3,
                "effects": {},
                "imgURL": oldImgURL("enemyStrongBug"),
                "partition": []
            },
            "upgrade_1": {
                "atk": 3,
                "hp": 5
            }
        }
    },
    "c_firewall": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".sc"
                ],
                "belongTo": [
                    "enemy"
                ],
                "atk": 0,
                "hp": 3,
                "effects": {},
                "imgURL": oldImgURL("enemyWeakWall"),
                "partition": []
            }
        }
    },
    "c_target": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [],
                "belongTo": [
                    "enemy"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("enemyWeakTarget"),
                "partition": []
            }
        }
    },
    "c_curse": {
        "variantData": {
            "base": {
                "level": 0,
                "rarityID": 0,
                "extensionArr": [
                    ".x"
                ],
                "belongTo": [
                    "boss"
                ],
                "atk": 0,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("miniboss1"),
                "partition": []
            }
        }
    },
    "c_legion_token": {
        "variantData": {
            "base": {
                "level": 0,
                "rarityID": 0,
                "extensionArr": [
                    ".legion"
                ],
                "belongTo": [
                    "omegaDungeon1"
                ],
                "atk": 1,
                "hp": 1,
                "effects": {},
                "imgURL": oldImgURL("vampGen2_minion"),
                "partition": []
            },
            "upgrade_1": {
                "atk": 2
            }
        }
    },
    "c_nova_protean": {
        "variantData": {
            "base": {
                "level": 1,
                "rarityID": 0,
                "extensionArr": [
                    ".nova"
                ],
                "belongTo": [
                    "collabNova"
                ],
                "atk": 2,
                "hp": 2,
                "effects": {},
                "imgURL": oldImgURL("novaStandard"),
                "partition": []
            },
            "upgrade_1": {
                "atk": 3,
                "hp": 3
            }
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
    // c_avarice : {

    // },

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
                        doArchtypeCheck : 0
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
                        count : 1
                    }
                },
                imgURL : oldImgURL("naturalCherry"),
                partition : [defaultPartition("c_cherry")]
            },
            upgrade_1 : {
                effects : {
                    e_draw : {
                        count : 2
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
                        doArchtypeCheck : 1
                    },
                }
            },
            upgrade_1 : {
                effects : {
                    e_pollinate : {
                        doArchtypeCheck : 0
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
                        doArchtypeCheck : 1
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_growth : {
                        doArchtypeCheck : 0
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
                        // doIncAtk : 0
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_autumn : {
                        // doIncAtk : 1
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
                        // HPinc : 1
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
                        // HPinc : 2
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