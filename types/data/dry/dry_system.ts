import type queenSystem from "../../../_queenSystem/main"
import type dry_zone from "./dry_zone"
import type dry_card from "./dry_card"
import type Action from "../../gameComponents/action"
import type { logInfo } from "../../../_queenSystem/main"

type effectID = string
type cardID = string
class dry_system {
    //TODO : include reblances of the stack strace up until the point of this object's creation
    //for checking hard unique and unique
    //^ done
    readonly threat_level : number
    readonly phaseIdx : number

    readonly zoneMap : Map<string, dry_zone>
    readonly turnActionID : number
    readonly turnCount : number
    readonly maxThreatLevel : number
    readonly rootID : number

    readonly fullLog : logInfo[] = []
    //see note on the weird reduce in handlers/queenSystem
    getActivatedEffectIDs() : effectID[] {
        return this.fullLog.map(i => {
            if(i.currentPhase !== 3 && i.currentPhase !== 6) return [];
            return Object.values(i.responses).reduce((accu, ele) => accu.concat(ele))
        }).reduce((accu, ele) => accu.concat(ele))
    }
    getActivatedCardIDs() : cardID[] {
        return this.fullLog.map(i => {
            if(i.currentPhase !== 3 && i.currentPhase !== 6) return [];
            return Object.values(i.responses).reduce((accu, ele) => accu.concat(ele))
        }).reduce((accu, ele) => accu.concat(ele))
    }
    getResolvedActions() : Action[] {
        return this.fullLog.map(i => {
            if(i.currentPhase !== 5) return undefined;
            return i.currentAction
        }).filter(i => i !== undefined)
    }

    constructor(system : queenSystem){//fix later
        this.threat_level = system.threatLevel
        this.phaseIdx = system.phaseIdx
        this.zoneMap = new Map()

        system.zoneHandler.zoneArr.forEach(i => {
            this.zoneMap.set(i.name, i.toDry())
        })

        this.fullLog = system.fullLog //dangerous property, not deep copied, but maybe too expensive to deep copy
        this.turnActionID = system.turnActionID
        this.turnCount = system.turnCount
        this.maxThreatLevel = system.maxThreatLevel
        this.rootID = system.rootID
    } 

    get isInChainPhase() {return this.phaseIdx === 3}
    get isInTriggerPhase() {return this.phaseIdx === 6}

    getCardWithID(cid : string) : dry_card | undefined{
        let res : dry_card | undefined = undefined
        this.zoneMap.forEach(i => {
            res = i.getCardWithID(cid)
        })
        return res
    }

    get system() {return this.zoneMap.get("system") as dry_zone}
    get deck() {return this.zoneMap.get("deck") as dry_zone}
    get storage() {return this.zoneMap.get("storage") as dry_zone}
    get enemyGrave() {return this.zoneMap.get("enemyGrave") as dry_zone}
    get playerGrave() {return this.zoneMap.get("playerGrave") as dry_zone}
    get hand() {return this.zoneMap.get("hand") as dry_zone}
    get enemyField() {return this.zoneMap.get("enemyField") as dry_zone}
    get playerField() {return this.zoneMap.get("playerField") as dry_zone}
    get void() {return this.zoneMap.get("void") as dry_zone}
}

export default dry_system