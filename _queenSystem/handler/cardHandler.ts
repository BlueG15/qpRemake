import type cardLoader from "../loader/loader_card";
import type effectLoader from "../loader/loader_effect";
import subtypeLoader from "../loader/loader_subtype";
import typeLoader from "../loader/loader_type";
import type registryHandler from "./registryHandler";
import type { Setting } from "../../types/abstract/gameComponents/settings";

import subtypeRegistry from "../../data/subtypeRegistry";

import subtype_chained from "../../types/effects/effectSubtypes/subtype_chained";
import subtype_fieldLock from "../../types/effects/effectSubtypes/subtype_fieldLock";
import subtype_hardUnique from "../../types/effects/effectSubtypes/subtype_hardUnique";
import subtype_instant from "../../types/effects/effectSubtypes/subtype_instant";
import subtype_once from "../../types/effects/effectSubtypes/subtype_once";
import subtype_unique from "../../types/effects/effectSubtypes/subtype_unique";
import subtype_hand_or_fieldLock from "../../types/effects/effectSubtypes/subtype_hand_or_fieldLock";
import subtype_graveLock from "../../types/effects/effectSubtypes/subtype_graveLock";
import subtype_delayed from "../../types/effects/effectSubtypes/subtype_delayed";

import effectTypeRegistry from "../../data/effectTypeRegistry";

import EffectType from "../../types/abstract/gameComponents/effectType";
import initEffect from "../../types/effects/effectTypes/initEffect";
import manualEffect from "../../types/effects/effectTypes/manualEffect";
import passiveEffect from "../../types/effects/effectTypes/passiveEffect";
import triggerEffect from "../../types/effects/effectTypes/triggerEffect";
import lockEffect from "../../types/effects/effectTypes/lockEffect";

import { rarityRegistry } from "../../data/rarityRegistry";
import rarityDataRegistry from "../../data/rarityRegistry";

import { cardData, cardData_unified, cardDataRegistry, effectData } from "../../data/cardRegistry";


import type Card from "../../types/abstract/gameComponents/card";

export default class cardHandler {
    private cloader : cardLoader
    private effloader : effectLoader
    private subtypeloader : subtypeLoader
    private typeLoader : typeLoader
    private setting : Setting

    constructor(s : Setting, regs : registryHandler){
        this.cloader = regs.cardLoader
        this.effloader = regs.effectLoader
        this.subtypeloader = regs.subTypeLoader
        this.typeLoader = regs.typeLoader
        this.setting = s

        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_chained], subtype_chained)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_fieldLock], subtype_fieldLock)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_hardUnique], subtype_hardUnique)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_instant], subtype_instant)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_once], subtype_once)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_unique], subtype_unique)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_handOrFieldLock], subtype_hand_or_fieldLock)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_graveLock], subtype_graveLock)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_st_delayed], subtype_delayed)

        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_none], EffectType)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_counter], EffectType)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_init], initEffect)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_manual], manualEffect)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_passive], passiveEffect)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_trigger], triggerEffect)
        this.typeLoader.load(effectTypeRegistry[effectTypeRegistry.e_t_lock], lockEffect)

        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_white], rarityDataRegistry.r_white)
        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_green], rarityDataRegistry.r_green)
        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_blue], rarityDataRegistry.r_blue)
        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_red], rarityDataRegistry.r_red)
        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_ability], rarityDataRegistry.r_ability)
        // this.rarityLoader.load(rarityRegistry[rarityRegistry.r_algo], rarityDataRegistry.r_algo)

        Object.entries(cardDataRegistry).forEach(([key, val]) => {
            this.cloader.load(key, {id : key, ...val} as any);
        })
    }

    getCard(cid : keyof typeof cardDataRegistry, variantID? : string[]) : Card
    getCard(cid : string, variantID? : string[]) : Card | undefined

    getCard(cid : keyof typeof cardDataRegistry, variantID : string[], dataOnly : true) : Omit<cardData_unified, "effects"> & {effects : effectData[]}
    getCard(cid : string, variantID : string[], dataOnly : true) : Omit<cardData_unified, "effects"> & {effects : effectData[]} | undefined

    getCard(cid : string, variantID? : string[], dataOnly = false) : Card | Omit<cardData_unified, "effects"> & {effects : effectData[]} | undefined{
        return this.cloader.getCard(cid, this.setting, variantID, dataOnly as any);
    }
}