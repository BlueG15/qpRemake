import { BrandedNumber, BrandedString } from "../misc";
import { ArchtypeRegistry } from "./archtype";
import { DoubleKeyRegistry } from "./base";
import type { CardPatchData, CardPatchDataFull } from "../cardData";
import { RarityRegistry } from "./rarity";

export const enum CardVariantName {
    base = "base",
    upgrade_1 = "upgrade_1"
}

const DefaultCards: Record<string, CardPatchDataFull> = {
    c_blank: {
        atk: 0,
        hp: 1,
        level: 0,
        rarity: RarityRegistry.white,
        extensionArr: [],
        archtype: [ArchtypeRegistry.null],
        effects: []
    }
}

type CardData = typeof DefaultCards
type CardDataID = BrandedNumber<CardData>
type CardName = BrandedString<CardData>

const CardDataRegistry = DoubleKeyRegistry.from<
    CardDataID, CardName, CardPatchDataFull, CardPatchData, typeof DefaultCards, [CardVariantName.upgrade_1]
>(
    DefaultCards, CardVariantName.base, CardVariantName.upgrade_1
)

export {
    CardDataID,
    CardName,
    CardDataRegistry
}