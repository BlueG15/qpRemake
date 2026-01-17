import actionRegistry from "../data/actionRegistry"
import type QueenSystem from "./queenSystem"

//Old test file is bad, so I write a new one 
const testSuite : Record<string, ((s : QueenSystem) => void)> = {
    test_load : (s) => {
        const loadedEffects = s.registryFile.effectLoader.classkeys
        const loadedCards = s.registryFile.cardLoader.classkeys
        console.log(`Loaded ${loadedEffects.length} effects and ${loadedCards.length} cards`)
    },

    test_localize : (s) => {
        const loadedEffects = s.registryFile.effectLoader.classkeys
        const loadedCards = s.registryFile.cardLoader.classkeys

        loadedEffects.forEach(e => {
            const localized = s.localizer.getLocalizedSymbol(e)
            if(!localized) console.log(`Effect ${e} is not localized`)
        })

        console.log()
        console.log("-".repeat(20))
        console.log()

        loadedCards.forEach(c => {
            const localized = s.localizer.getLocalizedSymbol(c)
            if(!localized) console.log(`Card ${c} is not localized`)
        })
    },

    test_unhandled_actions : (s) => {
        console.log("Unhanndled actions:", s.registryFile.actionLoader.getNotHandledActions().map(a => actionRegistry[a as any]))
    }
}

export default testSuite
