import _node from "../types/abstract/generics/node";
import _tree from "../types/abstract/generics/tree";
import zoneHandler from "./handler/zoneHandler";
import actionRegistry, {actionName, actionID} from "../data/actionRegistry";

import { Action, actionConstructionObj_variable, actionConstructorRegistry, actionFormRegistry, Action_class} from "./handler/actionGenrator";
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
    inputDataSpecific,
    inputData_zone,
    inputData_effect,
    inputData_subtype,
    inputData_standard,
} from "../data/systemRegistry";

import { id_able, notFull, Player_specific, Positionable, StrictGenerator } from "../types/misc";
import Position from "../types/abstract/generics/position";

import utils from "../utils";
import { inputFormRegistry, inputRequester } from "./handler/actionInputGenerator";

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

    private curr_input_obj : ReturnType<Action<"a_get_input">["flatAttr"]> | undefined = undefined
    input_cache : Map<string, inputRequester<any, inputData[], inputData[]>> = new Map() //key is cid_partitionid

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
                return this.zoneHandler.handleTurnReset(this, a as Action<"a_turn_reset">)

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
                return this.zoneHandler.system.map((i, index) => i.doThreatBurn(this, this.player_stat[index])).reduce((res, ele) => res.concat(ele))
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
                return this.zoneHandler.handleEffectActivation(this, a as Action<"a_activate_effect">)

            case actionRegistry.a_pos_change_force:
            case actionRegistry.a_pos_change : 
                return this.zoneHandler.handlePosChange(this, a as Action<"a_pos_change">)

            case actionRegistry.a_draw : 
                return this.zoneHandler.handleDraw(this, a as Action<"a_draw">)

            case actionRegistry.a_shuffle : 
                return this.zoneHandler.handleShuffle(this, a as Action<"a_shuffle">)

            case actionRegistry.a_execute : 
                return this.zoneHandler.handleExecute(this, a as Action<"a_execute">)

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
                return this.zoneHandler.handleAddStatusEffect(this, (a as Action<"a_add_status_effect">), eff)               
            }

            case actionRegistry.a_remove_status_effect : 
                return this.zoneHandler.handleRemoveStatusEffect(this, a as Action<"a_remove_status_effect">)
            

            case actionRegistry.a_activate_effect_subtype : 
                return this.zoneHandler.handleActivateEffectSubtypeFunc(this, a as Action<"a_activate_effect_subtype">);               
            
            case actionRegistry.a_modify_action : {
                let target = (a as Action<"a_modify_action">).targets[0].action
                let modifyObj = (a as Action<"a_modify_action">).flatAttr()

                Object.entries(modifyObj).forEach(([key, val]) => {
                    if(key !== "type") target.modifyAttr(key, val);
                })
                return;
            }
            case actionRegistry.a_reset_card : 
                return this.zoneHandler.handleCardReset(this, a as Action<"a_reset_card">);
            
            case actionRegistry.a_replace_action:
            case actionRegistry.a_negate_action : return; //tecnically not possible
                
            case actionRegistry.a_clear_all_status_effect : 
                return this.zoneHandler.handleClearAllStatusEffect(this, a as Action<"a_clear_all_status_effect">)
            
            case actionRegistry.a_reset_effect: 
                return this.zoneHandler.handleEffectReset(this, a as Action<"a_reset_effect">)

            case actionRegistry.a_enable_card: 
                return this.zoneHandler.handleCardStatus(this, a as Action<"a_enable_card">)

            case actionRegistry.a_disable_card:
                return this.zoneHandler.handleCardStatus(this, a as Action<"a_disable_card">)

            case actionRegistry.a_attack :
                return this.zoneHandler.handleAttack(this, a as Action<"a_attack">)

            case actionRegistry.a_deal_damage_internal:
            case actionRegistry.a_deal_damage_card :
                return this.zoneHandler.handleDealDamage_1(this, a as Action<"a_deal_damage_card">)

            case actionRegistry.a_deal_damage_position:
                return this.zoneHandler.handleDealDamage_2(this, a as Action<"a_deal_damage_position">)

            case actionRegistry.a_deal_heart_damage: 
                let pid = (a as Action<"a_deal_heart_damage">).targets[0].id
                let dmg = (a as Action<"a_deal_heart_damage">).flatAttr().dmg

                if(this.player_stat[pid]) this.player_stat[pid].heart -= dmg;
                return;

            case actionRegistry.a_decompile:
            case actionRegistry.a_destroy: 
                return this.zoneHandler.handleSendToTop(this, a as Action<"a_destroy"> | Action<"a_decompile">, zoneRegistry.z_grave)
            
            case actionRegistry.a_void:
                return this.zoneHandler.handleSendToTop(this, a as Action<"a_void">, zoneRegistry.z_void)

            case actionRegistry.a_zone_interact:
                return this.zoneHandler.handleZoneInteract((a as Action<"a_zone_interact">).targets[0].zone as Zone, this, a)

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
                if(n.data.is("a_get_input")){
                    return this.inputHandler(n.data, n)
                }
                return false; 
            }
            case TurnPhase.chain: {
                //chain step
                let [actionArr, logInfo] = this.zoneHandler.respond(this, n.data, !n.data.canBeChainedTo)
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

                let gotoComplete = false
                let replacements = actionArr.filter(i => i.id === actionRegistry.a_replace_action).map(i => (i as Action<"a_replace_action">).targets[0].action)
                if(replacements.length){
                    gotoComplete = true;
                    actionArr = replacements
                }

                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attach_node(n, i);
                    else this.actionTree.attach_node(this.actionTree.root, i);
                })
                this.phaseIdx = (gotoComplete) ? TurnPhase.complete : TurnPhase.recur;
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
                let [actionArr, logInfo] = this.zoneHandler.respond(this, n.data)
                this.fullLog.push({
                    currentPhase : 6,
                    currentAction : n.data,
                    responses : Object.fromEntries(logInfo)
                })
                //if(actionArr.length) console.log(actionArr.map(a => a.type + "_" + (a as Action<"a_activate_effect_internal">).targets[0].eff.id))
                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attach_node(n, i);
                    else this.actionTree.attach_node(this.actionTree.root, i);
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

    private verifyInput(i1 : inputData, i2 : inputData) : boolean {
        if(i1.type !== i2.type) return false;

        switch(i1.type){
            case inputType.boolean : return (i2 as inputData_bool).data === i1.data;
            case inputType.number : return (i2 as inputData_num).data === i1.data;
            case inputType.string : return (i2 as inputData_str).data === i1.data;
            
            case inputType.card : return i1.data instanceof Card && i2.data instanceof Card && i2.data.is(i1.data);
            case inputType.effect : return i1.data instanceof Effect && i2.data instanceof Effect && i2.data.is(i1.data);
            case inputType.effectSubtype : return i1.data instanceof effectSubtype && i2.data instanceof effectSubtype && i2.data.is(i1.data);

            case inputType.player : return typeof i1.data.id === (i2.data as any).id;
            case inputType.position : return i2.data instanceof Position && i1.data.is(i2.data);
            case inputType.zone : return i2.data instanceof Zone && i1.data.is(i2.data);
        }

        return false
    }

    private inputHandler(a : Action<"a_get_input">, n : _node) : boolean {
        console.log("processing input")

        this.curr_input_obj = a.flatAttr();
        const requester = this.curr_input_obj.requester;
        const applicator = this.curr_input_obj.applicator;

        if(!requester.hasInput()) {
            console.log("blank input, skipped, logging fullObject: ", this.curr_input_obj)
            this.phaseIdx = TurnPhase.complete;
            return false;
        }

        let final : Action[] | undefined = undefined //assign to this to NOT suspend
        
        if(requester.isFinalized()){
            final = applicator.apply(requester)
        } else {
            let [i_type, i_set] = requester.next();
            //returns if break of not
            function proceed(t : queenSystem, input : inputData) : Action[] | undefined {
                requester.apply(t, input)
                if(requester.isFinalized()) {
                    return applicator.apply(requester);
                }
                //fail safe check
                if(!requester.hasInput()) {
                    t.curr_input_obj = undefined;
                    return []
                };

                [i_type, i_set] = requester.next();
            }
            
            switch(this.setting.auto_input){
                case auto_input_option.first : {
                    while(true){
                        let input : inputData = i_set ? i_set[0] : this.getAllInputs(i_type, true)[0]
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                    break;
                }
                case auto_input_option.last : {
                    while(true){
                        let input : inputData = i_set ? i_set.at(-1)! : this.getAllInputs(i_type, true).at(-1)!
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                    break;
                }
                case auto_input_option.random : {
                    while(true){
                        let input : inputData = i_set ? utils.getRandomElement(i_set)! : utils.getRandomElement(this.getAllInputs(i_type, true))!
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                }
                case auto_input_option.default : {
                    while(true){
                        if(!i_set || i_set.length !== 1) break;
                        let input = i_set[0]
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                }
            }
        }

        if(final === undefined){
            console.log("suspending waiting for inputs");
            this.suspensionReason = suspensionReason.taking_input
            this.suspend(a.id);
            return false;
        } else {
            console.log("inputs getting skipped, trying to apply")

            this.suspensionReason = false;
            this.curr_input_obj = undefined;

            this.actionTree.attach_node(n, ...final);
            n.markComplete();

            this.phaseIdx = TurnPhase.declare //unwind back to declare;
            this.suspendID = -1;

            return true;
        }
    }

    getAllInputs<T extends inputType>(t : T) : inputDataSpecific<T>[] | undefined;
    getAllInputs<T extends inputType>(t : T, force : true) : inputDataSpecific<T>[];
    getAllInputs(t : inputType, force? : boolean | number, count? : number) : inputData[] | undefined {
        force = Number(force);
        switch(t){
                case inputType.boolean: return force ? [{
                    type : inputType.boolean,
                    data : utils.rng(1, 0, true) === 1
                }] as inputData_standard[] : undefined
                case inputType.number: return force ? [{
                    type : inputType.number,
                    data : utils.rng(100, 0, true)
                }] as inputData_standard[] : undefined
                case inputType.string: return force ? [{
                    type : inputType.string,
                    data : utils.generateID()
                } as const] as inputData_standard[] : undefined

                case inputType.zone: return this.map(0, z => inputFormRegistry.zone(this, z))

                case inputType.card : return this.map(1, c => inputFormRegistry.card(this, c))

                case inputType.player : return this.setting.players.map((_, pid) => inputFormRegistry.player(this, pid))

                case inputType.position : {
                    let res : dry_position[] = []
                    this.forEach(0, z => res.push(...z.getAllPos()))
                    return res.map(pos => inputFormRegistry.pos(this, pos))
                }

                case inputType.effect : return this.map(2, (e, zid, cid) => {
                    const zone = this.zoneArr[zid];
                    const c = zone.cardArr[cid]!;

                    return inputFormRegistry.effect(this, c, e)
                })

                case inputType.effectSubtype : return this.map(3, (st, zid, cid, eid) => {
                    const zone = this.zoneArr[zid];
                    const c = zone.cardArr[cid]!;
                    const e = c.totalEffects[eid]!;

                    return inputFormRegistry.subtype(this, c, e, st)
                })
            }
            throw new Error(`get all input failed, type = ${t}`)
    }

    generateSignature(a : inputData | undefined) : string {
        if(a == undefined) return utils.generateID()
        switch(a.type){

            case inputType.number:
            case inputType.string:
            case inputType.boolean: return String(a.data)

            case inputType.zone: return String(a.data.zone.id)
            case inputType.card: return a.data.card.id
            case inputType.effect: return a.data.eff.id
            case inputType.effectSubtype: return a.data.eff.id + a.data.subtype.dataID
            case inputType.player: return String(a.data.id)
            case inputType.position: return a.data.pos.toString()
            
        }
    }    

    continue(input? : inputData){
        let n = this.actionTree.getNode(this.suspendID)
        if(
            this.suspensionReason === suspensionReason.taking_input && n.data.is("a_get_input")
        ){
            if(this.curr_input_obj === undefined || input === undefined){
                throw new Error("Cannot unsuspend, not enough input taken")
            }

            const requester = this.curr_input_obj.requester;
            const applicator = this.curr_input_obj.applicator;
            
            if(!requester.hasInput()){
                throw new Error("Cannot unsuspend, invalid input object")
            }

            let [i_type, i_set] = requester.next();

            //check validity of input

            //naive? check
            if(i_set !== undefined){ //undefined is accept all    
                const filter_set = i_set.filter(i => i.type === input.type)
                if(!filter_set.length) {
                    throw new Error("input not in valid set, wrong type")
                }

                const flag = filter_set.some(i => {
                    this.verifyInput(i, input)
                })

                if(!flag) {
                    throw new Error("input not in valid set, correct type but wrong id")
                }
            } else if (input.type !== i_type) {
                throw new Error(`input type is incorrect, received : ${input.type}, wanted : ${i_type}`)
            }

            let res = this.inputHandler(n.data, n);

            //complete
            if(res) return this.processTurn();
            else {
                console.log("Input taken, but unfinished, please continue")
                return false;
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

    get zoneArr(){return this.zoneHandler.zoneArr}

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

    requestInput_zone_default(c : Positionable | Player_specific, zType : zoneRegistry, fz? : (s : dry_system, z : dry_zone) => boolean){
        return this.posCheck(c) ? new inputRequester(inputType.zone, this.getAllInputs(inputType.zone, true).filter(i => i.is(zType) && i.of(this.getZoneOf(c)) && (!fz || fz(this, i.data.zone)))) :
        new inputRequester(inputType.zone, this.getAllInputs(inputType.zone, true).filter(i => i.is(zType) && i.of(c) && (!fz || fz(this, i.data.zone))))
    }

    requestInput_card_default(c : Positionable, zType : zoneRegistry, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean){
        return this.requestInput_zone_default(c, zType, fz).extend(this, (s : dry_system, prev : [inputData_zone]) => {
            const z = prev[0].data.zone
            return z.cardArr_filtered.filter(c => (!fc || fc(s, c, z))).map(c => inputFormRegistry.card(s, c))
        })
    }

    requestInput_effect_default(c : Positionable, zType : zoneRegistry, getRealEffects : boolean, getStatusEffects : boolean, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean, feff? : (s : dry_system, eff : dry_effect, c : dry_card, z : dry_zone) => boolean){
        return this.requestInput_card_default(c, zType, fz, fc).extend(this, (s : dry_system, prev : [inputData_zone, inputData_card]) => {
            const z = prev[0].data.zone
            const c = prev[1].data.card
            let eArr = (getRealEffects ? c.effects : []).map(i => i)
            if(getStatusEffects) eArr.push(...c.statusEffects);
            return eArr.filter(e => (!feff || feff(s, e, c, z))).map(e => inputFormRegistry.effect(s, c, e))
        })
    }

    requestInput_effectSubtype_default(c : Positionable, zType : zoneRegistry, getRealEffects : boolean, getStatusEffects : boolean, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean, feff? : (s : dry_system, eff : dry_effect, c : dry_card, z : dry_zone) => boolean, fst? : (s : dry_system, st : dry_effectSubType, eff : dry_effect, c : dry_card, z : dry_zone) => boolean){
        return this.requestInput_effect_default(c, zType, getRealEffects, getStatusEffects, fz, fc, feff).extend(this, (s : dry_system, prev : [inputData_zone, inputData_card, inputData_effect]) => {
            const z = prev[0].data.zone
            const c = prev[2].data.card
            const e = prev[2].data.eff
            return e.subTypes.filter(st => (!fst || fst(s, st, e, c, z))).map(st => inputFormRegistry.subtype(s, c, e, st))
        })
    }

    requestInput_pos_default(c : Positionable, zType : zoneRegistry, getFreeOnly : boolean, fz? : (s : dry_system, z : dry_zone) => boolean, fpos? : (s : dry_system, p : dry_position, z : dry_zone) => boolean){
        return this.requestInput_zone_default(c, zType, fz).extend(this, (s : dry_system, prev : [inputData_zone]) => {
            const z = prev[0].data.zone
            const pArr = getFreeOnly ? (
                z.getEmptyPosArr ? z.getEmptyPosArr() : [z.lastPos]
            ) : z.getAllPos()
            return pArr.filter(pos => (!fpos || fpos(s, pos, z))).map(pos => inputFormRegistry.pos(s, pos))
        })
    }

    // hasValidInput(depth : 0, fz? : (s : dry_system, z : dry_zone) => boolean) : boolean;
    // hasValidInput(depth : 1, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean) : boolean;
    // hasValidInput(depth : 2, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean, fe? : (s : dry_system, e : dry_effect, c : dry_card, z : dry_zone) => boolean) : boolean;
    // hasValidInput(depth : 3, fz? : (s : dry_system, z : dry_zone) => boolean, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean, fe? : (s : dry_system, e : dry_effect, c : dry_card, z : dry_zone) => boolean, fst? : (s : dry_system, st : dry_effectSubType, e : dry_effect, c : dry_card, z : dry_zone) => boolean) : boolean;
    // hasValidInput(depth : 4, fz? : (s : dry_system, z : dry_zone) => boolean, fpos? : (s : dry_system, p : dry_position, z : dry_zone) => boolean) : boolean;
    // hasValidInput(
    //     depth : 0 | 1 | 2 | 3 | 4, 
    //     fz? : (s : dry_system, z : dry_zone) => boolean, 
    //     fc? : ((s : dry_system, c : dry_card, z : dry_zone) => boolean) | ((s : dry_system, p : dry_position, z : dry_zone) => boolean), 
    //     fe? : (s : dry_system, e : dry_effect, c : dry_card, z : dry_zone) => boolean, 
    //     fst? : (s : dry_system, st : dry_effectSubType, e : dry_effect, c : dry_card, z : dry_zone) => boolean
    // ) : boolean {
    //     const k = this.requestInput(depth as 3, fz, fc as any, fe, fst);
    //     return k[0][1] === undefined || k[0][1].length !== 0
    // }

    // hasValidInput_zone_default(c : Positionable | Player_specific, zType : zoneRegistry, f? : (s : dry_system, z : dry_zone) => boolean){
    //     return this.posCheck(c) ? this.hasValidInput(0, (s : dry_system, z : dry_zone) => z.is(zType) && z.of(s.getZoneOf(c)) && (f === undefined || f(s, z))) 
    //     : this.hasValidInput(0, (s : dry_system, z : dry_zone) => z.is(zType) && z.playerIndex === c.playerIndex && (f === undefined || f(s, z)))
    // }

    // hasValidInput_card_default(c : Positionable, zType : zoneRegistry, fc? : (s : dry_system, c : dry_card, z : dry_zone) => boolean){
    //     return this.hasValidInput(1, (s : dry_system, z : dry_zone) => z.is(zType) && z.of(s.getZoneOf(c)), fc)
    // }

    // hasValidInput_pos_default(c : Positionable, zType : zoneRegistry, getFreeOnly : boolean, fpos? : (s : dry_system, p : dry_position, z : dry_zone) => boolean){
    //     return this.hasValidInput(
    //         4, 
    //         (s : dry_system, z : dry_zone) => z.is(zType) && z.of(s.getZoneOf(c)), 
    //         (!getFreeOnly && fpos === undefined) ? undefined : (s : dry_system, p : dry_position, z : dry_zone) => {
    //             const p1 = (!getFreeOnly || !z.isOccupied(p))
    //             const p2 = fpos ? fpos(this, p, z) : true
    //             return p1 && p2
    //         }
    //     )
    //}

    private posCheck(a : any) : a is Positionable {
        return a.pos instanceof Position
    }

    isNotActionArr<T>(gen : T | Action[]) : gen is T {
        if(!Array.isArray(gen)) return false;
        return gen.some(i => !(i instanceof Action_class))
    }
    
    //APIs ported over from zoneHandlers
    forEach : zoneHandler["forEach"]
    map : zoneHandler["map"]
    filter : zoneHandler["filter"]
    
    //const
    readonly NULLPOS: dry_position = new Position(-1)
    readonly NULLCARD: dry_card
}

export default queenSystem
export {logInfo}