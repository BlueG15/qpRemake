import type { oldCardNames } from "./old/oldData/cards"

type effectData_fixxed = {
    typeID : keyof typeof effectTypeRegistry,
    subTypeIDs : subtypeName[],
    localizationKey? : string //used for looking up texts in localizer, undef = use effect dataID
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
    imgURL? : string
}

// import { type effectData_specific, type effectName } from "./effectRegistry"
import type effectTypeRegistry from "./effectTypeRegistry"

export type effectInfo = {
    effects : Record<string, Partial<effectData>>;
}

export type patchData_full = statInfo & effectInfo & displayInfo

export type patchData = Partial<statInfo> & {effects? : Record<string, Partial<effectData>>} & Partial<displayInfo>

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

import { rarityRegistry } from "./rarityRegistry";
import { subtypeName } from "./subtypeRegistry"
import type Effect from "../types/gameComponents/effect"

type oldDataURL = "https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/"
export function oldImgURL(oldID : string){
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png`
}

//Welp am creating another system for this stuff
export class quickCardData<K extends Omit<cardData, "id"> = 
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
                imgURL : undefined,
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
        if(this.data.variantData[key]){
            this.data.variantData[key] = {
                ...data,
                ...this.data.variantData[key],
            }
        }
        else this.data.variantData[key] = data;
        return this as any 
    }

    upgrade<X extends patchData>(data : X){
        return this.variant("upgrade_1", data)
    }

    upgradeStat(atk? : number, hp? : number){
        return this.upgrade({atk, hp})
    }

    /**Adds effects to the base version of the card, then add to the upgrade version if getEffData -> upgrade exists*/
    effect( 
        ...effects : (T_hasEffData | [T_hasEffData, Partial<effectData>] | [T_hasEffData, Partial<effectData>, Partial<effectData>])[]
    ) : quickCardData<K>["T_this"]{
        effects.forEach(V => {
            let e
            let patchBase, patchUpgrade
            if(Array.isArray(V)){
                e = V[0]
                patchBase = V[1]
                patchUpgrade = V[2]
            } else e = V;
            const val = e.getEffData ? e.getEffData() : undefined
            this.data.variantData.base.effects[e.name] = {}
            if(!val) return

            if(patchBase)
                Utils.patchGeneric(val.base, patchBase);
            
            if(patchUpgrade){
                if(!val.upgrade) val.upgrade = {};
                Utils.patchGeneric(val.upgrade, patchUpgrade)
            }

            if(val.upgrade) {
                this.upgrade({effects : {}})
                this.data.variantData["upgrade_1"].effects![e.name] = val.upgrade
            }
        })
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

type T_hasEffData = {
            name : string,
            getEffData? : () => {base : effectData, upgrade? : Partial<effectData>}
        }

const cardDataRegistry : {[key : string] : Omit<cardData, "id">} = {
    c_blank : quickCardData.def()
}
export { cardDataRegistry }