//temporary developmental stuff
//for ts to auto-reccomend strings
import type { oldCardNames } from "../game-components/old/oldData/cards"

type oldDataURL = "https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/"
export function oldImgURL(oldID : oldCardNames){
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png` as URLString
}

import { ArchtypeRegistry, CardVariantName, type RarityID, RarityRegistry } from "./registry"
import type { EffectDataID, ExtensionID, ArchtypeID, CardDataID, DeckID, OperatorID } from "./registry"
import { Callable, type URLString } from "./misc"
import type { EffectData, EffectDataPartial } from "./effectData"

//Card 
export type CardStatInfo = {
    level: number;
    rarity: RarityID;
    extensionArr: ExtensionID[];
    archtype : ArchtypeID[];
    atk: number; //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp: number;
}

export type CardDisplayInfo = {
    //display stuff
    imgURL? : string
}

export type CardEffectInfo = {
    effects : (EffectDataID | [EffectDataID, Partial<EffectData>])[];
}

export type CardPatchDataFull = CardStatInfo & CardEffectInfo & CardDisplayInfo
export type CardPatchData = Partial<CardPatchDataFull>

type CardDataLoadInfo = {
    dataID : CardDataID,
    variants : string[],
}

/**Unified is the result of merging relevant variants into base */
export type CardDataUnified = CardDataLoadInfo & CardPatchDataFull & {id : string}

export type DeckData = {
    cards : (CardDataLoadInfo & {count : number})[],
    operator : OperatorID,
    img? : CardDataID
}

export type CardDataWithVariantKeys = {
    base : CardPatchDataFull,
    [K : string] : CardPatchData
}

class CardDataGenerator extends Callable<CardDataWithVariantKeys> {
    storedVariants : Record<string, CardPatchData> = {}
    data : CardPatchData = {}
    private constructor(){super()}
    override onCall(): CardDataWithVariantKeys {
        const base = this.full()
        return {base, ...this.storedVariants}
    }

    variant(name : string, data : CardPatchData | CardDataGenerator) {
        this.storedVariants[name] = data instanceof CardDataGenerator ? data.partial() : data
        return this.T
    }

    upgrade(data : CardPatchData | CardDataGenerator){
        return this.variant(CardVariantName.upgrade_1, data)
    }

    upgradeStat(atk? : number, hp? : number){
        return this.upgrade({atk, hp})
    }

    effects(...effects : (EffectDataID | {dataID : EffectDataID} | [EffectDataID, EffectDataPartial] | [{dataID : EffectDataID}, EffectDataPartial])[]){
        this.data.effects = effects.map(e => {
            if(typeof e === "number") return e;
            if(Array.isArray(e)) {
                if(typeof e[0] !== "number") e[0] = e[0].dataID;
                return e as [EffectDataID, EffectDataPartial]
            };
            return e.dataID;
        })
        return this.T
    }

    overrideExtensions(...extentions : ExtensionID[]){
        this.data.extensionArr = extentions
        return this.T
    }

    hasExtensions(...extensions : ExtensionID[]){
        const arr = this.data.extensionArr ?? []
        arr.push(...extensions)
        this.data.extensionArr = arr
        return this.T
    }

    ofArchtype(...archtypes : ArchtypeID[]){
        const arr = this.data.archtype ?? []
        arr.push(...archtypes)
        this.data.archtype = arr

        const extentions = arr.map(a => ArchtypeRegistry.getData(a))
        return this.hasExtensions(...extentions)
    }

    level(n : number){
        this.data.level = n
        return this.T
    }

    stat(atk : number, hp : number){
        this.data.atk = atk
        this.data.hp = hp
        return this.T
    }

    rarity(r : RarityID){
        this.data.rarity = r
        return this.T
    }

    img(url : URLString | oldCardNames){
        if(!url.startsWith("http")) url = oldImgURL(url as oldCardNames);
        this.data.imgURL = url
        return this.T
    }

    //entry points
    static get white() {return new CardDataGenerator().rarity(RarityRegistry.white)}
    static get red() {return new CardDataGenerator().rarity(RarityRegistry.red)}
    static get green() {return new CardDataGenerator().rarity(RarityRegistry.green)}
    static get blue() {return new CardDataGenerator().rarity(RarityRegistry.blue)}
    static get ability() {return new CardDataGenerator().rarity(RarityRegistry.ability)}
    static get algo() {return new CardDataGenerator().rarity(RarityRegistry.algo)}
    static get system() {return new CardDataGenerator().rarity(RarityRegistry.system)}

    static get partial(){
        return new CardDataGenerator().T
    }

    //finals
    full(){
        const full : CardPatchDataFull = {
            level : 0,
            rarity : RarityRegistry.white,
            extensionArr : [],
            archtype : [],
            atk : 0,
            hp : 0,
            effects : []
        }
        return Utils.patch(full, this.data)
    }

    partial(){
        return this.data
    }
}

export const CardData = CardDataGenerator
export type CardData = CardPatchDataFull