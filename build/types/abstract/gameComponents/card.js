"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionData_class = void 0;
const e_status_1 = require("../../../specificEffects/e_status");
const position_1 = __importDefault(require("../generics/position"));
const cardRegistry_1 = require("../../../data/cardRegistry");
const errors_1 = require("../../errors");
const settings_1 = require("./settings");
// import error from "../../errors/error";
class partitionData_class {
    constructor(pdata, ...mapping) {
        if (typeof pdata === "object") {
            this.mapping = pdata.mapping;
            this.behaviorID = pdata.behaviorID;
            this.displayID = pdata.displayID;
            this.typeID = pdata.typeID;
            this.subTypeID = pdata.subTypeID;
        }
        else {
            this.mapping = mapping;
            this.behaviorID = pdata;
            this.displayID = "default";
            this.typeID = cardRegistry_1.type_and_or_subtype_inference_method.first;
            this.subTypeID = cardRegistry_1.type_and_or_subtype_inference_method.all;
        }
    }
}
exports.partitionData_class = partitionData_class;
class Card {
    constructor(s, cardData, effectArr) {
        this.pos = new position_1.default();
        this.canAct = true;
        //effects section
        this.effects = [];
        //maps partition index -> array of effects indexes, Record instead of array since it may have gaps
        //update : changed back into array cause why we shrink/compact to be an array 
        this.partitionInfo = [];
        //status effects are temporary effects
        this.statusEffects = [];
        this.attr = new Map();
        this.pInputMap = new Map;
        this.pShareMemory = new Map;
        this.originalData = cardData;
        this.loadStat(true);
        this.repartitioning(s);
        this.setting = s;
        this.effects = effectArr;
    }
    //load functions
    loadSetting(s) {
        if (s.global_partition_setting !== this.setting.global_partition_setting) {
            this.repartitioning(s);
        }
        this.setting = s;
    }
    repartitioning(newSetting) {
        switch (newSetting.global_partition_setting) {
            case settings_1.partitionSetting.auto_mapping_one_to_one: {
                this.partitionInfo = this.effects.map((_, index) => new partitionData_class(newSetting.default_partition_behavior, index));
                return;
            }
            case settings_1.partitionSetting.auto_mapping_types: {
                let mmap = new Map();
                this.effects.forEach((i, index) => {
                    let key = i.signature_type;
                    if (mmap.has(key))
                        mmap.get(key).push(index);
                    else
                        mmap.set(key, [index]);
                });
                this.partitionInfo = [];
                mmap.forEach(i => {
                    this.partitionInfo.push(new partitionData_class(newSetting.default_partition_behavior, ...i));
                });
                return;
            }
            case settings_1.partitionSetting.auto_mapping_subtypes: {
                let mmap = new Map();
                this.effects.forEach((i, index) => {
                    let key = i.signature_type;
                    if (mmap.has(key))
                        mmap.get(key).push(index);
                    else
                        mmap.set(key, [index]);
                });
                this.partitionInfo = [];
                mmap.forEach(i => {
                    this.partitionInfo.push(new partitionData_class(newSetting.default_partition_behavior, ...i));
                });
                return;
            }
            case settings_1.partitionSetting.auto_mapping_ygo: {
                this.partitionInfo = [
                    new partitionData_class(newSetting.default_partition_behavior, ...Utils.range(this.effects.length))
                ];
                return;
            }
            case settings_1.partitionSetting.manual_mapping_no_ghost: {
                //I have no authroity to load effects here
                //ahhh ?
                //oh welp
                this.partitionInfo = this.originalData.partition.map(val => new partitionData_class(val));
                return;
            }
            case settings_1.partitionSetting.manual_mapping_with_ghost: {
                let presence = new Set();
                this.partitionInfo = this.originalData.partition.map(val => {
                    val.mapping.forEach(i => presence.add(i));
                    return new partitionData_class(val);
                });
                let t = [];
                for (let i = 0; i < this.effects.length; i++) {
                    if (presence.has(i))
                        continue;
                    t.push(i);
                }
                this.partitionInfo.push(new partitionData_class(newSetting.default_partition_behavior, ...t));
            }
            case settings_1.partitionSetting.manual_mapping_with_ghost_spread: {
                let presence = new Set();
                this.partitionInfo = this.originalData.partition.map(val => {
                    val.mapping.forEach(i => presence.add(i));
                    return new partitionData_class(val.behaviorID, ...val.mapping);
                });
                for (let i = 0; i < this.effects.length; i++) {
                    if (presence.has(i))
                        continue;
                    this.partitionInfo.push(new partitionData_class(newSetting.default_partition_behavior, i));
                }
            }
        }
    }
    loadStat(fromStart = true) {
        let statObj = {
            maxAtk: this.originalData.atk,
            maxHp: this.originalData.hp,
            level: this.originalData.level,
            extensionArr: this.originalData.extensionArr.map(i => String(i)),
            rarityID: this.originalData.rarityID
        };
        this.statusEffects.forEach(i => i.parseStat(statObj));
        if (fromStart) {
            this.attr.set("atk", this.originalData.atk);
            this.attr.set("hp", this.originalData.hp);
            this.attr.set("maxAtk", statObj.maxAtk);
            this.attr.set("maxHp", statObj.maxHp);
        }
        else {
            this.maxAtk = statObj.maxAtk;
            this.maxHp = statObj.maxHp;
        }
        this.level = statObj.level;
        this.extensionArr = statObj.extensionArr;
        this.rarityID = statObj.rarityID;
    }
    //shorthand access
    get level() { return this.attr.get("level"); }
    set level(newLevel) { this.attr.set("level", newLevel); }
    get rarityID() { return this.attr.get("rarityID"); }
    set rarityID(newRarityID) { this.attr.set("rarityID", newRarityID); }
    get atk() { return this.attr.get("atk"); }
    set atk(n) {
        this.attr.set("atk", n);
        if (n > this.maxAtk)
            this.attr.set("maxAtk", n);
    }
    get hp() { return this.attr.get("hp"); }
    set hp(n) {
        this.attr.set("hp", n);
        if (n > this.maxHp)
            this.attr.set("maxHp", n);
    }
    get maxAtk() { return this.attr.get("maxAtk"); }
    set maxAtk(n) {
        //maintains the diff between 
        const diff = this.maxAtk - this.atk;
        this.attr.set("maxAtk", n);
        this.hp = n - diff;
    }
    get maxHp() { return this.attr.get("maxHp"); }
    set maxHp(n) {
        //maintains the diff between maxHp and hp
        const diff = this.maxHp - this.hp;
        this.attr.set("maxHp", n);
        this.hp = n - diff;
    }
    get extensionArr() {
        var _a;
        let res = ((_a = this.attr.get("extensionArr")) !== null && _a !== void 0 ? _a : []);
        return res.includes("*") ? ["*"] : res;
    }
    set extensionArr(val) { this.attr.set("extensionArr", val); }
    //read only shorthand access
    get effectIDs() { return this.effects.map(i => i.id); }
    get imgUrl() { return this.originalData.imgURL; }
    //belongTo should only be used for reference only? most cards check using extension, not this
    get belongTo() { return this.originalData.belongTo; }
    get id() { return this.originalData.id; }
    get dataID() { return this.originalData.dataID; }
    ;
    get variants() { return this.originalData.variants; }
    ;
    //easier attributes to work with
    get real_effectCount() { return this.effects.length; }
    get display_effectCount() { return this.partitionInfo.length; }
    get totalEffects() { return [...this.effects, ...this.statusEffects]; }
    get hasStatusEffect() { return this.statusEffects.length !== 0; }
    get isDead() { return this.hp <= 0; }
    get display_atk() { return (this.setting.show_negative_stat) ? this.atk : Math.max(this.atk, 0); }
    get display_hp() { return (this.setting.show_negative_stat) ? this.hp : Math.max(this.atk, 0); }
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
    getAllGhostEffects() {
        let presenceMap = new Array(this.effects.length).fill(false);
        this.partitionInfo.forEach(i => {
            i.mapping.forEach(k => { presenceMap[k] = true; });
        });
        return presenceMap.map((i, index) => !i ? index : undefined).filter(i => i !== undefined);
    }
    throwPartitionConflict(cid, pid, parr) {
        throw new Error(`Partition mapping invalid on card data with key ${cid}, invalid mapping on partition ${pid} : ${parr.toString()}`);
    }
    //those id are display id, aka partition index
    replacePartition(from_eidx, to_eidx, cardToCopyFrom) {
        if (to_eidx < 0 || to_eidx >= this.display_effectCount)
            return [new errors_1.effectNotExist(`<partition_id>_${to_eidx}`, this.id), undefined];
        if (from_eidx < 0 || from_eidx >= cardToCopyFrom.display_effectCount)
            return [new errors_1.effectNotExist(`<partition_id>_${from_eidx}`, this.id), undefined];
        let dataFrom = this.partitionInfo[from_eidx];
        let dataTo = cardToCopyFrom.partitionInfo[to_eidx];
        //1st step : delete the indexes from this card
        let res = [];
        let indexMap = new Map();
        this.partitionInfo.forEach((val, key) => {
            if (key !== to_eidx) {
                val.mapping.forEach((i, index) => {
                    if (indexMap.has(i)) {
                        let newIndex = indexMap.get(i);
                        this.partitionInfo[key].mapping[index] = newIndex;
                    }
                    else {
                        indexMap.set(i, res.length);
                        res.push(this.effects[i]);
                        this.partitionInfo[key].mapping[index] = res.length - 1;
                    }
                });
            }
        });
        // delete this.partitionInfo[to_eidx]
        //push back the data not referenced but still not deleted
        //allowing ghost effects
        if (res.length !== this.effects.length) {
            for (let i = 0; i < this.effects.length; i++) {
                if (dataTo.mapping.includes(i))
                    continue;
                if (indexMap.has(i))
                    continue;
                res.push(this.effects[i]);
            }
        }
        this.effects = res;
        let newPartitionInfo = new partitionData_class(dataFrom);
        //2nd step : add the new effects in
        dataFrom.mapping.forEach(i => {
            newPartitionInfo.mapping.push(this.effects.length);
            this.effects.push(cardToCopyFrom.effects[i]);
        });
        this.partitionInfo[to_eidx] = newPartitionInfo;
        return [undefined, []];
    }
    removePartition(pid) {
        //delete the indexes from this card
        let res = [];
        let indexMap = new Map();
        this.partitionInfo.forEach((val, key) => {
            if (key !== pid) {
                val.mapping.forEach((i, index) => {
                    if (indexMap.has(i)) {
                        let newIndex = indexMap.get(i);
                        this.partitionInfo[key].mapping[index] = newIndex;
                    }
                    else {
                        indexMap.set(i, res.length);
                        res.push(this.effects[i]);
                        this.partitionInfo[key].mapping[index] = res.length - 1;
                    }
                });
            }
        });
        //push back the data not referenced but still not deleted
        //allowing ghost effects
        if (res.length !== this.effects.length) {
            for (let i = 0; i < this.effects.length; i++) {
                if (this.partitionInfo[pid].mapping.includes(i))
                    continue;
                if (indexMap.has(i))
                    continue;
                res.push(this.effects[i]);
            }
        }
        this.effects = res;
        delete this.partitionInfo[pid];
        return [undefined, []];
    }
    sanitizePartitionMapping(mapping) {
        return mapping.filter(i => {
            i >= 0 && i < this.effects.length;
        });
    }
    insertPartition(partition, newEffects = []) {
        this.effects.push(...newEffects);
        let newRes = this.sanitizePartitionMapping(partition.mapping);
        if (newRes.length !== partition.mapping.length && !this.setting.ignore_invalid_partition_mapping) {
            this.throwPartitionConflict(this.id, this.partitionInfo.length, partition.mapping);
        }
        partition.mapping = newRes;
        this.partitionInfo.push(new partitionData_class(partition));
        return [undefined, []];
    }
    remapPartition(targetPartitionID, newMapping) {
        let k = this.sanitizePartitionMapping(newMapping);
        if (k.length !== newMapping.length && !this.setting.ignore_invalid_partition_mapping ||
            targetPartitionID < 0 || targetPartitionID >= this.partitionInfo.length) {
            this.throwPartitionConflict(this.id, targetPartitionID, newMapping);
        }
        this.partitionInfo[targetPartitionID].mapping = k;
    }
    updatePartitionInfo(targetPartitionID, patchData) {
        if (targetPartitionID < 0 || targetPartitionID >= this.partitionInfo.length) {
            this.throwPartitionConflict(this.id, targetPartitionID, []);
        }
        if (patchData.mapping) {
            let k = this.sanitizePartitionMapping(patchData.mapping);
            if (k.length !== patchData.mapping.length && !this.setting.ignore_invalid_partition_mapping) {
                this.throwPartitionConflict(this.id, targetPartitionID, patchData.mapping);
            }
            patchData.mapping = k;
        }
        Utils.patchGeneric(this.partitionInfo[targetPartitionID], patchData);
    }
    getPartitionDisplayInputs(sys, pid = -1) {
        //default implementation
        if (pid < 0) {
            //get all
            return this.getAllDisplayEffects().map(p => this.getPartitionDisplayInputs(sys, p.pid));
        }
        else {
            if (pid >= this.partitionInfo.length) {
                pid -= this.partitionInfo.length;
                if (pid >= this.statusEffects.length) {
                    //ghost effects
                    pid -= this.statusEffects.length;
                    const res = this.effects[pid];
                    if (res)
                        return res.getDisplayInput(this, sys);
                    return [];
                }
                //status effects
                const res = this.statusEffects[pid];
                if (res)
                    return res.getDisplayInput(this, sys);
                return [];
            }
            const partition = this.partitionInfo[pid];
            if (!partition)
                return [];
            return partition.mapping.map(i => this.effects[i]).flatMap(e => e.getDisplayInput(this, sys));
        }
    }
    isInSamePartition(eindex1, eindex2) {
        const e1 = this.effects[eindex1];
        const e2 = this.effects[eindex2];
        if (!e1 || !e2)
            return false;
        return this.partitionInfo.some(p => {
            p.mapping.length >= 2 && p.mapping.includes(eindex1) && p.mapping.includes(eindex2);
        });
    }
    getAllPartitionsIDs(eindex) {
        let res = [];
        this.partitionInfo.forEach((p, i) => {
            if (p.mapping.length >= 2 && p.mapping.includes(eindex))
                res.push(i);
        });
        if (res.length === 0) {
            //eff is ghost or status
            if (eindex < this.effects.length) {
                //ghost
                return [eindex + this.partitionInfo.length + this.statusEffects.length];
            }
            //status
            return [eindex + this.partitionInfo.length];
        }
        return res;
    }
    inferPdata(pdata) {
        var _a, _b, _c;
        const res = {};
        const effs = pdata.mapping.map(i => this.effects[i]);
        switch (pdata.typeID) {
            case cardRegistry_1.type_and_or_subtype_inference_method.first: {
                res.type = effs[0] ? effs[0].type.dataID : "e_t_null";
                break;
            }
            case cardRegistry_1.type_and_or_subtype_inference_method.most: {
                res.type = (_a = Utils.most(effs.map(e => e.type.dataID))) !== null && _a !== void 0 ? _a : "e_t_null";
                break;
            }
            default: {
                res.type = (_b = pdata.typeID) !== null && _b !== void 0 ? _b : "e_t_null";
                break;
            }
        }
        switch (pdata.subTypeID) {
            case cardRegistry_1.type_and_or_subtype_inference_method.first: {
                res.subtype = effs[0] ? effs[0].subTypes.map(st => st.dataID) : [];
                break;
            }
            case cardRegistry_1.type_and_or_subtype_inference_method.most: {
                res.subtype = [(_c = Utils.most(effs.flatMap(e => e.subTypes.map(st => st.dataID)))) !== null && _c !== void 0 ? _c : ""];
                if (res.subtype[0].length === 0)
                    res.subtype = [];
                break;
            }
            case cardRegistry_1.type_and_or_subtype_inference_method.all: {
                res.subtype = effs.flatMap(e => e.subTypes.map(st => st.dataID));
                break;
            }
            default: {
                res.subtype = pdata.subTypeID;
                break;
            }
        }
        if (pdata.displayID)
            res.key = pdata.displayID;
        else if (effs[0])
            res.key = effs[0].displayID;
        return (res.key) ? res : undefined;
    }
    getAllDisplayEffects() {
        return this.partitionInfo.map((p, index) => {
            const obj = this.inferPdata(p);
            if (!obj)
                return undefined;
            return {
                pid: index,
                key: obj.key,
                type: obj.type,
                subtypes: obj.subtype
            };
        }).filter(c => c !== undefined);
    }
    isStatusPartition(pid) {
        return (pid >= this.partitionInfo.length && pid - this.partitionInfo.length < this.statusEffects.length);
    }
    getParititonInputObj(pid, s, a) {
        if (pid >= this.partitionInfo.length) {
            pid -= this.partitionInfo.length;
            if (pid >= this.statusEffects.length) {
                //ghost effects
                pid -= this.statusEffects.length;
                const res = this.effects[pid];
                if (res)
                    return res.getInputObj(this, s, a);
                return;
            }
            //status effects
            const res = this.statusEffects[pid];
            if (res)
                return res.getInputObj(this, s, a);
            return;
        }
        const pdata = this.partitionInfo[pid];
        if (!pdata)
            return;
        const iarr = pdata.mapping.map(i => {
            const res = this.effects[i].getInputObj(this, s, a);
            if (res)
                this.pInputMap.set(i, res);
            return res;
        }).filter(e => e !== undefined);
        if (iarr.length === 0)
            return;
        return iarr.reduce((prev, curr) => prev.merge_with_signature(curr));
    }
    getFirstActualPartitionIndex() {
        if (this.partitionInfo.length)
            return 0;
        if (this.effects.length)
            return this.getAllGhostEffects()[0] + this.partitionInfo.length + this.statusEffects.length;
        return -1;
    }
    activatePartition(pid, s, a, input) {
        if (pid >= this.partitionInfo.length) {
            pid -= this.partitionInfo.length;
            if (pid >= this.statusEffects.length) {
                //ghost effects
                pid -= this.statusEffects.length;
                const res = this.effects[pid];
                if (res)
                    return res.activate(this, s, a, input);
                return [];
            }
            //status effects
            const res = this.statusEffects[pid];
            if (res)
                return res.activate(this, s, a, input);
            return [];
        }
        const pdata = this.partitionInfo[pid];
        if (!pdata)
            return [];
        const iarr = pdata.mapping.map(i => {
            const k = this.pInputMap.get(i);
            if (k)
                k.emplaceReserve();
            return k;
        });
        const mem = this.pShareMemory.get(pid);
        const res = pdata.mapping.flatMap((i, idx) => {
            //transplant memory
            if (mem)
                mem.forEach((val, key) => this.effects[i].attr.set(key, val));
            return this.effects[i].activate(this, s, a, iarr[idx]);
        });
        //clear saved inputs
        this.pInputMap.clear();
        this.pShareMemory.delete(pid);
        return res;
    }
    addShareMemory(e, key, val) {
        const eindex = this.findEffectIndex(e.id);
        const pid = this.getAllPartitionsIDs(eindex);
        if (pid.length <= 0)
            return;
        pid.forEach(p => {
            let k = this.pShareMemory.get(p);
            if (!k) {
                k = new Map();
                this.pShareMemory.set(p, k);
            }
            k.set(key, val);
        });
    }
    //end partition API
    /** @final */
    toDry() {
        return this;
    }
    // Effects API (mostl internal but not private due to the upper system may use this)
    disableEffect(eid) {
        let index = this.findEffectIndex(eid);
        if (index < 0)
            return;
        this.effects[index].disable();
    }
    disable() {
        this.effects.forEach(e => e.disable());
    }
    enable() {
        this.effects.forEach(e => e.enable());
    }
    findEffectIndex(eid) {
        if (!eid)
            return -1;
        for (let i = 0; i < this.totalEffects.length; i++) {
            if (this.totalEffects[i].id === eid)
                return i;
        }
        return -1;
    }
    getEffect(eid) {
        let index = this.findEffectIndex(eid);
        if (index < 0)
            return undefined;
        return this.totalEffects[index];
    }
    getResponseIndexArr(system, a) {
        //returns the effect indexes that respond
        let res = [];
        //update 1.2.6
        //assume map is all 1s
        let map = this.effects.map(i => i.canRespondAndActivate_prelim(this, system, a));
        this.partitionInfo.forEach((i, index) => {
            switch (i.behaviorID) {
                case cardRegistry_1.partitionActivationBehavior.first: {
                    if (i.mapping.length && map[i.mapping[0]]) {
                        res.push(index);
                    }
                    return;
                }
                case cardRegistry_1.partitionActivationBehavior.last: {
                    //only allow the last to activate
                    if (i.mapping.length && map[i.mapping.at(-1)]) {
                        res.push(index);
                    }
                    return;
                }
                case cardRegistry_1.partitionActivationBehavior.strict: {
                    if (i.mapping.some(t => map[t] === false))
                        return;
                    res.push(index);
                    return;
                }
            }
        });
        //pid mapping
        //0 -> pinfo's len - 1 : normal map, 1 to 1
        //pinfo's len -> pinfo's len + status's len -1 (x): map to status eff id x - pinfo's len 
        //pinfo's len + status's len -> pinfo's len + status's len + efflen's len (x): map to eff id 
        let l = this.partitionInfo.length;
        this.statusEffects.forEach((i, index) => {
            if (i.canRespondAndActivate_prelim(this, system, a))
                res.push(index + l);
        });
        l = l + this.statusEffects.length;
        this.getAllGhostEffects().forEach(i => {
            if (map[i])
                res.push(l + i);
        });
        return res;
    }
    ;
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
    reset() {
        this.canAct = true;
        let res = [];
        this.totalEffects.forEach(i => res.push(...i.reset()));
        return res;
    }
    //status effects stuff
    clearAllStatus() {
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
        this.statusEffects = [];
        this.loadStat(true);
    }
    addStatusEffect(s) {
        //preferably also input the id into this thing, but to get the actual thing from the id
        //we need the handler
        //maybe we handle this outside or s.th
        this.statusEffects.push(s);
        this.loadStat(false);
    }
    removeStatusEffect(id) {
        this.statusEffects = this.statusEffects.filter(i => i.id !== id);
        this.loadStat(true);
    }
    mergeStatusEffect() {
        let map = new Map();
        map.set(0, []);
        this.statusEffects.forEach(i => {
            let sig = i.mergeSignature;
            if (sig) {
                let k = map.get(sig);
                if (k)
                    k.push(i);
                else
                    map.set(sig, [i]);
            }
            else
                map.get(0).push(i);
        });
        let final = [];
        map.forEach((val, key) => {
            if (val.length <= 1 || key === 0)
                final.push(...val);
            else
                final.push(...val[0].merge(val.slice(1)));
        });
        this.statusEffects = final;
        this.loadStat(true);
    }
    toString(spaces = 4, simplify = false) {
        if (simplify)
            return this.id;
        return JSON.stringify({
            id: this.id,
            effects: this.effects.map(i => i.toString(spaces)),
            statusEffects: this.statusEffects,
            pos: this.pos.toString(),
            canAct: this.canAct,
            attr: Array.from(Object.entries(this.attr)),
            extensionArr: this.extensionArr,
            variants: this.variants,
            belongTo: this.belongTo,
            dataID: this.dataID,
            imgUrl: this.imgUrl,
        }, null, spaces);
    }
    get numCounters() {
        return this.statusEffects.filter(s => s.is(e_status_1.genericCounter)).reduce((prev, cur) => prev + cur.count, 0);
    }
    get hasCounter() {
        return this.statusEffects.some(s => s.is(e_status_1.genericCounter));
    }
    is(p) {
        if (Array.isArray(p)) {
            return p.some(ex => this.is(ex));
        }
        if (typeof p === "object") {
            return p.id === this.id;
        }
        return this.extensionArr.includes("*") || this.extensionArr.includes(p);
    }
    isFrom(s, z) {
        const zone = s.getZoneOf(this);
        if (!zone)
            return false;
        return zone.is(z);
    }
}
exports.default = Card;
