// import { registryRegistry } from "../../types/data/registryRegistry";
import registryAPI from "../../types/abstract/gameComponents/API";

//importing loaders
import cardLoader from "../loader/loader_card";
import effectLoader from "../loader/loader_effect";
import operatorLoader from "../loader/loader_operator";
import rarityLoader from "../loader/loader_rarity";
import subtypeLoader from "../loader/loader_subtype";
import zoneLoader from "../loader/loader_zone";
import customHandlerLoader from "../loader/loader_handler";
import localizationLoader from "../loader/loader_localization";

import { cardDataRegistry, type cardData, type effectData } from "../../types/data/cardRegistry";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type Action from "../../types/abstract/gameComponents/action";
import type queenSystem from "../queenSystem";
import type Effect from "../../types/abstract/gameComponents/effect";
import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import type { rarityData } from "../../types/data/rarityRegistry";
import type { zoneData } from "../../types/data/zoneRegistry";
import type Zone from "../../types/abstract/gameComponents/zone";

export default class registryHandler implements registryAPI {
    cardLoader : cardLoader
    effectLoader : effectLoader
    operatorLoader : operatorLoader
    rarityLoader : rarityLoader
    subTypeLoader : subtypeLoader
    zoneLoader : zoneLoader
    customActionLoader : customHandlerLoader
    localizationLoader : localizationLoader

    constructor(s : Setting){
        this.subTypeLoader = new subtypeLoader();
        this.rarityLoader = new rarityLoader();
        this.zoneLoader = new zoneLoader();
        this.operatorLoader = new operatorLoader();
        this.customActionLoader = new customHandlerLoader();
        this.localizationLoader = new localizationLoader(s);

        let o : Record<string, effectData> = {}
        Object.values(cardDataRegistry).forEach(i => {
            Object.values(i.variantData).forEach(k => {
                if(k.effects){
                    Object.entries(k.effects).forEach(([key, val]) => {
                        o[key] = val
                    })
                }
            })
        })

        this.effectLoader = new effectLoader(o, this.subTypeLoader);
        this.cardLoader = new cardLoader(this.effectLoader);
    }

    registry_edit_card(key: string, value: cardData): void {
        this.cardLoader.load(key, value);
    }

    registry_edit_custom_action_handler(actionIDs: number[], handlerFunc: ((a: Action, system: queenSystem) => undefined | void | Action[])): void {
        actionIDs.forEach(i => this.customActionLoader.load(i, handlerFunc));
    }

    registry_edit_effect_data(key: string, val: effectData): void {
        this.effectLoader.add(key, val);
    }

    registry_edit_effect_class(key: string, constructor: typeof Effect): void {
        this.effectLoader.add(key, constructor);
    }

    registry_edit_effect(key: string, data: effectData, constructor: typeof Effect): void {
        this.effectLoader.add(key, data);
        this.effectLoader.add(key, constructor);
    }

    registry_edit_effect_subtype(key: string, constructor: typeof effectSubtype): void {
        this.subTypeLoader.load(key, constructor);
    }

    registry_edit_localization(language: string, key: string, val: string): void {
        this.localizationLoader.add(language, key, val);
    }

    registry_edit_rarity(key: string, data: rarityData): void {
        this.rarityLoader.load(key, data)
    }

    registry_edit_zone_data(key: string, data: zoneData): void {
        this.zoneLoader.load(key, data);
    }

    registry_edit_zone_class(key: string, constructor: typeof Zone): void {
        this.zoneLoader.load(key, undefined, constructor)
    }

    registry_edit_zone(key: string, data: zoneData, constructor: typeof Zone): void {
        this.zoneLoader.load(key, data, constructor)
    }

}