// import { registryRegistry } from "../../types/data/registryRegistry";
import registryAPI from "../../types/abstract/gameComponents/API";

//importing loaders
import cardLoader from "../loader/loader_card";
import effectLoader from "../loader/loader_effect";
import subtypeLoader from "../loader/loader_subtype";
import typeLoader from "../loader/loader_type";
import zoneLoader from "../loader/loader_zone";
import customHandlerLoader from "../loader/loader_handler";
import localizationLoader from "../loader/loader_localization";

import { cardDataRegistry, type cardData, type effectData } from "../../data/cardRegistry";
import effectDataRegistry from "../../data/effectRegistry";
import type { Setting } from "../../types/abstract/gameComponents/settings";
import type { Action } from "./actionGenrator";
import type queenSystem from "../queenSystem";
import type Effect from "../../types/abstract/gameComponents/effect";
import type EffectSubtype from "../../types/abstract/gameComponents/effectSubtype";
import type { zoneData } from "../../data/zoneRegistry";
import type Zone from "../../types/abstract/gameComponents/zone";

export default class registryHandler implements registryAPI {
    cardLoader : cardLoader
    effectLoader : effectLoader
    typeLoader : typeLoader
    subTypeLoader : subtypeLoader
    zoneLoader : zoneLoader
    customActionLoader : customHandlerLoader
    localizationLoader : localizationLoader

    constructor(s : Setting){
        this.subTypeLoader = new subtypeLoader();
        this.zoneLoader = new zoneLoader();
        this.customActionLoader = new customHandlerLoader();
        this.localizationLoader = new localizationLoader(s);
        this.typeLoader = new typeLoader();

        this.effectLoader = new effectLoader(effectDataRegistry, this.subTypeLoader, this.typeLoader);
        this.cardLoader = new cardLoader(this.effectLoader);
    }

    registry_edit_card(key: string, value: cardData): void {
        this.cardLoader.load(key, value);
    }

    registry_edit_custom_action_handler(actionIDs: number[], handlerFunc: ((a: Action, system: queenSystem) => undefined | Action[])): void {
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

    registry_edit_effect_subtype(key: string, constructor: typeof EffectSubtype): void {
        this.subTypeLoader.load(key, constructor);
    }

    registry_edit_localization(language: string, key: string, val: string): void {
        this.localizationLoader.add(language, key, val);
    }

    // registry_edit_rarity(key: number, data: rarityData): void {
    //     (operatorDataRegistry as any)[key] = data
    //     if(operatorRegistry[key] === undefined){
    //         operatorRegistry[key]
    //     }
    // }

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