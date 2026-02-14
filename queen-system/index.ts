import _node from "../system-components/action-tree/node";
import _tree from "../system-components/action-tree/tree";
import ZoneLoader from "../system-components/loader/loader_zone";
import { ActionGenerator, ActionID, Action, ActionName, type LogInfo, CardDataRegistry, type OperatorID, TargetTypeID, type LogInfoHasResponse, ActionRegistry, GameRule, type PositionDry, ActionBase, type LogInfoNormal, type LogInfoResolve, type ZoneTypeID, type ZoneAttrID, GameRule_actions_can_be_modified, GameRule_actions_can_be_negated, GameRule_allow_add_status_effect, GameRule_allow_card_reset, GameRule_allow_turn_reset, GameRule_allow_dealing_damage_ahead, GameRule_allow_dealing_damage_to_cards, GameRule_allow_dealing_heart_damnage, GameRule_allow_decompile_card, GameRule_allow_destroy_card, GameRule_allow_draw, GameRule_allow_effect_reset, GameRule_allow_execute_card, GameRule_allow_move_cards, GameRule_allow_remove_all_effects, GameRule_allow_remove_all_status_effects, GameRule_allow_remove_status_effect, GameRule_allow_set_threat, GameRule_allow_shuffle, GameRule_threat_burn, GameRule_increment_threat_on_turn_end, GameRule_asks_effect_can_activate_twice, GameRule_allow_void_card, GameRule_attack_deals_damage_straight_ahead, GameRule_effects_can_be_activated, GameRule_cards_on_field_destroy_at_0_hp, GameRule_dealing_damage_ahead_when_no_target_deals_heart_dmg_equals_to_atk, GameRule_execute_also_do_physical_attack, GameRule_force_loss_on_heart_at_0, GameRule_turn_draw_also_do_turn_reset, GameRule_turn_start_also_do_turn_reset, type BrandedNumber, DeckID, DeckDataRegistry, GameRule_allow_add_effect, GameRule_card_can_be_disabled, GameRule_once_can_be_reset, GameRule_all_once_reset_reverts_to_single_reset, GameRule_effects_can_be_duplicated, GameRule_cards_can_be_duplicated, GameRule_effects_can_be_remove, GameRule_cards_can_be_delay, GameRule_clear_all_counters_reverts_to_remove_status_eff } from "../core";

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

import { PlayerStat, SuspensionReason, TurnPhase } from "../core";
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
import { ZoneLayout } from "../game-components/zones/zoneLayout";
import EffectLoader from "../system-components/loader/effect-loader";
import EffectTypeOrSubtypeLoader from "../system-components/loader/loader_type_subtype";
import { loadModdingAPI } from "../system-components/modding/modding-api";

// import type CardDry from "../dryData/CardDry";
// import position from "../baseClass/position";
type doGetNewNode = boolean
type completed = boolean

type cardID = string
type effectID = string

type PlayerID = BrandedNumber<PlayerStat>

export class QueenSystem implements SystemDry {
    //properties
    turnAction : Action | undefined = undefined
    turnCount : number = 0
    waveCount : number = 0
    threatLevel : number = 0
    maxThreatLevel : number = 20

    //handlers
    zoneLoader : ZoneLoader
    effectLoader : EffectLoader
    effectModifierLoader : EffectTypeOrSubtypeLoader
    cardLoader : CardLoader
    modLoader : ModLoader
    localizer : Localizer

    gameRuleSystem = new Map<ActionName, (a : Action) => Action[] | undefined | void>()
    //classification = undef maps to a_any
    gameRulesMap = new Map<TurnPhase, Map<ActionName | "a_any_or_a_all", {order : number, rule : GameRule}[]>>()
    //
    playerData : PlayerStat[] = []
    
    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from current phase ID
    
    private suspensionReason : SuspensionReason | false = false

    private currentInputObject : ReturnType<Action<"a_get_input">["flatAttr"]> | undefined = undefined

    get isSuspended() {return this.suspensionReason !== false}
    get zoneArr() {return this.zoneLoader.zoneArr}

    fullLog : LogInfo[] = []

    phaseIdx : TurnPhase = TurnPhase.declare
    actionTree : _tree<Action<"a_turn_end">>

    //cardID, effectIDs[]
    get rootID() : number {return this.actionTree.root.id}
    getRootAction() {return this.actionTree.root.data}

    constructor(
        public setting : Setting,
        public layout : ZoneLayout | undefined = undefined, 
        public renderer : qpRenderer,
        public gamerules : GameRule[] = QueenSystem.DEFAULT_GAMERULES,
    ){
        this.zoneLoader = new ZoneLoader()
        this.effectModifierLoader = new EffectTypeOrSubtypeLoader()
        this.effectLoader = new EffectLoader(this.effectModifierLoader)
        this.cardLoader = new CardLoader(this.effectLoader)
        this.modLoader = new ModLoader(setting)
        this.localizer = new Localizer(this)

        this.actionTree = new _tree(
            ActionGenerator.a_turn_end(Target.system(), {
                doIncreaseTurnCount : true
            })
        )

        const c = this.cardLoader.getCard(CardDataRegistry.c_blank, setting)!
        c.pos = new Position(-1)
        c.canAct = false;
        this.NULLCARD = c;

        gamerules.forEach(g => this.addGameRule(g))
    }

    // load sections

    static get DEFAULT_GAMERULES() : GameRule[] {
        return [ 
            new GameRule_allow_turn_reset(),
            new GameRule_allow_card_reset(),
            new GameRule_allow_effect_reset(),

            new GameRule_allow_dealing_damage_ahead(),
            new GameRule_allow_dealing_damage_to_cards(),
            new GameRule_allow_dealing_heart_damnage(),

            new GameRule_allow_decompile_card(),
            new GameRule_allow_destroy_card(),
            new GameRule_allow_execute_card(),
            new GameRule_allow_move_cards(),
            new GameRule_allow_void_card(),

            new GameRule_card_can_be_disabled(),
            new GameRule_once_can_be_reset(),
            new GameRule_all_once_reset_reverts_to_single_reset(),
            new GameRule_effects_can_be_duplicated(),
            new GameRule_cards_can_be_duplicated(),
            new GameRule_effects_can_be_remove(),
            new GameRule_cards_can_be_delay(),

            new GameRule_clear_all_counters_reverts_to_remove_status_eff(),
            
            new GameRule_allow_add_status_effect(),
            new GameRule_allow_add_effect(),
            new GameRule_allow_remove_all_effects(),
            new GameRule_allow_remove_all_status_effects(),
            new GameRule_allow_remove_status_effect(),

            new GameRule_effects_can_be_activated(),
            new GameRule_asks_effect_can_activate_twice(),
            new GameRule_attack_deals_damage_straight_ahead(),
            new GameRule_cards_on_field_destroy_at_0_hp(),
            new GameRule_dealing_damage_ahead_when_no_target_deals_heart_dmg_equals_to_atk(),
            new GameRule_execute_also_do_physical_attack(),
            new GameRule_force_loss_on_heart_at_0(),
            new GameRule_turn_draw_also_do_turn_reset(),
            new GameRule_turn_start_also_do_turn_reset(),

            new GameRule_allow_draw(),
            new GameRule_allow_shuffle(),
            
            new GameRule_threat_burn(),
            new GameRule_allow_set_threat(),
            new GameRule_increment_threat_on_turn_end(),
            
            //These needs to be last
            new GameRule_actions_can_be_modified(),
            new GameRule_actions_can_be_negated(),
        ]
    }

    addGameRule(
        rule : GameRule
    ){
        const key = (!rule.classification || rule.classification === "a_all") ? "a_any_or_a_all" : rule.classification
        const map = this.gameRulesMap.get(rule.phase) ?? new Map()
        
        const arr = map.get(key) ?? []
        arr.push({order : arr.length, rule})

        map.set(key, arr)
        this.gameRulesMap.set(rule.phase, map)
    }

    addPlayers(
        type : PlayerTypeID,
        deck : DeckID,
        heart = 20, 
        maxHeart = heart,
    ){
        const pid = this.playerData.length
        this.playerData.push({
            playerType : type,
            playerIndex : pid,
            heart,
            maxHeart,
            deck,
        })   
        return pid as PlayerID
    }

    private addSystemGameRule<T extends ActionName>(name : T, f : (a : Action<T>) => Action[] | void | undefined){
        this.gameRuleSystem.set(name, f as any)
    }

    private loadSystemGameRules(){
        this.addSystemGameRule("a_null", () => {})
        this.addSystemGameRule("error", (a) => {this.resolveError(a)})
        this.addSystemGameRule("a_turn_start", () => {})
        this.addSystemGameRule("a_turn_end", (a) => {
            //merge statusEffects
            this.forEach(1, (c => {
                c.mergeStatusEffect();
            }))

            if(a.getAttr("doIncreaseTurnCount")){
                this.turnCount++
            }

            this.suspensionReason = SuspensionReason.turn_finished
            this.suspend(this.actionTree.root.id)
        })
        this.addSystemGameRule("a_force_end_game", (a) => {
            //clear the tree
            this.actionTree.clear()
            this.suspensionReason = SuspensionReason.game_ended
            //am uhh not sure how to implememt this shit yet
            //i think this is fine? for now?
            this.suspend(this.actionTree.root.id)
        })
        this.addSystemGameRule("a_reprogram_start", (a) => {
            //TODO : to be implemented                
    
            //note to future me
            //suspend and notify renderer here
    
            //probably feed it a view of this class that specializes inn movinng stuff around

            //plug it in here
        })
        this.addSystemGameRule("a_reprogram_end", (a) => {
            //same as above
            //load the zones, shuffle, draw and stuff
        })
    }

    private sortFunc(a : {priority : number}, b : {priority : number}) : number{
        const x = a.priority, y = b.priority;
        if(Object.is(x, y)) return 0;
        const rank = (a : number) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }

    async load(gamestate? : SerializedSystem){
        //TODO : figure out the proper load order for stuff from mods to load properly, I have no clue tbh
        if(gamestate){
            this.loadGamestate(gamestate)
        } else if(this.layout){
            this.zoneLoader.zoneArr = []
            const ZIDs = this.layout.loadWhat()
            ZIDs.forEach(zid => {
                const zdata = ZoneRegistry.getData(zid);
                let zinstance = this.zoneLoader.getZone(this.setting, undefined, undefined, zid, zid)
                if(zinstance && !zdata.instancedFor.length){
                    Utils.insertionSort(
                        this.zoneLoader.zoneArr, 
                        zinstance,
                        this.sortFunc
                    )
                } else {
                    this.playerData.forEach((p, pindex) => {
                        zinstance = this.zoneLoader.getZone(this.setting, p.playerType, pindex, zid, zid)
                        if(zinstance && zdata.instancedFor.includes(p.playerType)){
                            Utils.insertionSort(
                                this.zoneLoader.zoneArr,
                                zinstance,
                                this.sortFunc
                            )
                        }
                    })
                }
            })
        }
        
        if(this.playerData.length === 0) console.warn("No player loaded, if this is unintended, make sure to call queenSystem.addPlayer(...) before load");
        this.loadSystemGameRules()   
        
        //initiate mod utils
        loadModdingAPI(this)

        let arr = [
            this.localizer.load(new LoadOptions(this.setting.modFolder_parser, this.setting.parser_modules)),
            this.modLoader.load(),
        ]
        await Promise.all(arr);
    }

    loadGamestate(gamestate : SerializedSystem){
        function getEffectFromSerialized(s : QueenSystem, serialized_e : SerializedEffect){
            const newEff = s.effectLoader.getEffect(serialized_e.dataID, serialized_e.variants, s.setting, {
                typeID : serialized_e.typeID,
                subTypeIDs : serialized_e.subTypeIDs,
                localizationKey : serialized_e.displayID
            });

            if(!newEff) return newEff
            newEff._setAttr( new Map(Object.entries(serialized_e.attr)) )
            return newEff
        }

        this.playerData = gamestate.players

        this.turnCount = gamestate.turn
        this.waveCount = gamestate.wave

        this.zoneLoader.zoneArr = gamestate.zones.map((z, index) => {
            const newZone = this.zoneLoader.getZone(this.setting, z.pType, z.pid, z.classID, z.dataID)
            if(!newZone) throw new Error("Tried to load invalid state data")
            newZone.attr = new Map(Object.entries(z.attr))
            const carr = z.cardArr.map(c => {
                if(!c) return c
                const newCard = this.cardLoader.getCard(c.dataID, this.setting, c.variants)
                if(!newCard) return undefined
                newCard.attr = new Map(Object.entries(c.attr))
                newCard.statusEffects = c.statusEffects.map(e => getEffectFromSerialized(this, e) as any)
                newCard.effects = c.effects.map(e => getEffectFromSerialized(this, e)!)
                return newCard
            })
            newZone.forceCardArrContent(this, carr, false)
            newZone.types = z.types
            return newZone
        })

        if(gamestate.zoneLayout){
            this.layout = ZoneLayout.fromSerialized(this.zoneArr, gamestate.zoneLayout.oppositeZones, gamestate.zoneLayout.transforms)
        } else {
            delete this.layout
        }
        this.restartTurn()
    }

    // PROCESSING section
    restartTurn(a? : Action){
        this.actionTree.clear()
        if(a) {
            this.actionTree.attach(a);
            this.turnAction = a;
        }
        this.actionTree.attach(
            ActionGenerator.a_turn_start(Target.system())
        )
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true)

        this.phaseIdx = TurnPhase.declare
    }

    resolveError(a : Action<"error"> | Error){
        console.log(a.toString())
    }

    start(){
        this.renderer.turnStart(this.toLocalized()!, this.processTurn.bind(this))
    }

    processTurn(turnActionFromPlayer?: Action) : completed;
    processTurn(startNode? : _node) : completed;
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
                if(!this.currentInputObject) throw Error("Somehow suspended but dont want to input");
                this.suspend(n.id)
                this.suspensionReason = false;
                let inputArr : InputRequestData<Target>
                const input = this.currentInputObject!.requester.next()
                if(input) inputArr = input;
                else throw new Error("Input not found")
                // else inputArr = this.getAllInputs(input[0], true);
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

    private gotoPhase(phase : TurnPhase){
        this.phaseIdx = phase
    }

    private respond(a : Action, log : LogInfoHasResponse){
        let arr : Action[] = []
        this.zoneArr.forEach(z => {
            arr.push(...z.getAllPos().map(p => ActionGenerator.a_internal_try_activate(p)(Target.system(), {
                log
            })))
        })
        return arr
    }

    private applyRules(phase : TurnPhase, a : Action, arr : Action[]){
        const rulesMap = this.gameRulesMap.get(TurnPhase.chain)
        const rulesSpecific = rulesMap?.get(ActionRegistry.getKey(a.type)) ?? []
        const rulesAny = rulesMap?.get("a_any_or_a_all") ?? []

        for(const {rule} of Utils.mergeSort(rulesSpecific, rulesAny, (a, b) => a.order - b.order)){
            if(rule.negated) continue;
            let obj : ReturnType<GameRule["resolves"]>

            if(rule.is("a_all")){
                obj = rule.resolves(this, arr)
            } else {
                obj = rule.resolves(this, a)
            }

            if(Array.isArray(obj)) arr = obj;
            else if(obj){
                if(obj.targetPhase !== undefined)
                    this.gotoPhase(obj.targetPhase);
                if(obj.replacedActionArr)
                    arr = obj.replacedActionArr;
            }
        }


        return arr
    }

    private attachesActions(actionArr : Action[], n : _node){
        actionArr.forEach(i => {
            if(i.isChain) this.actionTree.attach_node(n, i);
            else this.actionTree.attach_node(this.actionTree.root, i);
        })
    }

    private process(n : _node) : doGetNewNode {
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
                    currentPhase: this.phaseIdx,
                    currentAction : n.data
                })
                if(n.id === this.processStack.at(-1)) {
                    this.phaseIdx = TurnPhase.resolve;
                    return this.process(n);
                }
                // console.log("declare action: " + n.data.type)
                this.gotoPhase(TurnPhase.input)
                return false;
            }
            case TurnPhase.input: {
                //handle input
                this.fullLog.push({
                    currentPhase: this.phaseIdx,
                    currentAction : n.data
                })
                this.gotoPhase(TurnPhase.chain)
                if(n.data.is("a_get_input")){
                    return this.inputHandler(n.data, n)
                }
                return false; 
            }
            case TurnPhase.chain: {
                //chain step
                const log : LogInfoHasResponse = {
                    currentPhase: this.phaseIdx,
                    currentAction: n.data,
                    responses: {}
                }
                this.fullLog.push(log)
                let actionArr = this.respond(n.data, log)

                this.gotoPhase(TurnPhase.recur)
                actionArr = this.applyRules(TurnPhase.chain, n.data, actionArr)

                this.attachesActions(actionArr, n)
                return false
            }
            case TurnPhase.recur: {
                //recur step
                //recur until the last element of processStack is reached
                //then that element is removed
                this.fullLog.push({
                    currentPhase: this.phaseIdx,
                    currentAction : n.data
                })
                this.processStack.push(n.id)
                this.gotoPhase(TurnPhase.declare)
                return true;
            }
            case TurnPhase.resolve: {
                //resolve
                this.processStack.pop();

                const actionArr = this.applyRules(TurnPhase.resolve, n.data, [])
                this.attachesActions(actionArr, n)

                actionArr.forEach(a => a.resolvedFrom = n.data) 
                

                this.fullLog.push({
                    currentPhase : 5,
                    currentAction : n.data,
                    resolvedResult : actionArr
                })
                // console.log("finish resolving acion: " + n.data.type)
                if(n.data.canBeTriggeredTo) this.gotoPhase(TurnPhase.trigger);
                else this.gotoPhase(TurnPhase.complete); //6 is skipped
                return false;
            }
            case TurnPhase.trigger: {
                //trigger
                const log : LogInfoHasResponse = {
                    currentPhase: this.phaseIdx,
                    currentAction: n.data,
                    responses: {}
                }
                this.fullLog.push(log)
                let actionArr = this.respond(n.data, log)

                this.gotoPhase(TurnPhase.complete)
                this.applyRules(TurnPhase.trigger, n.data, actionArr)
                return false 
            }
            case TurnPhase.complete: {
                //complete 
                this.fullLog.push({
                    currentPhase: this.phaseIdx,
                    currentAction : n.data
                })
                n.markComplete();
                this.gotoPhase(TurnPhase.declare)
                return true;
            }
        }
        console.log("accessed invalid phaseIdx: " + this.phaseIdx)
        return false
    }

    suspend(nid : number){
        this.suspendID = nid;
    }

    private isTargetEqual(i1 : Target, i2 : Target) : boolean {
        if(i1.type !== i2.type) return false;

        switch(i1.type){
            case TargetTypeID.boolean : return (i2 as TargetBool).data === i1.data;
            case TargetTypeID.number : return (i2 as TargetNumber).data === i1.data;
            case TargetTypeID.string : return (i2 as TargetStr).data === i1.data;
            
            case TargetTypeID.card : return i1.data instanceof Card && i2.data instanceof Card && i2.data.is(i1.data);
            case TargetTypeID.effect : return i1.data instanceof Effect && i2.data instanceof Effect && i2.data.is(i1.data);

            case TargetTypeID.player : return i1.data === i2.data;
            case TargetTypeID.position : return i2.data instanceof Position && i1.data.is(i2.data);
            case TargetTypeID.zone : return i2.data instanceof Zone && i1.data.is(i2.data);
        }

        return false
    }

    private inputHandler(a : Action<"a_get_input">, n : _node) : boolean {
        console.log("processing input")

        this.currentInputObject = a.flatAttr();
        let requester = this.currentInputObject.requester;
        const applicator = this.currentInputObject.applicator;

        if(!requester.hasInput()) {
            console.log("blank input, skipped, logging fullObject: ", this.currentInputObject)
            this.phaseIdx = TurnPhase.complete;
            return false;
        }

        let final : Action[] | undefined = undefined //assign to this to NOT suspend
        
        if(requester.isFinalized()){
            final = applicator(requester.applied)
        } else {
            let requestData = requester.next()!;

            if(!requestData.valid()){
                console.log("innvalid input data, skipped, logging fullObject: ", this.currentInputObject)
                this.phaseIdx = TurnPhase.complete;
                return false;
            }
            
            //returns if break of not
            function proceed(s : QueenSystem, ...input : Target[]) : Action[] | undefined {
                requester = requester.apply(s, input) as any
                if(requester.isFinalized()) {
                    return applicator(requester.applied);
                }
                //fail safe check
                if(!requester.hasInput()) {
                    s.currentInputObject = undefined;
                    return []
                };

                requestData = requester.next()!;
            }
            
            switch(this.setting.auto_input){
                case AutoInputOption.first : {
                    while(true){
                        let input : Target = requestData.choices[0]
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
                        let input : Target = requestData.choices.at(-1)!
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
                        let input : Target = Utils.getRandomElement(requestData.choices)!
                        const k = proceed(this, input)
                        if(k !== undefined){
                            final = k;
                            break;
                        };
                    }
                }
                case AutoInputOption.default : {
                    if(requestData.isAutoApplicable()){
                        const k = proceed(this, ...requestData.choices)
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
            this.suspensionReason = SuspensionReason.taking_input
            this.suspend(a.id);
            return false;
        } else {
            console.log("inputs getting skipped, trying to apply")

            this.suspensionReason = false;
            this.currentInputObject = undefined;

            this.actionTree.attach_node(n, ...final);
            n.markComplete();

            this.phaseIdx = TurnPhase.declare //unwind back to declare;
            this.suspendID = -1;

            return true;
        }
    }

    getAllInputs<T extends TargetTypeID>(t : T) : TargetSpecific<T>[] | undefined;
    getAllInputs<T extends TargetTypeID>(t : T, force : true) : TargetSpecific<T>[];
    getAllInputs(t : TargetTypeID, force? : boolean | number, count? : number) : Target[] | undefined {
        force = Number(force);
        switch(t){
                case TargetTypeID.boolean: return force ? [{
                    type : TargetTypeID.boolean,
                    data : Utils.rng(1, 0, true) === 1
                }] as Target[] : undefined
                case TargetTypeID.number: return force ? [{
                    type : TargetTypeID.number,
                    data : Utils.rng(100, 0, true)
                }] as Target[] : undefined
                case TargetTypeID.string: return force ? [{
                    type : TargetTypeID.string,
                    data : Utils.generateID()
                } as const] as Target[] : undefined

                case TargetTypeID.zone: return this.map(0, z => Target.zone(z))

                case TargetTypeID.card : return this.map(1, c => Target.card(c))

                case TargetTypeID.player : return this.playerData.map((_, pid) => Target.player(pid))

                case TargetTypeID.position : {
                    let res : PositionDry[] = []
                    this.forEach(0, z => res.push(...z.getAllPos()))
                    return res.map(pos => Target.pos(pos))
                }

                case TargetTypeID.effect : return this.map(2, (e, c) => { return Target.effect(e, c) })
            }
            throw new Error(`get all input failed, type = ${t}`)
    }

    generateSignature(a : Target | undefined) : string {
        if(a == undefined) return Utils.generateID();
        const T = a.type + "_"
        switch(a.type){
            case TargetTypeID.number:
            case TargetTypeID.string:
            case TargetTypeID.boolean: return T + String(a.data)

            case TargetTypeID.zone: return T + String(a.data.id)
            case TargetTypeID.card: return T + a.data.id
            case TargetTypeID.effect: return T + a.data.id
            case TargetTypeID.player: return T + String(a.data)
            case TargetTypeID.position: return T + a.data.toString() 
            case TargetTypeID.action: return T + a.data.id
            // case TargetTypeID.effectType: return T + a.data.id
            // case TargetTypeID.effectSubtype: return T + a.data.id
            case TargetTypeID.gameRule : return T 
            case TargetTypeID.none : return T
            case TargetTypeID.system : return T
        }
    }    

    continue(a : Action) : ReturnType<QueenSystem["processTurn"]>;
    continue(input? : Target[]) : ReturnType<QueenSystem["processTurn"]>;
    continue(input : undefined | Target[] | Action) : ReturnType<QueenSystem["processTurn"]>{
        if(input instanceof ActionBase){
            if(this.suspensionReason === SuspensionReason.turn_finished) return this.processTurn(input);
            else throw new Error("Cannot continue when turn not finished")
        }

        let n = this.actionTree.getNode(this.suspendID)
        if(
            this.suspensionReason === SuspensionReason.taking_input && n.data.is("a_get_input")
        ){
            if(this.currentInputObject === undefined || input === undefined){
                throw new Error("Cannot unsuspend on inpuit empty")
            }

            const requester = this.currentInputObject.requester;
            // const applicator = this.curr_input_obj.applicator;
            
            if(!requester.hasInput()){
                throw new Error("Cannot unsuspend, invalid input object")
            }

            let requestData = requester.next();

            //check validity of input

            //naive? check, see input for impl details
            const flag = requestData?.isValidInput(this, input)

            if(!flag) {
                throw new Error("input not in valid set, correct type but wrong id")
            }

            let res = this.inputHandler(n.data, n);

            //complete
            if(res) return this.processTurn();
            else {
                console.log("Input taken, but unfinished, please continue")
                const inputArr = requester.next()!
                this.renderer.requestInput(inputArr, this.phaseIdx, this.toLocalized()!, n.data, this.continue.bind(this))
                return false;
            }
            
        } else if(this.suspensionReason !== false) throw new Error(`Cannot unsuspend when reason is not resolved`)
        this.suspendID = -1;
        return this.processTurn(n)
    }

    //Parsing game stat API

    forEach(depth : 0, f : (z : Zone, index : number) => any) : void;
    forEach(depth : 1, f : (c : Card, z : Zone, cindex : number, zindex : number) => any) : void;
    forEach(depth : 2, f : (e : Effect, c : Card, z : Zone, eindex : number, cindex : number, zindex : number) => any) : void;
    forEach(depth : 0 | 1 | 2, f : (...p : any) => any){
        switch(depth){
            case 0 : return this.zoneArr.forEach(f);
            case 1 : return this.zoneArr.forEach((z, zindex) => z.cardArrFiltered.forEach((c, cindex) => f(c, z, cindex, zindex)));
            case 2 : return this.zoneArr.forEach((z, zindex) => z.cardArrFiltered.forEach((c, cindex) => c.totalEffects.forEach((e, eindex) => f(e, c, z, eindex, cindex, zindex))));
        }
        throw new Error(`For each called with unknown depth (not 0, 1 or 2) depth=${depth}`)
    } 

    map<T>(depth : 0, f : (z : Zone, index : number) => T) : T[];
    map<T>(depth : 1, f : (c : Card, z : Zone, cindex : number, zindex : number) => T) : T[];
    map<T>(depth : 2, f : (e : Effect, c : Card, z : Zone, eindex : number, cindex : number, zindex : number) => T) : T[];
    map<T>(depth : 0 | 1 | 2, f : (...p : any) => T){
        switch(depth){
            case 0 : return this.zoneArr.map(f);
            case 1 : return this.zoneArr.flatMap((z, zindex) => z.cardArrFiltered.map((c, cindex) => f(c, z, cindex, zindex)));
            case 2 : return this.zoneArr.flatMap((z, zindex) => z.cardArrFiltered.flatMap((c, cindex) => c.totalEffects.map((e, eindex) => f(e, c, z, eindex, cindex, zindex))));
        }
        throw new Error(`For each called with unknown depth (not 0, 1 or 2) depth=${depth}`)
    }

    filter(depth : 0, f : (z : Zone, index : number) => boolean) : Zone[];
    filter(depth : 1, f : (c : Card, z : Zone, cindex : number, zindex : number) => boolean) : Card[];
    filter(depth : 2, f : (e : Effect, c : Card, z : Zone, eindex : number, cindex : number, zindex : number) => boolean) : Effect[];
    filter(depth : 0 | 1 | 2, f : (...p : any) => boolean){
        switch(depth){
            case 0 : return this.zoneArr.filter(f);
            case 1 : return this.zoneArr.flatMap((z, zindex) => z.cardArrFiltered.filter((c, cindex) => f(c, z, cindex, zindex)));
            case 2 : return this.zoneArr.flatMap((z, zindex) => z.cardArrFiltered.flatMap((c, cindex) => c.totalEffects.filter((e, eindex) => f(e, c, z, eindex, cindex, zindex))));
        }
        throw new Error(`For each called with unknown depth (not 0, 1 or 2) depth=${depth}`)
    }

    private foreachReturnEarly(...p : Parameters<QueenSystem["forEach"]>){

    }

    getPlayerWithID(pid : number) {
        return this.playerData[pid] as PlayerStat | undefined
    }

    getCurrentPlayerID(){
        const p = this.turnAction?.cause
        if(!p || p.type !== TargetTypeID.player)
            throw new Error("Turn action not caused by a player");
        return p.data
    }
        
    getCardWithID(cid : string) : Card | undefined{
        try{
            this.forEach(1, (c => {
                if(c.id === cid) throw c;
            }))
        }catch(n : any){
            if(n instanceof Card) return n
        }
    }

    getCardWithDataID(cid : string) : Card[] {
        return this.filter(1, c => c.id === cid) as Card[]
    }
    
    getZoneWithID(zid : number) : Zone | undefined {
        return this.zoneArr[zid];
    }

    getZoneOf(obj : Positionable) : Zone | undefined {
        return this.getZoneWithID(obj.pos.zoneID)
    }

    get resolutionLog() : LogInfoResolve[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.resolve) as LogInfoResolve[]
    }

    get completionLog() : LogInfoNormal[]{
        return this.fullLog.filter(i => i.currentPhase === TurnPhase.complete) as LogInfoNormal[]
    }

    getActivatedEffectIDs() : effectID[] {
        return this.fullLog.filter(
                i => (
                    i.currentPhase === TurnPhase.complete &&
                    i.currentAction.cause.type === TargetTypeID.effect
                )
            ).map(i => (i.currentAction.cause as TargetEffect).data.id)
    }

    hasEffectActivated(e : EffectDry){
        for(const log of this.fullLog){
            if(
                log.currentPhase === TurnPhase.complete &&
                log.currentAction.cause.type === TargetTypeID.effect
            ){
                return log.currentAction.cause.data.id === e.id
            }
        }
        return false
    }

    hasCardActivated(c : CardDry){
        const idStillToSearch = new Set(c.totalEffects.map(e => e.id))
        if(idStillToSearch.size > 0){
            for(const log of this.fullLog){
                if(
                    log.currentPhase === TurnPhase.complete &&
                    log.currentAction.cause.type === TargetTypeID.effect
                ){
                    const id = log.currentAction.cause.data.id
                    if(idStillToSearch.has(id)) return true;
                }
            }
            return false
        }
        return false
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

    getResolveOrigin<T extends ActionName>(a : Action, n : T) : undefined | Action<T> {
        let maxDepth = 50
        let trace = a.resolvedFrom
        while(maxDepth--){
            if(!trace) return;
            if(trace.is(n)) return trace;
            trace = trace.resolvedFrom
        }
    }

    getAllZonesOfPlayer(pid : number) : Record<ZoneTypeID, Zone[]>{
        if(pid < 0) return {}
        let res : Record<ZoneTypeID, Zone[]> = {}

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

    is(c : Positionable, type : ZoneTypeID) : boolean {
        const z = this.getZoneWithID(c.pos.zoneID);
        if(!z) return false;
        return z.is(type);
    }

    get isInTriggerPhase() {return this.phaseIdx === TurnPhase.trigger}
    get isInChainPhase() {return this.phaseIdx === TurnPhase.chain}

    getWouldBeAttackTargets(c : CardDry) : Card[] | undefined {
        if(!this.layout) return;
        const z = this.getZoneOf(c)
        if(!z || !z.is(ZoneRegistry.field)) return;
        const oppositeZoneID = this.layout.getOppositeZoneID(z)
        if(oppositeZoneID === undefined) return;
        const oppositeZone = this.getZoneWithID(oppositeZoneID)
        if(!oppositeZone) return;

        return (
            oppositeZone.cardArrFiltered
            .filter(target => this.layout!.isOpposite(c, target))
            .sort(target => this.layout!.distance(c, target))
        )
    }

    private posCheck(a : any) : a is Positionable {
        return a.pos instanceof Position
    }

    isNotActionArr<T>(gen : T | Action[]) : gen is T {
        if(!Array.isArray(gen)) return false;
        return gen.some(i => !(i instanceof ActionBase))
    }
    
    //const
    readonly NULLPOS: Position = new Position(-1)
    readonly NULLCARD: Card

    toSerialized(){
        return new SerializedSystem(
            this.playerData,
            this.zoneArr.map(z => 
                new SerializedZone(z.classID, z.dataID, z.cardArr.map(
                        c => c ? new SerializedCard(
                            c.dataID, c.variants, 
                            c.effects.map(
                                e => new SerializedEffect(e.dataID, e.type.dataID as any, e.subTypes.map(st => st.dataID) as any, e.displayID, e.attr.attr)
                            ), 
                            c.statusEffects.map(
                                e => new SerializedEffect(e.dataID, e.type.dataID as any, e.subTypes.map(st => st.dataID) as any, e.displayID, e.attr.attr)
                            ),
                            c.attr
                        ) : c
                    ), 
                    z.types.slice(), 
                    z.playerType,
                    z.playerIndex,
                    z.attr
                )
            ),
            this.layout?.toSerialized(),
            this.turnCount,
            this.waveCount
        )
    }

    toLocalized(mode? : ParseMode){
        return this.localizer.localizeSystem(this, mode)
    }
}

export {LogInfo as logInfo}