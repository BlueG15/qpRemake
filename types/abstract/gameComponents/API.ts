import type { cardData, effectData } from "../../../data/cardRegistry";
import type { zoneData } from "../../../data/zoneRegistry";
import type Zone from "./zone";
import type Effect from "./effect";
import type effectSubtype from "./effectSubtype";
import type queenSystem from "../../../_queenSystem/queenSystem";
import type Action_prototype from "./action";
import type { rarityData } from "../../../data/rarityRegistry";

export default interface registryAPI {

    //SAFE registry edit
    //There is also the registry for effectType and Action, but those doesnt need to be modified
    registry_edit_card(key : string, value : cardData) : void;
    registry_edit_effect_data(key : string, data : effectData) : void;
    registry_edit_effect_class(
        key : string, 
        constructor : typeof Effect
    ) : void;
    registry_edit_effect(
        key : string,
        data : effectData,
        constructor : typeof Effect
    ): void
    registry_edit_effect_subtype(
        key : string, 
        constructor : typeof effectSubtype
    ) : void;
    
    registry_edit_zone_data(key : string, data : zoneData) : void;
    registry_edit_zone_class(
        key : string,
        constructor : typeof Zone 
    ) : void;
    registry_edit_zone(
        key : string, 
        data : zoneData,
        constructor : typeof Zone 
    ) : void;

    registry_edit_rarity(
        key : string,
        data : rarityData
    ) : void;

    //UNSFAFE registry edit
    registry_edit_custom_action_handler(
        actionIDs : number[],
        handlerFunc : ((a : Action_prototype, system : queenSystem) => undefined | void | Action_prototype[])
    ) : void;
   
    //localization edit
    registry_edit_localization(language : string, key : string, val : string) : void;
}