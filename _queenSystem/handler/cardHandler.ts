import type cardLoader from "../loader/loader_card";
import type effectLoader from "../loader/loader_effect";
import type subtypeLoader from "../loader/loader_subtype";
import type registryHandler from "./registryHandler";
import type rarityLoader from "../loader/loader_rarity";
import type { Setting } from "../../types/abstract/gameComponents/settings";

import subtypeRegistry from "../../types/data/subtypeRegistry";

import subtype_chained from "../../types/effects/effectSubtypes/subtype_chained";
import subtype_fieldLock from "../../types/effects/effectSubtypes/subtype_fieldLock";
import subtype_hardUnique from "../../types/effects/effectSubtypes/subtype_hardUnique";
import subtype_instant from "../../types/effects/effectSubtypes/subtype_instant";
import subtype_once from "../../types/effects/effectSubtypes/subtype_once";
import subtype_unique from "../../types/effects/effectSubtypes/subtype_unique";

import { rarityRegistry } from "../../types/data/rarityRegistry";
import rarityDataRegistry from "../../types/data/rarityRegistry";

import { cardDataRegistry } from "../../types/data/cardRegistry";

export default class cardHandler {
    private cloader : cardLoader
    private effloader : effectLoader
    private subtypeloader : subtypeLoader
    private rarityLoader : rarityLoader
    private setting : Setting

    constructor(s : Setting, regs : registryHandler){
        this.cloader = regs.cardLoader
        this.effloader = regs.effectLoader
        this.subtypeloader = regs.subTypeLoader
        this.rarityLoader = regs.rarityLoader
        this.setting = s

        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_chained], subtype_chained)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_fieldLock], subtype_fieldLock)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_hardUnique], subtype_hardUnique)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_instant], subtype_instant)
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_once], subtype_once),
        this.subtypeloader.load(subtypeRegistry[subtypeRegistry.e_unique], subtype_unique)

        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_white], rarityDataRegistry.r_white)
        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_green], rarityDataRegistry.r_green)
        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_blue], rarityDataRegistry.r_blue)
        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_red], rarityDataRegistry.r_red)
        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_ability], rarityDataRegistry.r_ability)
        this.rarityLoader.load(rarityRegistry[rarityRegistry.r_algo], rarityDataRegistry.r_algo)

        Object.values(cardDataRegistry).forEach(i => {
            this.cloader.load(i.id, i);
        })
    }

    getCard(cid : string, variantID? : string[]){
        return this.cloader.getCard(cid, this.setting, variantID);
    }
}