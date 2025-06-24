//zones handler is handler of all the zones
//and importantly, converter from action to zone func calls

import type Zone from "../../types/abstract/gameComponents/zone";
import type Effect from "../../types/abstract/gameComponents/effect";
import type Card from "../../types/abstract/gameComponents/card";
import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";

import system from "../../types/defaultZones/system";
import res from "../../types/abstract/generics/universalResponse";
import deck from "../../types/defaultZones/deck";
import storage from "../../types/defaultZones/storage";
import grave from "../../types/defaultZones/grave";
import hand from "../../types/defaultZones/hand";
import field from "../../types/defaultZones/field";
import abiltyZone from "../../types/defaultZones/ability";
import _void from "../../types/defaultZones/void";
// import type dry_card from "../dryData/dry_card";
import zoneLoader from "../loader/loader_zone";
import type { Setting } from "../../types/abstract/gameComponents/settings";

import utils from "../../utils";
import zoneDataRegistry, { playerTypeID, zoneData } from "../../data/zoneRegistry";
import { zoneRegistry, zoneName, zoneID } from "../../data/zoneRegistry";

import type { StatusEffect_base } from "../../specificEffects/e_status";

import { cardNotExist, effectNotExist, incorrectActiontype, zoneAttrConflict, zoneNotExist } from "../../types/errors";
import type registryHandler from "./registryHandler";
import Position from "../../types/abstract/generics/position";
import { Action, Action_class, actionConstructorRegistry, actionFormRegistry, TargetType } from "./actionGenrator";
import { type identificationInfo_card, type identificationInfo, type identificationInfo_effect, type identificationInfo_subtype, identificationType } from "../../data/systemRegistry";
import type error from "../../types/errors/error";
import actionRegistry from "../../data/actionRegistry";
import { damageType } from "../../types/misc";
import type { dry_card, dry_system } from "../../data/systemRegistry";

class zoneHandler {
    readonly zoneArr : ReadonlyArray<Zone> = []
    private loader : zoneLoader

    //old
    // async load(zoneReg : typeof zoneDataRegistry){
    //     //every entries in zoneReg house an importURL leading to a child class extended from zone 
    //     //assuming the importURL are correct, import and create a new instance of those class
    //     //stores inside this class's zoneArr
        
    //     //using promise.all for concurrency

    //     const zonePromises = Object.entries(zoneReg)
    //     .sort((a, b) => isNaN(a[1].priority) ? 1 : isNaN(b[1].priority) ? -1 : a[1].priority - b[1].priority)
    //     .map(async ([keyStr, zoneData], index) => {
    //         let zoneClass = (await import(zoneData.importURL)).default as typeof zone;
    //         let zoneInstance = new zoneClass(index, keyStr, zoneRegistry[keyStr as zoneName], zoneData) as zone;
    //         this.zoneArr.push(zoneInstance);
    //     });

    //     await Promise.all(zonePromises);
    // }
    
    constructor(regs : registryHandler, s : Setting){
        this.loader = regs.zoneLoader
        this.loader.load(zoneRegistry[zoneRegistry.z_system], zoneDataRegistry.z_system, system);
        this.loader.load(zoneRegistry[zoneRegistry.z_deck], zoneDataRegistry.z_deck, deck);
        this.loader.load(zoneRegistry[zoneRegistry.z_hand], zoneDataRegistry.z_hand, hand);
        this.loader.load(zoneRegistry[zoneRegistry.z_void], zoneDataRegistry.z_void, _void);
        this.loader.load(zoneRegistry[zoneRegistry.z_storage], zoneDataRegistry.z_storage, storage);
        this.loader.load(zoneRegistry[zoneRegistry.z_field], zoneDataRegistry.z_field, field);
        this.loader.load(zoneRegistry[zoneRegistry.z_grave], zoneDataRegistry.z_grave, grave);
        this.loader.load(zoneRegistry[zoneRegistry.z_ability], zoneDataRegistry.z_ability, abiltyZone);

        // this.maxPlayerIndex = s.players.length

        Object.entries(zoneDataRegistry).forEach(([zkey, zdata], index) => {
            if(!zdata.instancedFor.length){
                let  zinstance = (this.loader.getZone(zkey, s) as Zone)
                utils.insertionSort(
                    this.zoneArr as Zone[], 
                    zinstance,
                    this.sortFunc
                )
            } else {
                s.players.forEach((ptype, pindex) => {
                    let zinstance = (this.loader.getZone(zkey, s, ptype, pindex) as Zone)
                    if(zdata.instancedFor.includes(ptype)){
                        utils.insertionSort(
                            this.zoneArr as Zone[],
                            zinstance,
                            this.sortFunc
                        )
                    }
                })
            }
        })

        this.correctID()
    }

    private sortFunc(a : zoneData | Zone, b : zoneData | Zone) : number{
        const x = a.priority, y = b.priority;
        if(Object.is(x, y)) return 0;
        const rank = (a : number) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }

    private correctID(){
        for(let i = 0; i < this.zoneArr.length; i++) this.zoneArr[i].id = i;
    }

    load(key : string, data : zoneData, c? : typeof Zone){
        this.loader.load(key, data, c);
    }

    add(zclassID : string, s : Setting, ptype? : playerTypeID | -1, pid? : number, zDataID? : string){
        let instance = this.loader.getZone(zclassID, s, ptype, pid, zDataID);
        if(!instance) throw new Error(`Fail to create instance of zone ${zclassID}`);
        utils.insertionSort(this.zoneArr as Zone[], instance, this.sortFunc);
        this.correctID()
    }

    load_and_add_noPlayer(key : string, s : Setting, data : zoneData, c : typeof Zone) : void; //add both
    load_and_add_noPlayer(key : string, s : Setting, _class : typeof Zone, dataID? : string) : void; //add class only, no ID use key
    load_and_add_noPlayer(key : string, s : Setting, data : zoneData, classID? : string) : void; //add data only, no ID use key
    load_and_add_noPlayer(key : string, s : Setting, param3 : zoneData | typeof Zone, param4? : typeof Zone | string){
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
            this.add(key, s, -1, -1, param4 as string)
            return;
        }
        //case 3, add data only
        if(typeof param3 === "object"){
            this.loader.load(key, param3);
            this.add(key, s, -1, -1, param4 as string)
            return;
        }
        //technically unreachable code
        throw new Error("Undefined behavior: load_and_add, zoneHandler");
    }

    addNewPlayerInstancedZones(s : Setting, ptype : playerTypeID, pid : number = -1){
        let insertNew : Zone[] = []
        this.zoneArr.forEach(i => {
            let data = this.loader.getData(i.dataID)
            if(data && data.instancedFor.includes(ptype)){
                let z = this.loader.getZone(i.classID, s, ptype, pid, i.dataID)
                if(z) insertNew.push(z)
            }
        })

        insertNew.forEach(i => utils.insertionSort(this.zoneArr as Zone[], i, this.sortFunc))
        this.correctID()
    }

    //operations

    private genericHandler_card<
        M extends [identificationInfo_card | identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card] {
        let target = a.targets[0]
        let z = this.zoneArr[target.card.pos.zoneID]
        let c = z.getCardByPosition(new Position(target.card.pos))
        if(!c) {
            c = this.getCardWithID(target.card.id);
            if (!c) return [true, [new cardNotExist()]];
        }
        if(!a.resolvable(s, z.toDry(), c.toDry())) return [true, []]
        return [false, c];
    }

    private genericHandler_effect<
        M extends [identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card, Effect] {
        let target = a.targets[0]
        let z = this.zoneArr[target.card.pos.zoneID]
        let c = z.getCardByPosition(new Position(target.card.pos))
        if(!c) {
            c = this.getCardWithID(target.card.id);
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

        if(!a.resolvable(s, z.toDry(), c.toDry(), eff.toDry())) return [true, []]
        return [false, c, eff]
    }

    private genericHandler_subtype<
        M extends [identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card, Effect, number] {
        let target = a.targets[0]
        let z = this.zoneArr[target.card.pos.zoneID]
        let c = z.getCardByPosition(new Position(target.card.pos))
        if(!c) {
            c = this.getCardWithID(target.card.id);
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

        if(!a.resolvable(s, z.toDry(), c.toDry(), eff.toDry(), eff.subTypes[st].toDry())) return [true, []]

        return [false, c, eff, st]

    }




    /**
     * 
     * @param a : a pos change action, with 2 targets, a card target and a position target in index 0 and 1
     * @returns 
     */
    handlePosChange(s : dry_system, a : Action<"a_pos_change">) : Action[]{

        let k1 = a.targets[0];
        let k2 = a.targets[1];

        let pos = new Position(k2.pos)
        let res : Action[] = []

        let z = this.zoneArr[k1.card.pos.zoneID]
        let c = z.getCardByPosition(new Position(k1.card.pos))

        // let idxFrom = pos.zoneID
        // let cardIdx = utils.positionToIndex(pos.flat(), this.zoneArr[idxFrom].shape)
        // let c = this.zoneArr[idxFrom].cardArr[cardIdx]
        if(!c) {
            c = this.getCardWithID(k1.card.id)
            if(!c) return [
                new cardNotExist().add("zoneHandler", "handlePosChange", 54)
            ];
        }

        if(!a.resolvable(s, z.toDry(), c.toDry())) return [];

        let temp : res

        if(pos && pos.valid && pos.zoneID === c.pos.zoneID){
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

        if(!a.resolvable(s, zone.toDry())) return []

        let deck = zone as deck;

        let playerindex = deck.playerIndex
        let hand = this.hands.filter(i => i.playerIndex === playerindex);

        if(hand.length !== 1) return [
            new zoneNotExist(-1).add("zoneHandler", "handleDraw", 222)
        ]

        let res = deck.draw(s, a, hand[0])
        console.log("2", a.flatAttr(), res)
        if(res[0]) return [res[0]];
        else return res[1];
    }   

    handleShuffle(s : dry_system, a : Action<"a_shuffle">) : Action[]{
        let z = this.zoneArr[a.targets[0].zone.id]
        if(!z || !(z as any).draw) return [
            new zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
        ]
        if(!a.resolvable(s, z.toDry())) return [];
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

    handleEffectActivation(s : dry_system, a : Action<"a_activate_effect">) : Action[]{
        let res = this.genericHandler_effect(s, a);
        if(res[0]) return res[1];
        return res[2].activate(res[1], s, a);
    }

    handleActivateEffectSubtypeFunc(s : dry_system, a : Action<"a_activate_effect_subtype">) : Action[]{
        let res = this.genericHandler_subtype(s, a);
        if(res[0]) return res[1];
        return res[2].activateSubtypeSpecificFunc(res[3], res[1], s, a)
    }

    handleAddStatusEffect(s : dry_system, a : Action<"a_add_status_effect">, e : StatusEffect_base) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].addStatusEffect(e);
        return [];
    }

    handleClearAllStatusEffect(s : dry_system, a : Action<"a_clear_all_status_effect">) : Action[] {
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

    handleCardStatus(s : dry_system, a : Action<"a_enable_card"> | Action<"a_disable_card">) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].canAct = (a.typeID === actionRegistry.a_enable_card)
        return []
    }

    handleAttack(s : dry_system, a : Action<"a_attack">) : Action[] {
        let attr = a.flatAttr()

        //find opposite
        if((a.cause as any).card === undefined) return []
        let c = (a.cause as any).card as dry_card

        let oppositeZones : Zone | undefined = this.zoneArr[c.pos.zoneID]
        if(!oppositeZones) return []
        
        let targetZone = oppositeZones.getOppositeZone(this.zoneArr)
        if(!targetZone.length) return []

        let targets = targetZone[0].getOppositeCards(c)
        
        if(!targets.length){
            return [
                actionConstructorRegistry.a_deal_heart_damage(s, oppositeZones.playerIndex)(a.cause, {
                    dmg : c.attr.get("atk") ?? 0
                })
            ]
        }

        targets = targets.sort((a, b) => a.pos.x - b.pos.x)

        return [
            actionConstructorRegistry.a_deal_damage_internal(s, targets[0].toDry())(a.cause, {
                dmg : (attr.dmg === undefined) ? c.attr.get("atk") ?? 0 : attr.dmg,
                dmgType : (attr.dmgType === undefined) ? damageType.physical : attr.dmgType
            })
        ]
    }

    handleDealDamage_1(s : dry_system, a : Action<"a_deal_damage_card"> | Action<"a_deal_damage_internal">){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        let attr = a.flatAttr();
        res[1].hp -= attr.dmg;

        if(res[1].hp === 0){
            return [
                actionConstructorRegistry.a_destroy(s, res[1].toDry())(actionFormRegistry.system())
            ]
        }
        return []
    }

    handleDealDamage_2(s : dry_system, a : Action<"a_deal_damage_position">){
        let pos = a.targets[0].pos

        let c = this.getCardWithPosition(new Position(pos));
        if(!c) return [
            new cardNotExist()
        ]

        let attr = a.flatAttr();
        c.hp -= attr.dmg

        if(c.hp === 0){
            return [
                actionConstructorRegistry.a_destroy(s, c.toDry())(actionFormRegistry.system())
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
            actionConstructorRegistry.a_attack(s, a.targets[0].card)(a.cause, {
                dmg : res[1].atk,
                dmgType : damageType.physical
            }),
            actionConstructorRegistry.a_pos_change_force(s, res[1].toDry())(g[0].top.toDry())(actionFormRegistry.system()).dontchain()
        ]
    }

    handleSendToTop(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">, zid : number){
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
            actionConstructorRegistry.a_pos_change_force(s, res[1].toDry())(targetZone[0].top.toDry())(actionFormRegistry.system())
        ]
    }

    respond(system : dry_system, a : Action, zoneResponsesOnly : boolean = false) : [Action[], [string, string[]][]]{
        let arr : Action[] = []
        let infoLog : Map<string, string[]> = new Map() //cardID, effectIDs[]
        this.zoneArr.forEach(i => {
            arr.push(...i.getZoneRespond(a, system))
        })
        if(zoneResponsesOnly) return [arr, []];
        this.zoneArr.forEach(i => {
            let respondMap = i.getCanRespondMap(a, system)
            respondMap.forEach((eidxArr, cardInfo) => {
                eidxArr.forEach(eidx => {
                    arr.push(
                        actionConstructorRegistry.a_activate_effect_internal(system, cardInfo, cardInfo.effects[eidx])(a.cause)
                    )
                    if(infoLog.has(cardInfo.id)) {
                        (infoLog.get(cardInfo.id) as string[]).push(cardInfo.effects[eidx].id);
                    } else {
                        infoLog.set(cardInfo.id, [cardInfo.effects[eidx].id])
                    } 
                })
            })
        })
        return [arr, Object.entries(infoLog)]
    }

    forEach(depth : 0, callback : ((z : Zone, zid : number) => void)) : void;
    forEach(depth : 1, callback : ((c : Card, zid : number, cid : number) => void)) : void;
    forEach(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => void)) : void;
    forEach(depth : 3, callback : ((st : effectSubtype, zid : number, cid : number, eid : number, stid : number) => void)) : void;
    forEach(depth : number, callback : ((z : any, ...index : number[]) => void)) : void{
        switch(depth){
            case 0: 
                return this.zoneArr.forEach((z : Zone, zid : number) => callback(z, zid));
            case 1: 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach((c, cid) => {
                        if(c) callback(c, zid, cid)
                    })
                );
            case 2: 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach(
                        (c, cid) => {
                            if(c) c.totalEffects.forEach((e, eid) => callback(e, zid, cid, eid))
                        }
                    )
                )
            case 3 : 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach(
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

    map<T>(depth : 0, callback : ((z : Zone, zid : number) => T)) : T[];
    map<T>(depth : 1, callback : ((c : Card, zid : number, cid : number) => T)) : T[];
    map<T>(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => T)) : T[];
    map<T>(depth : 3, callback : ((st : effectSubtype, zid : number, cid : number, eid : number, stid : number) => T)) : T[];
    map<T>(depth : number, callback : ((z : any, ...index : number[]) => T)) : T[]{
        let final : T[] = [];
        this.forEach(depth as any, (c, ...index : number[]) => {
            final.push(callback(c, ...index));
        })
        return final;
    }

    filter(depth : 0, callback : ((z : Zone, zid : number) => boolean)) : Zone[];
    filter(depth : 1, callback : ((c : Card, zid : number, cid : number) => boolean)) : Card[];
    filter(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => boolean)) : Effect[];
    filter(depth : 3, callback : ((st : effectSubtype, zid : number, cid : number, eid : number, stid : number) => boolean)) : effectSubtype[];
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

    enforceCardIntoZone(zoneIdx : number, cardArr : Card[]){
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr)
    }

    getZoneWithDataID(dataID : string) : Zone[] {
        return this.zoneArr.filter(i => i.dataID === dataID)
    }

    getZoneWithClassID(classID : string) : Zone[] {
        return this.zoneArr.filter(i => i.classID === classID)
    }

    getZoneWithName(zoneName : string){
        return this.zoneArr.find(a => a.name == zoneName)
    }

    getZoneWithID(id : number) : Zone | undefined{
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
    get system() {return this.getZoneWithType(zoneRegistry.z_system) as system[]}
    get void() {return this.getZoneWithType(zoneRegistry.z_void) as _void[]}
    get decks() {return this.getZoneWithType(zoneRegistry.z_deck) as deck[]}
    get storages() {return this.getZoneWithType(zoneRegistry.z_storage) as storage[]}
    get hands() {return this.getZoneWithType(zoneRegistry.z_hand) as hand[]}
    get abilityZones() {return this.getZoneWithType(zoneRegistry.z_ability) as abiltyZone[]}
    get graves() {return this.getZoneWithType(zoneRegistry.z_grave) as grave[]}
    get fields() {return this.getZoneWithType(zoneRegistry.z_field) as field[]}

    getPlayerZone(pid : number, type : number) : Zone[]{
        return this.zoneArr.filter(i => i.playerIndex === pid && i.types.includes(type))
    }
}

export default zoneHandler


/*
note:
this file isnt complete
i havent added the ability for zones and cards to respond to actions

*/