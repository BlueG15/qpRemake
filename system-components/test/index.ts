import { ActionID, ActionRegistry, type Action } from "../../core"
import type { Card } from "../../game-components/cards"
import type { Effect } from "../../game-components/effects"
import type QueenSystem from "../../queen-system"

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

        loadedEffects.forEach((e : Effect) => {
            const localized = s.localizer.getLocalizedSymbol(e)
            if(!localized) console.log(`Effect ${e} is not localized`)
        })

        console.log()
        console.log("-".repeat(20))
        console.log()

        loadedCards.forEach((c : Card) => {
            const localized = s.localizer.getLocalizedSymbol(c)
            if(!localized) console.log(`Card ${c} is not localized`)
        })
    },

    test_unhandled_actions : (s) => {
        console.log("Unhanndled actions:", s.registryFile.actionLoader.getNotHandledActions().map((a : Action) => ActionRegistry.getKey(a.type)))
    }
}

export default testSuite
