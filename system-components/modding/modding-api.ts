import type { Card } from "../../game-components/cards";
import type { Effect } from "../../game-components/effects";
import type { CardData, DeckData, EffectData, ZoneData } from "../../core/data-type";
import { CardDataRegistry, type Action, type ActionBase, type ActionID, type ActionName, type ArchtypeID, type CardDataID, type ColorData, type ColorID, type DeckID, type EffectDataID, type EffectSubtypeID, type EffectTypeID, type OperatorData, type OperatorID, type ZoneTypeID } from "../../core/registry";
import type { EffectModifier, Fn_any } from "../../core";
import type { Zone } from "../../game-components/zones";
import type QueenSystem from "../../queen-system";

//TODO : implement this class, make it global, mods only needs to import this to add stuff
export class ModdingAPI {
    constructor(private boundSystem : QueenSystem){}
    //add stuff
    addCard          (name : string, constructor : (new (...p : ConstructorParameters<typeof Card>) => Card) & {getCardData?() : CardData}, data? : CardData) : CardDataID {
        
    }

    addEffect        (name : string, constructor : (new (...p : ConstructorParameters<typeof Effect>) => Effect) & {getEffData?() : EffectData}, data? : EffectData) : EffectDataID
    addEffectType    (name : string, constructor : (new (...p : ConstructorParameters<typeof EffectModifier>) => EffectModifier)) : EffectTypeID
    addEffectSubtype (name : string, constructor : (new (...p : ConstructorParameters<typeof EffectModifier>) => EffectModifier)) : EffectSubtypeID
    addZone          (name : string, data : ZoneData, constructor : (new (...p : ConstructorParameters<typeof Zone>) => Zone)) : ZoneTypeID
    addArchtype      (name : string) : ArchtypeID
    addAction        (name : string, handler : (q : QueenSystem, a : Action) => void) : ActionID
    addColor         (name : string, data : ColorData) : ColorID
    addDeck          (name : string, data : DeckData)  : DeckID
    addOperator      (name : string, data : OperatorData) : OperatorID
}
