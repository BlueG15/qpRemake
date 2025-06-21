import _node from "../types/abstract/generics/node";
import _tree from "../types/abstract/generics/tree";
import zoneHandler from "./handler/zoneHandler";
import dry_system from "../data/dry/dry_system";
import actionRegistry, {actionName, actionID} from "../data/actionRegistry";

import { Action, actionConstructorRegistry, actionFormRegistry } from "./handler/actionGenrator";

import type Card from "../types/abstract/gameComponents/card";
import type error from "../types/errors/error";
import { 
    cardNotExist,
    cardNotInApplicableZone,
    effectCondNotMet,
    invalidOrderMap,
    invalidPosition,
    unknownError,
    zoneAttrConflict,
    zoneFull,
    effectNotExist,
    wrongEffectIdx,
    subTypeOverrideConflict,
    unregisteredAction,
    cannotLoad,
    incorrectActiontype,
    zoneNotExist
    
} from "../types/errors";

import dry_card from "../data/dry/dry_card";
import dry_position from "../data/dry/dry_position";

import { 
    inputData,
    logInfo,
    player_stat,
    suspensionReason,
    TurnPhase
} from "../data/systemRegistry";

import { Setting } from "../types/abstract/gameComponents/settings";

import cardHandler from "./handler/cardHandler";
import registryHandler from "./handler/registryHandler";
import modHandler from "./handler/modHandler";
import Localizer from "./handler/localizationHandler";

import { operatorRegistry } from "../data/operatorRegistry";
import StatusEffect_base from "../specificEffects/_statusEffect_base";
import Position from "../types/abstract/generics/position";

import res from "../types/abstract/generics/universalResponse";
import { playerTypeID } from "../data/zoneRegistry";

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
    player_stat : player_stat[]
    
    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from phaseIdx 3
    
    private suspensionReason : suspensionReason | false = false
    takenInput? : inputData[] = undefined

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
    
    get threatLevel() : number[] {return this.zoneHandler.system.map(i => i.threat)}
    set threatLevel(val : number | number[]){
        if(typeof val === "number"){
            if(isNaN(val) || val < 0) val = 0;
            // if(val > this.zoneHandler.system.maxThreat) val = this.zoneHandler.system.maxThreat
            this.zoneHandler.system.forEach(i => i.threat = val as number);
        } else {
            const s = this.zoneHandler.system
            val.forEach((t, index) => {
                s[index].threat = t
            })
        }
    }

    get maxThreatLevel() : number[] {return this.zoneHandler.system.map(i => i.maxThreat)}

    phaseIdx : TurnPhase = TurnPhase.declare
    actionTree : _tree<Action<"a_turn_end">>

    constructor(s : Setting){
        this.setting = s

        this.registryFile = new registryHandler(s)
        this.zoneHandler = new zoneHandler(this.registryFile, s)
        this.cardHander = new cardHandler(s, this.registryFile)
        this.modHandler = new modHandler(s, this.registryFile)
        this.localizer = new Localizer(this.registryFile)

        this.actionTree = new _tree(
            actionConstructorRegistry.a_turn_end(actionFormRegistry.system(), {
                doIncreaseTurnCount : true
            })
        )

        this.player_stat = s.players.map((i, index) => 
            i === playerTypeID.player ?
            {
                playerIndex : index,
                heart : 20,
                maxHeart : 20,
                operator : operatorRegistry.o_esper,
                deckInfo : []
            } : {
                playerIndex : index,
                heart : Infinity,
                maxHeart : Infinity,
                operator : operatorRegistry.o_queen,
                deckInfo : []
            }
        )
    }

    restartTurn(a? : Action){
        this.actionTree.clear()
        if(a) {
            this.actionTree.attach(a);
            this.turnActionID = a.id;
        }
        this.actionTree.attach(
            actionConstructorRegistry.a_turn_start(actionFormRegistry.system())
        )
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = TurnPhase.declare
        this.turnActionID = -Infinity
    }

    resolveError(a : error){
        console.log(a.toString())
    }

    private actionSwitch_resolve(a : Action) : undefined | Action[]{
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if(typeof a.typeID !== "number") return [new unregisteredAction(a)]
        switch(a.typeID){
            case actionRegistry.a_null : 
                return
            case actionRegistry.error : 
                this.resolveError(a as error);
                break;
            
            case actionRegistry.a_turn_start : 
                return; //turn start

            case actionRegistry.a_turn_end : {
                //turn end
                
                //merge statusEffects
                this.zoneHandler.forEach(1, (c => {
                    c.mergeStatusEffect();
                }))

                if((a as Action<"a_turn_end">).flatAttr().doIncreaseTurnCount){
                    return [
                        actionConstructorRegistry.a_increase_turn_count(actionFormRegistry.system())
                    ]
                }
                return
            }; 

            case actionRegistry.a_turn_reset : 
                return this.zoneHandler.handleTurnReset(this.toDry(), a as Action<"a_turn_reset">)

            //note : may move the resolution of 6, 7, 8 to zone/system
            case actionRegistry.a_increase_turn_count : {
                this.turnCount++;
                return;
            }

            case actionRegistry.a_set_threat_level : {
                this.threatLevel = (a as Action<"a_set_threat_level">).flatAttr().newThreatLevel
                if(this.threatLevel > this.maxThreatLevel) {
                    this.threatLevel = this.maxThreatLevel;
                    return [
                        actionConstructorRegistry.a_do_threat_burn(actionFormRegistry.system())
                    ]
                }
                return
            }

            case actionRegistry.a_do_threat_burn : {
                return this.zoneHandler.system.map((i, index) => i.doThreatBurn(this.toDry(), this.player_stat[index])).reduce((res, ele) => res.concat(ele))
            }

            case actionRegistry.a_force_end_game : {
                //end the game
                //clear the tree
                this.actionTree.clear()
                this.suspensionReason = suspensionReason.game_finished
                //am uhh not sure how to implememt this shit yet
                //i think this is fine? for now?
                this.suspend(this.actionTree.root.id)
                return;
            } 

            case actionRegistry.a_activate_effect_internal : 
            case actionRegistry.a_activate_effect : 
                // 5 and 101 resolves the same, just has different control flow
                return this.zoneHandler.handleEffectActivation(this.toDry(), a as Action<"a_activate_effect">, this.toDry())

            case actionRegistry.a_pos_change_force:
            case actionRegistry.a_pos_change : 
                return this.zoneHandler.handlePosChange(this.toDry(), a as Action<"a_pos_change">)

            case actionRegistry.a_draw : 
                return this.zoneHandler.handleDraw(this.toDry(), a as Action<"a_draw">)

            case actionRegistry.a_shuffle : 
                return this.zoneHandler.handleShuffle(this.toDry(), a as Action<"a_shuffle">)

            case actionRegistry.a_execute : 
                return this.zoneHandler.handleExecute(this.toDry(), a as Action<"a_execute">)

            case actionRegistry.a_reprogram_start : {
                //to be implemented                

                //note to future me
                //make some kinda input_interface object

                //plug it in here
                return;
            }

            case actionRegistry.a_reprogram_end : {
                //to be implemented                
                return;
            }

            case actionRegistry.a_add_status_effect :  {
                let s = (a as Action<"a_add_status_effect">).flatAttr().statusID
                let eff = this.registryFile.effectLoader.getEffect(s, this.setting);
                if(!eff || !(eff instanceof StatusEffect_base)) return [
                    new cannotLoad(s, "statusEffect")
                ];
                return this.zoneHandler.handleAddStatusEffect(this.toDry(), (a as Action<"a_add_status_effect">), eff)               
            }

            case actionRegistry.a_remove_status_effect : 
                return this.zoneHandler.handleRemoveStatusEffect(this.toDry(), a as Action<"a_remove_status_effect">)
            

            case actionRegistry.a_activate_effect_subtype : 
                return this.zoneHandler.handleActivateEffectSubtypeFunc(this.toDry(), a as Action<"a_activate_effect_subtype">);               
            
            case actionRegistry.a_modify_action : {
                let target = (a as Action<"a_modify_action">).targets[0].action
                let modifyObj = (a as Action<"a_modify_action">).flatAttr()

                Object.entries(modifyObj).forEach(([key, val]) => {
                    if(key !== "type") target.modifyAttr(key, val);
                })
                return;
            }
            case actionRegistry.a_reset_card : 
                return this.zoneHandler.handleCardReset(this.toDry(), a as Action<"a_reset_card">);
            
            case actionRegistry.a_replace_action:
            case actionRegistry.a_negate_action : return; //tecnically not possible
                
            case actionRegistry.a_clear_all_status_effect : 
                return this.zoneHandler.handleClearAllStatusEffect(this.toDry(), a as Action<"a_clear_all_status_effect">)
            
            case actionRegistry.a_reset_effect: 
                return this.zoneHandler.handleEffectReset(this.toDry(), a as Action<"a_reset_effect">)

            case actionRegistry.a_enable_card: 
                return this.zoneHandler.handleCardStatus(this.toDry(), a as Action<"a_enable_card">)

            case actionRegistry.a_disable_card:
                return this.zoneHandler.handleCardStatus(this.toDry(), a as Action<"a_disable_card">)

            case actionRegistry.a_attack :
                return this.zoneHandler.handleAttack(this.toDry(), a as Action<"a_attack">)

            case actionRegistry.a_deal_damage_internal:
            case actionRegistry.a_deal_damage_card :
                return this.zoneHandler.handleDealDamage_1(this.toDry(), a as Action<"a_deal_damage_card">)

            case actionRegistry.a_deal_damage_position:
                return this.zoneHandler.handleDealDamage_2(this.toDry(), a as Action<"a_deal_damage_position">)

            case actionRegistry.a_deal_heart_damage: 
                let pid = (a as Action<"a_deal_heart_damage">).targets[0].id
                let dmg = (a as Action<"a_deal_heart_damage">).flatAttr().dmg

                if(this.player_stat[pid]) this.player_stat[pid].heart -= dmg;
                return;

            case actionRegistry.a_destroy: 
                return this.zoneHandler.handleDestroy(this.toDry(), a as Action<"a_destroy">)

            case actionRegistry.a_zone_interact:
                let zid = (a as Action<"a_zone_interact">).targets[0].zone.id
                return this.zoneHandler.zoneArr[zid].interact(this.toDry(), a.cause);

            default : {
                //only should reach here iff effect is unregistered
                //technically this is unreachable code but who knows
                //let unhandledID = a.typeID //if this is never, we checked every cases

                //new note
                //mods may emit new undefined actions
                //go to zone handler to fix this shit

                return this.registryFile.customActionLoader.handle(a.id, a, this);
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
                let [actionArr, logInfo] = this.zoneHandler.respond(this.toDry(), n.data, !n.data.canBeChainedTo)
                this.fullLog.push({
                    currentPhase : 3,
                    currentAction : n.data,
                    responses : Object.fromEntries(logInfo)
                })

                //special handled
                if(actionArr.some(
                    i => i.id === actionRegistry.a_negate_action
                )){
                    this.phaseIdx = TurnPhase.complete;
                    return false;
                }

                let replacement = actionArr.find(i => i.id === actionRegistry.a_replace_action)
                if(replacement){
                    this.actionTree.attach(replacement);
                    this.phaseIdx = TurnPhase.complete;
                    return false;
                }

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
                let [actionArr, logInfo] = this.zoneHandler.respond(this.toDry(), n.data)
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

}

export default queenSystem
export {logInfo}