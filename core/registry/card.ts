import { BrandedNumber, BrandedString } from "../misc";
import { ArchtypeRegistry } from "./archtype";
import { Registry } from "./base";
import type { CardData as CData } from "../data-type";
import { RarityRegistry } from "./rarity";

const DefaultCards = {
    c_blank : {variantData : {base : {
        atk : 0,
        hp : 1,
        level : 0,
        rarity : RarityRegistry.white,
        extensionArr : [],
        archtype : [ArchtypeRegistry.null],
        effects : []
    }}}
} 

type CardData = typeof DefaultCards
type CardDataID = BrandedNumber<CardData>
type CardDataName = BrandedString<CardData>

const CardDataRegistry = Registry.from<CardDataID, CardDataName, CData, CardData>(DefaultCards)

export {
    CardDataID,
    CardDataName,
    CardDataRegistry
}