//card handler is handler of all the zones
//and importantly, converter from action to zone func calls

import type posChange from "../specificAction/posChange";
import type zone from "../baseClass/zone";
import type card from "../baseClass/card";
import type res from "../baseClass/universalResponse";
import type dry_system from "../dryData/dry_system";
import type system from "../zones/system";
import type deck from "../zones/deck";
import type storage from "../zones/storage";
import type grave from "../zones/grave";
import type hand from "../zones/hand";
import type field from "../zones/field";
import type _void from "../zones/void";

import utils from "../baseClass/util";
import type zoneRegistry from "../data/zoneRegistry";
import action from "../baseClass/action";

import { cardNotExist } from "./errorHandler";
import {
    turnReset,
    drawAction,
    shuffle,
    activateEffect
} from "./actionHandler"

class zoneHandler {
    zoneArr : zone[] = []
    //i forgot to sort this array based on priority
    //aka...changed everthing downward
    constructor(){}
    async init(zoneReg : typeof zoneRegistry){
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
    handlePosChange(a : posChange) : action[]{
        let res : action[] = []
        
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

    handleShuffle(a : shuffle) : action[]{
        let temp = this.zoneArr[a.zoneID].shuffle(a.shuffleMap)
        if(temp[0]) return [temp[0]]
        return temp[1]
    }

    handleTurnReset(a : turnReset) : action[]{
        //only do field refresh
        if(!a.doFieldRefresh) return []
        return [...this.playerField.turnReset(a), ...this.enemyField.turnReset(a)]
    }

    handleEffectActivation(a : activateEffect, system : dry_system) : action[]{
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

    respond(a : action, system : dry_system, isChain : boolean){
        let arr : action[] = []
        this.zoneArr.forEach(i => {
            arr.push(...i.getZoneRespond(a, isChain))
        })
        this.zoneArr.forEach(i => {
            let respondMap = i.getCanRespondMap(a, system)
            respondMap.forEach(([edixArr, cardInfo], index) => {
                edixArr.forEach(eidx => {
                    arr.push(new activateEffect(isChain, cardInfo.id, eidx, a.causeCardID))
                })
            })
        })
        return arr
    }

    enforceCardIntoZone(zoneIdx : number, cardArr : card[]){
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr)
    }

    getZoneWithName(zoneName : string){
        return this.zoneArr.find(a => a.name == zoneName)
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