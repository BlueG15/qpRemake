import _node from "../system-components/action-tree/node";
import _tree from "../system-components/action-tree/tree";
import ZoneLoader from "../system-components/loader/loader_zone";
import { ActionGenerator, ActionID, Action, ActionName, type LogInfo } from "../core";

import { AutoInputOption, Setting } from "../core/settings";

import CardLoader from "../system-components/loader/card-loader";
import ModLoader from "../system-components/loader/loader_mod";
import Localizer from "../system-components/localization/localizer";

import { 
    OperatorRegistry,
    PlayerTypeID,
    ZoneRegistry
} from "../core";
import { StatusEffect_base } from "../game-components/effects/default/e_status";

import { Position } from "../game-components/positions";
import { Card } from "../game-components/cards";
import { Zone } from "../game-components/zones";
import { Effect } from "../game-components/effects";
import { EffectModifier } from "../core";

import { InputRequestData, InputRequest } from "../system-components/inputs";
import { 
    Target,
    TargetSystem,
    TargetAction,
    TargetZone,
    TargetCard,
    TargetEffect,
    TargetEffectType,
    TargetEffectSubType,
    TargetNull,
    TargetPlayer,
    TargetPos,
    TargetBool,
    TargetStr,
    TargetNumber,
    TargetSpecific,
} from "../core";
import { 
    SystemDry,
    ZoneDry,
    CardDry, 
    EffectDry,
} from "../core";

import { StatPlayer, SuspensionReason, TurnPhase } from "../core";
import { IdAble, notFull, PlayerSpecific, Positionable } from "../core";

import { qpRenderer } from "../system-components/renderer";
import { LoadOptions, ParseMode } from "../system-components/localization/xml-text-parser";
import { 
    SerializedCard, 
    SerializedEffect, 
    SerializedPlayer, 
    SerializedSystem, 
    SerializedZone 
} from "../core/serialized";

// import type dry_card from "../dryData/dry_card";
// import position from "../baseClass/position";
type doGetNewNode = boolean
type completed = boolean

type cardID = string
type effectID = string

class QueenSystem implements SystemDry {
    //properties
    turnAction? : Action = undefined
    turnCount : number = 0
    waveCount : number = 0
    threatLevel : number = 0
    maxThreatLevel : number = 20

    //handlers
    zoneHandler : ZoneLoader
    cardHandler : CardLoader
    modHandler : ModLoader
    localizer : Localizer

    //setting
    setting : Setting

    //
    player_stat : StatPlayer[] = []
    
    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from current phase ID
    
    private suspensionReason : SuspensionReason | false = false

    private curr_input_obj : ReturnType<Action<"a_get_input">["flatAttr"]> | undefined = undefined

    get isSuspended() {return this.suspensionReason !== false}

    fullLog : LogInfo[] = []

    phaseIdx : TurnPhase = TurnPhase.declare
    actionTree : _tree<Action<"a_turn_end">>

    //cardID, effectIDs[]
    get rootID() : number {return this.actionTree.root.id}
    getRootAction() {return this.actionTree.root.data}
    getLayout() {return this.zoneHandler.layout}

    constructor(
        s : Setting,
        public renderer : qpRenderer,
        layout? : Layout, 
    ){
        this.setting = s

        this.registryFile = new registryHandler(s)
        this.zoneHandler = new zoneHandler(this.registryFile)
        this.cardHandler = new cardHandler(s, this.registryFile)
        this.modHandler = new modHandler(s, this.registryFile)
        this.localizer = new Localizer(this, this.registryFile)

        if(layout) this.zoneHandler.applyLayout(layout);

        this.actionTree = new _tree(
            ActionGenerator.a_turn_end(Identification.system(), {
                doIncreaseTurnCount : true
            })
        )

        this.forEach = this.zoneHandler.forEach.bind(this.zoneHandler)
        this.map = this.zoneHandler.map.bind(this.zoneHandler)
        this.filter = this.zoneHandler.filter.bind(this.zoneHandler)

        const c = this.cardHandler.getCard("c_blank")
        c.pos = new Position(-1)
        c.canAct = false;
        this.NULLCARD = c;
    }

    addDeck(
        loadCardsInfo : player_stat["loadCardsInfo"],
        merge = false
    ){
        const p = this.player_stat.at(-1)
        if(!p) throw new Error("Tried to load deck info into a none-existent player")
        merge ? p.loadCardsInfo.concat(loadCardsInfo) : p.loadCardsInfo = loadCardsInfo
    }

    addPlayers(
        type : playerTypeID,
        operatorID : operatorRegistry,
        //optional
        loadCardsInfo : player_stat["loadCardsInfo"] = [],
        heart = 20, 
        maxHeart = heart,
    ){
        this.player_stat.push({
            playerType : type,
            playerIndex : this.player_stat.length,
            heart,
            maxHeart,
            operator : operatorID,
            loadCardsInfo
        })    
    }

    private loadActionHandlers(){
        this.registryFile.add_action_handler("a_null", () => {})
        this.registryFile.add_action_handler("error", (s, a) => {s.resolveError(a)})
        this.registryFile.add_action_handler("a_turn_start", () => {})
        this.registryFile.add_action_handler("a_turn_end", (s, a) => {
            //merge statusEffects
            s.zoneHandler.forEach(1, (c => {
                c.mergeStatusEffect();
            }))

            if(a.getAttr("doIncreaseTurnCount")){
                s.turnCount++
            }

            s.suspensionReason = suspensionReason.turn_finished
        })
        this.registryFile.add_action_handler("a_set_threat_level", (s, a) => {
            s.threatLevel = a.getAttr("newThreatLevel")
            if(s.threatLevel > s.maxThreatLevel) {
                s.threatLevel = s.maxThreatLevel;
                return [
                    ActionGenerator.a_do_threat_burn(Identification.system())
                ]
            }
        })
        this.registryFile.add_action_handler("a_do_threat_burn", (s, a) => {
            return s.zoneHandler.system.flatMap((i, index) => i.doThreatBurn(this, this.player_stat[index]))
        })
        this.registryFile.add_action_handler("a_force_end_game", (s, a) => {
            //clear the tree
            s.actionTree.clear()
            s.suspensionReason = suspensionReason.game_ended
            //am uhh not sure how to implememt this shit yet
            //i think this is fine? for now?
            s.suspend(s.actionTree.root.id)
        })
        this.registryFile.add_action_handler("a_reprogram_start", (s, a) => {
            //to be implemented                
    
            //note to future me
            //suspend and notify renderer here
    
            //plug it in here
        })
        this.registryFile.add_action_handler("a_reprogram_end", (s, a) => {
            //to be implemented
            //load the zones, shuffle, draw and stuff
        })
        this.registryFile.add_action_handler("a_modify_action", (s, a) => {
            let target = a.targets[0].action
            let modifyObj = a.flatAttr()

            Object.entries(modifyObj).forEach(([key, val]) => {
                if(key !== "type") target.modifyAttr(key, val);
            })
            return;
        })
        this.registryFile.add_action_handler("a_replace_action", () => {})
        this.registryFile.add_action_handler("a_negate_action", () => {})
        this.registryFile.add_action_handler("a_deal_heart_damage", (s, a) => {
            let pid = a.targets[0].id
            let dmg = a.getAttr("dmg")

            if(s.player_stat[pid]) s.player_stat[pid].heart -= dmg;
        })
    }

    async load(gamestate? : SerializedSystem){
        if(gamestate){
            this.loadGamestate(gamestate)
        }
        
        if(this.player_stat.length === 0) console.warn("No player loaded, if this is unintended, make sure to call addPlayer(...) before load");
        this.zoneHandler.loadEffects(this.setting, this.player_stat)
        this.loadActionHandlers()
        let arr = [
            this.localizer.load(new loadOptions(this.setting.modFolder_parser, this.setting.parser_modules)),
            this.modHandler.load(),
            this.registryFile.effectLoader.load(this.setting),
        ]
        await Promise.all(arr);
    }

    loadGamestate(gamestate : SerializedSystem){
        function getEffectFromSerialized(s : QueenSystem, serialized_e : Serialized_effect){
            const newEff = s.registryFile.effectLoader.getEffect(serialized_e.dataID, s.setting, {
                typeID : serialized_e.typeID,
                subTypeIDs : serialized_e.subTypeIDs,
                localizationKey : serialized_e.displayID_default
            });

            if(!newEff) return newEff
            newEff._setAttr( new Map(Object.entries(serialized_e.attr)) )
            return newEff
        }

        this.player_stat = gamestate.players.map(
            (p, index) => {return {
                playerType : p.pType,
                playerIndex : index,
                heart : p.heart,
                maxHeart : p.heart,
                operator : p.operator,
                deck : p.deckName,
                loadCardsInfo : []
            }
        })

        this.turnCount = gamestate.turn
        this.waveCount = gamestate.wave

        this.zoneHandler.zoneArr = gamestate.zones.map((z, index) => {
            const newZone = this.registryFile.zoneLoader.getZone(z.classID, this.setting, 0, 0, z.dataID)
            if(!newZone) throw new Error("Tried to load invalid state data")
            newZone.attr = new Map(Object.entries(z.attr))
            newZone.cardArr = z.cardArr.map(c => {
                if(!c) return c
                const newCard = this.registryFile.cardLoader.getCard(c.dataID, this.setting, c.variants)
                if(!newCard) return undefined
                newCard.attr = new Map(Object.entries(c.attr))
                newCard.statusEffects = c.statusEffects.map(e => getEffectFromSerialized(this, e) as any)
                newCard.effects = c.effects.map(e => getEffectFromSerialized(this, e)!)
            })
            newZone.types = z.types
            return newZone
        })

        if(gamestate.zoneLayout){
            this.zoneHandler.applySerializedLayout(gamestate.zoneLayout.oppositeZones, gamestate.zoneLayout.transforms)
        } else {
            delete this.zoneHandler.layout
        }
        this.restartTurn()
    }

    restartTurn(a? : Action){
        this.actionTree.clear()
        if(a) {
            this.actionTree.attach(a);
            this.turnAction = a;
        }
        this.actionTree.attach(
            ActionGenerator.a_turn_start(Identification.system())
        )
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = TurnPhase.declare
    }

    resolveError(a : Action<"error"> | Error){
        console.log(a.toString())
    }

    private resolveAction(a : Action) : undefined | Action[]{
        if(typeof a.typeID !== "number") return [new unregisteredAction(a)]
        return this.registryFile.actionLoader.handle(a.typeID, a, this);
    }

    start(){
        this.renderer.turnStart(this.toLocalized()!, this.processTurn.bind(this))
    }

    processTurn(startNode? : _node) : completed;
    processTurn(turnActionFromPlayer?: Action) : completed
    processTurn(param? : Action | _node) : completed{
        if(!param) {
            console.log("finish processing turn");
            return true;
        }
        let n : _node | undefined
        if(param instanceof _node){
            n = param
        } else {
            this.restartTurn(param);
            this.phaseIdx = 1;
            n = this.actionTree.getNext()
            if(!n) return true;
            this.suspend(n.id)
            this.suspensionReason = false;
            this.renderer.gameStart(this.toLocalized()!, this.continue.bind(this))
            return false
        }
        // while(n){
            let doGetNewNode = this.process(n);
            if(this.suspendID !== -1) {
                if(!this.curr_input_obj) throw Error("Somehow suspended but dont want to input");
                this.suspend(n.id)
                this.suspensionReason = false;
                let inputArr
                const input = this.curr_input_obj!.requester.next()
                if(input[1]) inputArr = input[1];
                else inputArr = this.getAllInputs(input[0], true);
                this.renderer.requestInput(
                    inputArr, 
                    this.phaseIdx, this.toLocalized()!, 
                    n.data, 
                    this.continue.bind(this)
                )
                return false;
            };
            const oldAction = n.data
            if(doGetNewNode) n = this.actionTree.getNext(); 
            if(!n) return true;

            this.suspend(n.id)
            this.suspensionReason = false;
            this.renderer.update(this.phaseIdx, this.toLocalized()!, oldAction, this.continue.bind(this))
            return false;
            // }
    }

    process(n : _node) : doGetNewNode {
        //[phase progression graph:

        //v--------------\--------------\
        //1 -> 2 -> 3 -> 4    5 -> 6 -> 7
        //\--if visited once--^

        //technically 6 needs to go to 1 and loop through all again but screw it, 
        //we already resolved the dang thing, just mark it as complete and move on
        
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
                // console.log("declare action: " + n.data.type)
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
                const log : logInfoHasResponse = {
                    currentPhase: TurnPhase.chain,
                    currentAction: n.data,
                    responses: {}
                }
                this.fullLog.push(log)
                let actionArr = this.zoneHandler.respond(this, n.data, !n.data.canBeChainedTo, log)

                const forcedActions = actionArr.filter(a => a.isCost)

                //special handled
                const isNegated = actionArr.some(
                    i => i.id === actionID.a_negate_action
                )
                let gotoComplete = isNegated
                let replacements = actionArr.filter(a => a.is("a_replace_action")).map(i => (i as Action<"a_replace_action">).targets[0].action)
                if(replacements.length){
                    gotoComplete = true;
                    actionArr = forcedActions.concat(replacements)
                }
                if(isNegated) actionArr = forcedActions

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
                let x = this.resolveAction(n.data)
                if(x) {
                    x.forEach(i => {
                        if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                        else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                        i.resolvedFrom = n.data
                    })
                }
                this.fullLog.push({
                    currentPhase : 5,
                    currentAction : n.data,
                    resolvedResult : (x) ? x : []
                })
                // console.log("finish resolving acion: " + n.data.type)
                if(n.data.canBeTriggeredTo) this.phaseIdx = TurnPhase.trigger;
                else this.phaseIdx = TurnPhase.complete; //6 is skipped
                return false;
            }
            case TurnPhase.trigger: {
                //trigger
                const log : logInfoHasResponse = {
                    currentPhase: TurnPhase.trigger,
                    currentAction: n.data,
                    responses: {}
                }
                this.fullLog.push(log)
                let actionArr = this.zoneHandler.respond(this, n.data, !n.data.canBeTriggeredTo, log)
                
                actionArr = actionArr.map(i => {
                    if(i.is("a_replace_action")) return i.targets[0].action;
                    return i;
                })

                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attach_node(n, i);
                    else this.actionTree.attach_node(this.actionTree.root, i);
                    i.resolvedFrom = n.data
                })
                this.phaseIdx = TurnPhase.complete;
                return false 
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

    private isInputDataEqual(i1 : inputData, i2 : inputData) : boolean {
        if(i1.type !== i2.type) return false;

        switch(i1.type){
            case inputType.boolean : return (i2 as inputData_bool).data === i1.data;
            case inputType.number : return (i2 as inputData_num).data === i1.data;
            case inputType.string : return (i2 as inputData_str).data === i1.data;
            
            case inputType.card : return i1.data instanceof Card && i2.data instanceof Card && i2.data.is(i1.data);
            case inputType.effect : return i1.data instanceof Effect && i2.data instanceof Effect && i2.data.is(i1.data);

            case inputType.player : return i1.data === i2.data;
            case inputType.position : return i2.data instanceof Position && i1.data.is(i2.data);
            case inputType.zone : return i2.data instanceof __Zone__ && i1.data.is(i2.data);
        }

        return false
    }

    private inputHandler(a : Action<"a_get_input">, n : _node) : boolean {
        console.log("processing input")

        this.curr_input_obj = a.flatAttr();
        let requester = this.curr_input_obj.requester;
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
            function proceed(t : QueenSystem, input : inputData) : Action[] | undefined {
                requester = requester.apply(t, input) as any
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
                case AutoInputOption.first : {
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
                case AutoInputOption.last : {
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
                case AutoInputOption.random : {
                    while(true){
                        let input : inputData = i_set ? Utils.getRandomElement(i_set)! : Utils.getRandomElement(this.getAllInputs(i_type, true))!
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                }
                case AutoInputOption.default : {
                    while(true){
                        //Because of this condition, inputRequester_multiple is NOT applied automatically
                        //i.e input wants 2 zones, we have 2 zones, but we aint apply any cause its not 1
                        //this is...technically intended
                        //for now, since idk how to fix this
                        //inputs can merge afterall
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
                    data : Utils.rng(1, 0, true) === 1
                }] as inputData[] : undefined
                case inputType.number: return force ? [{
                    type : inputType.number,
                    data : Utils.rng(100, 0, true)
                }] as inputData[] : undefined
                case inputType.string: return force ? [{
                    type : inputType.string,
                    data : Utils.generateID()
                } as const] as inputData[] : undefined

                case inputType.zone: return this.map(0, z => inputFormRegistry.zone(this, z))

                case inputType.card : return this.map(1, c => inputFormRegistry.card(this, c))

                case inputType.player : return this.player_stat.map((_, pid) => inputFormRegistry.player(this, pid))

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
            }
            throw new Error(`get all input failed, type = ${t}`)
    }

    generateSignature(a : inputData | undefined) : string {
        if(a == undefined) return Utils.generateID();
        const T = a.type + "_"
        switch(a.type){
            case inputType.number:
            case inputType.string:
            case inputType.boolean: return T + String(a.data)

            case inputType.zone: return T + String(a.data.id)
            case inputType.card: return T + a.data.id
            case inputType.effect: return T + a.data.id
            case inputType.player: return T + String(a.data)
            case inputType.position: return T + a.data.toString()   
        }
    }    

    continue(a : Action) : ReturnType<QueenSystem["processTurn"]>;
    continue(input? : inputData) : ReturnType<QueenSystem["processTurn"]>;
    continue(input : undefined | inputData | Action) : ReturnType<QueenSystem["processTurn"]>{
        if(input instanceof Action_class){
            if(this.suspensionReason === suspensionReason.turn_finished) return this.processTurn(input);
            else throw new Error("Cannot continue when turn not finished")
        }

        let n = this.actionTree.getNode(this.suspendID)
        if(
            this.suspensionReason === suspensionReason.taking_input && n.data.is("a_get_input")
        ){
            if(this.curr_input_obj === undefined || input === undefined){
                throw new Error("Cannot unsuspend on inpuit empty")
            }

            const requester = this.curr_input_obj.requester;
            // const applicator = this.curr_input_obj.applicator;
            
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
                    this.isInputDataEqual(i, input)
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

                let inputArr
                const input = requester.next()
                if(input[1]) inputArr = input[1];
                else inputArr = this.getAllInputs(input[0], true);

                this.renderer.requestInput(inputArr, this.phaseIdx, this.toLocalized()!, n.data, this.continue.bind(this))
                return false;
            }
            
        } else if(this.suspensionReason !== false) throw new Error(`Cannot unsuspend when reason is not resolved`)
        this.suspendID = -1;
        return this.processTurn(n)
    }

    //Parsing log API

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

    get completionLog() : logInfoNormal[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.complete) as logInfoNormal[]
    }

    getActivatedEffectIDs() : effectID[] {
        return this.fullLog.filter(
                i => i.currentPhase === TurnPhase.complete &&
                 i.currentAction.cause.type === identificationType.effect
                ).map(i => (i.currentAction.cause as identificationInfo_effect).eff.id)
    }

    getActivatedCardIDs() : cardID[] {
        return this.fullLog.filter(
                i => i.currentPhase === TurnPhase.complete &&
                 i.currentAction.cause.type === identificationType.effect
                ).map(i => (i.currentAction.cause as identificationInfo_effect).card.id)
    }

    getResolvedActions() : Action[] {
        return this.fullLog.map(i => {
            if(i.currentPhase !== 5) return undefined;
            return i.currentAction
        }).filter(i => i !== undefined) as Action[]
    }

    hasActionCompleted(a : Action, startSearchingIndex : number = 0){
        for(let i = startSearchingIndex; i < this.fullLog.length; i++){
            if(this.fullLog[i].currentPhase === TurnPhase.complete){
                if(this.fullLog[i].currentAction.id === a.id) return true
            }
        }
        return false;
    }

    getResolveOrigin<T extends actionName>(a : Action, n : T) : undefined | Action<T> {
        let maxDepth = 50
        let trace = a.resolvedFrom
        while(maxDepth--){
            if(!trace) return;
            if(trace.is(n)) return trace;
            trace = trace.resolvedFrom
        }
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

    is(c : Positionable, type : zoneRegistry) : boolean {
        const z = this.getZoneWithID(c.pos.zoneID);
        if(!z) return false;
        return z.is(type);
    }

    get isInTriggerPhase() {return this.phaseIdx === TurnPhase.trigger}
    get isInChainPhase() {return this.phaseIdx === TurnPhase.chain}

    getWouldBeAttackTarget(c : dry_card){
        return this.zoneHandler.getWouldBeAttackTarget(this, c)
    }

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

    isPlayAction(a : Action) : a is Action<"a_move"> | Action<"a_move_force">{
        if (!(a.is("a_move") || a.is("a_move_force"))) return false
        const zoneTo = this.getZoneWithID(a.targets[1].pos.zoneID)
        const cond1 = zoneTo ? zoneTo.is(zoneRegistry.z_field) : false
        const cond2 = a.targets[0].card.isFrom(this, zoneRegistry.z_hand)
        return cond1 && cond2
    }

    toSerialized(){
        return new SerializedSystem(
            this.player_stat.map(p => new SerializedPlayer(p.playerType, p.heart, p.operator, p.deck)),
            this.zoneArr.map(z => 
                new SerializedZone(z.classID, z.dataID, z.cardArr.map(
                        c => c ? new SerializedCard(
                            c.name, c.variants, 
                            c.effects.map(
                                e => new Serialized_effect(e.dataID, e.type.dataID as any, e.subTypes.map(st => st.dataID) as any, e.displayID, e.attr.attr)
                            ), 
                            c.statusEffects.map(
                                e => new Serialized_effect(e.dataID, e.type.dataID as any, e.subTypes.map(st => st.dataID) as any, e.displayID, e.attr.attr)
                            ),
                            c.attr
                        ) : c
                    ), 
                    z.types.slice(), 
                    z.attr
                )
            ),
            this.zoneHandler.layout?.toSerialized(),
            this.turnCount,
            this.waveCount
        )
    }

    toLocalized(mode? : parseMode){
        return this.localizer.localizeSystem(this, mode)
    }
}

export default QueenSystem
export {LogInfo as logInfo}