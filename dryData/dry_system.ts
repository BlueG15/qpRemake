import type queenSystem from "../handlers/queenSystem"
import type dry_zone from "./dry_zone"
import type dry_card from "./dry_card"
import type Action from "../baseClass/action"
import type { logInfo } from "../handlers/queenSystem"

type effectID = string
type cardID = string
class dry_system {
    //TODO : include reblances of the stack strace up until the point of this object's creation
    //for checking hard unique and unique
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
}

export default dry_system