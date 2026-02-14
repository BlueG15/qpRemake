import { ActionID, ActionName, ActionRegistry, CardDataRegistry, CardVariantName, EffectDataRegistry, EffectSubtypeRegistry, EffectTypeRegistry, GameRule, PlayerTypeID, ZoneRegistry, type Action } from "../../core"
import type { Card } from "../../game-components/cards"
import type { Effect } from "../../game-components/effects"
import type { QueenSystem } from "../../queen-system"
import { ParseMode } from "../localization/xml-text-parser"

//TODO: Old test file is bad, so I write a new one 
const testSuite : Record<string, ((s : QueenSystem) => void)> = {
    checkAllRegisteredCards(){
        console.log(CardDataRegistry.getAllRegisteredKeys())
    },
    checkAllRegisteredEffects(){
        console.log(EffectDataRegistry.getAllRegisteredKeys())
    },
    checkAllRegisteredZones(){
        console.log(ZoneRegistry.getAllRegisteredKeys())
    },
    checkHandledActions(s){
        const allActions = ActionRegistry.getAllRegisteredKeys()

        const Handled : Record<string, string[]> = {}
        const SystemHandled : ActionName[] = []
        const UnHandled : ActionName[] = []
        const allGameRules = new Set(s.gamerules.map(g => g.displayID))

        for(const a of allActions){
            const g = s.gamerules.filter(g => g.classification === a).map(g => g.displayID)
            g.forEach(g => allGameRules.delete(g))
            if(g.length){
                const arr = Handled[a] ?? []
                arr.push(...g)
                Handled[a] = arr
            } else if(s.gameRuleSystem.has(a)){
                SystemHandled.push(a)
            } else {
                UnHandled.push(a)
            }
        }

        console.log("----- GameRule Handled -----")
        for(const [a, g] of Object.entries(Handled)){
            console.log(`Action ${a} is handled by ${g.length} game rule(s)`, g)
        }
        console.log()
        console.log("----- System Handled -----")
        console.log(SystemHandled)
        console.log()
        console.log("----- Potentially Not Handled (a_all and a_any cannot be checked) -----")
        console.log(UnHandled)
        console.log()
        console.log("----- Unaccounted for gamerules -----")
        console.log(allGameRules)
    },
    checkCanCreateAllEffectTypes(s){
        const allIDs = EffectTypeRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const id of allIDs){
            const c = s.effectModifierLoader.getType(id, s.setting)
            if(!c) {
                console.log(`Effect type ${EffectTypeRegistry.getKey(id)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllEffectSubtypes(s){
        const allIDs = EffectSubtypeRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const id of allIDs){
            const c = s.effectModifierLoader.getSubType(id, s.setting)
            if(!c) {
                console.log(`Effect subtype ${EffectSubtypeRegistry.getKey(id)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllBaseCards(s){
        const allCardIDs = CardDataRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const cid of allCardIDs){
            const c = s.cardLoader.getCard(cid, s.setting, [CardVariantName.base])
            if(!c) {
                console.log(`Card ${CardDataRegistry.getKey(cid)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllUpgradeCards(s){
        const allCardIDs = CardDataRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const cid of allCardIDs){
            const c = s.cardLoader.getCard(cid, s.setting, [CardVariantName.upgrade_1])
            if(!c) {
                console.log(`Card ${CardDataRegistry.getKey(cid)} - upgrade variant cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllBaseEffects(s){
        const allEffIDs = EffectDataRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const eid of allEffIDs){
            const c = s.effectLoader.getEffect(eid, [CardVariantName.base], s.setting)
            if(!c) {
                console.log(`Effect ${EffectDataRegistry.getKey(eid)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllUpgradeEffects(s){
        const allEffIDs = EffectDataRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const eid of allEffIDs){
            const c = s.effectLoader.getEffect(eid, [CardVariantName.upgrade_1], s.setting)
            if(!c) {
                console.log(`Effect ${EffectDataRegistry.getKey(eid)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkCanCreateAllZones(s){
        const allZoneIDs = ZoneRegistry.getAllRegisteredIDs()
        let ErrorFlag = false
        for(const zid of allZoneIDs){
            const c = s.zoneLoader.getZone(s.setting, PlayerTypeID.player, 0, zid)
            if(!c) {
                console.log(`Zone ${ZoneRegistry.getKey(zid)} cannot be created`);
                ErrorFlag = true
            }
        }
        if(!ErrorFlag) console.log("Everything can be created!")
    },
    checkAllLocalizeEffectText(s){
        const allEffsID = EffectDataRegistry.getAllRegisteredIDs()
        for(const eid of allEffsID){
            const has = s.localizer.isCurrentLanguageHasKey(eid, "effect")
            if(has){
                console.log(`${EffectDataRegistry.getKey(eid)} === CHECKED `)
            } else {
                console.log(`${EffectDataRegistry.getKey(eid)} ========> NOT CHECKED `)
            }
        }
    },
    checkAllLocalizeCardNames(s){
        const allEffsID = CardDataRegistry.getAllRegisteredIDs()
        for(const cid of allEffsID){
            const has = s.localizer.isCurrentLanguageHasKey(cid, "card")
            if(has){
                console.log(`${CardDataRegistry.getKey(cid)} === CHECKED `)
            } else {
                console.log(`${CardDataRegistry.getKey(cid)} ========> NOT CHECKED `)
            }
        }
    }
}

function runAllTests(s : QueenSystem){
    Object.entries(testSuite).forEach(([key, test], i) => {
        const openingMessage = `===== TESTING test number ${i}: ${key} =====`
        const endingMessage = "=".repeat(openingMessage.length)
        console.log(openingMessage)
        try{
            test(s)
        }catch(e){
            console.error("Test failed to run, errors:")
            console.error(e)
        }
        console.log(endingMessage)
        console.log()
    })
}

export {testSuite, runAllTests}
