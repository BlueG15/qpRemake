//zones handler is handler of all the zones
//and importantly, converter from action to zone func calls

import __Zone__, { Zone_T } from "./zone";
import Effect from "../../core/types/gameComponents/effect";
import Card from "../../core/types/gameComponents/card";
import type EffectSubtype from "../effectSubtypes/effectSubtype";

import System from "../../defaultImplementation/zones/system";
import res from "../../core/types/generics/universalResponse";
import Deck from "../../defaultImplementation/zones/deck";
import Storage from "../../defaultImplementation/zones/storage";
import Grave from "../../defaultImplementation/zones/grave";
import Hand from "../../defaultImplementation/zones/hand";
import Field from "../../defaultImplementation/zones/field";
import Ability from "../../defaultImplementation/zones/ability";
import Void from "../../defaultImplementation/zones/void";
// import type dry_card from "../dryData/dry_card";
import zoneLoader from "../_queenSystem/loader/loader_zone";
import type { Setting } from "../../core/types/gameComponents/settings";

import DefaultZoneData, { playerTypeID, zoneData } from "../../core/registry/zone";
import { zoneRegistry, zoneName, zoneID } from "../../core/registry/zone";

import { StatusEffect_base } from "../defaultImplementation/effects/e_status";

import { cannotLoad, cardNotExist, effectNotExist, incorrectActiontype, zoneAttrConflict, zoneNotExist } from "../../defaultImplementation/errors";
import type registryHandler from "../_queenSystem/handler/registryHandler";
import Position from "../positions";
import { Action, ActionBase, actionAttrType, ActionGenerator, Identification, TargetType } from "../../core/registry/action";
import { type identificationInfo_card, type identificationInfo, type identificationInfo_effect, type identificationInfo_subtype, identificationType } from "../data/systemRegistry";
import type Error from "../../defaultImplementation/errors";
import type HandlerLoader from "../loader/loader_action";
import { damageType } from "../data/systemRegistry";
import type { dry_system, dry_card, dry_zone, inputData, player_stat, logInfoResolve, logInfoHasResponse } from "../data/systemRegistry";
import { inputApplicator, InputRequester } from "../../system-components/inputs/actionInputGenerator";
import type QueenSystem from "../_queenSystem/queenSystem";
import Drop from "../../defaultImplementation/zones/drop";
import { SerializedLayout, SerializedTransform } from "../../core/types/serializedGameComponents/Gamestate";

type ZoneContructor = new (...p : ConstructorParameters<typeof __Zone__>) => Zone_T

class zoneHandler {
    zoneArr : ReadonlyArray<__Zone__> = []
    layout? : Layout
    private loader : zoneLoader
    constructor(regs : registryHandler){this.loader = regs.zoneLoader}
    
    loadEffects(s : Setting, players : player_stat[]){
        //load zones
        this.loader.load(zoneRegistry.z_system,  DefaultZoneData[zoneRegistry.z_system],   System);
        this.loader.load(zoneRegistry.z_drop,    DefaultZoneData[zoneRegistry.z_drop],     Drop)
        this.loader.load(zoneRegistry.z_void,    DefaultZoneData[zoneRegistry.z_void],     Void);
        this.loader.load(zoneRegistry.z_deck,    DefaultZoneData[zoneRegistry.z_deck],     Deck);
        this.loader.load(zoneRegistry.z_hand,    DefaultZoneData[zoneRegistry.z_hand],     Hand);
        this.loader.load(zoneRegistry.z_storage, DefaultZoneData[zoneRegistry.z_storage],  Storage);
        this.loader.load(zoneRegistry.z_field,   DefaultZoneData[zoneRegistry.z_field],    Field);
        this.loader.load(zoneRegistry.z_grave,   DefaultZoneData[zoneRegistry.z_grave],    Grave);
        this.loader.load(zoneRegistry.z_ability, DefaultZoneData[zoneRegistry.z_ability],  Ability);

        // this.maxPlayerIndex = s.players.length

        Object.entries(DefaultZoneData).forEach(([zkey, zdata], index) => {
            if(!zdata.instancedFor.length){
                let  zinstance = (this.loader.getZone(Number(zkey), s) as __Zone__)
                Utils.insertionSort(
                    this.zoneArr as __Zone__[], 
                    zinstance,
                    this.sortFunc
                )
            } else {
                players.forEach((p, pindex) => {
                    let zinstance = (this.loader.getZone(Number(zkey), s, p.playerType, pindex) as __Zone__)
                    if(zdata.instancedFor.includes(p.playerType)){
                        Utils.insertionSort(
                            this.zoneArr as __Zone__[],
                            zinstance,
                            this.sortFunc
                        )
                    }
                })
            }
        })

        this.correctID()
    }

    loadActionHandlers(s : HandlerLoader){
        //effect
        s.load("a_internal_try_activate", this.handleInternalActivate.bind(this))
        s.load("a_activate_effect", this.handleEffectActivation.bind(this))
        s.load("a_reset_effect", this.handleEffectReset.bind(this))

        //zone
        s.load("a_shuffle", this.handleShuffle.bind(this))
        s.load("a_draw", this.handleDraw.bind(this))
        s.load("a_zone_interact", this.handleZoneInteract.bind(this))

        //card
        s.load("a_attack", this.handleAttack.bind(this))
        s.load("a_move", this.handleMove.bind(this))
        s.load("a_destroy", this.handleSendToTop_grave.bind(this))
        s.load("a_decompile", this.handleSendToTop_grave.bind(this))
        s.load("a_void", this.handleSendToTop_void.bind(this))

        s.load("a_deal_damage_card", this.handleDealDamageCard.bind(this))
        s.load("a_deal_damage_ahead", this.handleAttack.bind(this))
        s.load("a_execute", this.handleExecute.bind(this))
        s.load("a_add_status_effect", this.handleAddStatusEffect.bind(this))
        s.load("a_remove_status_effect", this.handleRemoveStatusEffect.bind(this))
        s.load("a_clear_all_status_effect", this.handleRemoveAllStatusEffect.bind(this))
        s.load("a_remove_all_effects", this.handleRemoveAllEffects.bind(this))
        s.load("a_reset_card", this.handleCardReset.bind(this))

        //misc
        s.load("a_turn_reset", this.handleTurnReset.bind(this))
    }

    applySerializedLayout(oppositeZones : number[][], transforms : Record<number, SerializedTransform>){
        this.layout = Layout.fromSerialized(this.zoneArr, oppositeZones, transforms)
    }
    
    applyLayout(L : Layout){
        L.load(this.fields)
        this.layout = L
    }

    toGlobal(pos : Position){
        if(!this.layout) return pos;
        return this.layout.localToGlobal(pos);
    }

    private sortFunc(a : zoneData | __Zone__, b : zoneData | __Zone__) : number{
        const x = a.priority, y = b.priority;
        if(Object.is(x, y)) return 0;
        const rank = (a : number) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }

    private correctID(){
        for(let i = 0; i < this.zoneArr.length; i++) this.zoneArr[i].id = i;
    }

    add(zclassID : number, s : Setting, ptype? : playerTypeID | -1, pid? : number, zDataID? : number){
        let instance = this.loader.getZone(zclassID, s, ptype, pid, zDataID);
        if(!instance) throw new Error(`Fail to create instance of zone ${zclassID}`);
        Utils.insertionSort(this.zoneArr as __Zone__[], instance, this.sortFunc);
        this.correctID()
    }

    load_and_add_noPlayer(key : number, s : Setting, data : zoneData, c : ZoneContructor) : void; //add both
    load_and_add_noPlayer(key : number, s : Setting, _class : ZoneContructor, dataID? : number) : void; //add class only, no ID use key
    load_and_add_noPlayer(key : number, s : Setting, data : zoneData, classID? : number) : void; //add data only, no ID use key
    load_and_add_noPlayer(key : number, s : Setting, param3 : zoneData | ZoneContructor, param4? : ZoneContructor | number){
        //case 1, add both
        if(typeof param3 === "object" && typeof param4 === "function"){
            this.loader.load(key, param3, param4);
            this.add(key, s, -1, -1, key);
            return;
        } 
        if(!param4) param4 = key;
        //case 2, add class only
        if(typeof param3 === "function"){
            this.loader.load(key, undefined, param3);
            this.add(key, s, -1, -1, param4 as number)
            return;
        }
        //case 3, add data only
        if(typeof param3 === "object"){
            this.loader.load(key, param3);
            this.add(key, s, -1, -1, param4 as number)
            return;
        }
        //technically unreachable code
        throw new Error("Undefined behavior: load_and_add, zoneHandler");
    }

    addNewPlayerInstancedZones(s : Setting, ptype : playerTypeID, pid : number = -1){
        let insertNew : __Zone__[] = []
        this.zoneArr.forEach(i => {
            let data = this.loader.getData(i.dataID)
            if(data && data.instancedFor.includes(ptype)){
                let z = this.loader.getZone(i.classID, s, ptype, pid, i.dataID)
                if(z) insertNew.push(z)
            }
        })

        insertNew.forEach(i => Utils.insertionSort(this.zoneArr as __Zone__[], i, this.sortFunc))
        this.correctID()
    }

    //operations

    private genericHandler_card<
        M extends [identificationInfo_card | identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : ActionBase<M>) : [true, Error[]] | [false, Card] {
        let target = a.targets[0]
        let c : dry_card | Card | undefined = target.card
        if(!(c instanceof Card)) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }
        return [false, c as Card];
    }

    private genericHandler_effect<
        M extends [identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : ActionBase<M>) : [true, Error[]] | [false, Card, Effect] {
        let target = a.targets[0]
        let c : Card | undefined = target.card as any
        if(!(c instanceof Card)) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }
        c = c as Card

        let eff : Effect | undefined
        let eindex = c.findEffectIndex(target.eff.id)
        if( eindex < 0 ) {
            eff = this.getEffectWithID(target.eff.id);
            if(!eff) return [true, [new effectNotExist(target.eff.id, c.id)]]
        } else {
            eff = c.totalEffects[eindex]
        }
        return [false, c, eff]
    }

    private genericHandler_subtype<
        M extends [identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : ActionBase<M>) : [true, Error[]] | [false, Card, Effect, number] {
        let target = a.targets[0]
        let c = target.card as Card | undefined
        if(!c) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }

        let eff : Effect | undefined
        let eindex = c.findEffectIndex(target.eff.id)
        if( eindex < 0 ) {
            eff = this.getEffectWithID(target.eff.id);
            if(!eff) return [true, [new effectNotExist(target.eff.id, c.id)]]
        } else {
            eff = c.totalEffects[eindex]
        }

        let st = eff.getSubtypeidx(target.subtype.dataID)
        if(st < 0) return [true, [new effectNotExist(target.eff.id, c.id).add("zoneHandler", "handleActivateEffectSubtypeFunc", 326)]]

        return [false, c, eff, st]
    }

    //**Pushes if effect says it can activate, pushes a_activate_effect onto stack, ask again on resolution of a_activate_effect*/
    handleInternalActivate(s : dry_system, a : Action<"a_internal_try_activate">) : Action[] {
        const log = a.getAttr("log")
        const targetPos = a.targets[0].pos
        const z = this.zoneArr[targetPos.zoneID]
        if(!z) return [];
        const c = z.getCardByPosition(targetPos as Position)
        if(!c) return [];
        return c.totalEffects.flatMap(e => {
            if(Effect.checkCanActivate(e, c, s, a)){
                log.responses[c.id].push(e.id)
                return [ActionGenerator.a_activate_effect(s, c, e)(Identification.system())]
            } 
            return []
        })
    }

    handleActivateEffect(s : dry_system, a : Action<"a_activate_effect">){
        return Effect.tryActivate(a.targets[0].eff as Effect, a.targets[0].card, s, a)
    }

    /**
     * 
     * @param a : a pos change action, with 2 targets, a card target and a position target in index 0 and 1
     * @returns 
     */
    handleMove(s : dry_system, a : Action<"a_move">) : Action[]{
        let k1 = a.targets[0];
        let k2 = a.targets[1];

        let res : Action[] = []
        
        const pos = k2.pos as Position
        const c = k1.card as Card

        // const zFrom = this.zoneArr[c.pos.zoneID]
        // if(!zFrom || !zFrom.validatePosition(c.pos)) return [];

        const zTo = this.zoneArr[pos.zoneID]

        let temp : res

        if(pos && zTo.validatePosition(pos) && pos.zoneID === c.pos.zoneID){
            console.log("move is triggered")
            let idxTo = pos.zoneID
            temp = this.zoneArr[idxTo].move(c, pos)
            //move is prioritized
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])
        } else {
            temp = this.zoneArr[c.pos.zoneID].remove(c)
            
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])

            temp = this.zoneArr[pos.zoneID].add(c, pos)
                
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])
        }

        return res
    }

    handleDraw(s : dry_system, a : Action<"a_draw">) : Action[]{
        let zone = this.zoneArr[a.targets[0].zone.id]
        if(!zone || !(zone as any).draw) return [
            new zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
        ]

        let deck = zone as any as Deck;

        let playerindex = deck.playerIndex
        let hand = this.hands.filter(i => i.playerIndex === playerindex);

        if(hand.length !== 1) return [
            new zoneNotExist(-1).add("zoneHandler", "handleDraw", 222)
        ]

        let res = deck.draw(s, a, hand[0])
        console.log("2", a, res)
        if(res[0]) return [res[0]];
        else return res[1];
    }   

    handleShuffle(s : dry_system, a : Action<"a_shuffle">) : Action[]{
        let z = this.zoneArr[a.targets[0].zone.id]
        if(!z || !(z as any).draw) return [
            new zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
        ]
        let temp = z.shuffle(a.flatAttr().shuffleMap)
        if(temp[0]) return [temp[0]]
        return temp[1]
    }

    handleTurnReset(s : dry_system, a : Action<"a_turn_reset">) : Action[]{
        //only do field refresh
        let res : Action[] = []
        this.zoneArr.forEach(i => res.push(...i.turnReset(a)))
        return res;
    }

    handleCardReset(s : dry_system, a : Action<"a_reset_card">) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        return res[1].reset()
    }

    handleEffectReset(s : dry_system, a : Action<"a_reset_effect">) : Action[]{ 
        let res = this.genericHandler_effect(s, a);
        if(res[0]) return res[1];
        return res[2].reset()
    }

    handleEffectActivation(s : QueenSystem, a : Action<"a_activate_effect">) : Action[]{
        const {card, eff} = a.targets[0]
        const input = Effect.tryActivate(eff as Effect, card, s, a)

        if(!input) return [];
        if(!input[0]) return input[1]();
    
        return [
            ActionGenerator.a_get_input(a.cause, {
                requester : input[0],
                applicator : new inputApplicator(input[1], [], eff)
            })
        ];
    }

    handleAddStatusEffect(s : dry_system, a : Action<"a_add_status_effect">) : Action[]{
        let statusString = (a as Action<"a_add_status_effect">).flatAttr().typeID
        let eff = (s as any).registryFile.effectLoader.getEffect(s, s.setting);
        if(!eff || !(eff instanceof StatusEffect_base)) return [
            new cannotLoad(statusString, "statusEffect")
        ];

        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].addStatusEffect(eff);
        return [];
    }

    handleRemoveAllStatusEffect(s : dry_system, a : Action<"a_clear_all_status_effect">) : Action[] {
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].clearAllStatus();
        return []
    }

    handleRemoveStatusEffect(s : dry_system, a : Action<"a_remove_status_effect">) : Action[]{
        let res = this.genericHandler_effect(s, a);
        if(res[0]) return res[1];
        res[1].removeStatusEffect(res[2].id)
        return []
    }

    handleRemoveAllEffects(s : dry_system, a : Action<"a_remove_all_effects">) : Action[] {
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].effects = [];
        return []
    }

    handleCardStatus(s : dry_system, a : Action<"a_enable_card"> | Action<"a_disable_card">) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].canAct = (a.is("a_enable_card"))
        return []
    }

    getWouldBeAttackTarget(s : dry_system, c : dry_card) : [__Zone__, Card[]] | undefined {
        if(!this.layout) return;

        const zoneOFC = this.zoneArr[c.pos.zoneID]
        if(!zoneOFC) return;

        const globalP = this.layout.localToGlobal(c.pos as Position)
        const oppositeZoneID = this.layout.getOppositeZoneID(zoneOFC)
        if(oppositeZoneID === undefined) return;

        const oppositeZone = this.zoneArr[oppositeZoneID]
        return [oppositeZone, oppositeZone.cardArr_filtered.filter(c1 => this.layout!.localToGlobal(c1.pos as Position).x === globalP.x) as any]
    }

    handleAttack(s : dry_system, a : Action<"a_attack"> | Action<"a_deal_damage_ahead">) : Action[] {
        let attr = a.flatAttr()
        if(a.cause.type !== identificationType.card) return [];
        let c = a.cause.card as dry_card
        if(!c) return []

        let targets = this.getWouldBeAttackTarget(s, c);
        if(!targets) return []
        
        if(!targets[1].length){
            return [
                ActionGenerator.a_deal_heart_damage(s, targets[0].playerIndex)(a.cause, {
                    dmg : c.attr.get("atk") ?? 0
                })
            ]
        }

        return [
            ActionGenerator.a_deal_damage_card(s, targets[1][0])(a.cause, {
                dmg : (attr.dmg === undefined) ? c.attr.get("atk") ?? 0 : attr.dmg,
                dmgType : (attr.dmgType === undefined) ? damageType.physical : attr.dmgType
            })
        ]
    }

    handleDealDamageCard(s : dry_system, a : Action<"a_deal_damage_card">){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        let attr = a.flatAttr();
        res[1].hp -= attr.dmg;

        if(res[1].hp === 0){
            return [
                ActionGenerator.a_destroy(s, res[1])(Identification.system())
            ]
        }
        return []
    }

    handleExecute(s : dry_system, a : Action<"a_execute">){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        //unpacks to an attack and a send to grave

        let zoneid = res[1].pos.zoneID
        let z = this.zoneArr[zoneid]
        if(!z) return [
            new zoneNotExist(zoneid)
        ]

        let pid = z.playerIndex

        let g = this.getPlayerZone(pid, zoneRegistry.z_grave);
        if(!g || !g.length) return [
            new zoneNotExist(pid)
        ]

        return [
            ActionGenerator.a_attack(s, a.targets[0].card)(a.cause, {
                dmg : res[1].atk,
                dmgType : damageType.physical
            }),
            ActionGenerator.a_move_force(s, res[1])(g[0].top)(Identification.system()).dontchain()
        ]
    }

    handleSendToTop_grave(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_grave)
    }

    handleSendToTop_void(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_void)
    }

    handleSendToTop_deck(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_deck)
    }

    handleSendToTop(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile"> | Action<"a_void">, zid : number){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        let zoneid = res[1].pos.zoneID
        let z = this.zoneArr[zoneid]
        if(!z) return [
            new zoneNotExist(zoneid)
        ]

        let pid = z.playerIndex

        let targetZone = this.getPlayerZone(pid, zid);
        if(!targetZone) return [
            new zoneNotExist(pid)
        ]

        return [
            ActionGenerator.a_move_force(s, res[1])(targetZone[0].top)(Identification.system())
        ]
    }

    getZoneRespond(z : __Zone__, s : dry_system, a : Action) : Action[] {
        const gen = z.getInput_ZoneRespond(a, s);
        if(gen === undefined) return z.getZoneRespond(a, s, undefined as any);

        return [
            ActionGenerator.a_get_input(Identification.system(), {
                requester : gen as any,
                applicator : new inputApplicator(z.getZoneRespond as any, [a, s], z)
            })
        ]
    }

    handleZoneInteract(s : dry_system, a : Action<"a_zone_interact">) : Action[] {
        const z = a.targets[0].zone as __Zone__
        const gen = z.getInput_interact(s, a.cause);
        if(gen === undefined) return z.interact(s, a.cause, undefined);

        return [
            ActionGenerator.a_get_input(Identification.system(), {
                requester : gen as any,
                applicator : new inputApplicator(z.interact as any, [s, a.cause], z)
            })
        ]
    }

    respond(system : dry_system, a : Action, zoneResponsesOnly : boolean = false, log : logInfoHasResponse) : Action[]{
        let arr : Action[] = []
        // let infoLog : Map<string, string[]> = new Map() //cardID, effectIDs[]
        this.zoneArr.forEach(i => {
            arr.push(...this.getZoneRespond(i, system, a))
        })
        if(zoneResponsesOnly) return arr;
        this.zoneArr.forEach(z => {
            arr.push(...z.getAllPos().map(p => ActionGenerator.a_internal_try_activate(system, p)(Identification.system(), {
                log
            })))
        })
        return arr
    }

    forEach(depth : 0, callback : ((z : __Zone__, zid : number) => void)) : void;
    forEach(depth : 1, callback : ((c : Card, zid : number, cid : number) => void)) : void;
    forEach(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => void)) : void;
    forEach(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => void)) : void;
    forEach(depth : number, callback : ((z : any, ...index : number[]) => void)) : void{
        switch(depth){
            case 0: 
                return this.zoneArr.forEach((z : __Zone__, zid : number) => callback(z, zid));
            case 1: 
                return this.zoneArr.forEach(
                    (z : __Zone__, zid : number) => z.cardArr.forEach((c, cid) => {
                        if(c) callback(c, zid, cid)
                    })
                );
            case 2: 
                return this.zoneArr.forEach(
                    (z : __Zone__, zid : number) => z.cardArr.forEach(
                        (c, cid) => {
                            if(c) c.totalEffects.forEach((e, eid) => callback(e, zid, cid, eid))
                        }
                    )
                )
            case 3 : 
                return this.zoneArr.forEach(
                    (z : __Zone__, zid : number) => z.cardArr.forEach(
                        (c, cid) => {
                            if(c) c.totalEffects.forEach(
                                (e, eid) => e.subTypes.forEach((st, stid) => callback(st, zid, cid, eid, stid))
                            )
                        }
                    )
                )
            
            default : return;
        }
    }

    map<T>(depth : 0, callback : ((z : __Zone__, zid : number) => T)) : T[];
    map<T>(depth : 1, callback : ((c : Card, zid : number, cid : number) => T)) : T[];
    map<T>(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => T)) : T[];
    map<T>(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => T)) : T[];
    map<T>(depth : number, callback : ((z : any, ...index : number[]) => T)) : T[]{
        let final : T[] = [];
        this.forEach(depth as any, (c, ...index : number[]) => {
            final.push(callback(c, ...index));
        })
        return final;
    }

    filter(depth : 0, callback : ((z : __Zone__, zid : number) => boolean)) : __Zone__[];
    filter(depth : 1, callback : ((c : Card, zid : number, cid : number) => boolean)) : Card[];
    filter(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => boolean)) : Effect[];
    filter(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => boolean)) : EffectSubtype[];
    filter(depth : number, callback : ((z : any, ...index : number[]) => boolean)) : any[]{
        let final : any[] = [];
        this.forEach(depth as any, (c, ...index : number[]) => {
            if(callback(c, ...index)) final.push(c);
        })
        return final;
    }

    getEffectWithID(eid : string) : Effect | undefined{
        for(let i = 0; i < this.zoneArr.length; i++){
            for(let j = 0; j < this.zoneArr[i].cardArr.length; j++){
                let c = this.zoneArr[i].cardArr[j]
                if(!c) continue;
                let x = c.findEffectIndex(eid);
                if(x < 0) continue;
                return c.effects[x]
            }
        }
        return undefined;
    }

    getZoneWithType(type : number){
        return this.zoneArr.filter(i => i.types.includes(type))
    }

    forceCardIntoZone(zoneIdx : number, cardArr : Card[]){
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr)
    }

    getZoneWithDataID(dataID : number) : __Zone__[] {
        return this.zoneArr.filter(i => i.dataID === dataID)
    }

    getZoneWithClassID(classID : number) : __Zone__[] {
        return this.zoneArr.filter(i => i.classID === classID)
    }

    getZoneWithName(zoneName : string){
        return this.zoneArr.find(a => a.name == zoneName)
    }

    getZoneWithID(id : number) : __Zone__ | undefined{
        return this.zoneArr[id];
    }

    getCardWithID(cardID : string){
        for(let i = 0; i < this.zoneArr.length; i++){
            let index = this.zoneArr[i].cardArr.findIndex(i => i && i.id === cardID)
            if(index < 0) continue;
            return this.zoneArr[i].cardArr[index];
        }
        return undefined
    }

    getCardWithPosition(pos : Position){
        let z = this.zoneArr[pos.zoneID]
        if(!z) return undefined

        return z.getCardByPosition(pos)
    }

    //get stuff
    get system() {return this.getZoneWithType(zoneRegistry.z_system) as System[]}
    get void() {return this.getZoneWithType(zoneRegistry.z_void) as Void[]}
    get decks() {return this.getZoneWithType(zoneRegistry.z_deck) as any as Deck[]}
    get storages() {return this.getZoneWithType(zoneRegistry.z_storage) as Storage[]}
    get hands() {return this.getZoneWithType(zoneRegistry.z_hand) as Hand[]}
    get abilityZones() {return this.getZoneWithType(zoneRegistry.z_ability) as Ability[]}
    get graves() {return this.getZoneWithType(zoneRegistry.z_grave) as Grave[]}
    get fields() {return this.getZoneWithType(zoneRegistry.z_field) as Field[]}
    get drops() {return this.getZoneWithType(zoneRegistry.z_drop) as Drop[]}

    getPlayerZone(pid : number, type : number) : __Zone__[]{
        return this.zoneArr.filter(i => i.playerIndex === pid && i.types.includes(type))
    }
}

export default zoneHandler