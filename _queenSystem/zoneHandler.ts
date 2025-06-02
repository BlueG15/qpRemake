//card handler is handler of all the zones
//and importantly, converter from action to zone func calls

import type posChange from "../types/actions/posChange";
import type zone from "../types/abstract/gameComponents/zone";
import type card from "../types/abstract/gameComponents/card";
import type res from "../types/abstract/generics/universalResponse";
import type dry_system from "../types/data/dry/dry_system";
import type system from "../types/zones/system";
import type deck from "../types/zones/deck";
import type storage from "../types/zones/storage";
import type grave from "../types/zones/grave";
import type hand from "../types/zones/hand";
import type field from "../types/zones/field";
import type _void from "../types/zones/void";
// import type dry_card from "../dryData/dry_card";

import utils from "../utils";
import type zoneDataRegistry from "../types/data/zoneRegistry";
import Action from "../types/abstract/gameComponents/action";

import { cardNotExist } from "../types/errors";
import {
    turnReset,
    drawAction,
    shuffle,
    activateEffect,
    internalActivateEffectSignal,
    activateEffectSubtypeSpecificFunc,
} from "../types/actions"

class zoneHandler {
    zoneArr : zone[] = []
    constructor(){}
    async init(zoneReg : typeof zoneDataRegistry){
        //every entries in zoneReg house an importURL leading to a child class extended from zone 
        //assuming the importURL are correct, import and create a new instance of those class
        //stores inside this class's zoneArr
        
        //using promise.all for concurrency

        const zonePromises = Object.entries(zoneReg)
        .sort((a, b) => a[1].priority - b[1].priority)
        .map(async ([keyStr, zoneData], index) => {
            let zoneClass = (await import(zoneData.importURL)).default;
            let zoneInstance = new zoneClass(index, keyStr, zoneData) as zone;
            this.zoneArr.push(zoneInstance);
        });

        await Promise.all(zonePromises);
    }
    
    //operations
    handlePosChange(a : posChange) : Action[]{
        let res : Action[] = []
        
        let idxFrom = a.fromPos.zoneID
        let cardIdx = utils.positionToIndex(a.fromPos.flat(), this.zoneArr[idxFrom].shape)
        let c = this.zoneArr[idxFrom].cardArr[cardIdx]
        if(!c) return [
            new cardNotExist().add("cardHandler", "handlePosChange", 54)
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
        this.zoneArr.forEach(i => {
            let t = i.findIndex(cardIdx)
            if(t >= 0){
                let k = (i.cardArr[t] as card).activateEffect(a.effectID, system, a)
                if(k[0]) return [k[0].add("cardHandler", "handleEffectActivation", 98)]
                else return k[1]
            }
        }) 
        return [new cardNotExist().add("cardHandler", "handleEffectActivation", 102)]       
    }

    handleActivateEffectSubtypeFunc(a : activateEffectSubtypeSpecificFunc, system : dry_system){
        let cardIdx = a.targetCardID as string
        this.zoneArr.forEach(i => {
            let t = i.findIndex(cardIdx)
            if(t >= 0){
                let k = (i.cardArr[t] as card).activateEffectSubtypeSpecificFunc(a.effectID, a.subTypeID ,system, a)
                if(k[0]) return [k[0].add("cardHandler", "handleEffectActivation", 127)]
                else return k[1]
            }
        }) 
        return [new cardNotExist().add("cardHandler", "handleEffectActivation", 131)]
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

    enforceCardIntoZone(zoneIdx : number, cardArr : card[]){
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
    get system() {return this.getZoneWithName("system") as system}
    get deck() {return this.getZoneWithName("deck") as deck}
    get storage() {return this.getZoneWithName("storage") as storage}
    get enemyGrave() {return this.getZoneWithName("enemyGrave") as grave}
    get playerGrave() {return this.getZoneWithName("playerGrave") as grave}
    get hand() {return this.getZoneWithName("hand") as hand}
    get enemyField() {return this.getZoneWithName("enemyField") as field}
    get playerField() {return this.getZoneWithName("playerField") as field}
    get void() {return this.getZoneWithName("void") as _void}
}

export default zoneHandler


/*
note:
this file isnt complete
i havent added the ability for zones and cards to respond to actions

*/