import { genericCounter, StatusEffect_base } from "../effects/default/e_status";
import { Position } from "../positions";
import { Effect } from "../effects";

import { 
    type CardDry, 
    type SystemDry, 
    type ZoneTypeID, 
    type IdAble, 
    type Setting, 
    type CardDataUnified, 
    type Action,
    type TargetCard,
    Target,
    RarityRegistry,
 } from "../../core";
import type { ArchtypeID, CardDataID, RarityID } from "../../core";

export class Card implements CardDry {
    setting : Setting
    pos : Position = new Position();
    canAct : boolean = true
    originalData : CardDataUnified

    get identity() : TargetCard {
        return Target.card(this)
    }
    
    //effects section
    effects : Effect[] = [];

    //status effects are temporary effects
    statusEffects: StatusEffect_base[] = [];
    
    attr : Map<string, any> = new Map();

    constructor(
        s : Setting,
        cardData : CardDataUnified,
        effectArr : Effect[],
    ){
        this.originalData = cardData
        this.loadStat(true)
        this.setting = s
        this.effects = effectArr
    }

    private loadStat(fromStart = true){

        let statObj = {
            maxAtk : this.originalData.atk,
            maxHp : this.originalData.hp,
            level : this.originalData.level,
            extensionArr : this.originalData.extensionArr.map(i => String(i)),
            rarityID : this.originalData.rarity
        }

        this.statusEffects.forEach(i => i.parseStat(statObj))

        if(fromStart){
            this.attr.set("atk", this.originalData.atk);
            this.attr.set("hp", this.originalData.hp);

            this.attr.set("maxAtk", statObj.maxAtk);
            this.attr.set("maxHp", statObj.maxHp);
        } else {
            this.maxAtk = statObj.maxAtk
            this.maxHp = statObj.maxHp
        }

        this.level = statObj.level
        this.extensionArr = statObj.extensionArr
        this.rarityID = statObj.rarityID
    }

    //shorthand access
    get level() : number {return this.attr.get("level")}
    set level(newLevel : number){this.attr.set("level", newLevel)}

    get rarityID() : RarityID {return this.attr.get("rarityID")}
    set rarityID(newRarityID : RarityID){this.attr.set("rarityID", newRarityID)}
    
    get atk() : number {return this.attr.get("atk")}
    set atk(n : number){
        this.attr.set("atk", n)
        if(n > this.maxAtk) this.attr.set("maxAtk", n);
    }
    
    get hp() : number {return this.attr.get("hp")}
    set hp(n : number){
        this.attr.set("hp", n)
        if(n > this.maxHp) this.attr.set("maxHp", n);
    }

    get maxAtk() : number {return this.attr.get("maxAtk")}
    set maxAtk(n : number){
        //maintains the diff between 
        const diff = this.maxAtk - this.atk
        this.attr.set("maxAtk", n);
        this.hp = n - diff
    }
    
    get maxHp() : number {return this.attr.get("maxHp")}
    set maxHp(n : number){
        //maintains the diff between maxHp and hp
        const diff = this.maxHp - this.hp;
        this.attr.set("maxHp", n);
        this.hp = n - diff;
    }

    get extensionArr() : string[] {
        let res = (this.attr.get("extensionArr") ?? []) as string[]
        return res.includes("*") ? ["*"] : res;
    }
    set extensionArr(val : string[]) {this.attr.set("extensionArr", val);}
    
    //read only shorthand access
    get effectIDs() : string[] {return this.effects.map(i => i.id)}
    get imgUrl() : string | undefined {return this.originalData.imgURL}
    get dataID() : CardDataID {return this.originalData.dataID}
    
    get archtype(){return this.originalData .archtype}

    get id() : string {return this.originalData.id}
    // get name() : string {return this.originalData.dataID};
    // get dataID() : string {return this.originalData.dataID};
    get variants() : string[] {return this.originalData.variants};

    //easier attributes to work with
    get totalEffects() : Effect[] {return [...this.effects, ...this.statusEffects]}
    get isDead() : boolean {return this.hp <= 0}

    get displayAtk() {return (this.setting.show_negative_stat) ? this.atk : Math.max(this.atk, 0)}
    get displayHp() {return (this.setting.show_negative_stat) ? this.hp : Math.max(this.atk, 0)}

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

    //end partition API

    toDry() : CardDry {
        return this
    }
    
    // Effects API (mostl internal but not private due to the upper system may use this)

    disableEffect(eid : string){
        let index = this.findEffectIndex(eid);
        if(index < 0) return
        this.effects[index].disable()
    }

    disable(){
        this.effects.forEach(e => e.disable())
    }

    enable(){
        this.effects.forEach(e => e.enable())
    }

    findEffectIndex(eid?: string) : number{
        if(!eid) return -1;
        for(let i = 0; i < this.totalEffects.length; i++){
            if(this.totalEffects[i].id === eid) return i;
        }
        return -1;
    }

    //misc APIs
    //this is specicfically for step2 - resolution of effects
    reset() : Action[] {
        this.canAct = true;
        return this.totalEffects.flatMap(i => i.reset());
    }

    //status effects stuff

    clearAllStatus(){
        //i hereby declare, status effect do not do shit when they are cleared forcefully
        //i.e via this function
        //should this declaration fails in the future, modify this bad boi

        //Note that things that activate when a timer ran out can still be done 
        //it can emit activate effect - self in respond to the "turn start" action
        //      if timer <= 0, [do effect, remove status effect from self]
        //      else timer - 1, []

        //for status that activate just once, repond to turn start as normal, 
        // but decrease an internal counter too

        //reset stats, keep the effect
        this.statusEffects = []
        this.loadStat(true)
    }

    addStatusEffect(s : StatusEffect_base){
        //preferably also input the id into this thing, but to get the actual thing from the id
        //we need the handler
        //maybe we handle this outside or s.th
        this.statusEffects.push(s);
        this.loadStat(false);
    }

    removeStatusEffect(id : string){
        this.statusEffects = this.statusEffects.filter(i => i.id !== id);
        this.loadStat(true);
    }

    mergeStatusEffect(){
        let map = new Map<string | 0, StatusEffect_base[]>()
        map.set(0, []);
        this.statusEffects.forEach(i => {
            let sig = i.mergeSignature
            if(sig){
                let k = map.get(sig);
                if(k) k.push(i);
                else map.set(sig, [i]);
            } else (map.get(0) as StatusEffect_base[]).push(i)
        })
        let final : StatusEffect_base[] = []
        map.forEach((val, key) => {
            if(val.length <= 1 || key === 0) final.push(...val);
            else final.push(...val[0].merge(val.slice(1)));
        })
        this.statusEffects = final;
        this.loadStat(true);
    }

    toString(spaces : number = 4, simplify : boolean = false) {
        if(simplify) return this.id
        return JSON.stringify({
            id : this.id,
            effects : this.effects.map(i => i.toString(spaces)),
            statusEffects : this.statusEffects,
            pos : this.pos.toString(),
            canAct : this.canAct,
            attr : Array.from(Object.entries(this.attr)),
            extensionArr : this.extensionArr,
            variants : this.variants,
            archtype : this.archtype,
            dataID : this.dataID,
            imgUrl : this.imgUrl,
            rarity : RarityRegistry.getKey(this.rarityID)
        }, null, spaces)
    }

    get counters(){
        return this.statusEffects.filter(e => e instanceof genericCounter)
    }

    is(c : IdAble) : boolean;
    is(archtype : ArchtypeID) : boolean;
    is(archtypeArr : ReadonlyArray<ArchtypeID>) : boolean;
    is(p : IdAble | ArchtypeID | (readonly ArchtypeID[] & {id? : undefined})) {
        if(Array.isArray(p)){
            return p.some(ex => this.is(ex))
        }
        if(typeof p === "object"){
            return p.id === this.id
        } 
        return this.originalData.archtype.some(a => a === p)
    }

    has(extension: string): boolean;
    has(extensionArr: ReadonlyArray<string>): boolean;
    has(p: string | ReadonlyArray<string>): boolean {
        if(typeof p === "string"){
            return this.extensionArr.includes("*") || this.extensionArr.includes(p)
        }
        return p.some(ex => this.has(ex))
    }

    isFrom(s : SystemDry, z : ZoneTypeID){
        const zone = s.getZoneOf(this);
        if(!zone) return false;
        return zone.is(z)
    }
}