//zones handler is handler of all the zones
//and importantly, converter from action to zone func calls

import type Zone from "../../types/abstract/gameComponents/zone";
import type posChange from "../../types/actions/posChange";
import system from "../../types/defaultZones/system";
import Card from "../../types/abstract/gameComponents/card";
import res from "../../types/abstract/generics/universalResponse";
import dry_system from "../../types/data/dry/dry_system";
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
import zoneDataRegistry, { zoneData } from "../../types/data/zoneRegistry";
import { zoneRegistry, zoneName, zoneID } from "../../types/data/zoneRegistry";
import Action from "../../types/abstract/gameComponents/action";

import type StatusEffect from "../../types/effects/effectTypes/statusEffect";

import { cardNotExist } from "../../types/errors";
import {
    turnReset,
    drawAction,
    shuffle,
    activateEffect,
    internalActivateEffectSignal,
    activateEffectSubtypeSpecificFunc,
    addStatusEffect,
    removeStatusEffect,
} from "../../types/actions"
import type registryHandler from "./registryHandler";

class zoneHandler {
    readonly zoneArr : Zone[]
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
    
    constructor(regs : registryHandler){
        this.loader = regs.zoneLoader
        this.loader.load(zoneRegistry[zoneRegistry.z_system], zoneDataRegistry.z_system);
        this.loader.load(zoneRegistry[zoneRegistry.z_deck], zoneDataRegistry.z_deck);
        this.loader.load(zoneRegistry[zoneRegistry.z_hand], zoneDataRegistry.z_hand);
        this.loader.load(zoneRegistry[zoneRegistry.z_void], zoneDataRegistry.z_void);
        this.loader.load(zoneRegistry[zoneRegistry.z_storage], zoneDataRegistry.z_storage);
        this.loader.load(zoneRegistry[zoneRegistry.z_p1_field], zoneDataRegistry.z_p1_field);
        this.loader.load(zoneRegistry[zoneRegistry.z_p2_field], zoneDataRegistry.z_p2_field);
        this.loader.load(zoneRegistry[zoneRegistry.z_p1_grave], zoneDataRegistry.z_p1_grave);
        this.loader.load(zoneRegistry[zoneRegistry.z_p2_grave], zoneDataRegistry.z_p2_grave);

        //pre-sorted
        this.zoneArr = [
            new system(0, zoneRegistry[zoneRegistry.z_system], zoneDataRegistry.z_system), //Inf
            
            new field(1, zoneRegistry[zoneRegistry.z_p1_field], zoneDataRegistry.z_p1_field), //6
            new field(2, zoneRegistry[zoneRegistry.z_p2_field], zoneDataRegistry.z_p2_field), //5
            
            new hand(3, zoneRegistry[zoneRegistry.z_hand], zoneDataRegistry.z_deck), //4

            new grave(4, zoneRegistry[zoneRegistry.z_p1_grave], zoneDataRegistry.z_p1_grave), //3
            new grave(5, zoneRegistry[zoneRegistry.z_p2_grave], zoneDataRegistry.z_p2_grave), //2

            new deck(6, zoneRegistry[zoneRegistry.z_deck], zoneDataRegistry.z_deck), //1
            new storage(7, zoneRegistry[zoneRegistry.z_storage], zoneDataRegistry.z_storage), //0

            new abiltyZone(8, zoneRegistry[zoneRegistry.z_ability], zoneDataRegistry.z_ability), //-1
            new _void(9, zoneRegistry[zoneRegistry.z_void], zoneDataRegistry.z_void), //-2
        ]
    }

    private sortFunc(a : zoneData, b : zoneData) : number{
        const x = a.priority, y = b.priority;
        if(Object.is(x, y)) return 0;
        const rank = (a : number) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }

    load(key : string, data : zoneData, c? : typeof Zone){
        this.loader.load(key, data, c);
    }

    add(zclassID : string, s : Setting, zDataID? : string){
        let instance = this.loader.getZone(zclassID, s, zDataID);
        if(!instance) throw new Error(`Fail to create instance of zone ${zclassID}`);
        utils.insertionSort(this.zoneArr, instance, this.sortFunc);
        for(let i = 0; i < this.zoneArr.length; i++) this.zoneArr[i].id = i;
    }

    load_and_add(key : string, s : Setting, data : zoneData, c : typeof Zone) : void; //add both
    load_and_add(key : string, s : Setting, _class : typeof Zone, dataID? : string) : void; //add class only, no ID use key
    load_and_add(key : string, s : Setting, data : zoneData, classID? : string) : void; //add data only, no ID use key
    load_and_add(key : string, s : Setting, param3 : zoneData | typeof Zone, param4? : typeof Zone | string){
        //case 1, add both
        if(typeof param3 === "object" && typeof param4 === "function"){
            this.loader.load(key, param3, param4);
            this.add(key, s, key);
            return;
        } 
        if(!param4) param4 = key;
        //case 2, add class only
        if(typeof param3 === "function"){
            this.loader.load(key, undefined, param3);
            this.add(key, s, param4 as string)
            return;
        }
        //case 3, add data only
        if(typeof param3 === "object"){
            this.loader.load(key, param3);
            this.add(key, s, param4 as string)
            return;
        }
        //technically unreachable code
        throw new Error("Undefined behavior: load_and_add, zoneHandler");
    }

    //operations
    handlePosChange(a : posChange) : Action[]{
        let res : Action[] = []
        
        let idxFrom = a.fromPos.zoneID
        let cardIdx = utils.positionToIndex(a.fromPos.flat(), this.zoneArr[idxFrom].shape)
        let c = this.zoneArr[idxFrom].cardArr[cardIdx]
        if(!c) return [
            new cardNotExist().add("zoneHandler", "handlePosChange", 54)
        ];
        let temp : res

        if(a.toPos && a.toPos.valid && a.toPos.zoneID === idxFrom){
            console.log("move is triggered")
            let idxTo = a.toPos.zoneID
            temp = this.zoneArr[idxTo].move(c, a.toPos)
            //move is prioritized
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])

        } else {

            if(a instanceof drawAction){
                temp = this.deck.draw(a)
            } else {
                temp = this.zoneArr[idxFrom].remove(c)
            }
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])

            if(a.toPos){
                let idxTo = a.toPos.zoneID
                temp = this.zoneArr[idxTo].add(c, a.toPos)
            }
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])
        }

        return res
    }

    handleShuffle(a : shuffle) : Action[]{
        let temp = this.zoneArr[a.zoneID].shuffle(a.shuffleMap)
        if(temp[0]) return [temp[0]]
        return temp[1]
    }

    handleTurnReset(a : turnReset) : Action[]{
        //only do field refresh
        if(!a.doFieldRefresh) return []
        return [...this.playerField.turnReset(a), ...this.enemyField.turnReset(a)]
    }

    handleEffectActivation(a : activateEffect, system : dry_system) : Action[]{
        let cardIdx = a.targetCardID as string
        for(let k = 0; k < this.zoneArr.length; k++){
            const i = this.zoneArr[k]
            let t = i.findIndex(cardIdx)
            if(t >= 0){
                let k = (i.cardArr[t] as Card).activateEffect(a.effectID, system, a)
                if(k[0]) return [k[0].add("zoneHandler", "handleEffectActivation", 98)]
                else return k[1]
            }
        }
        return [new cardNotExist().add("zoneHandler", "handleEffectActivation", 102)]       
    }

    handleActivateEffectSubtypeFunc(a : activateEffectSubtypeSpecificFunc, system : dry_system) : Action[]{
        let cardIdx = a.targetCardID as string
        for(let k = 0; k < this.zoneArr.length; k++){
            const i = this.zoneArr[k]
            let t = i.findIndex(cardIdx)
            if(t >= 0){
                let k = (i.cardArr[t] as Card).activateEffectSubtypeSpecificFunc(a.effectID, a.subTypeID ,system, a)
                if(k[0]) return [k[0].add("zoneHandler", "handleEffectActivation", 127)]
                else return k[1]
            }
        }
        return [new cardNotExist().add("zoneHandler", "handleEffectActivation", 131)]
    }

    handleAddStatusEffect(a : addStatusEffect, e : StatusEffect) : Action[]{
        if(!a.targetCardID) return [new cardNotExist().add("zoneHandler", "handleAddStatusEffect", 220)]
        let card = this.getCardFromID(a.targetCardID);
        if(!card) return [new cardNotExist().add("zoneHandler", "handleAddStatusEffect", 222)];
        card.addStatusEffect(e);
        return [];
    }

    handleRemoveStatusEffect(a : removeStatusEffect) : Action[]{
        if(!a.targetCardID) return [new cardNotExist().add("zoneHandler", "handleRemoveStatusEffect", 229)]
        let card = this.getCardFromID(a.targetCardID);
        if(!card) return [new cardNotExist().add("zoneHandler", "handleRemoveStatusEffect", 231)];
        card.removeStatusEffect(a.statusID);
        return []
    }

    respond(a : Action, system : dry_system, zoneResponsesOnly : boolean = false) : [Action[], [string, string[]][]]{
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
                    arr.push(new internalActivateEffectSignal(
                        cardInfo.id, 
                        cardInfo.effects[eidx].id, 
                        a.causeCardID
                    ))
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

    enforceCardIntoZone(zoneIdx : number, cardArr : Card[]){
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr)
    }

    getZoneWithName(zoneName : string){
        return this.zoneArr.find(a => a.name == zoneName)
    }

    getCardFromID(cardID : string){
        for(let i = 0; i < this.zoneArr.length; i++){
            let index = this.zoneArr[i].cardArr.findIndex(i => i && i.id === cardID)
            if(index < 0) continue;
            return this.zoneArr[i].cardArr[index];
        }
        return undefined
    }

    //get stuff
    get system() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_system]) as system}
    
    get deck() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_deck]) as deck}
    get storage() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_storage]) as storage}

    get enemyGrave() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_p2_grave]) as grave}
    get playerGrave() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_p1_grave]) as grave}

    get hand() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_hand]) as hand}

    get enemyField() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_p2_field]) as field}
    get playerField() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_p1_field]) as field}

    get abilityZone() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_ability]) as abiltyZone}
    get void() {return this.getZoneWithName(zoneRegistry[zoneRegistry.z_void]) as _void}
}

export default zoneHandler


/*
note:
this file isnt complete
i havent added the ability for zones and cards to respond to actions

*/