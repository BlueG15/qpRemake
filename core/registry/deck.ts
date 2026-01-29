import type { BrandedNumber, BrandedSpecific, BrandedString } from "../misc";
import type { DeckData } from "../data-type";
import { IDRegistry, Registry } from "./base";
import { CardDataRegistry } from "./card";
import { OperatorRegistry } from "./operator";

type Decks = ["oops_all_blank", "null_deck"]
type DeckName = BrandedString<Decks>
type DeckID = BrandedNumber<Decks>

const DefaulDecks : Record<Decks[number], Omit<DeckData, "id">> = {
    oops_all_blank : {
        cards : new Array(5).fill(CardDataRegistry.c_blank),
        operator : OperatorRegistry.esper,
    },
    null_deck : {
        cards : [],
        operator : OperatorRegistry.esper
    }
}

const DeckDataRegistry = Registry.from<DeckID, DeckName, Omit<DeckData, "id">, typeof DefaulDecks>(DefaulDecks)

export {
    DeckID,
    DeckName,
    DeckDataRegistry
}