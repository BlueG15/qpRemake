import type { BrandedNumber, BrandedString } from "../misc";
import type { DeckData } from "../cardData";
import { Registry } from "./base";
import { CardDataRegistry } from "./card";
import { OperatorRegistry } from "./operator";

type Decks = ["oops_all_blank", "null_deck"]
type DeckName = BrandedString<Decks>
type DeckID = BrandedNumber<Decks>

const DefaulDecks : Record<Decks[number], DeckData> = {
    oops_all_blank : {
        cards : [{
            dataID : CardDataRegistry.c_blank,
            variants : ["base"],
            count : 5,
        }],
        operator : OperatorRegistry.esper,
    },
    null_deck : {
        cards : [],
        operator : OperatorRegistry.esper
    }
}

const DeckDataRegistry = Registry.from<DeckID, DeckName, DeckData, typeof DefaulDecks>(DefaulDecks)

export {
    DeckID,
    DeckName,
    DeckDataRegistry
}