import _node from "../types/abstract/generics/node";
import _tree from "../types/abstract/generics/tree";
import Action from "../types/abstract/gameComponents/action";
import zoneHandler from "./handler/zoneHandler";
import dry_system from "../types/data/dry/dry_system";
import actionRegistry, {actionName, actionID} from "../types/data/actionRegistry";

import { 
    turnReset,
    activateEffect,
    posChange,
    activateEffectSubtypeSpecificFunc, 
    drawAction, 
    increaseTurnCount, 
    modifyAnotherAction, 
    setThreatLevel, 
    turnEnd, 
    turnStart,
    doThreatLevelBurn,
    shuffle,
    addStatusEffect
} from "../types/actions";

import type Card from "../types/abstract/gameComponents/card";
import type error from "../types/errors/error";
import { cannotLoad, unregisteredAction } from "../types/errors";

import dry_card from "../types/data/dry/dry_card";
import dry_position from "../types/data/dry/dry_position";

import { 
    logInfo,
    player_stat,
    suspensionReason,
    TurnPhase
} from "../types/data/systemRegistry";

import { Setting } from "../types/abstract/gameComponents/settings";

import cardHandler from "./handler/cardHandler";
import registryHandler from "./handler/registryHandler";
import modHandler from "./handler/modHandler";
import Localizer from "./handler/localizationHandler";

import { operatorRegistry } from "../types/data/operatorRegistry";

// import type dry_card from "../dryData/dry_card";
// import position from "../baseClass/position";
type doGetNewNode = boolean
type completed = boolean

type cardID = string
type effectID = string

class queenSystem {
    //properties
    turnActionID : number = -Infinity
    turnCount : number = 0

    //handlers
    zoneHandler : zoneHandler
    cardHander : cardHandler
    registryFile : registryHandler
    modHandler : modHandler
    localizer : Localizer

    //setting
    setting : Setting

    //
    player_stat : player_stat

    
    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from phaseIdx 3
    
    private suspensionReason : suspensionReason | false = false
    takenInput? : dry_position | string | dry_card | number = undefined

    get isSuspended() {return this.suspensionReason !== false}

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
        }).filter(i => i !== undefined) as Action[]
    }
    
    //cardID, effectIDs[]
    get rootID() : number {return this.actionTree.root.id}

    
    get threatLevel() : number {return this.zoneHandler.system.threat}
    set threatLevel(val : number){
        if(isNaN(val) || val < 0) val = 0
        // if(val > this.zoneHandler.system.maxThreat) val = this.zoneHandler.system.maxThreat
        this.zoneHandler.system.threat = val;
    }

    get maxThreatLevel() : number {return this.zoneHandler.system.maxThreat}

    phaseIdx : TurnPhase = TurnPhase.declare
    actionTree : _tree

    constructor(s : Setting){
        this.setting = s

        this.registryFile = new registryHandler(s)
        this.zoneHandler = new zoneHandler(this.registryFile)
        this.cardHander = new cardHandler(s, this.registryFile)
        this.modHandler = new modHandler(s, this.registryFile)
        this.localizer = new Localizer(this.registryFile)

        this.actionTree = new _tree(new turnEnd())

        this.player_stat = {
            heart : 20,
            maxHeart : 20,
            operator : operatorRegistry.o_esper,
            deckInfo : []
        }
    }

    restartTurn(a? : Action){
        this.actionTree.clear()
        if(a) {
            this.actionTree.attach(a);
            this.turnActionID = a.id;
        }
        this.actionTree.attach(new turnStart())
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = TurnPhase.declare
        this.turnActionID = -Infinity
    }

    resolveError(a : error){
        console.log(a.toString())
    }

    private actionSwitch_resolve(a : Action) : undefined | void | Action[]{
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if(typeof a.typeID !== "number") return [new unregisteredAction(a)]
        switch(a.typeID){
            case actionRegistry.a_null : 
                break
            case actionRegistry.error : 
                return this.resolveError(a as error)
            
            case actionRegistry.a_turn_start : 
                break; //turn start

            case actionRegistry.a_turn_end : {
                //turn end
                if((a as turnEnd).doIncreaseTurnCount){
                    return [new increaseTurnCount()]
                }
                return []
            }; 

            case actionRegistry.a_turn_reset : 
                return this.zoneHandler.handleTurnReset(a as turnReset)

            //note : may move the resolution of 6, 7, 8 to zone/system
            case actionRegistry.a_increase_turn_count : {
                this.turnCount++;
                return [];
            }

            case actionRegistry.a_set_threat_level : {
                this.threatLevel = (a as setThreatLevel).newThreatLevel
                if(this.threatLevel > this.maxThreatLevel) {
                    this.threatLevel = this.maxThreatLevel;
                    return [new doThreatLevelBurn()]
                }
                return []
            }

            case actionRegistry.a_do_threat_burn : {
                return this.zoneHandler.system.doThreatBurn(this.player_stat)
            }

            case actionRegistry.a_force_end_game : {
                //end the game
                //clear the tree
                this.actionTree.clear()
                this.suspensionReason = suspensionReason.game_finished
                //am uhh not sure how to implememt this shit yet
                //i think this is fine? for now?
                this.suspend(this.actionTree.root.id)
            }

            case actionRegistry.a_activate_effect_internal : 
            case actionRegistry.a_activate_effect : 
                // 5 and 101 resolves the same, just has different control flow
                return this.zoneHandler.handleEffectActivation(a as activateEffect, this.toDry())

            case actionRegistry.a_pos_change : 
                return this.zoneHandler.handlePosChange(a as posChange)

            case actionRegistry.a_draw : 
                return this.zoneHandler.handlePosChange(a as drawAction)

            case actionRegistry.a_shuffle : 
                return this.zoneHandler.handleShuffle(a as shuffle)

            case actionRegistry.a_execute : {
                //to be implemented                    
                break;
            }

            case actionRegistry.a_reprogram_start : {
                //to be implemented                
                break;
            }

            case actionRegistry.a_reprogram_end : {
                //to be implemented                
                break;
            }

            case actionRegistry.a_add_status_effect : {
                let eff = this.registryFile.effectLoader.getEffect((a as addStatusEffect).statusID, this.setting);
                if(!eff) return [
                    new cannotLoad((a as addStatusEffect).statusID, "statusEffect")
                ];
                return this.zoneHandler.handleAddStatusEffect(a as addStatusEffect, eff)               
            }

            case actionRegistry.a_remove_status_effect : {
                //to be implemented                
                break;
            }

            case actionRegistry.a_activate_effect_subtype : 
                return this.zoneHandler.handleActivateEffectSubtypeFunc(a as activateEffectSubtypeSpecificFunc, this.toDry());               
            
            case actionRegistry.a_modify_action : {
                let target = (a as modifyAnotherAction).targetActionID as number
                let n = this.actionTree.getNode(target)
                if(n.id !== target) return []
                n.data.modifyAttr(
                    (a as modifyAnotherAction).attrToModify, 
                    (a as modifyAnotherAction).newAttrValue
                )
                return []
            }
            case actionRegistry.a_reset_card : {
                return;
            }   

            default : {
                //only should reach here iff effect is unregistered
                //technically this is unreachable code but who knows
                //let unhandledID = a.typeID //if this is never, we checked every cases

                //new note
                //mods may emit new undefined actions
                //go to zone handler to fix this shit

                return this.zoneHandler.respond(a, this.toDry(), true)[0];
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
            this.restartTurn(param);
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
            case TurnPhase.declare: {
                //declare step
                this.fullLog.push({
                    currentPhase: 1,
                    currentAction : n.data
                })
                if(n.id === this.processStack.at(-1)) {
                    this.phaseIdx = TurnPhase.resolve;
                    return this.process(n);
                }
                console.log("declare action: " + n.data.type)
                this.phaseIdx = TurnPhase.input;
                return false;
            }
            case TurnPhase.input: {
                //handle input
                this.fullLog.push({
                    currentPhase : 2,
                    currentAction : n.data
                })
                this.phaseIdx = TurnPhase.chain;
                if(n.data.requireInput) {
                    this.suspensionReason = suspensionReason.taking_input
                    this.suspend(n.id);
                }
                return false; 
            }
            case TurnPhase.chain: {
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
                this.phaseIdx = TurnPhase.recur;
                return false
            }
            case TurnPhase.recur: {
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
            case TurnPhase.resolve: {
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
                if(n.data.canBeTriggeredTo) this.phaseIdx = TurnPhase.trigger;
                else this.phaseIdx = TurnPhase.complete; //6 is skipped
                return false;
            }
            case TurnPhase.trigger: {
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
                this.phaseIdx = TurnPhase.complete;
                return false;  
            }
            case TurnPhase.complete: {
                //complete 
                this.fullLog.push({
                    currentPhase : 7,
                    currentAction : n.data
                })
                n.markComplete();
                this.phaseIdx = TurnPhase.declare;
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
        if(this.suspensionReason){
            this.suspensionReason = false;
            if(this.takenInput === undefined){
                throw new Error("Cannot unsuspend, new input not taken yet")
            }
            n.data.applyUserInput(this.takenInput)
            this.takenInput = undefined
        }
        this.suspendID = -1;
        this.processTurn(n)
    }

    async load(){
        let arr = [
            this.modHandler.load(),
            this.localizer.load(),
            this.modHandler.load(),
            this.registryFile.effectLoader.load(this.setting)
        ]
        await Promise.all(arr);
    }

    toDry(){
        return new dry_system(this)
    }

    startTestGame(cardArr : Card[]){
        //draw 1 card to hand
        this.zoneHandler.deck.forceCardArrContent(cardArr)
        this.restartTurn()
        let a = this.zoneHandler.deck.getAction_draw(true, false, this.zoneHandler.hand.lastPos)
        this.processTurn(a);
    }


}

export default queenSystem
export {logInfo}