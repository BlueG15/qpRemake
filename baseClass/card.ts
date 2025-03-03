import Effect from "./effect";
import StatusEffect from "../effectTypes/statusEffect";
import action from "./action";
import type res from "./universalResponse";

import wrongEffectIdx from "../errors/wrongEffectIdx";
// import effectCondNotMet from "../errors/effectCondNotMet";

import position from "./position";
import type turnReset from "../specificAction/turnReset";

// import { activateEffect } from "../handlers/actionHandler";

//qp has cards that are able to tranfer / inherit effects of something else
//this...should still works?
import dry_card from "../dryData/dry_card";
import type dry_system from "../dryData/dry_system";
import type { cardData_merged, effectDisplayDataItem } from "../data/cardRegistry";
import { freeUpStatusIDs } from "../handlers/actionHandler";
import { effectNotExist } from "../errors";

class Card {
    readonly dataID : string;
    readonly originalData : cardData_merged
    readonly id : string

    effects : Effect[] = [];
    pos : position = new position(0);
    img : string = "";
    attr : Map<string, any> = new Map();
    canAct : boolean = true

    statusEffects: StatusEffect[] = [];
    //status effects are temporary effects

    

    constructor(id: string, dataID : string = "", cardData : cardData_merged){
        this.dataID = dataID
        this.id = id
        this.originalData = cardData
        this.attr = new Map(Object.entries(cardData))
        this.maxAtk = this.atk
        this.maxHp = this.hp
        // level: number;
        // rarityID: number;
        // archtype: string;
    }

    //shorthand access
    get level() : number {return this.attr.get("level")}
    set level(newLevel : number){this.attr.set("level", newLevel)}

    get rarityID() : number {return this.attr.get("rarityID")}
    set rarityID(newRarityID : number){this.attr.set("rarityID", newRarityID)}

    get archtype() : string {return this.attr.get("archtype")}
    set archtype(newArchtype : string){this.attr.set("archtype", newArchtype)}
    
    get atk() : number {return this.attr.get("atk")}
    set atk(n : number){this.attr.set("atk", n)}
    
    get hp() : number {return this.attr.get("hp")}
    set hp(n : number){this.attr.set("hp", n)}

    get maxAtk() : number {return this.attr.get("maxAtk")}
    set maxAtk(n : number){
        this.attr.set("maxAtk", n);
        if(this.atk > n) this.atk = n;
    }
    
    get maxHp() : number {return this.attr.get("maxHp")}
    set maxHp(n : number){
        this.attr.set("maxHp", n);
        if(this.hp > n) this.hp = n;
    }
    
    //read only shorthand access
    get extensionArr() : string[] {return this.attr.get("extensionArr")}

    get effectIDs() : string[] {return this.attr.get("effectIDs")}
    get effectPartition() : number[] {return this.attr.get("effectPartition")}
    get effectDisplayData() : effectDisplayDataItem[] {return this.attr.get("effectDisplayData")}

    private set extensionArr(a : string[]) {this.attr.set("extensionArr", a)}
    private set effectIDs(a : string[]) {this.attr.set("effectIDs", a)}
    private set effectPartition(a : number[]) {this.attr.set("effectPartition", a)}
    private set effectDisplayData(a : effectDisplayDataItem[]) {this.attr.set("effectDisplayData", a)}

    //easier attributes to work with
    get real_effectCount() : number {return this.effectIDs.length}
    get display_effectCount() : number {return this.effectPartition.length}
    get totalEffects() : Effect[] {return [...this.effects, ...this.statusEffects]}
    get hasStatusEffect() : boolean {return this.statusEffects.length !== 0}
    get isDead() : boolean {return this.hp === 0}

    get display_atk() {return Math.max(this.atk, 0)}
    get display_hp() {return Math.max(this.atk, 0)}

    pushNewExtension(nExtension : string){
        let a = this.extensionArr
        a.push(nExtension)
        this.attr.set("extensionArr", a)
    }

    removeExtension(whatToRemove : string){
        let a = this.extensionArr
        a = a.filter(n => n !== whatToRemove)
        this.attr.set("extensionArr", a)
    }

    getStartIndexOfRealEffect(display_eidx : number){
        return this.effectPartition.slice(0, display_eidx).reduce((sum, val) => sum + val, 0);
    }

    replaceEffect(from_eidx : number, to_eidx : number, cardToCopyFrom : Card){
        //those id are display id, 0 - 2 exclusively
        //add an error for these cases
        if(from_eidx < 0 || from_eidx >= this.display_effectCount) {return undefined} 
        if(to_eidx < 0 || to_eidx >= cardToCopyFrom.display_effectCount) {return undefined}

        let arr = this.effectIDs;
        arr.splice(
            this.getStartIndexOfRealEffect(from_eidx), //start idx
            this.effectPartition[from_eidx], //delete count
            ...cardToCopyFrom.effectIDs.slice(
                cardToCopyFrom.getStartIndexOfRealEffect(to_eidx), //start idx
                cardToCopyFrom.getStartIndexOfRealEffect(to_eidx) + cardToCopyFrom.effectPartition[to_eidx] //end idx
            )
        )
        this.effectIDs = arr;
        //basically copy effectID from the target to this one in the required display_idx
        this.effectPartition[from_eidx] = cardToCopyFrom.effectPartition[to_eidx];
        this.effectDisplayData[from_eidx] = cardToCopyFrom.effectDisplayData[to_eidx];
    }

    addStatusEffect(s : StatusEffect){
        //preferably also input the id into this thing, but to get the actual thing from the id
        //we need the handler
        //maybe we handle this outside or s.th
        this.statusEffects.push(s);
    }

    removeStatusEffect(id : string){
        this.statusEffects = this.statusEffects.filter(i => i.id !== id);
    }

    toDry(){
        return new dry_card(this)
    }

    findEffectIndex(eid?: string) : number{
        if(!eid) return -1;
        for(let i = 0; i < this.totalEffects.length; i++){
            if(this.totalEffects[i].id === eid) return i;
        }
        return -1;
    }

    getResponseIndexArr(system : dry_system, a : action) : number[]{
        //returns the effect ids that respond
        let res : number[] = []
        this.totalEffects.forEach((i, index) => {
            if(i.canRespondAndActivate(this, system, a)) res.push(index)
        })
        return res
    }; 
    activateEffect(idx : number, system : dry_system, a : action) : res 
    activateEffect(eid : string, system : dry_system, a : action) : res
    activateEffect(id : number | string, system : dry_system, a : action) : res {
        let idx : number
        if(typeof id === "number"){
            idx = id;
        } else {
            idx = this.findEffectIndex(id);
            if(idx < 0) return [new effectNotExist(id, this.id), undefined]
        }
        if(!this.totalEffects[idx]){
            let err = new wrongEffectIdx(idx, this.id)
            err.add("card.ts", "activateEffect", 25)
            return [err, undefined]
        }
        //assumes can activate
        //fix later
        return [undefined, this.totalEffects[idx].activate(this, system, a)]
    }
    turnReset(a : turnReset) : action[]{
        this.canAct = true
        return this.clearAllStatus()
    }
    clearAllStatus() : action[]{
        //i hereby declare, status effect do not do shit when they are cleared forcefully
        //i.e via this function
        //should this declaration fails in the future, modify this bad boi

        //Note that things that activate when a timer ran out can still be done 
        //it can emit activate effect - self in respond to the "turn start" action
        //      if timer <= 0, [do effect, remove status effect from self]
        //      else timer - 1, []

        //for status that activate just once, repond to turn start as normal, 
        // but decrease an internal counter too
        
        let res = this.statusEffects.map(i => i.id)
        this.statusEffects = [];

        //reset stats, keep the effect
        let k = new Map(Object.entries(this.originalData))
        this.maxAtk = this.atk
        this.maxHp = this.hp
        k.set("effectIDs", this.effectIDs)
        k.set("effectPartition", this.effectPartition)
        k.set("effectDisplayData", this.effectDisplayData)

        this.attr = k
        return [new freeUpStatusIDs(res)];
        
        //return the deleted id so that the handler can free up these id
    }
}

export default Card