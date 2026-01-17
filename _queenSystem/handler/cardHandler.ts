import type cardLoader from "../loader/loader_card";
import type effectLoader from "../loader/loader_effect";
import subtypeLoader from "../loader/loader_subtype";
import typeLoader from "../loader/loader_type";
import type registryHandler from "./registryHandler";
import type { Setting } from "../../types/gameComponents/settings";

import subtypeRegistry from "../../data/subtypeRegistry";

import Chained from "../../defaultImplementation/effectSubtypes/subtype_chained";
import FieldLock from "../../defaultImplementation/effectSubtypes/subtype_fieldLock";
import HardUnique from "../../defaultImplementation/effectSubtypes/subtype_hardUnique";
import Instant from "../../defaultImplementation/effectSubtypes/subtype_instant";
import Once from "../../defaultImplementation/effectSubtypes/subtype_once";
import Unique from "../../defaultImplementation/effectSubtypes/subtype_unique";
import HandOrFieldLock from "../../defaultImplementation/effectSubtypes/subtype_hand_or_fieldLock";
import GraveLock from "../../defaultImplementation/effectSubtypes/subtype_graveLock";
import Delayed from "../../defaultImplementation/effectSubtypes/subtype_delayed";

import effectTypeRegistry from "../../data/effectTypeRegistry";

import EffectType from "../../types/gameComponents/effectType";
import InitEffect from "../../defaultImplementation/effectTypes/initEffect";
import ManualEffect from "../../defaultImplementation/effectTypes/manualEffect";
import PassiveEffect from "../../defaultImplementation/effectTypes/passiveEffect";
import TriggerEffect from "../../defaultImplementation/effectTypes/triggerEffect";
import LockEffect from "../../defaultImplementation/effectTypes/lockEffect";

import { rarityRegistry } from "../../data/rarityRegistry";
import rarityDataRegistry from "../../data/rarityRegistry";

import { cardData, cardData_unified, cardDataRegistry, effectData } from "../../data/cardRegistry";


import type Card from "../../types/gameComponents/card";

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

        this.subtypeloader.load(subtypeRegistry.e_st_chained, Chained)
        this.subtypeloader.load(subtypeRegistry.e_st_fieldLock, FieldLock)
        this.subtypeloader.load(subtypeRegistry.e_st_hardUnique, HardUnique)
        this.subtypeloader.load(subtypeRegistry.e_st_instant, Instant)
        this.subtypeloader.load(subtypeRegistry.e_st_once, Once)
        this.subtypeloader.load(subtypeRegistry.e_st_unique, Unique)
        this.subtypeloader.load(subtypeRegistry.e_st_handOrFieldLock, HandOrFieldLock)
        this.subtypeloader.load(subtypeRegistry.e_st_graveLock, GraveLock)
        this.subtypeloader.load(subtypeRegistry.e_st_delayed, Delayed)

        this.typeLoader.load(effectTypeRegistry.e_t_none, EffectType)
        this.typeLoader.load(effectTypeRegistry.e_t_counter, EffectType)
        this.typeLoader.load(effectTypeRegistry.e_t_init, InitEffect)
        this.typeLoader.load(effectTypeRegistry.e_t_manual, ManualEffect)
        this.typeLoader.load(effectTypeRegistry.e_t_passive, PassiveEffect)
        this.typeLoader.load(effectTypeRegistry.e_t_trigger, TriggerEffect)
        this.typeLoader.load(effectTypeRegistry.e_t_lock, LockEffect)

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