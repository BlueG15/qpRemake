import type { cardData, effectData } from "../../data/cardRegistry";
import type { zoneData } from "../../data/zoneRegistry";
import type Effect from "./effect";
import type EffectSubtype from "./effectSubtype";
import type QueenSystem from "../../_queenSystem/queenSystem";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type EffectType from "./effectType";
import type { rarityData } from "../../data/rarityRegistry";
import type { DeckData } from "../../data/deckRegistry";
import type { Zone, Zone_T } from "./zone";
import type { actionName } from "../../data/actionRegistry";

export default interface registryAPI {
    //SAFE registry edit
    add_effect(e : (new (...p : ConstructorParameters<typeof Effect>) => Effect) & {getEffData : () => {base : effectData, upgrade? : Partial<effectData>}}) : void;
    add_card(key : string, cardData : cardData) : void
    
    add_effect_type(
        constructor : typeof EffectType
    ) : void;

    add_effect_subtype(
        id : number,
        constructor : typeof EffectSubtype
    ) : void;

    add_zone( 
        data : zoneData,
        constructor : new (...p : ConstructorParameters<typeof Zone>) => Zone_T
    ) : void;
    //There is also the registry for effectType and Action, but those doesnt need to be modified

    //UNSFAFE registry edit
    add_action_handler<T extends actionName>(
        actionName : T, 
        handlerFunc: ((system: QueenSystem, a: Action<T>) => undefined | void | Action[])
    ): void
   
    //localization edit
    add_localization(language : string, key : string, val : string) : void;
    add_localization_bulk(language : string, obj : Record<string, string>) : void;

    //other registries - edit enums directly or call here:
    //returns the enum number
    add_rarity(key : string, rarity : rarityData) : number;
    add_operator(name : string) : number;
    add_deck(name : string, content : DeckData) : number;
}