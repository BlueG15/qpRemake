import type queenSystem from "../../_queenSystem/queenSystem"
import type dry_zone from "./dry_zone"
import dry_card from "./dry_card"
import type { logInfo } from "../../_queenSystem/queenSystem"
import { logInfoHasResponse, logInfoNormal, TurnPhase, type logInfoResolve, type player_stat } from "../systemRegistry"
import { zoneRegistry } from "../zoneRegistry"
import { Action } from "../../_queenSystem/handler/actionGenrator"

import utils from "../../utils"
import { actionName } from "../actionRegistry"

type effectID = string
type cardID = string
class dry_system {
    //TODO : include reblances of the stack strace up until the point of this object's creation
    //for checking hard unique and unique
    //^ done
    readonly phaseIdx : number

    readonly turnActionID : number
    readonly turnCount : number
    readonly rootID : number

    readonly playerStat : ReadonlyArray<player_stat>

    readonly fullLog : logInfo[] = []

    private readonly ref : queenSystem

    readonly rootAction : Action<"a_turn_end">

    readonly zoneMap : ReadonlyMap<string, dry_zone>

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
        }).filter(i => i !== undefined) as Action[]
    }

    constructor(system : queenSystem){//fix later
        this.ref = system
        this.phaseIdx = system.phaseIdx

        this.zoneMap = new Map(
            system.zoneHandler.zoneArr.map(i => [i.name, i.toDry()])
        )

        this.fullLog = system.fullLog //dangerous property, not deep copied, but maybe too expensive to deep copy
        this.turnActionID = system.turnActionID
        this.turnCount = system.turnCount
        this.rootID = system.rootID

        this.playerStat = system.player_stat.map(i => Object.entries(i).reduce((curr, ele) => {
            curr[ele[0] as keyof player_stat] = ele[1];
            return curr;
        }, {} as player_stat))

        this.rootAction = system.actionTree.root.data as Action<"a_turn_end">
    } 

    get isInChainPhase() {return this.phaseIdx === TurnPhase.chain}
    get isInTriggerPhase() {return this.phaseIdx === TurnPhase.trigger}

    getCardWithID(cid : string) : dry_card | undefined{
        try{
            this.zoneMap.forEach(zone => {
                let c = zone.getCardWithID(cid)
                if(c) throw c
            })
        }catch(c : any){
            if(c instanceof dry_card) return c;
            return undefined
        }
        return undefined
    }

    getZoneWithID(zid : number) : dry_zone | undefined {
        if(isNaN(zid) || !isFinite(zid) || zid < 0) return undefined;
        let iter = this.zoneMap.values();
        let val = iter.next();
        while(zid !== 0 && !val.done) val = iter.next();
        if(zid !== 0) return undefined;
        return val.value;
    }

    // get system() {return this.ref.zoneHandler.system.toDry()}
    // get deck() {return this.ref.zoneHandler.deck.toDry()}
    // get storage() {return this.ref.zoneHandler.storage.toDry()}
    // get hand() {return this.zoneMap.get(zoneRegistry[zoneRegistry.z_hand]) as dry_zone}
    // get void() {return this.ref.zoneHandler.void.toDry()}
    // getField(pid : number) {return this.zoneMap.get(zoneRegistry[zoneRegistry.z_p1_field]) as dry_zone}
    // getGrave(pid : number) {return this.ref.zoneHandler.getGrave(pid)?.toDry()}

    //log APIs
    get resolutionLog() : logInfoResolve[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.resolve) as logInfoResolve[]
    }

    get chainLog() : logInfoHasResponse[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.chain) as logInfoHasResponse[]
    }

    get triggerLog() : logInfoHasResponse[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.trigger) as logInfoHasResponse[]
    }

    get completionLog() : logInfoNormal[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.complete) as logInfoNormal[]
    }

    hasActionCompleted(a : Action, startSearchingIndex : number = 0){
        for(let i = startSearchingIndex; i < this.fullLog.length; i++){
            if(this.fullLog[i].currentPhase === TurnPhase.complete){
                if(this.fullLog[i].currentAction.id === a.id) return true
            }
        }
        return false;
    }


    /**
     * Finds a chain of action A -> resolved to B -> resolved to C -> ...
     * @param typeArr : action types to search
     * @returns  Action[] if success, unefined if not
     * 
     * 
     * Search is first comes first serve, B is the first in the resoution log of A that has the wanted type (id 1 in the arr) 
     */
    findSpecificChainOfAction_resolve<
        T extends actionName[]
    >(typeArr : T) : Action[] | undefined{
        if(!typeArr.length) return [];
        let res : Action[] = [];

        let candidateResolveLog : logInfoResolve | undefined = this.resolutionLog.find(k => k.currentAction.type === typeArr[0]);
        if(!candidateResolveLog) return undefined
        res.push(candidateResolveLog.currentAction)
        if(typeArr.length === 1) return res;

        for(let i = 1; i < typeArr.length; i++){
            let matchedNext : Action | undefined = candidateResolveLog.resolvedResult.find(k => k.type === typeArr[i]);
            if(!matchedNext) return undefined;

            candidateResolveLog = this.resolutionLog.find(k => k.currentAction.id === matchedNext.id);
            if(!candidateResolveLog) return undefined;
            res.push(candidateResolveLog.currentAction)
        }

        return res;
    }

    /**
     * Parses the whole log though the condition funciton, tally and returns the result
     * @param condition a function that returns a thing parsable to a number
     * @param stopEarlyCount a count that if reached, will return early
     * @returns total count
     * 
     * 
     */
    count(condition : (log : logInfo) => number | boolean | undefined, stopEarlyCount? : number){
        let c = 0;
        if(stopEarlyCount === undefined) stopEarlyCount = Infinity
        for(let i = 0; i < this.fullLog.length; i++){
            c += utils.toSafeNumber( condition(this.fullLog[i]), true )
            if(c >= stopEarlyCount) return c;
        }
        return c
    }

    getAllZonesOfPlayer(pid : number) : Record<number, dry_zone[]>{
        if(pid < 0) return {}
        let res : Record<number, dry_zone[]> = {}

        this.zoneMap.forEach((val, key) => {
            if(val.playerIndex === pid) val.types.forEach(i => res[i] ? res[i].push(val) : res[i] = [val])
        })

        return res;
    }

}


export default dry_system
export type dectetorFunc = (log : logInfo) => number | boolean | undefined