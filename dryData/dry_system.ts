import type queenSystem from "../handlers/queenSystem"
import type dry_zone from "./dry_zone"

class dry_system {
    //TODO : include reblances of the stack strace up until the point of this object's creation
    //for checking hard unique and unique
    readonly threat_level : number
    readonly phaseIdx : number

    readonly zoneMap : Map<string, dry_zone>
    constructor(system : queenSystem){//fix later
        this.threat_level = system.threatLevel
        this.phaseIdx = system.phaseIdx
        this.zoneMap = new Map()

        system.zoneHandler.zoneArr.forEach(i => {
            this.zoneMap.set(i.name, i.toDry())
        })
    } 

    get isInChainPhase() {return this.phaseIdx === 3}
    get isInTriggerPhase() {return this.phaseIdx === 6}
}

export default dry_system