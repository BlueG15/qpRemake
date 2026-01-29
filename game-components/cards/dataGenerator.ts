//temporary developmental stuff
//for ts to auto-reccomend strings
import type { oldCardNames } from "../old/oldData/cards"

type oldDataURL = "https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/"
export function oldImgURL(oldID : oldCardNames){
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png`
}

import { ArchtypeRegistry, type RarityID, RarityRegistry } from "../../core/registry"
import type { EffectData, CardData, CardPatchData, ArchtypeID, CardPatchDataFull, EffectDataID, URLString, ExtensionID } from "../../core"


type T_hasEffData = {
    name : string,
    getEffData? : () => {base : EffectData, upgrade? : Partial<EffectData>}
}

export class CardDataGenerator implements CardData {
    variantData: { [key: string]: Partial<CardPatchDataFull> | undefined; base: CardPatchDataFull; upgrade_1?: CardPatchData }
    private constructor(base : CardPatchDataFull){
        this.variantData = {base}
    }

    static base(
        atk : number, hp : number,
        level : number,
        rarity : RarityID,
        archtype : ArchtypeID | ArchtypeID[],
        oldCardData : oldCardNames | URLString,
        ...effects : CardPatchDataFull["effects"]
    ) : CardDataGenerator;
    static base(
        atk : number, hp : number,
        level : number,
        rarity : RarityID,
        archtype : ArchtypeID | ArchtypeID[],
        oldCardData : oldCardNames | URLString,
        extensionArr : ExtensionID[],
        ...effects : CardPatchDataFull["effects"]
    ) : CardDataGenerator;
    static base(
        atk : number, hp : number,
        level : number,
        rarity : RarityID,
        archtype : ArchtypeID | ArchtypeID[],
        oldCardData : oldCardNames | URLString,
        extensionArr : ExtensionID[] | CardPatchDataFull["effects"][number],
        ...effects : CardPatchDataFull["effects"]
    ){
        archtype = Array.isArray(archtype) ? archtype : [archtype]
        if(Array.isArray(extensionArr) && (typeof extensionArr[0] !== "number")){
            extensionArr = archtype.flatMap(a => ArchtypeRegistry.getData(a))
        }
        extensionArr = extensionArr as ExtensionID[]
        const imgURL = oldCardData.startsWith("http") ? oldCardData : oldImgURL(oldCardData as any)
        return new CardDataGenerator({atk, hp, level, rarity, archtype, extensionArr , effects, imgURL })
    }

    upgrade(
        atk? : number, hp? : number,
        level? : number,
        rarity? : RarityID,
        archtype? : ArchtypeID | ArchtypeID[],
        oldCardData? : oldCardNames | URLString,
        ...effects : CardPatchDataFull["effects"]
    ) : this;
    upgrade(
        atk? : number, hp? : number,
        level? : number,
        rarity? : RarityID,
        archtype? : ArchtypeID | ArchtypeID[],
        oldCardData? : oldCardNames | URLString,
        extensionArr? : CardPatchDataFull["effects"][number],
        ...effects : CardPatchDataFull["effects"]
    ) : this;
    upgrade(
        atk? : number, hp? : number,
        level? : number,
        rarity? : RarityID,
        archtype? : ArchtypeID | ArchtypeID[],
        oldCardData? : oldCardNames | URLString,
        extensionArr? : ExtensionID[] | CardPatchDataFull["effects"][number],
        ...effects : CardPatchDataFull["effects"]
    ){
        archtype = Array.isArray(archtype) ? archtype : (archtype ? [archtype] : undefined)
        if(archtype && Array.isArray(extensionArr) && (typeof extensionArr[0] !== "number")){
            extensionArr = archtype.flatMap(a => ArchtypeRegistry.getData(a))
        }
        extensionArr = extensionArr as ExtensionID[] | undefined
        const imgURL = oldCardData ? oldCardData.startsWith("http") ? oldCardData : oldImgURL(oldCardData as any) : undefined

        let data : CardPatchData = {}
        if(atk      !== undefined && atk !== this.variantData.base.atk)           data.atk = atk;
        if(hp       !== undefined && atk !== this.variantData.base.hp)            data.hp = hp;
        if(level    !== undefined && atk !== this.variantData.base.level)         data.level = level;
        if(rarity   !== undefined && rarity !== this.variantData.base.rarity)     data.rarity = rarity;
        if(archtype !== undefined && archtype !== this.variantData.base.archtype) data.archtype = archtype;
        if(imgURL   !== undefined && imgURL !== this.variantData.base.imgURL)     data.imgURL = imgURL;
        //override extensionArr and effetcs anyway, cause whatever, checking them woudld cause too much brain power rn (4am lmao)
        if(effects.length !== 0) data.effects = effects;
        if(extensionArr && extensionArr.length !== 0) data.extensionArr = extensionArr;

        this.variantData.upgrade_1 = data
        return this
    }

    //TODO : add an "add arbitrary variant function"
}