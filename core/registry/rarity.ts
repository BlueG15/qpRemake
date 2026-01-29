import { BrandedNumber, BrandedString, safeSimpleTypes } from ".."
import { ColorID, ColorRegistry } from "./color"
import { Registry } from "./base"

const enum Rarity {
    white = 0,
    red,
    green,
    blue,
    ability,
    algo
}

type RarityID = BrandedNumber<Rarity>
type RarityName = BrandedString<Rarity>

type RarityDataFixxed = {
    color : ColorID, 
    drop_weight : number, //a number from 0 to 1 (inclusive) of how likely a card of this rarity to drop
}

type RarityDataVariable = {
    [key : string] : safeSimpleTypes
}

type RarityData = RarityDataFixxed | (RarityDataFixxed & RarityDataVariable)

const DefaultRarityData = {
    white : {
        color : ColorRegistry.white, 
        drop_weight : .95,
    },
    blue : {
        color : ColorRegistry.blue,
        drop_weight : .7,
    },
    green : {
        color : ColorRegistry.green,
        drop_weight : .4,
    },
    red : {
        color : ColorRegistry.red,
        drop_weight : .1,
    },
    ability : {
        color : ColorRegistry.yellow,
        drop_weight : 0,
    },
    algo : {
        color : ColorRegistry.purple,
        drop_weight : 0,
    }
} as const

const RarityRegistry = Registry.from<RarityID, RarityName, RarityData, typeof DefaultRarityData>(DefaultRarityData)
export {
    RarityRegistry,
    RarityID,
    RarityName,
    RarityData
}
