import Effect from "./effect";
import { StatusEffect_base } from "../../../specificEffects/e_status";
import Position from "../generics/position";
import type { dry_card, dry_system } from "../../../data/systemRegistry";

import { Action } from "../../../_queenSystem/handler/actionGenrator";
import type res from "../generics/universalResponse";
import { cardData_unified, partitionData, partitionActivationBehavior, cardData, type_and_or_subtype_inference_method, statInfo} from "../../../data/cardRegistry";

import { effectNotExist, wrongEffectIdx } from "../../errors";

import { Setting, partitionSetting } from "./settings";
import { id_able } from "../../misc";
// import error from "../../errors/error";


export class partitionData_class implements partitionData {
    mapping : number[]
    behaviorID : partitionActivationBehavior

    displayID : string
    typeID : string | type_and_or_subtype_inference_method.first | type_and_or_subtype_inference_method.most
    subTypeID : string | type_and_or_subtype_inference_method


    constructor(
        behaviorID : partitionActivationBehavior, 
        ...mapping : number[]
    );
    constructor(
        pdata : partitionData
    );
    constructor(
        pdata : partitionActivationBehavior | partitionData, 
        ...mapping : number[]
    ){
        if(typeof pdata === "object"){
            this.mapping = pdata.mapping
            this.behaviorID = pdata.behaviorID
    
            this.displayID = pdata.displayID
            this.typeID = pdata.typeID
            this.subTypeID = pdata.subTypeID
        } else {
            this.mapping = mapping
            this.behaviorID = pdata
    
            this.displayID = "default"
            this.typeID = type_and_or_subtype_inference_method.first
            this.subTypeID = type_and_or_subtype_inference_method.all
        }
    }
}

class Card {
    setting : Setting
    pos : Position = new Position();
    canAct : boolean = true
    originalData : cardData_unified
    
    //effects section
    effects : Effect[] = [];
    //maps partition index -> array of effects indexes, Record instead of array since it may have gaps
    //update : changed back into array cause why we shrink/compact to be an array 
    partitionInfo : partitionData_class[] = []
    

    //status effects are temporary effects
    statusEffects: StatusEffect_base[] = [];
    
    attr : Map<string, any> = new Map();

    constructor(
        s : Setting,
        cardData : cardData_unified,
        effectArr : Effect[],
    ){
        this.originalData = cardData
        this.loadStat(true)
        this.repartitioning(s);
        this.setting = s
        this.effects = effectArr
    }

    //load functions
    loadSetting(s : Setting){
        if(s.global_partition_setting !== this.setting.global_partition_setting){
            this.repartitioning(s)
        }
        this.setting = s
    }

    private repartitioning(newSetting : Setting){
        switch(newSetting.global_partition_setting){
            case partitionSetting.auto_mapping_one_to_one: {
                this.partitionInfo = this.effects.map((_, index) => 
                    new partitionData_class(newSetting.default_partition_behavior, index)  
                )
                return;
            }
            case partitionSetting.auto_mapping_types: {
                let mmap = new Map<string, number[]>()

                this.effects.forEach((i, index) => {
                    let key = i.signature_type
                    if(mmap.has(key)) (mmap.get(key) as number[]).push(index);
                    else mmap.set(key, [index]);
                })

                this.partitionInfo = []

                mmap.forEach(i => {
                    this.partitionInfo.push(
                        new partitionData_class(newSetting.default_partition_behavior, ...i)
                    )
                })
                return;
            }
            case partitionSetting.auto_mapping_subtypes: {
                let mmap = new Map<string, number[]>()

                this.effects.forEach((i, index) => {
                    let key = i.signature_type
                    if(mmap.has(key)) (mmap.get(key) as number[]).push(index);
                    else mmap.set(key, [index]);
                })

                this.partitionInfo = []

                mmap.forEach(i => {
                    this.partitionInfo.push(
                        new partitionData_class(newSetting.default_partition_behavior, ...i)
                    )
                })
                return;
            }
            case partitionSetting.auto_mapping_ygo: {
                this.partitionInfo = [
                    new partitionData_class(newSetting.default_partition_behavior, ...Utils.range(this.effects.length))
                ]
                return;
            }
            case partitionSetting.manual_mapping_no_ghost: {
                //I have no authroity to load effects here
                //ahhh ?

                //oh welp
                this.partitionInfo = this.originalData.partition.map(val => 
                    new partitionData_class(val)
                )
                return;
            }
            case partitionSetting.manual_mapping_with_ghost: {
                let presence = new Set<number>()

                this.partitionInfo = this.originalData.partition.map(val => {
                    val.mapping.forEach(i => presence.add(i))
                    return new partitionData_class(val)
                })

                let t : number[] = []

                for(let i = 0; i < this.effects.length; i++){
                    if(presence.has(i)) continue;
                    t.push(i)
                }

                this.partitionInfo.push(
                    new partitionData_class(newSetting.default_partition_behavior, ...t)
                )
            }
            case partitionSetting.manual_mapping_with_ghost_spread: {
                let presence = new Set<number>()

                this.partitionInfo = this.originalData.partition.map(val => {
                    val.mapping.forEach(i => presence.add(i))
                    return new partitionData_class(val.behaviorID, ...val.mapping)
                })

                for(let i = 0; i < this.effects.length; i++){
                    if(presence.has(i)) continue;
                    this.partitionInfo.push(
                        new partitionData_class(newSetting.default_partition_behavior, i)
                    )
                }

            }
        }
    }

    private loadStat(fromStart = true){

        let statObj = {
            maxAtk : this.originalData.atk,
            maxHp : this.originalData.hp,
            level : this.originalData.level,
            extensionArr : this.originalData.extensionArr.map(i => String(i))
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
    }

    //shorthand access
    get level() : number {return this.attr.get("level")}
    set level(newLevel : number){this.attr.set("level", newLevel)}

    get rarityID() : number {return this.attr.get("rarityID")}
    set rarityID(newRarityID : number){this.attr.set("rarityID", newRarityID)}
    
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
    get imgUrl() : string {return this.originalData.imgURL}
    
    //belongTo should only be used for reference only? most cards check using extension, not this
    get belongTo() : string[] {return this.originalData.belongTo}

    get id() : string {return this.originalData.id}
    get dataID() : string {return this.originalData.dataID};
    get variants() : string[] {return this.originalData.variants};

    //easier attributes to work with
    get real_effectCount() : number {return this.effects.length}
    get display_effectCount() : number {return this.partitionInfo.length}
    get totalEffects() : Effect[] {return [...this.effects, ...this.statusEffects]}
    get hasStatusEffect() : boolean {return this.statusEffects.length !== 0}
    get isDead() : boolean {return this.hp <= 0}

    get display_atk() {return (this.setting.show_negative_stat) ? this.atk : Math.max(this.atk, 0)}
    get display_hp() {return (this.setting.show_negative_stat) ? this.hp : Math.max(this.atk, 0)}

    // pushNewExtension(nExtension : string){
    //     let a = this.extensionArr
    //     a.push(nExtension)
    //     this.attr.set("extensionArr", a)
    // }

    // removeExtension(whatToRemove : string){
    //     let a = this.extensionArr
    //     a = a.filter(n => n !== whatToRemove)
    //     this.attr.set("extensionArr", a)
    // }

    //effect manipulation
    //partition API:

    private getAllGhostEffects(): number[]{
        let presenceMap : boolean[] = new Array(this.effects.length).fill(false)
        this.partitionInfo.forEach(i => {
            i.mapping.forEach(k => {presenceMap[k] = true})
        })

        return presenceMap.map((i, index) => !i ? index : undefined).filter(i => i !== undefined) as number[]
    }

    private throwPartitionConflict(cid : string, pid : number, parr : number[]){
        throw new Error(`Partition mapping invalid on card data with key ${cid}, invalid mapping on partition ${pid} : ${parr.toString()}`)
    } 

    //those id are display id, aka partition index
    replacePartition(from_eidx : number, to_eidx : number, cardToCopyFrom : Card) : res {

        if(to_eidx < 0 || to_eidx >= this.display_effectCount) 
            return [new effectNotExist(`<partition_id>_${to_eidx}`, this.id), undefined]
        if(from_eidx < 0 || from_eidx >= cardToCopyFrom.display_effectCount) 
            return [new effectNotExist(`<partition_id>_${from_eidx}`, this.id), undefined]

        let dataFrom = this.partitionInfo[from_eidx]
        let dataTo = cardToCopyFrom.partitionInfo[to_eidx]

        //1st step : delete the indexes from this card
        let res : Effect[] = []
        let indexMap = new Map<number, number>()

        this.partitionInfo.forEach((val, key) => {
            if(key !== to_eidx){
                val.mapping.forEach((i, index) => {
                    if(indexMap.has(i)){
                        let newIndex = indexMap.get(i) as number;
                        this.partitionInfo[key].mapping[index] = newIndex
                    } else {
                        indexMap.set(i, res.length);
                        res.push(this.effects[i]);
                        this.partitionInfo[key].mapping[index] = res.length - 1
                    }
                })
            }
        })

        // delete this.partitionInfo[to_eidx]

        //push back the data not referenced but still not deleted
        //allowing ghost effects
        if(res.length !== this.effects.length){
            for(let i = 0; i < this.effects.length; i++){
                if(dataTo.mapping.includes(i)) continue;
                if(indexMap.has(i)) continue;
                res.push(this.effects[i]);
            }
        }
        this.effects = res

        let newPartitionInfo = new partitionData_class(dataFrom)

        //2nd step : add the new effects in
        dataFrom.mapping.forEach(i => {
            newPartitionInfo.mapping.push(this.effects.length)
            this.effects.push(cardToCopyFrom.effects[i])
        })

        this.partitionInfo[to_eidx] = newPartitionInfo
        
        return [undefined, []]
    }

    removePartition(pid : number) : res {
        //delete the indexes from this card
        let res : Effect[] = []
        let indexMap = new Map<number, number>()


        this.partitionInfo.forEach((val, key) => {
            if(key !== pid){
                val.mapping.forEach((i, index) => {
                    if(indexMap.has(i)){
                        let newIndex = indexMap.get(i) as number
                        this.partitionInfo[key].mapping[index] = newIndex
                    } else {
                        indexMap.set(i, res.length);
                        res.push(this.effects[i]);
                        this.partitionInfo[key].mapping[index] = res.length - 1
                    }
                })
            }
        })
        
        //push back the data not referenced but still not deleted
        //allowing ghost effects
        if(res.length !== this.effects.length){
            for(let i = 0; i < this.effects.length; i++){
                if(this.partitionInfo[pid].mapping.includes(i)) continue;
                if(indexMap.has(i)) continue;
                res.push(this.effects[i]);
            }
        }
        this.effects = res

        delete this.partitionInfo[pid]

        return [undefined, []]
    }

    private sanitizePartitionMapping(mapping : number[]){
        return mapping.filter(i => {
            i >= 0 && i < this.effects.length
        })
    }

    insertPartition(partition : partitionData, newEffects : Effect[] = []) : res {
        this.effects.push(...newEffects)
        let newRes = this.sanitizePartitionMapping(partition.mapping)
        if(newRes.length !== partition.mapping.length && !this.setting.ignore_invalid_partition_mapping){
            this.throwPartitionConflict(this.id, this.partitionInfo.length, partition.mapping)
        }
        partition.mapping = newRes
        this.partitionInfo.push(new partitionData_class(partition));
        return [undefined, []]
    }

    remapPartition(targetPartitionID : number, newMapping : number[]){
        let k = this.sanitizePartitionMapping(newMapping)
        if(
            k.length !== newMapping.length && !this.setting.ignore_invalid_partition_mapping ||
            targetPartitionID < 0 ||  targetPartitionID >= this.partitionInfo.length
        ){
            this.throwPartitionConflict(this.id, targetPartitionID, newMapping)
        }
        this.partitionInfo[targetPartitionID].mapping = k
    }

    updatePartitionInfo(targetPartitionID : number, patchData : Partial<partitionData>){

        if(targetPartitionID < 0 ||  targetPartitionID >= this.partitionInfo.length){
            this.throwPartitionConflict(this.id, targetPartitionID, [])
        }

        if(patchData.mapping){
            let k = this.sanitizePartitionMapping(patchData.mapping);
            if(k.length !== patchData.mapping.length && !this.setting.ignore_invalid_partition_mapping){
                this.throwPartitionConflict(this.id, targetPartitionID, patchData.mapping)
            }
            patchData.mapping = k
        }

        Utils.patchGeneric(this.partitionInfo[targetPartitionID], patchData);
    }

    getPartitionDisplayInputs(sys : dry_system, partitionIndex : number) : (string | number)[]; //input array
    getPartitionDisplayInputs(sys : dry_system) : (string | number)[][]; //displayID -> input array
    getPartitionDisplayInputs(sys : dry_system, pid = -1){
        //default implementation
        if(pid < 0){
            //get all

            return this.partitionInfo.map(data => {
                let res : (string | number)[] = []
                data.mapping.forEach(i => res.push(...this.effects[i].getDisplayInput(this, sys)))
                return res
            })

        } else {
            let res : (string | number)[] = []
            this.partitionInfo[pid].mapping.forEach(i => {
                res.push(...this.effects[i].getDisplayInput(this, sys))
            })
            return res
        }
    }

    isInSamePartition(eindex1 : number, eindex2 : number) : boolean {
        const e1 = this.effects[eindex1]
        const e2 = this.effects[eindex2]
        if(!e1 || !e2) return false;
        return this.partitionInfo.some(p => {
            p.mapping.length >= 2 && p.mapping.includes(eindex1) && p.mapping.includes(eindex2)
        })
    }

    getAllPartitions(eindex : number) : number[]{
        const e = this.effects[eindex]
        if(!e) return []
        let res : number[] = []
        this.partitionInfo.forEach((p, i) => {
            if(p.mapping.length >= 2 && p.mapping.includes(eindex)) res.push(i)
        })
        return res;
    }

    //end partition API

    /** @final */
    toDry() : dry_card {
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

    getEffect(eid? :string) : Effect | undefined {
        let index = this.findEffectIndex(eid);
        if(index < 0) return undefined
        return this.totalEffects[index]
    }

    getResponseIndexArr(system : dry_system, a : Action) : number[]{
        //returns the effect indexes that respond
        let res = new Set<number>()

        //update 1.2.6
        //assume map is all 1s
        let map = this.effects.map(i => i.canRespondAndActivate_prelim(this, system, a));

        this.partitionInfo.forEach(i => {
            switch(i.behaviorID){
                case partitionActivationBehavior.first: {
                    for(let j = 0; j < i.mapping.length; j++){
                        if(map[ i.mapping[j] ]) {
                            res.add(j)
                            return;
                        }
                    }
                    return;
                }
                case partitionActivationBehavior.last: {
                    for(let j = i.mapping.length - 1; j >= 0; j--){
                        if(map[ i.mapping[j] ]) {
                            res.add(j)
                            return;
                        }
                    }
                    return;
                }
                case partitionActivationBehavior.loose: {
                    for(let j = i.mapping.length - 1; j >= 0; j--){
                        if(map[ i.mapping[j] ]) res.add(j)
                    }
                    return;
                }
                case partitionActivationBehavior.strict: {
                    if(i.mapping.some(t => map[t] === false)) return;
                    for(let j = i.mapping.length - 1; j >= 0; j--){
                        if(map[ i.mapping[j] ]) res.add(j)
                    }
                    return;
                }
            }
        })
        let l = this.effects.length
        this.statusEffects.forEach((i, index) => {
            if(i.canRespondAndActivate_prelim(this, system, a)) res.add(index + l)
        })
        this.getAllGhostEffects().forEach(i => {
            if( map[i] ) res.add(i)
        })
        return Array.from(res).sort();
    }; 

    // activateEffect(idx : number, system : dry_system, a : Action) : [error, undefined] | [undefined, ReturnType<Effect["activate"]>]
    // activateEffect(eid : string, system : dry_system, a : Action) : [error, undefined] | [undefined, ReturnType<Effect["activate"]>]
    // activateEffect(id : number | string, system : dry_system, a : Action) : [error, undefined] | [undefined, ReturnType<Effect["activate"]>]{
    //     let idx : number
    //     if(typeof id === "number"){
    //         idx = id;
    //     } else {
    //         idx = this.findEffectIndex(id);
    //         if(idx < 0) return [new effectNotExist(id, this.id), undefined]
    //     }
    //     if(!this.totalEffects[idx]){
    //         let err = new wrongEffectIdx(idx, this.id)
    //         err.add("card.ts", "activateEffect", 25)
    //         return [err, undefined]
    //     }
    //     //assumes can activate
    //     //fix later
    //     return [undefined, this.totalEffects[idx].activate(this, system, a)]
    // }

    // activateEffectSubtypeSpecificFunc(eidx : number, subTypeidx : number, system : dry_system, a : Action) : res;
    // activateEffectSubtypeSpecificFunc(eidx : number, subTypeID  : string, system : dry_system, a : Action) : res;
    // activateEffectSubtypeSpecificFunc(eID  : string, subTypeID  : string, system : dry_system, a : Action) : res;
    // activateEffectSubtypeSpecificFunc(eID  : string, subTypeidx : number, system : dry_system, a : Action) : res;
    // activateEffectSubtypeSpecificFunc(effectIdentifier : string | number, subtypeIdentifier : string | number, system : dry_system, a : Action) : res{
    //     let idx : number
    //     if(typeof effectIdentifier === "string"){
    //         idx = this.findEffectIndex(effectIdentifier)
    //         if(idx < 0) return [new effectNotExist(effectIdentifier, this.id), undefined]
    //     } else idx = effectIdentifier;
    //     if(!this.totalEffects[idx]){
    //         let err = new wrongEffectIdx(idx, this.id)
    //         err.add("card.ts", "activateEffect", 25)
    //         return [err, undefined]
    //     }
    //     return [undefined, this.totalEffects[idx].activateSubtypeSpecificFunc(subtypeIdentifier, this, system, a)];
    // }

    //misc APIs
    //this is specicfically for step2 - resolution of effects
    reset() : Action[] {
        this.canAct = true;
        let res : Action[] = [];
        this.totalEffects.forEach(i => res.push(...i.reset()));
        return res;
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
            belongTo : this.belongTo,
            dataID : this.dataID,
            imgUrl : this.imgUrl,
        }, null, spaces)
    }

    is(c : id_able) : boolean;
    is(extension : string) : boolean;
    is(extensionArr : ReadonlyArray<string>) : boolean;
    is(p : id_able | string | (readonly string[] & {id? : undefined})) {
        if(Array.isArray(p)){
            return p.some(ex => this.is(ex))
        }
        if(typeof p === "object"){
            return p.id === this.id
        } 
        return this.extensionArr.includes("*") || this.extensionArr.includes(p)
    }
}

export default Card