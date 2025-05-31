import _node from "../types/abstract/generics/node";
import _tree from "../types/abstract/generics/tree";
import Action from "../types/abstract/gameComponents/action";
import zoneHandler from "./zoneHandler";
import dry_system from "../types/data/dry/dry_system";
import actionRegistry, {actionName, actionID} from "../types/data/actionRegistry";

import type error from "../types/errors/error";
import type turnReset from "../types/actions/turnReset";
import type activateEffect from "../types/actions/activateEffect";
import type posChange from "../types/actions/posChange";
import { 
    activateEffectSubtypeSpecificFunc, 
    drawAction, 
    increaseTurnCount, 
    modifyAnotherAction, 
    setThreatLevel, 
    turnEnd, 
    turnStart,
    doThreatLevelBurn,
    shuffle
} from "../types/actions";
import type card from "../types/abstract/gameComponents/card";
import { unregisteredAction } from "../types/errors";
// import type dry_card from "../dryData/dry_card";
// import position from "../baseClass/position";
type doGetNewNode = boolean
type completed = boolean

type cardID = string
type effectID = string

interface logInfoNormal {
    currentPhase : 1 | 2 | 4 | 7,
    currentAction : Action,
}

interface logInfoHasResponse {
    currentPhase : 3 | 6,
    currentAction : Action,
    responses : Record<cardID, effectID[]>
}

interface logInfoResolve {
    currentPhase : 5,
    currentAction : Action,
    resolvedResult : Action[]
}

type logInfo = logInfoNormal | logInfoHasResponse | logInfoResolve

class queenSystem {
    turnActionID : number = -Infinity
    rootID : number 
    turnCount : number = 0
    maxThreatLevel : number = 20
    threatLevel : number
    zoneHandler : zoneHandler

    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from phaseIdx 3

    fullLog : logInfo[] = []
    //the weird reduce thiny is equivalent to .flat(2), done since .flat is not available for es6
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

    //cardID, effectIDs[]

    phaseIdx : number = 0
    actionTree : _tree

    constructor(zoneHandler : zoneHandler){
        this.threatLevel = 0
        this.zoneHandler = zoneHandler
        this.actionTree = new _tree(new turnEnd())
        this.rootID = this.actionTree.root.id
    }

    restartTurn(){
        this.actionTree.clear()
        this.actionTree.attach(new turnStart())
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = 0
        this.turnActionID = -Infinity
        this.rootID = this.actionTree.root.id
    }

    resolveError(a : error){
        console.log(a.toString())
    }

    private actionSwitch_resolve(a : Action) : undefined | void | Action[]{
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if(typeof a.typeID !== "number") return [new unregisteredAction(a)]
        switch(a.typeID){
            case actionRegistry.null : 
                break
            case actionRegistry.error : 
                return this.resolveError(a as error)
            
            case actionRegistry.turnStart : 
                break; //turn start

            case actionRegistry.turnEnd : {
                //turn end
                if((a as turnEnd).doIncreaseTurnCount){
                    return [new increaseTurnCount()]
                }
                return []
            }; 

            case actionRegistry.turnReset : 
                return this.zoneHandler.handleTurnReset(a as turnReset)

            case actionRegistry.freeUpStatusIDs : {
                //to be implemented                
                break;
            }

            //note : may move the resolution of 6, 7, 8 to zone/system
            case actionRegistry.increaseTurnCount : {
                this.turnCount++;
                return [];
            }

            case actionRegistry.setThreatLevel : {
                this.threatLevel = (a as setThreatLevel).newThreatLevel
                if(isNaN(this.threatLevel) || this.threatLevel < 0) this.threatLevel = 0;
                if(this.threatLevel > this.maxThreatLevel) {
                    this.threatLevel = this.maxThreatLevel;
                    return [new doThreatLevelBurn()]
                }
                return []
            }

            case actionRegistry.doThreatLevelBurn : {
                //do burn i guess
                //not implemented
                return []
            }

            case actionRegistry.forcefullyEndTheGame : {
                //end the game
                //keep the tree

                //am uhh not sure how to implememt this shit yet
                //i think this is fine? for now?
                this.suspend(this.actionTree.root.id)
            }

            case actionRegistry.internalActivateEffectSignal : 
            case actionRegistry.activateEffect : 
                // 5 and 101 resolves the same, just has different control flow
                return this.zoneHandler.handleEffectActivation(a as activateEffect, this.toDry())

            case actionRegistry.posChange : 
                return this.zoneHandler.handlePosChange(a as posChange)

            case actionRegistry.draw : 
                return this.zoneHandler.handlePosChange(a as drawAction)

            case actionRegistry.shuffle : 
                return this.zoneHandler.handleShuffle(a as shuffle)

            case actionRegistry.execute : {
                //to be implemented                    
                break;
            }

            case actionRegistry.reprogramStart : {
                //to be implemented                
                break;
            }

            case actionRegistry.reprogramEnd : {
                //to be implemented                
                break;
            }

            case actionRegistry.addStatusEffect : {
                //to be implemented                
                break;
            }

            case actionRegistry.removeStatusEffect : {
                //to be implemented                
                break;
            }

            case actionRegistry.activateEffectSubtypeSpecificFunc : 
                return this.zoneHandler.handleActivateEffectSubtypeFunc(a as activateEffectSubtypeSpecificFunc, this.toDry());               
            
            case actionRegistry.modifyAnotherAction : {
                let target = (a as modifyAnotherAction).targetActionID as number
                let n = this.actionTree.getNode(target)
                if(n.id !== target) return []
                n.data.modifyAttr(
                    (a as modifyAnotherAction).attrToModify, 
                    (a as modifyAnotherAction).newAttrValue
                )
                return []
            }

            default : {
                //only should reach here iff effect is unregistered
                //technically this is unreachable code but who knows
                let unhandledID = a.typeID //if this is never, we checked every cases
                return [new unregisteredAction(a)]
            }
        }


    }

    processTurn(startNode? : _node) : completed;
    processTurn(turnActionFromPlayer?: Action) : completed
    processTurn(param? : Action | _node) : completed{
        let n : _node | undefined
        if(param instanceof _node){
            n = param
        } else {
            this.restartTurn();
            if(param) {
                this.actionTree.attach(param)
                this.turnActionID = param.id
            }
            this.phaseIdx = 1;
            n = this.actionTree.getNext()
        }
        while(n){
            let doGetNewNode = this.process(n);
            if(this.suspendID !== -1) return false;
            if(doGetNewNode) n = this.actionTree.getNext(); 
        }
        console.log("finish processing turn");
        return true;
    }

    process(n : _node) : doGetNewNode {
        //[phase progression graph:

        //v--------------\--------------\
        //1 -> 2 -> 3 -> 4    5 -> 6 -> 7
        //\--if visited once--^

        //technically 6 needs to go to 1 and loop through all again but screw it, 
        //we already resolved the dang thing, just mark it as complete and move on
        
        // if(!n) {
        //     console.log("finish processing turn, clearing tree");
        //     this.restartTurn();
        //     return;
        // }
        switch(this.phaseIdx){
            case 1: {
                //declare step
                this.fullLog.push({
                    currentPhase: 1,
                    currentAction : n.data
                })
                if(n.id === this.processStack.at(-1)) {
                    this.phaseIdx = 5;
                    return this.process(n);
                }
                console.log("declare action: " + n.data.type)
                this.phaseIdx = 2;
                return false;
            }
            case 2: {
                //handle input
                this.fullLog.push({
                    currentPhase : 2,
                    currentAction : n.data
                })
                this.phaseIdx = 5;
                if(n.data.requireInput) this.suspend(n.id);
                return false;
            }
            case 3: {
                //chain step
                let [actionArr, logInfo] = this.zoneHandler.respond(n.data, this.toDry(), !n.data.canBeChainedTo)
                this.fullLog.push({
                    currentPhase : 3,
                    currentAction : n.data,
                    responses : Object.fromEntries(logInfo)
                })
                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                    else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                })
                this.phaseIdx = 4;
                return false
            }
            case 4: {
                //recur step
                //recur until the last element of processStack is reached
                //then that element is removed
                this.fullLog.push({
                    currentPhase : 4,
                    currentAction : n.data
                })
                this.processStack.push(n.id)
                this.phaseIdx = 1;
                return true;
            }
            case 5: {
                //resolve
                this.processStack.pop();
                let x = this.actionSwitch_resolve(n.data)
                if(x) {
                    x.forEach(i => {
                        if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                        else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                    })
                }
                this.fullLog.push({
                    currentPhase : 5,
                    currentAction : n.data,
                    resolvedResult : (x) ? x : []
                })
                console.log("finish resolving acion: " + n.data.type)
                if(n.data.canBeTriggeredTo) this.phaseIdx = 6;
                else this.phaseIdx = 7; //6 is skipped
                return false;
            }
            case 6: {
                //trigger
                let [actionArr, logInfo] = this.zoneHandler.respond(n.data, this.toDry())
                this.fullLog.push({
                    currentPhase : 6,
                    currentAction : n.data,
                    responses : Object.fromEntries(logInfo)
                })
                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                    else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                })
                this.phaseIdx = 7;
                return false;  
            }
            case 7: {
                //complete 
                this.fullLog.push({
                    currentPhase : 7,
                    currentAction : n.data
                })
                n.markComplete();
                this.phaseIdx = 1;
                return true;
            }
        }
        console.log("accessed invalid phaseIdx: " + this.phaseIdx)
        return false
    }

    suspend(nid : number){
        this.suspendID = nid;
    }

    continue(){
        let n = this.actionTree.getNode(this.suspendID)
        this.suspendID = -1;
        this.processTurn(n)
    }

    toDry(){
        return new dry_system(this)
    }

    initializeTestGame(cardArr : card[]){
        //draw 1 card to hand
        this.zoneHandler.deck.forceCardArrContent(cardArr)
        this.restartTurn()
        let a = this.zoneHandler.deck.getAction_draw(true, false, this.zoneHandler.hand.lastPos)
        this.actionTree.attachArbitrary(this.actionTree.root.id, a)
    }


}

export default queenSystem
export {logInfo}