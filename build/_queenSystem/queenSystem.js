"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = __importDefault(require("../types/abstract/generics/node"));
const tree_1 = __importDefault(require("../types/abstract/generics/tree"));
const zoneHandler_1 = __importDefault(require("./handler/zoneHandler"));
const actionRegistry_1 = __importDefault(require("../data/actionRegistry"));
const actionGenrator_1 = require("./handler/actionGenrator");
const errors_1 = require("../types/errors");
const settings_1 = require("../types/abstract/gameComponents/settings");
const cardHandler_1 = __importDefault(require("./handler/cardHandler"));
const registryHandler_1 = __importDefault(require("./handler/registryHandler"));
const modHandler_1 = __importDefault(require("./handler/modHandler"));
const localizationHandler_1 = __importDefault(require("./handler/localizationHandler"));
const e_status_1 = require("../specificEffects/e_status");
const zoneRegistry_1 = require("../data/zoneRegistry");
const card_1 = __importDefault(require("../types/abstract/gameComponents/card"));
const zone_1 = __importDefault(require("../types/abstract/gameComponents/zone"));
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const effectSubtype_1 = __importDefault(require("../types/abstract/gameComponents/effectSubtype"));
const systemRegistry_1 = require("../data/systemRegistry");
const position_1 = __importDefault(require("../types/abstract/generics/position"));
const actionInputGenerator_1 = require("./handler/actionInputGenerator");
const effectTextParser_1 = require("../effectTextParser");
const Gamestate_1 = require("../types/abstract/serializedGameComponents/Gamestate");
class queenSystem {
    get isSuspended() { return this.suspensionReason !== false; }
    //cardID, effectIDs[]
    get rootID() { return this.actionTree.root.id; }
    getRootAction() { return this.actionTree.root.data; }
    get threatLevel() { return this.zoneHandler.system.map(i => i.threat); }
    set threatLevel(val) {
        if (typeof val === "number") {
            if (isNaN(val) || val < 0)
                val = 0;
            // if(val > this.zoneHandler.system.maxThreat) val = this.zoneHandler.system.maxThreat
            this.zoneHandler.system.forEach(i => i.threat = val);
        }
        else {
            const s = this.zoneHandler.system;
            val.forEach((t, index) => {
                s[index].threat = t;
            });
        }
    }
    get maxThreatLevel() { return this.zoneHandler.system.map(i => i.maxThreat); }
    constructor(s, renderer) {
        this.renderer = renderer;
        //properties
        this.turnAction = undefined;
        this.turnCount = 0;
        this.waveCount = 0;
        //
        this.player_stat = [];
        this.processStack = [];
        //stores id of node before step "recur until meet this again"
        this.suspendID = -1;
        //^ node id of the node before suspended, 
        //when unsuspended, continue processing this node from current phase ID
        this.suspensionReason = false;
        this.curr_input_obj = undefined;
        this.fullLog = [];
        this.phaseIdx = systemRegistry_1.TurnPhase.declare;
        //const
        this.NULLPOS = new position_1.default(-1);
        this.setting = s;
        this.registryFile = new registryHandler_1.default(s);
        this.zoneHandler = new zoneHandler_1.default(this.registryFile);
        this.cardHandler = new cardHandler_1.default(s, this.registryFile);
        this.modHandler = new modHandler_1.default(s, this.registryFile);
        this.localizer = new localizationHandler_1.default(this, this.registryFile);
        this.actionTree = new tree_1.default(actionGenrator_1.actionConstructorRegistry.a_turn_end(actionGenrator_1.actionFormRegistry.system(), {
            doIncreaseTurnCount: true
        }));
        this.forEach = this.zoneHandler.forEach;
        this.map = this.zoneHandler.map;
        this.filter = this.zoneHandler.filter;
        const c = this.cardHandler.getCard("c_blank");
        c.pos = new position_1.default(-1);
        c.canAct = false;
        this.NULLCARD = c;
    }
    addDeck(loadCardsInfo, merge = false) {
        const p = this.player_stat.at(-1);
        if (!p)
            throw new Error("Tried to load deck info into a none-existent player");
        merge ? p.loadCardsInfo.concat(loadCardsInfo) : p.loadCardsInfo = loadCardsInfo;
    }
    addPlayers(type, operatorID, 
    //optional
    loadCardsInfo = [], heart = 20, maxHeart = heart) {
        this.player_stat.push({
            playerType: zoneRegistry_1.playerTypeID[type],
            playerIndex: this.player_stat.length,
            heart,
            maxHeart,
            operator: operatorID,
            loadCardsInfo
        });
    }
    load(gamestate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (gamestate) {
                this.loadGamestate(gamestate);
            }
            if (this.player_stat.length === 0)
                console.warn("No player loaded, if this is unintended, make sure to call addPlayer(...) before load");
            this.zoneHandler.loadZones(this.setting, this.player_stat);
            let arr = [
                this.localizer.load(new effectTextParser_1.loadOptions(this.setting.modFolder_parser, this.setting.parser_modules)),
                this.modHandler.load(),
                this.registryFile.effectLoader.load(this.setting),
            ];
            yield Promise.all(arr);
        });
    }
    loadGamestate(gamestate) {
        function getEffectFromSerialized(s, serialized_e) {
            const newEff = s.registryFile.effectLoader.getEffect(serialized_e.dataID, s.setting, {
                typeID: serialized_e.typeID,
                subTypeIDs: serialized_e.subTypeIDs,
                displayID_default: serialized_e.displayID_default
            });
            if (!newEff)
                return newEff;
            newEff.attr = new Map(Object.entries(serialized_e.attr));
            return newEff;
        }
        this.player_stat = gamestate.players.map((p, index) => {
            return {
                playerType: p.pType,
                playerIndex: index,
                heart: p.heart,
                maxHeart: p.heart,
                operator: p.operator,
                deck: p.deckName,
                loadCardsInfo: []
            };
        });
        this.turnCount = gamestate.turn;
        this.waveCount = gamestate.wave;
        this.zoneHandler.zoneArr = gamestate.zones.map((z, index) => {
            const newZone = this.registryFile.zoneLoader.getZone(z.classID, this.setting, 0, 0, z.dataID);
            if (!newZone)
                throw new Error("Tried to load invalid state data");
            newZone.attr = new Map(Object.entries(z.attr));
            newZone.cardArr = z.cardArr.map(c => {
                if (!c)
                    return c;
                const newCard = this.registryFile.cardLoader.getCard(c.dataID, this.setting, c.variants);
                if (!newCard)
                    return undefined;
                newCard.partitionInfo = c.partitions;
                newCard.attr = new Map(Object.entries(c.attr));
                newCard.statusEffects = c.statusEffects.map(e => getEffectFromSerialized(this, e));
                newCard.effects = c.effects.map(e => getEffectFromSerialized(this, e));
            });
            newZone.types = z.types;
            return newZone;
        });
        this.restartTurn();
    }
    restartTurn(a) {
        this.actionTree.clear();
        if (a) {
            this.actionTree.attach(a);
            this.turnAction = a;
        }
        this.actionTree.attach(actionGenrator_1.actionConstructorRegistry.a_turn_start(actionGenrator_1.actionFormRegistry.system()));
        this.actionTree.root.data.modifyAttr("doIncreaseTurnCount", true);
        this.phaseIdx = systemRegistry_1.TurnPhase.declare;
    }
    resolveError(a) {
        console.log(a.toString());
    }
    ___testAction(id) {
        const oldF = this.registryFile.customActionLoader.___ObtainFunc(id);
        let didCustomHandlerTriggered = false;
        this.registryFile.customActionLoader.load(id, () => { didCustomHandlerTriggered = true; throw 0; });
        try {
            //Test forcing invaldi action to the handler
            //if error or resolve normally without reaching custom action handler, we safe
            const test = this.actionSwitch_resolve({ typeID: id });
            if (oldF)
                this.registryFile.customActionLoader.load(id, oldF);
            else
                this.registryFile.customActionLoader.delete(id);
            return true;
        }
        catch (e) {
            if (oldF)
                this.registryFile.customActionLoader.load(id, oldF);
            else
                this.registryFile.customActionLoader.delete(id);
            return !didCustomHandlerTriggered;
        }
    }
    actionSwitch_resolve(a) {
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if (typeof a.typeID !== "number")
            return [new errors_1.unregisteredAction(a)];
        switch (a.typeID) {
            case actionRegistry_1.default.a_null:
                return;
            case actionRegistry_1.default.error:
                this.resolveError(a);
                break; //break is intentional to access the default case
            case actionRegistry_1.default.a_turn_start:
                return; //turn start
            case actionRegistry_1.default.a_turn_end:
                {
                    //turn end
                    //merge statusEffects
                    this.zoneHandler.forEach(1, (c => {
                        c.mergeStatusEffect();
                    }));
                    if (a.flatAttr().doIncreaseTurnCount) {
                        return [
                            actionGenrator_1.actionConstructorRegistry.a_increase_turn_count(actionGenrator_1.actionFormRegistry.system())
                        ];
                    }
                    return;
                }
                ;
            case actionRegistry_1.default.a_turn_reset:
                return this.zoneHandler.handleTurnReset(this, a);
            //note : may move the resolution of 6, 7, 8 to zone/system
            case actionRegistry_1.default.a_increase_turn_count: {
                this.turnCount++;
                return;
            }
            case actionRegistry_1.default.a_set_threat_level: {
                this.threatLevel = a.flatAttr().newThreatLevel;
                if (this.threatLevel > this.maxThreatLevel) {
                    this.threatLevel = this.maxThreatLevel;
                    return [
                        actionGenrator_1.actionConstructorRegistry.a_do_threat_burn(actionGenrator_1.actionFormRegistry.system())
                    ];
                }
                return;
            }
            case actionRegistry_1.default.a_do_threat_burn: {
                return this.zoneHandler.system.map((i, index) => i.doThreatBurn(this, this.player_stat[index])).reduce((res, ele) => res.concat(ele));
            }
            case actionRegistry_1.default.a_force_end_game: {
                //end the game
                //clear the tree
                this.actionTree.clear();
                this.suspensionReason = systemRegistry_1.suspensionReason.game_finished;
                //am uhh not sure how to implememt this shit yet
                //i think this is fine? for now?
                this.suspend(this.actionTree.root.id);
                return;
            }
            case actionRegistry_1.default.a_activate_effect_internal:
            case actionRegistry_1.default.a_activate_effect:
                // 5 and 101 resolves the same, just has different control flow
                return this.zoneHandler.handleEffectActivation(this, a);
            case actionRegistry_1.default.a_pos_change_force:
            case actionRegistry_1.default.a_pos_change:
                return this.zoneHandler.handlePosChange(this, a);
            case actionRegistry_1.default.a_draw:
                return this.zoneHandler.handleDraw(this, a);
            case actionRegistry_1.default.a_shuffle:
                return this.zoneHandler.handleShuffle(this, a);
            case actionRegistry_1.default.a_execute:
                return this.zoneHandler.handleExecute(this, a);
            case actionRegistry_1.default.a_reprogram_start: {
                //to be implemented                
                //note to future me
                //make some kinda input_interface object
                //plug it in here
                return;
            }
            case actionRegistry_1.default.a_reprogram_end: {
                //to be implemented                
                return;
            }
            case actionRegistry_1.default.a_add_status_effect: {
                let s = a.flatAttr().typeID;
                let eff = this.registryFile.effectLoader.getEffect(s, this.setting);
                if (!eff || !(eff instanceof e_status_1.StatusEffect_base))
                    return [
                        new errors_1.cannotLoad(s, "statusEffect")
                    ];
                return this.zoneHandler.handleAddStatusEffect(this, a, eff);
            }
            case actionRegistry_1.default.a_remove_status_effect:
                return this.zoneHandler.handleRemoveStatusEffect(this, a);
            case actionRegistry_1.default.a_activate_effect_subtype:
                return this.zoneHandler.handleActivateEffectSubtypeFunc(this, a);
            case actionRegistry_1.default.a_modify_action: {
                let target = a.targets[0].action;
                let modifyObj = a.flatAttr();
                Object.entries(modifyObj).forEach(([key, val]) => {
                    if (key !== "type")
                        target.modifyAttr(key, val);
                });
                return;
            }
            case actionRegistry_1.default.a_reset_card:
                return this.zoneHandler.handleCardReset(this, a);
            case actionRegistry_1.default.a_replace_action:
            case actionRegistry_1.default.a_negate_action: return; //tecnically not possible
            case actionRegistry_1.default.a_clear_all_status_effect:
                return this.zoneHandler.handleClearAllStatusEffect(this, a);
            case actionRegistry_1.default.a_reset_effect:
                return this.zoneHandler.handleEffectReset(this, a);
            case actionRegistry_1.default.a_enable_card:
                return this.zoneHandler.handleCardStatus(this, a);
            case actionRegistry_1.default.a_disable_card:
                return this.zoneHandler.handleCardStatus(this, a);
            case actionRegistry_1.default.a_attack:
                return this.zoneHandler.handleAttack(this, a);
            case actionRegistry_1.default.a_deal_damage_internal:
            case actionRegistry_1.default.a_deal_damage_card:
                return this.zoneHandler.handleDealDamage_1(this, a);
            case actionRegistry_1.default.a_deal_damage_position:
                return this.zoneHandler.handleDealDamage_2(this, a);
            case actionRegistry_1.default.a_deal_heart_damage:
                let pid = a.targets[0].id;
                let dmg = a.flatAttr().dmg;
                if (this.player_stat[pid])
                    this.player_stat[pid].heart -= dmg;
                return;
            case actionRegistry_1.default.a_decompile:
            case actionRegistry_1.default.a_destroy:
                return this.zoneHandler.handleSendToTop(this, a, zoneRegistry_1.zoneRegistry.z_grave);
            case actionRegistry_1.default.a_void:
                return this.zoneHandler.handleSendToTop(this, a, zoneRegistry_1.zoneRegistry.z_void);
            case actionRegistry_1.default.a_zone_interact:
                return this.zoneHandler.handleZoneInteract(a.targets[0].zone, this, a);
            //TODO : add the missing actions
            default: {
                //only should reach here iff effect is unregistered
                //technically this is unreachable code but who knows
                //let unhandledID = a.typeID //if this is never, we checked every cases
                //new note
                //mods may emit new undefined actions
                //go to zone handler to fix this shit
                // console.log("Unhandle case reached, ", a.typeID)
                return this.registryFile.customActionLoader.handle(a.typeID, a, this);
            }
        }
    }
    start() {
        this.renderer.turnStart(this.toLocalized(), this.processTurn.bind(this));
    }
    processTurn(param) {
        if (!param) {
            console.log("finish processing turn");
            return true;
        }
        let n;
        if (param instanceof node_1.default) {
            n = param;
        }
        else {
            this.restartTurn(param);
            this.phaseIdx = 1;
            n = this.actionTree.getNext();
            if (!n)
                return true;
            this.suspend(n.id);
            this.suspensionReason = false;
            this.renderer.gameStart(this.toLocalized(), this.continue.bind(this));
            return false;
        }
        // while(n){
        let doGetNewNode = this.process(n);
        if (this.suspendID !== -1) {
            if (!this.curr_input_obj)
                throw Error("Somehow suspended but dont want to input");
            this.suspend(n.id);
            this.suspensionReason = false;
            let inputArr;
            const input = this.curr_input_obj.requester.next();
            if (input[1])
                inputArr = input[1];
            else
                inputArr = this.getAllInputs(input[0], true);
            this.renderer.requestInput(inputArr, this.phaseIdx, this.toLocalized(), n.data, this.continue.bind(this));
            return false;
        }
        ;
        const oldAction = n.data;
        if (doGetNewNode)
            n = this.actionTree.getNext();
        if (!n)
            return true;
        this.suspend(n.id);
        this.suspensionReason = false;
        this.renderer.update(this.phaseIdx, this.toLocalized(), oldAction, this.continue.bind(this));
        return false;
        // }
    }
    process(n) {
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
        switch (this.phaseIdx) {
            case systemRegistry_1.TurnPhase.declare: {
                //declare step
                this.fullLog.push({
                    currentPhase: 1,
                    currentAction: n.data
                });
                if (n.id === this.processStack.at(-1)) {
                    this.phaseIdx = systemRegistry_1.TurnPhase.resolve;
                    return this.process(n);
                }
                // console.log("declare action: " + n.data.type)
                this.phaseIdx = systemRegistry_1.TurnPhase.input;
                return false;
            }
            case systemRegistry_1.TurnPhase.input: {
                //handle input
                this.fullLog.push({
                    currentPhase: 2,
                    currentAction: n.data
                });
                this.phaseIdx = systemRegistry_1.TurnPhase.chain;
                if (n.data.is("a_get_input")) {
                    return this.inputHandler(n.data, n);
                }
                return false;
            }
            case systemRegistry_1.TurnPhase.chain: {
                //chain step
                let [actionArr, logInfo] = this.zoneHandler.respond(this, n.data, !n.data.canBeChainedTo);
                this.fullLog.push({
                    currentPhase: 3,
                    currentAction: n.data,
                    responses: Object.fromEntries(logInfo)
                });
                const forcedActions = actionArr.filter(a => a.isCost);
                //special handled
                const isNegated = actionArr.some(i => i.id === actionRegistry_1.default.a_negate_action);
                let gotoComplete = isNegated;
                let replacements = actionArr.filter(a => a.is("a_replace_action")).map(i => i.targets[0].action);
                if (replacements.length) {
                    gotoComplete = true;
                    actionArr = forcedActions.concat(replacements);
                }
                if (isNegated)
                    actionArr = forcedActions;
                actionArr.forEach(i => {
                    if (i.isChain)
                        this.actionTree.attach_node(n, i);
                    else
                        this.actionTree.attach_node(this.actionTree.root, i);
                });
                this.phaseIdx = (gotoComplete) ? systemRegistry_1.TurnPhase.complete : systemRegistry_1.TurnPhase.recur;
                return false;
            }
            case systemRegistry_1.TurnPhase.recur: {
                //recur step
                //recur until the last element of processStack is reached
                //then that element is removed
                this.fullLog.push({
                    currentPhase: 4,
                    currentAction: n.data
                });
                this.processStack.push(n.id);
                this.phaseIdx = 1;
                return true;
            }
            case systemRegistry_1.TurnPhase.resolve: {
                //resolve
                this.processStack.pop();
                let x = this.actionSwitch_resolve(n.data);
                if (x) {
                    x.forEach(i => {
                        if (i.isChain)
                            this.actionTree.attachArbitrary(n.id, i);
                        else
                            this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                    });
                }
                this.fullLog.push({
                    currentPhase: 5,
                    currentAction: n.data,
                    resolvedResult: (x) ? x : []
                });
                // console.log("finish resolving acion: " + n.data.type)
                if (n.data.canBeTriggeredTo)
                    this.phaseIdx = systemRegistry_1.TurnPhase.trigger;
                else
                    this.phaseIdx = systemRegistry_1.TurnPhase.complete; //6 is skipped
                return false;
            }
            case systemRegistry_1.TurnPhase.trigger: {
                //trigger
                let [actionArr, logInfo] = this.zoneHandler.respond(this, n.data, !n.data.canBeTriggeredTo);
                this.fullLog.push({
                    currentPhase: 6,
                    currentAction: n.data,
                    responses: Object.fromEntries(logInfo)
                });
                actionArr = actionArr.map(i => {
                    if (i.is("a_replace_action"))
                        return i.targets[0].action;
                    return i;
                });
                actionArr.forEach(i => {
                    if (i.isChain)
                        this.actionTree.attach_node(n, i);
                    else
                        this.actionTree.attach_node(this.actionTree.root, i);
                });
                this.phaseIdx = systemRegistry_1.TurnPhase.complete;
                return false;
            }
            case systemRegistry_1.TurnPhase.complete: {
                //complete 
                this.fullLog.push({
                    currentPhase: 7,
                    currentAction: n.data
                });
                n.markComplete();
                this.phaseIdx = systemRegistry_1.TurnPhase.declare;
                return true;
            }
        }
        console.log("accessed invalid phaseIdx: " + this.phaseIdx);
        return false;
    }
    suspend(nid) {
        this.suspendID = nid;
    }
    verifyInput(i1, i2) {
        if (i1.type !== i2.type)
            return false;
        switch (i1.type) {
            case systemRegistry_1.inputType.boolean: return i2.data === i1.data;
            case systemRegistry_1.inputType.number: return i2.data === i1.data;
            case systemRegistry_1.inputType.string: return i2.data === i1.data;
            case systemRegistry_1.inputType.card: return i1.data instanceof card_1.default && i2.data instanceof card_1.default && i2.data.is(i1.data);
            case systemRegistry_1.inputType.effect: return i1.data instanceof effect_1.default && i2.data instanceof effect_1.default && i2.data.is(i1.data);
            case systemRegistry_1.inputType.effectSubtype: return i1.data instanceof effectSubtype_1.default && i2.data instanceof effectSubtype_1.default && i2.data.is(i1.data);
            case systemRegistry_1.inputType.player: return typeof i1.data.id === i2.data.id;
            case systemRegistry_1.inputType.position: return i2.data instanceof position_1.default && i1.data.is(i2.data);
            case systemRegistry_1.inputType.zone: return i2.data instanceof zone_1.default && i1.data.is(i2.data);
        }
        return false;
    }
    inputHandler(a, n) {
        console.log("processing input");
        this.curr_input_obj = a.flatAttr();
        let requester = this.curr_input_obj.requester;
        const applicator = this.curr_input_obj.applicator;
        if (!requester.hasInput()) {
            console.log("blank input, skipped, logging fullObject: ", this.curr_input_obj);
            this.phaseIdx = systemRegistry_1.TurnPhase.complete;
            return false;
        }
        let final = undefined; //assign to this to NOT suspend
        if (requester.isFinalized()) {
            final = applicator.apply(requester);
        }
        else {
            let [i_type, i_set] = requester.next();
            //returns if break of not
            function proceed(t, input) {
                requester = requester.apply(t, input);
                if (requester.isFinalized()) {
                    return applicator.apply(requester);
                }
                //fail safe check
                if (!requester.hasInput()) {
                    t.curr_input_obj = undefined;
                    return [];
                }
                ;
                [i_type, i_set] = requester.next();
            }
            switch (this.setting.auto_input) {
                case settings_1.auto_input_option.first: {
                    while (true) {
                        let input = i_set ? i_set[0] : this.getAllInputs(i_type, true)[0];
                        const k = proceed(this, input);
                        if (k !== undefined) {
                            final = k;
                            break;
                        }
                        ;
                    }
                    break;
                }
                case settings_1.auto_input_option.last: {
                    while (true) {
                        let input = i_set ? i_set.at(-1) : this.getAllInputs(i_type, true).at(-1);
                        const k = proceed(this, input);
                        if (k !== undefined) {
                            final = k;
                            break;
                        }
                        ;
                    }
                    break;
                }
                case settings_1.auto_input_option.random: {
                    while (true) {
                        let input = i_set ? Utils.getRandomElement(i_set) : Utils.getRandomElement(this.getAllInputs(i_type, true));
                        const k = proceed(this, input);
                        if (k !== undefined) {
                            final = k;
                            break;
                        }
                        ;
                    }
                }
                case settings_1.auto_input_option.default: {
                    while (true) {
                        //Because of this condition, inputRequester_multiple is NOT applied automatically
                        //i.e input wants 2 zones, we have 2 zones, but we aint apply any cause its not 1
                        //this is...technically intended
                        //for now, since idk how to fix this
                        //inputs can merge afterall
                        if (!i_set || i_set.length !== 1)
                            break;
                        let input = i_set[0];
                        const k = proceed(this, input);
                        if (k !== undefined) {
                            final = k;
                            break;
                        }
                        ;
                    }
                }
            }
        }
        if (final === undefined) {
            console.log("suspending waiting for inputs");
            this.suspensionReason = systemRegistry_1.suspensionReason.taking_input;
            this.suspend(a.id);
            return false;
        }
        else {
            console.log("inputs getting skipped, trying to apply");
            this.suspensionReason = false;
            this.curr_input_obj = undefined;
            this.actionTree.attach_node(n, ...final);
            n.markComplete();
            this.phaseIdx = systemRegistry_1.TurnPhase.declare; //unwind back to declare;
            this.suspendID = -1;
            return true;
        }
    }
    getAllInputs(t, force, count) {
        force = Number(force);
        switch (t) {
            case systemRegistry_1.inputType.boolean: return force ? [{
                    type: systemRegistry_1.inputType.boolean,
                    data: Utils.rng(1, 0, true) === 1
                }] : undefined;
            case systemRegistry_1.inputType.number: return force ? [{
                    type: systemRegistry_1.inputType.number,
                    data: Utils.rng(100, 0, true)
                }] : undefined;
            case systemRegistry_1.inputType.string: return force ? [{
                    type: systemRegistry_1.inputType.string,
                    data: Utils.generateID()
                }] : undefined;
            case systemRegistry_1.inputType.zone: return this.map(0, z => actionInputGenerator_1.inputFormRegistry.zone(this, z));
            case systemRegistry_1.inputType.card: return this.map(1, c => actionInputGenerator_1.inputFormRegistry.card(this, c));
            case systemRegistry_1.inputType.player: return this.player_stat.map((_, pid) => actionInputGenerator_1.inputFormRegistry.player(this, pid));
            case systemRegistry_1.inputType.position: {
                let res = [];
                this.forEach(0, z => res.push(...z.getAllPos()));
                return res.map(pos => actionInputGenerator_1.inputFormRegistry.pos(this, pos));
            }
            case systemRegistry_1.inputType.effect: return this.map(2, (e, zid, cid) => {
                const zone = this.zoneArr[zid];
                const c = zone.cardArr[cid];
                return actionInputGenerator_1.inputFormRegistry.effect(this, c, e);
            });
            case systemRegistry_1.inputType.effectSubtype: return this.map(3, (st, zid, cid, eid) => {
                const zone = this.zoneArr[zid];
                const c = zone.cardArr[cid];
                const e = c.totalEffects[eid];
                return actionInputGenerator_1.inputFormRegistry.subtype(this, c, e, st);
            });
        }
        throw new Error(`get all input failed, type = ${t}`);
    }
    generateSignature(a) {
        if (a == undefined)
            return Utils.generateID();
        switch (a.type) {
            case systemRegistry_1.inputType.number:
            case systemRegistry_1.inputType.string:
            case systemRegistry_1.inputType.boolean: return String(a.data);
            case systemRegistry_1.inputType.zone: return String(a.data.zone.id);
            case systemRegistry_1.inputType.card: return a.data.card.id;
            case systemRegistry_1.inputType.effect: return a.data.eff.id;
            case systemRegistry_1.inputType.effectSubtype: return a.data.eff.id + a.data.subtype.dataID;
            case systemRegistry_1.inputType.player: return String(a.data.id);
            case systemRegistry_1.inputType.position: return a.data.pos.toString();
        }
    }
    continue(input) {
        let n = this.actionTree.getNode(this.suspendID);
        if (this.suspensionReason === systemRegistry_1.suspensionReason.taking_input && n.data.is("a_get_input")) {
            if (this.curr_input_obj === undefined || input === undefined) {
                throw new Error("Cannot unsuspend, not enough input taken");
            }
            const requester = this.curr_input_obj.requester;
            const applicator = this.curr_input_obj.applicator;
            if (!requester.hasInput()) {
                throw new Error("Cannot unsuspend, invalid input object");
            }
            let [i_type, i_set] = requester.next();
            //check validity of input
            //naive? check
            if (i_set !== undefined) { //undefined is accept all    
                const filter_set = i_set.filter(i => i.type === input.type);
                if (!filter_set.length) {
                    throw new Error("input not in valid set, wrong type");
                }
                const flag = filter_set.some(i => {
                    this.verifyInput(i, input);
                });
                if (!flag) {
                    throw new Error("input not in valid set, correct type but wrong id");
                }
            }
            else if (input.type !== i_type) {
                throw new Error(`input type is incorrect, received : ${input.type}, wanted : ${i_type}`);
            }
            let res = this.inputHandler(n.data, n);
            //complete
            if (res)
                return this.processTurn();
            else {
                console.log("Input taken, but unfinished, please continue");
                let inputArr;
                const input = requester.next();
                if (input[1])
                    inputArr = input[1];
                else
                    inputArr = this.getAllInputs(input[0], true);
                this.renderer.requestInput(inputArr, this.phaseIdx, this.toLocalized(), n.data, this.continue.bind(this));
                return false;
            }
        }
        else if (this.suspensionReason !== false)
            throw new Error(`Cannot unsuspend when reason is not resolved`);
        this.suspendID = -1;
        return this.processTurn(n);
    }
    //Parsing log API
    //the weird reduce thiny is equivalent to .flat(2), done since .flat is not available for es6
    getActivatedEffectIDs() {
        return this.fullLog.map(i => {
            if (i.currentPhase !== 3 && i.currentPhase !== 6)
                return [];
            return Object.values(i.responses).reduce((accu, ele) => accu.concat(ele));
        }).reduce((accu, ele) => accu.concat(ele));
    }
    getActivatedCardIDs() {
        return this.fullLog.map(i => {
            if (i.currentPhase !== 3 && i.currentPhase !== 6)
                return [];
            return Object.values(i.responses).reduce((accu, ele) => accu.concat(ele));
        }).reduce((accu, ele) => accu.concat(ele));
    }
    getResolvedActions() {
        return this.fullLog.map(i => {
            if (i.currentPhase !== 5)
                return undefined;
            return i.currentAction;
        }).filter(i => i !== undefined);
    }
    //more API ported from dry_system
    getCardWithID(cid) {
        return this.zoneHandler.getCardWithID(cid);
    }
    getCardWithDataID(cid) {
        return this.zoneHandler.filter(1, c => c.id === cid);
    }
    getZoneWithID(zid) {
        return this.zoneHandler.getZoneWithID(zid);
    }
    getZoneOf(obj) {
        return this.zoneHandler.getZoneWithID(obj.pos.zoneID);
    }
    get zoneArr() { return this.zoneHandler.zoneArr; }
    get resolutionLog() {
        return this.fullLog.filter(i => i.currentPhase === systemRegistry_1.TurnPhase.resolve);
    }
    get chainLog() {
        return this.fullLog.filter(i => i.currentPhase === systemRegistry_1.TurnPhase.chain);
    }
    get triggerLog() {
        return this.fullLog.filter(i => i.currentPhase === systemRegistry_1.TurnPhase.trigger);
    }
    get completionLog() {
        return this.fullLog.filter(i => i.currentPhase === systemRegistry_1.TurnPhase.complete);
    }
    hasActionCompleted(a, startSearchingIndex = 0) {
        for (let i = startSearchingIndex; i < this.fullLog.length; i++) {
            if (this.fullLog[i].currentPhase === systemRegistry_1.TurnPhase.complete) {
                if (this.fullLog[i].currentAction.id === a.id)
                    return true;
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
    findSpecificChainOfAction_resolve(typeArr) {
        if (!typeArr.length)
            return [];
        let res = [];
        let candidateResolveLog = this.resolutionLog.find(k => k.currentAction.type === typeArr[0]);
        if (!candidateResolveLog)
            return undefined;
        res.push(candidateResolveLog.currentAction);
        if (typeArr.length === 1)
            return res;
        for (let i = 1; i < typeArr.length; i++) {
            let matchedNext = candidateResolveLog.resolvedResult.find(k => k.type === typeArr[i]);
            if (!matchedNext)
                return undefined;
            candidateResolveLog = this.resolutionLog.find(k => k.currentAction.id === matchedNext.id);
            if (!candidateResolveLog)
                return undefined;
            res.push(candidateResolveLog.currentAction);
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
    count(condition, stopEarlyCount) {
        let c = 0;
        if (stopEarlyCount === undefined)
            stopEarlyCount = Infinity;
        for (let i = 0; i < this.fullLog.length; i++) {
            c += Utils.toSafeNumber(condition(this.fullLog[i]), true);
            if (c >= stopEarlyCount)
                return c;
        }
        return c;
    }
    getAllZonesOfPlayer(pid) {
        if (pid < 0)
            return {};
        let res = {};
        this.zoneArr.forEach(val => {
            if (val.playerIndex === pid)
                val.types.forEach(i => res[i] ? res[i].push(val) : res[i] = [val]);
        });
        return res;
    }
    getPIDof(c) {
        const z = this.getZoneOf(c);
        if (!z)
            return NaN;
        return z.playerIndex;
    }
    is(c, type) {
        const z = this.getZoneWithID(c.pos.zoneID);
        if (!z)
            return false;
        return z.is(type);
    }
    get isInTriggerPhase() { return this.phaseIdx === systemRegistry_1.TurnPhase.trigger; }
    get isInChainPhase() { return this.phaseIdx === systemRegistry_1.TurnPhase.chain; }
    requestInput_zone_default(c, zType, fz) {
        return this.posCheck(c) ? new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.zone, this.getAllInputs(systemRegistry_1.inputType.zone, true).filter(i => i.is(zType) && i.of(this.getZoneOf(c)) && (!fz || fz(this, i.data.zone)))) :
            new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.zone, this.getAllInputs(systemRegistry_1.inputType.zone, true).filter(i => i.is(zType) && i.of(c) && (!fz || fz(this, i.data.zone))));
    }
    requestInput_card_default(c, zType, fz, fc) {
        return this.requestInput_zone_default(c, zType, fz).extend(this, (s, prev) => {
            const z = prev[0].data.zone;
            return z.cardArr_filtered.filter(c => (!fc || fc(s, c, z))).map(c => actionInputGenerator_1.inputFormRegistry.card(s, c));
        });
    }
    requestInput_effect_default(c, zType, getRealEffects, getStatusEffects, fz, fc, feff) {
        return this.requestInput_card_default(c, zType, fz, fc).extend(this, (s, prev) => {
            const z = prev[0].data.zone;
            const c = prev[1].data.card;
            let eArr = (getRealEffects ? c.effects : []).map(i => i);
            if (getStatusEffects)
                eArr.push(...c.statusEffects);
            return eArr.filter(e => (!feff || feff(s, e, c, z))).map(e => actionInputGenerator_1.inputFormRegistry.effect(s, c, e));
        });
    }
    requestInput_effectSubtype_default(c, zType, getRealEffects, getStatusEffects, fz, fc, feff, fst) {
        return this.requestInput_effect_default(c, zType, getRealEffects, getStatusEffects, fz, fc, feff).extend(this, (s, prev) => {
            const z = prev[0].data.zone;
            const c = prev[2].data.card;
            const e = prev[2].data.eff;
            return e.subTypes.filter(st => (!fst || fst(s, st, e, c, z))).map(st => actionInputGenerator_1.inputFormRegistry.subtype(s, c, e, st));
        });
    }
    requestInput_pos_default(c, zType, getFreeOnly, fz, fpos) {
        return this.requestInput_zone_default(c, zType, fz).extend(this, (s, prev) => {
            const z = prev[0].data.zone;
            const pArr = getFreeOnly ? (z.getEmptyPosArr ? z.getEmptyPosArr() : [z.lastPos]) : z.getAllPos();
            return pArr.filter(pos => (!fpos || fpos(s, pos, z))).map(pos => actionInputGenerator_1.inputFormRegistry.pos(s, pos));
        });
    }
    getWouldBeAttackTarget(a) {
        return this.zoneHandler.getWouldBeAttackTarget(this, a);
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
    posCheck(a) {
        return a.pos instanceof position_1.default;
    }
    isNotActionArr(gen) {
        if (!Array.isArray(gen))
            return false;
        return gen.some(i => !(i instanceof actionGenrator_1.Action_class));
    }
    isPlayAction(a) {
        if (!(a.is("a_pos_change") || a.is("a_pos_change_force")))
            return false;
        const zoneTo = this.getZoneWithID(a.targets[1].pos.zoneID);
        const cond1 = zoneTo ? zoneTo.is(zoneRegistry_1.zoneRegistry.z_field) : false;
        const cond2 = a.targets[0].card.isFrom(this, zoneRegistry_1.zoneRegistry.z_hand);
        return cond1 && cond2;
    }
    toSerialized() {
        return new Gamestate_1.Serialized_system(this.player_stat.map(p => new Gamestate_1.Serialized_player(p.playerType, p.heart, p.operator, p.deck)), this.zoneArr.map(z => new Gamestate_1.Serialized_zone(z.classID, z.dataID, z.cardArr.map(c => c ? new Gamestate_1.Serialized_card(c.dataID, c.variants, c.effects.map(e => new Gamestate_1.Serialized_effect(e.dataID, e.type.dataID, e.subTypes.map(st => st.dataID), e.displayID, e.attr)), c.statusEffects.map(e => new Gamestate_1.Serialized_effect(e.dataID, e.type.dataID, e.subTypes.map(st => st.dataID), e.displayID, e.attr)), c.partitionInfo, c.attr) : c), z.types.slice(), z.attr)), this.turnCount, this.waveCount);
    }
    toLocalized(mode) {
        return this.localizer.localizeSystem(this, mode);
    }
}
exports.default = queenSystem;
