import _node from "../types/abstract/generics/node";
import _tree from "../types/abstract/generics/tree";
import zoneHandler from "./handler/zoneHandler";
import actionRegistry, {actionName, actionID} from "../data/actionRegistry";

import { Action, actionConstructorRegistry, actionFormRegistry, actionInputObj } from "./handler/actionGenrator";
import type error from "../types/errors/error";
import { 
    unregisteredAction,
    cannotLoad,
} from "../types/errors";

import { auto_input_option, Setting } from "../types/abstract/gameComponents/settings";

import cardHandler from "./handler/cardHandler";
import registryHandler from "./handler/registryHandler";
import modHandler from "./handler/modHandler";
import Localizer from "./handler/localizationHandler";

import { operatorRegistry } from "../data/operatorRegistry";
import { StatusEffect_base } from "../specificEffects/e_status";
import { playerTypeID, zoneRegistry } from "../data/zoneRegistry";

import Card from "../types/abstract/gameComponents/card";
import Zone from "../types/abstract/gameComponents/zone";
import Effect from "../types/abstract/gameComponents/effect";
import effectSubtype from "../types/abstract/gameComponents/effectSubtype";

import { 
    inputData,
    player_stat,
    suspensionReason,
    TurnPhase,

    dry_card,
    dry_effect,
    dry_position,
    dry_zone,
    dry_effectType,
    dry_effectSubType,

    logInfoHasResponse,
    logInfoNormal,
    logInfoResolve,
    logInfo,
    dry_system,
    inputType,
    inputData_bool,
    inputData_num,
    inputData_str,
    inputData_card,
    inputData_pos,
} from "../data/systemRegistry";

import { id_able, Positionable } from "../types/misc";
import Position from "../types/abstract/generics/position";

import utils from "../utils";

// import type dry_card from "../dryData/dry_card";
// import position from "../baseClass/position";
type doGetNewNode = boolean
type completed = boolean

type cardID = string
type effectID = string

class queenSystem {
    //properties
    turnAction? : Action = undefined
    turnCount : number = 0

    //handlers
    zoneHandler : zoneHandler
    cardHandler : cardHandler
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

    takenInput? : inputData = undefined
    takenInputs_arr : inputData[] = []

    validInputSet : inputData[] | undefined = undefined //undefined is literally, undefined, its unbounded
    validInputType : inputType | undefined = undefined

    get isSuspended() {return this.suspensionReason !== false}

    fullLog : logInfo[] = []

    phaseIdx : TurnPhase = TurnPhase.declare
    actionTree : _tree<Action<"a_turn_end">>

    //cardID, effectIDs[]
    get rootID() : number {return this.actionTree.root.id}
    getRootAction() {return this.actionTree.root.data}
    
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

    

    constructor(s : Setting){
        this.setting = s

        this.registryFile = new registryHandler(s)
        this.zoneHandler = new zoneHandler(this.registryFile, s)
        this.cardHandler = new cardHandler(s, this.registryFile)
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

        this.forEach = this.zoneHandler.forEach
        this.map = this.zoneHandler.map
        this.filter = this.zoneHandler.filter

        const c = this.cardHandler.getCard("c_blank")
        c.pos = new Position(-1)
        c.canAct = false;
        this.NULLCARD = c;
    }

    restartTurn(a? : Action){
        this.actionTree.clear()
        if(a) {
            this.actionTree.attach(a);
            this.turnAction = a;
        }
        this.actionTree.attach(
            actionConstructorRegistry.a_turn_start(actionFormRegistry.system())
        )
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = TurnPhase.declare
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
                return this.zoneHandler.handleEffectActivation(this.toDry(), a as Action<"a_activate_effect">)

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
                let s = (a as Action<"a_add_status_effect">).flatAttr().typeID
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

            case actionRegistry.a_decompile:
            case actionRegistry.a_destroy: 
                return this.zoneHandler.handleSendToTop(this.toDry(), a as Action<"a_destroy"> | Action<"a_decompile">, zoneRegistry.z_grave)
            
            case actionRegistry.a_void:
                return this.zoneHandler.handleSendToTop(this.toDry(), a as Action<"a_void">, zoneRegistry.z_void)

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
                if(n.data.is("a_get_input")) {
                    console.log("input received")

                    let actuallySuspend = true;

                    const obj = n.data.flatAttr().input;

                    const k = obj.getValid.next({} as any).value; //first next has no input, forcing is fine

                    if(!k) {
                        console.log("blank input, skipped, logging fullObject: ", obj)
                        this.phaseIdx = TurnPhase.complete;
                        return false;
                    }


                    this.validInputSet = k[1];
                    this.validInputType = k[0];

                    switch(this.setting.auto_input){
                        case auto_input_option.first : {
                            actuallySuspend = false;
                            this.takenInputs_arr = []
                            let c = 0;
                            while(true){
                                let input : inputData = this.validInputSet ? this.validInputSet[0] : this.getAllInputs(this.validInputType)[0]
                                this.takenInputs_arr.push(input);
                                let j : [inputType, inputData[]] | void = obj.getValid.next(input).value
                                if(!j || !j.length) break;
                                this.validInputSet = j[1];
                                this.validInputType = j[0];
                                c++;
                            }
                            break;
                        }
                        case auto_input_option.last : {
                            actuallySuspend = false;
                            this.takenInputs_arr = []
                            let c = 0;
                            while(true){
                                let input : inputData = this.validInputSet ? this.validInputSet.at(-1)! : this.getAllInputs(this.validInputType).at(-1)!
                                this.takenInputs_arr.push(input);
                                let j : [inputType, inputData[]] | void = obj.getValid.next(input).value
                                if(!j || !j.length) break;
                                this.validInputSet = j[1];
                                this.validInputType = j[0];
                                c++;
                            }
                            break;
                        }
                        case auto_input_option.random : {
                            actuallySuspend = false;
                            this.takenInputs_arr = []
                            let c = 0
                            while(true){
                                let input : inputData = this.validInputSet ? utils.getRandomElement(this.validInputSet)! : utils.getRandomElement(this.getAllInputs(this.validInputType))!
                                this.takenInputs_arr.push(input);
                                let j : [inputType, inputData[]] | void = obj.getValid.next(input).value
                                if(!j || !j.length) break;
                                this.validInputSet = j[1];
                                this.validInputType = j[0];
                                c++;
                            }
                        }
                        case auto_input_option.default : {
                            actuallySuspend = !this.grabInput_default(obj);
                        }
                    }

                    if(actuallySuspend){
                        console.log("suspending waiting for inputs");
                        this.suspensionReason = suspensionReason.taking_input
                        this.suspend(n.id);
                    } else {
                        console.log("inputs getting skipped, trying to apply")

                        this.suspensionReason = false;
                        this.takenInput = undefined;

                        this.validInputSet = undefined;
                        this.validInputType = undefined;

                        const actions = obj.applyInput(this, this.takenInputs_arr);
                        this.actionTree.attach_node(n, ...actions);
                        n.markComplete();

                        this.takenInputs_arr = [];

                        this.phaseIdx = TurnPhase.declare //unwind back to declare;
                        this.suspendID = -1;

                        return true;
                    }
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

                let replacements = actionArr.filter(i => i.id === actionRegistry.a_replace_action).map(i => (i as Action<"a_replace_action">).targets[0].action)
                if(replacements.length){
                    this.actionTree.attach(...replacements);
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

    private grabInput_default(obj : actionInputObj) : boolean{ //finished or not
        this.takenInputs_arr = []
        if(this.validInputSet === undefined) return false;
        while(true){
            if(this.validInputSet.length > 1) return false;
            if(this.validInputSet.length === 0) throw new Error("input set empty, somehow?____")
            this.takenInput = this.validInputSet[0]
            this.takenInputs_arr.push(this.takenInput)
            let j : void | [inputType, inputData[]] = obj.getValid.next(this.takenInput).value
            if(!j || !j.length) return true;
            this.validInputSet = j[1];
            this.validInputType = j[0];
        }
        return false;
    }

    private verifyInput(i1 : inputData, i2 : inputData) : boolean {
        if(i1.type !== i2.type) return false;

        switch(i1.type){
            case inputType.boolean : return typeof (i2 as inputData_bool).data === "boolean";
            case inputType.number : return typeof (i2 as inputData_num).data === "number";
            case inputType.string : return typeof (i2 as inputData_str).data === "string";
            
            case inputType.card : return i1.data instanceof Card && i2.data instanceof Card && i2.data.is(i1.data);
            case inputType.effect : return i1.data instanceof Effect && i2.data instanceof Effect && i2.data.is(i1.data);
            case inputType.effectSubtype : return i1.data instanceof effectSubtype && i2.data instanceof effectSubtype && i2.data.is(i1.data);

            case inputType.player : return typeof i1.data.id === (i2.data as any).id;
            case inputType.position : return i2.data instanceof Position && i1.data.is(i2.data);
            case inputType.zone : return i2.data instanceof Zone && i1.data.is(i2.data);
        }

        return false
    }

    private getAllInputs(t : inputType){
        switch(t){
                case inputType.boolean: return [{
                    type : inputType.boolean,
                    data : utils.rng(1, 0, true) === 1
                } as const]
                case inputType.number: return [{
                    type : inputType.number,
                    data : utils.rng(100, 0, true)
                } as const]
                case inputType.string: return [{
                    type : inputType.string,
                    data : utils.generateID()
                } as const]

                case inputType.zone: return this.map(0, z => {return {
                    type : inputType.zone,
                    data : actionFormRegistry.zone(this, z)
                } as const })

                case inputType.card : return this.map(1, c => {return {
                    type : inputType.card,
                    data : actionFormRegistry.card(this, c)
                } as const })

                case inputType.player : return this.setting.players.map((_, pid) => {return {
                    type : inputType.player,
                    data : actionFormRegistry.player(this, pid)
                } as const })

                case inputType.position : {
                    const arr1 = this.map(1, (c, zid, cid) => {return {
                        type : inputType.position,
                        data : actionFormRegistry.position(this, c.pos)
                    } as inputData_pos})

                    const arr2 = this.map(0, 
                        z => (z.cardArr.map((c, i) => [c, i] as [Card | undefined, number])).filter(c => c[0] === undefined).map(c => {return {
                            type : inputType.position,
                            data : actionFormRegistry.position(this, new Position(z.id, z.name, ...utils.indexToPosition(c[1], z.shape)))
                        } as inputData_pos})
                    ).reduce((c, ele) => c.concat(ele), [])

                    return arr1.concat(...arr2)
                }

                case inputType.effect : return this.map(2, (e, zid, cid) => {
                    const zone = this.getZoneWithID(zid)!;
                    const c = zone.cardArr[cid]!;

                    return {
                        type : inputType.effect,
                        data : actionFormRegistry.effect(this, c, e)
                    } as const
                })

                case inputType.effectSubtype : return this.map(3, (st, zid, cid, eid) => {
                    const zone = this.getZoneWithID(zid)!;
                    const c = zone.cardArr[cid]!;
                    const e = c.totalEffects[eid]!;

                    return {
                        type : inputType.effectSubtype,
                        data : actionFormRegistry.subtype(this, c, e, st)
                    } as const
                })
            }
            throw new Error(`get all input failed, type = ${t}`)
    }

    continue(){
        let n = this.actionTree.getNode(this.suspendID)
        if(this.suspensionReason === suspensionReason.taking_input && n.data.is("a_get_input")){
            
            if(this.takenInput === undefined){
                throw new Error("Cannot unsuspend, not enough input taken, next input expected: ")
            }

            //check validity of input

            //naive check
            if(this.validInputSet !== undefined){ //undefined is accept all    
                const filter_set = this.validInputSet.filter(i => i.type === this.takenInput!.type)
                if(!filter_set.length) {
                    throw new Error("input not in valid set, wrong type")
                }

                const flag = filter_set.some(i => {
                    this.verifyInput(i, this.takenInput!)
                })

                if(!flag) {
                    throw new Error("input not in valid set, correct type but wrong id")
                }
            }

            const obj = n.data.flatAttr().input
            this.validInputSet = obj.getValid.next(this.takenInput).value as any;

            if(!this.validInputSet){
                //complete
                this.suspensionReason = false;
                this.takenInput = undefined;

                this.validInputSet = undefined;
                this.validInputType = undefined;

                const actions = obj.applyInput(this, this.takenInputs_arr);
                this.actionTree.attach_node(n, ...actions);
                n.markComplete();

                this.takenInputs_arr = [];

                this.phaseIdx = TurnPhase.declare //unwind back to declare;
                this.suspendID = -1;

                const newN = n.childArr[0];
                return this.processTurn(newN);

            } else {
                //continue suspending
                this.takenInputs_arr.push(this.takenInput);
                this.takenInput = undefined;

                if(this.setting.auto_input === auto_input_option.default){
                    const isFinishedTakingInput = this.grabInput_default(obj)
                    if(isFinishedTakingInput){
                        this.suspensionReason = false;
                        this.takenInput = undefined;

                        this.validInputSet = undefined;
                        this.validInputType = undefined;

                        const actions = obj.applyInput(this, this.takenInputs_arr);
                        this.actionTree.attach_node(n, ...actions);
                        n.markComplete();

                        this.takenInputs_arr = [];

                        this.phaseIdx = TurnPhase.declare //unwind back to declare;
                        this.suspendID = -1;

                        const newN = n.childArr[0];
                        return this.processTurn(newN);
                    }
                }
                return;
            }
            
        } else if(this.suspensionReason !== false) throw new Error(`Cannot unsuspend when reason is not resolved`)
        this.suspendID = -1;
        return this.processTurn(n)
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

    toDry() : dry_system{
        return this
    }


    //Parsing log API

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


    //more API ported from dry_system
    getCardWithID(cid : string) : dry_card | undefined{
        return this.zoneHandler.getCardWithID(cid);
    }

    getCardWithDataID(cid : string) : dry_card[] {
        return this.zoneHandler.filter(1, c => c.id === cid)
    }
    
    getZoneWithID(zid : number) : dry_zone | undefined {
        return this.zoneHandler.getZoneWithID(zid);
    }

    getZoneOf(obj : Positionable) : dry_zone | undefined {
        return this.zoneHandler.getZoneWithID(obj.pos.zoneID)
    }

    get zoneArr() : ReadonlyArray<dry_zone> {return this.zoneHandler.zoneArr}

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

        this.zoneArr.forEach(val => {
            if(val.playerIndex === pid) val.types.forEach(i => res[i] ? res[i].push(val) : res[i] = [val])
        })

        return res;
    }

    getPIDof(c : Positionable){
        const z = this.getZoneOf(c);
        if(!z) return NaN;
        return z.playerIndex;
    }

    getWouldBeAttackTarget(a : Action<"a_attack">) : dry_card | undefined {
        if((a.cause as any).card === undefined) return undefined
        let c = (a.cause as any).card as dry_card

        let oppositeZones : dry_zone | undefined = this.zoneArr[c.pos.zoneID]
        if(!oppositeZones) return undefined
        
        let targetZone = oppositeZones.getOppositeZone(this.zoneArr)
        if(!targetZone.length) return undefined

        let targets = targetZone[0].getOppositeCards(c)
        if(!targets) return undefined

        return targets[0];
    }

    is(c : Positionable, type : zoneRegistry) : boolean {
        const z = this.getZoneWithID(c.pos.zoneID);
        if(!z) return false;
        return z.is(type);
    }

    get isInTriggerPhase() {return this.phaseIdx === TurnPhase.trigger}
    get isInChainPhase() {return this.phaseIdx === TurnPhase.chain}
    
    //APIs ported over from zoneHandlers
    forEach : zoneHandler["forEach"]
    map : zoneHandler["map"]
    filter : zoneHandler["filter"]
    
    //const
    readonly NULLPOS: dry_position = new Position(-1).toDry()
    readonly NULLCARD: dry_card
}

export default queenSystem
export {logInfo}