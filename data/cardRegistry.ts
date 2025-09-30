//update 1.2.9: changed the definitions of these
//If changed in future to no longer be activating the entire partition if activate
//change activatePartition in card
export enum partitionActivationBehavior {
    "strict" = 0, //one reject, all reject
    "first", //first authoritatitve, first rejects, all rejects
    "last", //last authoritative, ...
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
import type effectTypeRegistry from "./effectTypeRegistry"

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
    displayID? : string
    typeID : string | type_and_or_subtype_inference_method.first | type_and_or_subtype_inference_method.most
    subTypeID : string[] | type_and_or_subtype_inference_method
}

import { rarityRegistry } from "./rarityRegistry";
import { subtypeName } from "./subtypeRegistry"

export function defaultPartition(id? : string, num : number[] | number = 0) : partitionData{
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

import type { lastInfo, NumToLambda, LambdaToNum, Transplant, successor } from "../types/misc"
type k = Transplant<cardData["variantData"]["base"], "atk", 5>

import type { oldCardNames } from "./old/oldData/cards"

//Welp am creating another system for this stuff
class quickCardData<K extends Omit<cardData, "id"> = 
{
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
}> extends Function {

    private constructor(){super()}
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
    }>["T_this"]{
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
    }>["T_this"]{
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
    }>["T_this"]{
        this.data.variantData.base.belongTo.push(archtype);
        this.data.variantData.base.extensionArr.push(archtype);
        return this as any
    }

    extension<T extends string>(ex : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "extensionArr"
                    ? [...K["variantData"]["base"][key2], T]
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>["T_this"]{
        this.data.variantData.base.extensionArr.push(ex);
        return this as any
    }

    belongTo<T extends string>(ex : T) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "belongTo" 
                    ? [...K["variantData"]["base"][key2], T]
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>["T_this"]{
        this.data.variantData.base.belongTo.push(ex);
        return this as any
    }

    enemy(){
        return this.belongTo("enemy")
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
    }>["T_this"]{
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
    }>["T_this"]{
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
    }>["T_this"]{
        this.data.variantData.base.level = level
        return this as any
    }

    variant<newKey extends string, X extends patchData>(key : newKey, data : X) : quickCardData<{
        variantData : K["variantData"] & {
            [K in newKey] : X
        }
    }>["T_this"]{
        (this.data.variantData as any)[key] = data;
        return this as any 
    }

    upgrade<X extends patchData>(data : X){
        return this.variant("upgrade_1", data)
    }

    effect<X extends effectInfo>(
        data : X
    ) : quickCardData<{
        variantData : {
            [key in keyof K["variantData"]] : key extends "base" ? {
                [key2 in keyof K["variantData"]["base"]] : 
                    key2 extends "effects" | "partition"
                    ? X[key2]
                    : K["variantData"]["base"][key2]
            } : K["variantData"][key]
        }
    }>["T_this"]{
        this.data.variantData.base.effects = data.effects;
        this.data.variantData.base.partition = data.partition;
        return this as any
    }

    //quickhand stat, tailwind inspired

    static get def(){return new quickCardData().toFunc()}
    static get green(){return new quickCardData().rarity(rarityRegistry.r_green).toFunc()}
    static get blue(){return new quickCardData().rarity(rarityRegistry.r_blue).toFunc()}
    static get red(){return new quickCardData().rarity(rarityRegistry.r_red).toFunc()}
    static get algo(){return new quickCardData().rarity(rarityRegistry.r_algo).toFunc()}
    static get ability(){return new quickCardData().rarity(rarityRegistry.r_ability).toFunc()}

    get l0(){return this.level(0)}
    get l2(){return this.level(2)}
    get l3(){return this.level(3)}

    static get l0(){return new quickCardData().l0.toFunc()}
    static get l2(){return new quickCardData().l2.toFunc()}
    static get l3(){return new quickCardData().l3.toFunc()}

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

    static stat<ATK extends number, HP extends number>(stat0 : ATK, stat1 : HP){
        return new quickCardData().atk(stat0).hp(stat1).toFunc()
    }

    private T_this : (() => ReturnType<this["fin"]>) & this = 0 as any
    private toFunc(){
        return new Proxy(this, {
            apply(target){
                return target.fin()
            }
        }) as (() => ReturnType<this["fin"]>) & this
    }
}

class quickEffectInfo<K extends effectInfo = {
    effects : {},
    partition : []
}, effCountArr extends 0[] = []> extends Function{
    private constructor(){super()}
    data : effectInfo = {
        effects : {},
        partition : []
    }
    effCountArr : number = 0
    currPartition : number = 0

    private p_start<T_id extends string | undefined = undefined>(id? : T_id) : quickEffectInfo<{
        effects : K["effects"],
        partition : [...K["partition"], {
            behaviorID : partitionActivationBehavior.first,
            mapping : [],
            displayID : T_id,
            typeID : type_and_or_subtype_inference_method.first,
            subTypeID : type_and_or_subtype_inference_method.all
        }]
    }, effCountArr>["T_this"]{
        this.data.partition[this.currPartition] = defaultPartition(id)
        return this as any
    }

    p<T_id extends string>(id? : T_id) : quickEffectInfo<{
        effects : K["effects"],
        partition : [...K["partition"], {
            behaviorID : partitionActivationBehavior.first,
            mapping : [],
            displayID : T_id,
            typeID : type_and_or_subtype_inference_method.first,
            subTypeID : type_and_or_subtype_inference_method.all
        }]
    }, effCountArr>["T_this"]{
        this.currPartition++;
        this.data.partition[this.currPartition] = defaultPartition(id, this.effCountArr)
        return this as any
    }

    e<
        Key extends effectName, 
        Data extends Partial<effectData_specific<Key>>,
        L extends [partitionData[], partitionData[]] = lastInfo<K["partition"]>
    >(key : Key, obj : Data): quickEffectInfo<{
        effects : K["effects"] & {
            [z in Key] : Data
        },
        partition : [...L[1], {
            [key in keyof L[0][0]] 
            : key extends "mapping" 
            ? [...L[0][0][key], effCountArr["length"]] 
            : L[0][0][key]
        }]
    }, [0, ...effCountArr] >["T_this"]{
        this.data.effects[key] = obj as any
        this.data.partition[this.currPartition].mapping.push(this.effCountArr)
        this.data.partition[this.currPartition].mapping = Array.from(new Set(this.data.partition[this.currPartition].mapping))
        this.effCountArr++
        return this as any
    }

    displayID<
        T_id extends string,
        L extends [partitionData[], partitionData[]] = lastInfo<K["partition"]>,
    >(id : T_id): quickEffectInfo<{
        effects : K["effects"]
        partition : [...L[1], {
            [key in keyof L[0][0]] 
            : key extends "displayID"
            ? T_id
            : L[0][0][key]
        }]
    }, effCountArr>["T_this"] {
        this.data.partition[this.currPartition].displayID = id
        return this as any
    }

    behavior<
        newBahavior extends partitionActivationBehavior,
        L extends [partitionData[], partitionData[]] = lastInfo<K["partition"]>,
    >(be : newBahavior): quickEffectInfo<{
        effects : K["effects"]
        partition : [...L[1], {
            [key in keyof L[0][0]] 
            : key extends "behaviorID"
            ? newBahavior
            : L[0][0][key]
        }]
    }, effCountArr>["T_this"] {
        this.data.partition[this.currPartition].behaviorID = be
        return this as any
    }

    static def(displayID? : string){
        return new quickEffectInfo().p_start(displayID).toFunc()
    }

    fin() : K{
        return this.data as any
    }

    private T_this : (() => ReturnType<this["fin"]>) & this = 0 as any
    private toFunc(){
        return new Proxy(this, {
            apply(target){
                return target.fin()
            }
        }) as (() => ReturnType<this["fin"]>) & this
    }
}

//TODO : change to const later
const cardDataRegistry : {[key : string] : Omit<cardData, "id">}
= {

    //zero eff stuff
    //removed the 2 unused nova card that wont work anyway

    c_blank : quickCardData.def.img("puzzleBlank")(),
    c_knife : quickCardData.def.extension(".hck").stat(3, 5).img("quantumKnifeTutorial")(),
    c_quantum_sigil : quickCardData.def.img("quantumSigil")(),
    c_sentry :  quickCardData.def.extension("sc").enemy().stat(1, 2).img("enemySentry")(),
    c_stagemarker : quickCardData.def.img("stageMarker")(),
    c_security : quickCardData.def.extension("x").img("securityLock")(),
    c_objective_data : quickCardData.def.extension("txt").img("objectiveData1")(),
    c_active : quickCardData.green.img("openingDungeonMark")(),
    c_dummy : quickCardData.def.img("puzzleDummy")(),
    c_loot_dummy : quickCardData.def.img("lootDummy")(),
    c_lock_core : quickCardData.red.img("queenLockCore")(),
    c_machine_block : quickCardData.def.stat(0, 2).img("machineBlock").variant(
        "2",
        {hp : 3, imgURL : oldImgURL("machineBlock2")}
    )(),
    c_machine_coin : quickCardData.def.img("machineCoin")(),
    c_brain_queen : quickCardData.def.img("brainQueen")(),
    c_story_oxygen : quickCardData.def.img("storyOxygen")(),
    c_story_hydrogen: quickCardData.def.img("storyHydrogen")(),
    c_story_backdoor: quickCardData.def.img("storyBackdoor")(),
    c_flower_hologram: quickCardData.def.img("flowerHologram")(),
    c_dark_power: quickCardData.stat(2, 2).img("bossB10MinionSpawn")(),
    c_zira_defeat: quickCardData.red.l3.belongTo("boss").extension("z").img("bossCometDefeat")(),
    c_bug_passive: quickCardData.stat(0, 4).enemy().extension("mw").img("enemyPassiveBug")(),
    c_stagemark: quickCardData.def.enemy().img("enemyStageTarget")(),
    c_strong_bug: quickCardData.stat(2, 3).enemy().extension("mw").img("enemyStrongBug").upgrade(
        {atk : 3, hp : 5}
    )(),
    c_firewall: quickCardData.stat(0, 3).enemy().extension("sc").img("enemyWeakWall")(),
    c_target: quickCardData.def.enemy().img("enemyWeakTarget")(),
    c_curse: quickCardData.def.extension("x").belongTo("boss").img("miniboss1")(),
    c_legion_token: quickCardData.stat(1, 1).archtype("legion").img("vampGen2_minion").upgrade(
        {atk : 2} //check syka for stat info
    )(),
    c_nova_protean: quickCardData.stat(2, 2).archtype("nova").img("novaStandard").upgrade(
        {atk : 3, hp : 3}
    )(),

    //generics

    //white
    c_after_burner : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def()
        .e("e_draw_until", {count : 2})
        .p()
        .e("e_quick", {})
        ()
    ).upgrade(
        {
            effects : quickEffectInfo
            .def()
            .e("e_draw_until", {count : 3})
            .e("e_quick", {})
            ().effects
        }
    )(),

    c_battery : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def("e_turn_draw")
        .e("e_draw", {doTurnDraw : 1})
        ()
    ).upgrade(
        quickEffectInfo
        .def("e_turn_draw")
        .e("e_draw", {doTurnDraw : 1})
        .p()
        .e("e_quick", {})
        ()
    )(),

    c_flash_bang : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def()
        .e("e_delay_all", {delayCount : 3})
        .p()
        .e("e_quick", {})
        ()
    ).upgrade({
        effects : quickEffectInfo
        .def()
        .e("e_delay_all", {delayCount : 4})
        .p()
        .e("e_quick", {})
        ().effects
    })(),

    c_cinder : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def()
        .e("e_delay_all", {delayCount : 2})
        .e("e_quick", {})
        ()
    ).upgrade({
        effects : quickEffectInfo
        .def()
        .e("e_delay_all", {delayCount : 3})
        .e("e_quick", {})
        ().effects
    })(),

    c_ember : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def()
        .e("e_draw", {count : 1})
        ()
    ).upgrade({
        effects : quickEffectInfo
        .def()
        .e("e_draw", {count : 1})
        ().effects
    })(),
    
    //green
    c_capacitor : quickCardData.def.archtype("generic").effect(
        quickEffectInfo
        .def()
        .e("e_capacitor_1", {maxCount : 3})
        .p()
        .e("e_capacitor_2", {})
        .p()
        .e("e_reset_all_once_this", {})
        ()
    ).upgrade({
        effects : quickEffectInfo
        .def()
        .e("e_capacitor_1", {maxCount : 5})
        .p()
        .e("e_capacitor_2", {})
        .p()
        .e("e_reset_all_once_this", {})
        ().effects
    })(),

    //blue

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
                    e_apple : {
                        count : 1
                    }
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
                    e_banana : {
                        doArchtypeCheck : 1
                    }
                },
                imgURL : oldImgURL("naturalBanana"),
                partition : [defaultPartition()]
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
                partition : [defaultPartition()]
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
                partition : [defaultPartition()]
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
                partition : [defaultPartition()]
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
                    e_pumpkin : {
                        maxHp : 1,
                    },
                    e_fragile : {}
                }
            },
            upgrade_1 : {
                effects : {
                    e_pumpkin : {
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
                    defaultPartition("c_winter", [0, 1]),
                    defaultPartition("c_winter", 2)
                ],
                effects : {
                    e_winter_1 : {
                        mult : 1
                    },
                    e_winter_2 : {},
                    e_dmg_reduction : {
                        reductionAmmount : Infinity,
                        minDmg : 1,
                    }
                }
            },
            upgrade_1 : {
                effects : {
                    e_winter_1 : {
                        mult : 2
                    },
                    e_winter_2 : {},
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