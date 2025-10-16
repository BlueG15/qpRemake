import { operatorID, operatorRegistry } from "./operatorRegistry";
import type { cardDataRegistry } from "./cardRegistry";

export enum deckRegistry {
    "d_all_lemons" = 0,
    "d_all_apples",
    "d_natural",
}


//class solely for type checking purposes
export class DeckData {
    constructor(
        public readonly deckID : deckRegistry,
        public readonly cards : (keyof typeof cardDataRegistry)[],
        public readonly operator : operatorID,
        public readonly img : (keyof typeof cardDataRegistry)
    ){}
}

export const deckDataRegistry //: Record<deckRegistry, deckData> 
= {
    0 : new DeckData(
        deckRegistry.d_all_lemons,
        new Array(10).fill("c_lemon") as "c_lemon"[],
        operatorRegistry.o_esper,
        "c_lemon"
    ),
    1 : new DeckData(
        deckRegistry.d_all_apples,
        new Array(10).fill("c_apple") as "c_apple"[],
        operatorRegistry.o_esper,
        "c_apple"
    ),
    2 : new DeckData(
        deckRegistry.d_natural,
        [
            "c_apple", 
            "c_banana", 
            "c_cherry", 
            "c_lemon",
            "c_pomegranate",
            "c_pumpkin",
            "c_greenhouse",
            "c_pollinate",
            "c_growth",
            "c_spring",
            "c_summer", 
            "c_autumn",
            "c_winter", 
            "c_demeter", 
        ],
        operatorRegistry.o_esper,
        "c_spring"
    )
} as const