// import { registryRegistry } from "../../types/data/registryRegistry";
import registryAPI from "../../types/gameComponents/API";

//importing loaders
import cardLoader from "../loader/loader_card";
import effectLoader from "../loader/loader_effect";
import subtypeLoader from "../loader/loader_subtype";
import typeLoader from "../loader/loader_type";
import zoneLoader from "../loader/loader_zone";
import HandlerLoader from "../loader/loader_action";
import localizationLoader from "../loader/loader_localization";

import { cardDataRegistry, type cardData, type effectData } from "../../data/cardRegistry";
import effectDataRegistry from "../../data/effectRegistry";
import type { Setting } from "../../types/gameComponents/settings";
import type { Action } from "./actionGenrator";
import type QueenSystem from "../queenSystem";
import type Effect from "../../types/gameComponents/effect";
import type EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { zoneData } from "../../data/zoneRegistry";
import type { Zone_T } from "../../types/gameComponents/zone";
import { DeckData } from "../../data/deckRegistry";
import { rarityData } from "../../data/rarityRegistry";
import EffectType from "../../types/gameComponents/effectType";
import type { actionName } from "../../data/actionRegistry";

export default class registryHandler implements registryAPI {
    cardLoader : cardLoader
    effectLoader : effectLoader
    typeLoader : typeLoader
    subTypeLoader : subtypeLoader
    zoneLoader : zoneLoader
    actionLoader : HandlerLoader
    localizationLoader : localizationLoader

    constructor(s : Setting){
        this.subTypeLoader = new subtypeLoader();
        this.zoneLoader = new zoneLoader();
        this.actionLoader = new HandlerLoader();
        this.localizationLoader = new localizationLoader(s);
        this.typeLoader = new typeLoader();

        this.effectLoader = new effectLoader(effectDataRegistry, this.subTypeLoader, this.typeLoader);
        this.cardLoader = new cardLoader(this.effectLoader);
    }

    //TODO : implement these
    add_effect_type(constructor: typeof EffectType): void {
        throw new Error("Method not implemented.");
    }
    add_rarity(key: string, rarity: rarityData): number {
        throw new Error("Method not implemented.");
    }
    add_operator(name: string): number {
        throw new Error("Method not implemented.");
    }
    add_deck(name: string, content: DeckData): number {
        throw new Error("Method not implemented.");
    }

    add_effect(e: (new (...p : ConstructorParameters<typeof Effect>) => Effect) & { getEffData: () => { base: effectData; upgrade?: Partial<effectData>; }; }): void {
        this.effectLoader.add(e.name, e.getEffData().base)
    }
    add_card(key : string, cardData: cardData): void {;
        this.cardLoader.load(key, cardData)
    }
    
    add_action_handler<T extends actionName>(actionName : T, handlerFunc: ((system: QueenSystem, a: Action<T>) => undefined | void | Action[])): void {
        this.actionLoader.load(actionName, handlerFunc as any);
    }
    
    add_effect_subtype(id : number, constructor: typeof EffectSubtype): void {
        this.subTypeLoader.load(id, constructor);
    }
    
    add_localization(language: string, key: string, val: string): void {
        this.localizationLoader.add(language, key, val);
    }
    add_localization_bulk(language : string, obj: Record<string, string>): void {
        Object.entries(obj).forEach(([key, val]) => {
            this.add_localization(language, key, val)
        })
    }

    add_zone(data: zoneData, constructor: new (...p : any) => Zone_T): void {
        this.zoneLoader.load(data.id, data, constructor)
    }

}