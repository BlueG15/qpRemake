import { type CardData, type CardDataID, type EffectData, type EffectDataID, type EffectModifier, type EffectTypeID, type EffectSubtypeID, type ZoneData, type ZoneTypeID, type ArchtypeID, type Action, type ActionID, type ColorData, type ColorID, type DeckData, type DeckID, type OperatorData, type OperatorID, CardDataRegistry } from "../../core";
import type { Card } from "../../game-components/cards";
import type { Effect } from "../../game-components/effects";
import type { Zone } from "../../game-components/zones";
import type QueenSystem from "../../queen-system";
import type { ModdingAPI } from "./modding-api";

class ModUtils implements ModdingAPI {
    constructor(private boundSystem : QueenSystem){}
    addCard(name: string, constructor: (new (...p: ConstructorParameters<typeof Card>) => Card) & { getCardData?(): CardData; }, data: CardData): CardDataID {
        return this.boundSystem.cardLoader.load(name, constructor.getCardData ? constructor.getCardData() : data, constructor)
    }
    addEffect(name: string, constructor: (new (...p: ConstructorParameters<typeof Effect>) => Effect) & { getEffData?(): {base : EffectData}; }, data?: EffectData): EffectDataID {
        return this.boundSystem.effectLoader.load(name, constructor, data)!
    }
    addEffectType(name: string, constructor: (new (...p: ConstructorParameters<typeof EffectModifier>) => EffectModifier)): EffectTypeID {
        throw new Error("Method not implemented.");
    }
    addEffectSubtype(name: string, constructor: (new (...p: ConstructorParameters<typeof EffectModifier>) => EffectModifier)): EffectSubtypeID {
        throw new Error("Method not implemented.");
    }
    addZone(name: string, data: ZoneData, constructor: (new (...p: ConstructorParameters<typeof Zone>) => Zone)): ZoneTypeID {
        throw new Error("Method not implemented.");
    }
    addArchtype(name: string): ArchtypeID {
        throw new Error("Method not implemented.");
    }
    addAction(name: string, handler: (q: QueenSystem, a: Action) => void): ActionID {
        throw new Error("Method not implemented.");
    }
    addColor(name: string, data: ColorData): ColorID {
        throw new Error("Method not implemented.");
    }
    addDeck(name: string, data: DeckData): DeckID {
        throw new Error("Method not implemented.");
    }
    addOperator(name: string, data: OperatorData): OperatorID {
        throw new Error("Method not implemented.");
    }  
} 

export { ModdingAPI }