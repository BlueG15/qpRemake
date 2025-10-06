"use strict";
//zones handler is handler of all the zones
//and importantly, converter from action to zone func calls
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = __importDefault(require("../../types/defaultZones/system"));
const deck_1 = __importDefault(require("../../types/defaultZones/deck"));
const storage_1 = __importDefault(require("../../types/defaultZones/storage"));
const grave_1 = __importDefault(require("../../types/defaultZones/grave"));
const hand_1 = __importDefault(require("../../types/defaultZones/hand"));
const field_1 = __importDefault(require("../../types/defaultZones/field"));
const ability_1 = __importDefault(require("../../types/defaultZones/ability"));
const void_1 = __importDefault(require("../../types/defaultZones/void"));
const zoneRegistry_1 = __importDefault(require("../../data/zoneRegistry"));
const zoneRegistry_2 = require("../../data/zoneRegistry");
const errors_1 = require("../../types/errors");
const position_1 = __importDefault(require("../../types/abstract/generics/position"));
const actionGenrator_1 = require("./actionGenrator");
const actionRegistry_1 = __importDefault(require("../../data/actionRegistry"));
const misc_1 = require("../../types/misc");
const actionInputGenerator_1 = require("./actionInputGenerator");
const drop_1 = __importDefault(require("../../types/defaultZones/drop"));
class zoneHandler {
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
    constructor(regs) {
        this.zoneArr = [];
        this.loader = regs.zoneLoader;
    }
    loadZones(s, players) {
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_system], zoneRegistry_1.default.z_system, system_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_drop], zoneRegistry_1.default.z_drop, drop_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_void], zoneRegistry_1.default.z_void, void_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_deck], zoneRegistry_1.default.z_deck, deck_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_hand], zoneRegistry_1.default.z_hand, hand_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_storage], zoneRegistry_1.default.z_storage, storage_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_field], zoneRegistry_1.default.z_field, field_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_grave], zoneRegistry_1.default.z_grave, grave_1.default);
        this.loader.load(zoneRegistry_2.zoneRegistry[zoneRegistry_2.zoneRegistry.z_ability], zoneRegistry_1.default.z_ability, ability_1.default);
        // this.maxPlayerIndex = s.players.length
        Object.entries(zoneRegistry_1.default).forEach(([zkey, zdata], index) => {
            if (!zdata.instancedFor.length) {
                let zinstance = this.loader.getZone(zkey, s);
                Utils.insertionSort(this.zoneArr, zinstance, this.sortFunc);
            }
            else {
                players.forEach((p, pindex) => {
                    let zinstance = this.loader.getZone(zkey, s, p.playerType, pindex);
                    if (zdata.instancedFor.includes(p.playerType)) {
                        Utils.insertionSort(this.zoneArr, zinstance, this.sortFunc);
                    }
                });
            }
        });
        this.correctID();
    }
    sortFunc(a, b) {
        const x = a.priority, y = b.priority;
        if (Object.is(x, y))
            return 0;
        const rank = (a) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }
    correctID() {
        for (let i = 0; i < this.zoneArr.length; i++)
            this.zoneArr[i].id = i;
    }
    load(key, data, c) {
        this.loader.load(key, data, c);
    }
    add(zclassID, s, ptype, pid, zDataID) {
        let instance = this.loader.getZone(zclassID, s, ptype, pid, zDataID);
        if (!instance)
            throw new Error(`Fail to create instance of zone ${zclassID}`);
        Utils.insertionSort(this.zoneArr, instance, this.sortFunc);
        this.correctID();
    }
    load_and_add_noPlayer(key, s, param3, param4) {
        //case 1, add both
        if (typeof param3 === "object" && typeof param4 === "function") {
            this.loader.load(key, param3, param4);
            this.add(key, s, -1, -1, key);
            return;
        }
        if (!param4)
            param4 = key;
        //case 2, add class only
        if (typeof param3 === "function") {
            this.loader.load(key, undefined, param3);
            this.add(key, s, -1, -1, param4);
            return;
        }
        //case 3, add data only
        if (typeof param3 === "object") {
            this.loader.load(key, param3);
            this.add(key, s, -1, -1, param4);
            return;
        }
        //technically unreachable code
        throw new Error("Undefined behavior: load_and_add, zoneHandler");
    }
    addNewPlayerInstancedZones(s, ptype, pid = -1) {
        let insertNew = [];
        this.zoneArr.forEach(i => {
            let data = this.loader.getData(i.dataID);
            if (data && data.instancedFor.includes(ptype)) {
                let z = this.loader.getZone(i.classID, s, ptype, pid, i.dataID);
                if (z)
                    insertNew.push(z);
            }
        });
        insertNew.forEach(i => Utils.insertionSort(this.zoneArr, i, this.sortFunc));
        this.correctID();
    }
    //operations
    genericHandler_card(s, a) {
        let target = a.targets[0];
        let z = this.zoneArr[target.card.pos.zoneID];
        let c = z.getCardByPosition(new position_1.default(target.card.pos));
        if (!c) {
            c = this.getCardWithID(target.card.id);
            if (!c)
                return [true, [new errors_1.cardNotExist()]];
        }
        if (!a.resolvable(s, z, c))
            return [true, []];
        return [false, c];
    }
    genericHandler_effect(s, a) {
        let target = a.targets[0];
        let z = this.zoneArr[target.card.pos.zoneID];
        let c = z.getCardByPosition(new position_1.default(target.card.pos));
        if (!c) {
            c = this.getCardWithID(target.card.id);
            if (!c)
                return [true, [new errors_1.cardNotExist()]];
        }
        let eff;
        let eindex = c.findEffectIndex(target.eff.id);
        if (eindex < 0) {
            eff = this.getEffectWithID(target.eff.id);
            if (!eff)
                return [true, [new errors_1.effectNotExist(target.eff.id, c.id)]];
        }
        else {
            eff = c.totalEffects[eindex];
        }
        if (!a.resolvable(s, z, c, eff))
            return [true, []];
        return [false, c, eff];
    }
    genericHandler_subtype(s, a) {
        let target = a.targets[0];
        let z = this.zoneArr[target.card.pos.zoneID];
        let c = z.getCardByPosition(new position_1.default(target.card.pos));
        if (!c) {
            c = this.getCardWithID(target.card.id);
            if (!c)
                return [true, [new errors_1.cardNotExist()]];
        }
        let eff;
        let eindex = c.findEffectIndex(target.eff.id);
        if (eindex < 0) {
            eff = this.getEffectWithID(target.eff.id);
            if (!eff)
                return [true, [new errors_1.effectNotExist(target.eff.id, c.id)]];
        }
        else {
            eff = c.totalEffects[eindex];
        }
        let st = eff.getSubtypeidx(target.subtype.dataID);
        if (st < 0)
            return [true, [new errors_1.effectNotExist(target.eff.id, c.id).add("zoneHandler", "handleActivateEffectSubtypeFunc", 326)]];
        if (!a.resolvable(s, z, c, eff, eff.subTypes[st]))
            return [true, []];
        return [false, c, eff, st];
    }
    /**
     *
     * @param a : a pos change action, with 2 targets, a card target and a position target in index 0 and 1
     * @returns
     */
    handlePosChange(s, a) {
        let k1 = a.targets[0];
        let k2 = a.targets[1];
        let pos = new position_1.default(k2.pos);
        let res = [];
        let z = this.zoneArr[k1.card.pos.zoneID];
        let c = z.getCardByPosition(new position_1.default(k1.card.pos));
        // let idxFrom = pos.zoneID
        // let cardIdx = utils.positionToIndex(pos.flat(), this.zoneArr[idxFrom].shape)
        // let c = this.zoneArr[idxFrom].cardArr[cardIdx]
        if (!c) {
            c = this.getCardWithID(k1.card.id);
            if (!c)
                return [
                    new errors_1.cardNotExist().add("zoneHandler", "handlePosChange", 54)
                ];
        }
        if (!a.resolvable(s, z, c))
            return [];
        let temp;
        if (pos && pos.valid && pos.zoneID === c.pos.zoneID) {
            console.log("move is triggered");
            let idxTo = pos.zoneID;
            temp = this.zoneArr[idxTo].move(c, pos);
            //move is prioritized
            if (temp[0])
                res.push(temp[0]);
            else
                res.push(...temp[1]);
        }
        else {
            temp = this.zoneArr[c.pos.zoneID].remove(c);
            if (temp[0])
                res.push(temp[0]);
            else
                res.push(...temp[1]);
            temp = this.zoneArr[pos.zoneID].add(c, pos);
            if (temp[0])
                res.push(temp[0]);
            else
                res.push(...temp[1]);
        }
        return res;
    }
    handleDraw(s, a) {
        let zone = this.zoneArr[a.targets[0].zone.id];
        if (!zone || !zone.draw)
            return [
                new errors_1.zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
            ];
        if (!a.resolvable(s, zone)) {
            console.log("from handle draw: ", zone.id, a.targets[0].zone.id);
            return [];
        }
        let deck = zone;
        let playerindex = deck.playerIndex;
        let hand = this.hands.filter(i => i.playerIndex === playerindex);
        if (hand.length !== 1)
            return [
                new errors_1.zoneNotExist(-1).add("zoneHandler", "handleDraw", 222)
            ];
        let res = deck.draw(s, a, hand[0]);
        console.log("2", a.flatAttr(), res);
        if (res[0])
            return [res[0]];
        else
            return res[1];
    }
    handleShuffle(s, a) {
        let z = this.zoneArr[a.targets[0].zone.id];
        if (!z || !z.draw)
            return [
                new errors_1.zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
            ];
        if (!a.resolvable(s, z))
            return [];
        let temp = z.shuffle(a.flatAttr().shuffleMap);
        if (temp[0])
            return [temp[0]];
        return temp[1];
    }
    handleTurnReset(s, a) {
        //only do field refresh
        let res = [];
        this.zoneArr.forEach(i => res.push(...i.turnReset(a)));
        return res;
    }
    handleCardReset(s, a) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        return res[1].reset();
    }
    handleEffectReset(s, a) {
        let res = this.genericHandler_effect(s, a);
        if (res[0])
            return res[1];
        return res[2].reset();
    }
    handleEffectActivation(s, a) {
        const card = a.targets[0].card;
        const pid = a.targets[1].pid;
        const gen = card.getParititonInputObj(pid, s, a);
        if (!gen)
            return card.activatePartition(pid, s, a);
        return [
            actionGenrator_1.actionConstructorRegistry.a_get_input(a.cause, {
                requester: gen,
                applicator: new actionInputGenerator_1.inputApplicator(card.activatePartition, [pid, s, a], card)
            })
        ];
    }
    handleActivateEffectSubtypeFunc(s, a) {
        let res = this.genericHandler_subtype(s, a);
        if (res[0])
            return res[1];
        return res[2].activateSubtypeSpecificFunc(res[3], res[1], s, a);
    }
    handleAddStatusEffect(s, a, e) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        res[1].addStatusEffect(e);
        return [];
    }
    handleClearAllStatusEffect(s, a) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        res[1].clearAllStatus();
        return [];
    }
    handleRemoveStatusEffect(s, a) {
        let res = this.genericHandler_effect(s, a);
        if (res[0])
            return res[1];
        res[1].removeStatusEffect(res[2].id);
        return [];
    }
    handleCardStatus(s, a) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        res[1].canAct = (a.typeID === actionRegistry_1.default.a_enable_card);
        return [];
    }
    getWouldBeAttackTarget(s, a) {
        //find opposite
        if (a.cause.card === undefined)
            return [];
        let c = a.cause.card;
        let oppositeZones = this.zoneArr[c.pos.zoneID];
        if (!oppositeZones)
            return [];
        let targetZone = oppositeZones.getOppositeZone(this.zoneArr);
        if (!targetZone.length)
            return [];
        return [oppositeZones, targetZone[0].getOppositeCards(c).sort((a, b) => a.pos.y - b.pos.y)];
    }
    handleAttack(s, a) {
        var _a, _b;
        let attr = a.flatAttr();
        let c = a.cause.card;
        if (!c)
            return [];
        let targets = this.getWouldBeAttackTarget(s, a);
        if (!targets.length)
            return [];
        if (!targets[1].length) {
            return [
                actionGenrator_1.actionConstructorRegistry.a_deal_heart_damage(s, targets[0].playerIndex)(a.cause, {
                    dmg: (_a = c.attr.get("atk")) !== null && _a !== void 0 ? _a : 0
                })
            ];
        }
        return [
            actionGenrator_1.actionConstructorRegistry.a_deal_damage_internal(s, targets[1][0])(a.cause, {
                dmg: (attr.dmg === undefined) ? (_b = c.attr.get("atk")) !== null && _b !== void 0 ? _b : 0 : attr.dmg,
                dmgType: (attr.dmgType === undefined) ? misc_1.damageType.physical : attr.dmgType
            })
        ];
    }
    handleDealDamage_1(s, a) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        let attr = a.flatAttr();
        res[1].hp -= attr.dmg;
        if (res[1].hp === 0) {
            return [
                actionGenrator_1.actionConstructorRegistry.a_destroy(s, res[1])(actionGenrator_1.actionFormRegistry.system())
            ];
        }
        return [];
    }
    handleDealDamage_2(s, a) {
        let pos = a.targets[0].pos;
        let c = this.getCardWithPosition(new position_1.default(pos));
        if (!c)
            return [
                new errors_1.cardNotExist()
            ];
        let attr = a.flatAttr();
        c.hp -= attr.dmg;
        if (c.hp === 0) {
            return [
                actionGenrator_1.actionConstructorRegistry.a_destroy(s, c)(actionGenrator_1.actionFormRegistry.system())
            ];
        }
        return [];
    }
    handleExecute(s, a) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        //unpacks to an attack and a send to grave
        let zoneid = res[1].pos.zoneID;
        let z = this.zoneArr[zoneid];
        if (!z)
            return [
                new errors_1.zoneNotExist(zoneid)
            ];
        let pid = z.playerIndex;
        let g = this.getPlayerZone(pid, zoneRegistry_2.zoneRegistry.z_grave);
        if (!g || !g.length)
            return [
                new errors_1.zoneNotExist(pid)
            ];
        return [
            actionGenrator_1.actionConstructorRegistry.a_attack(s, a.targets[0].card)(a.cause, {
                dmg: res[1].atk,
                dmgType: misc_1.damageType.physical
            }),
            actionGenrator_1.actionConstructorRegistry.a_pos_change_force(s, res[1])(g[0].top)(actionGenrator_1.actionFormRegistry.system()).dontchain()
        ];
    }
    handleSendToTop(s, a, zid) {
        let res = this.genericHandler_card(s, a);
        if (res[0])
            return res[1];
        let zoneid = res[1].pos.zoneID;
        let z = this.zoneArr[zoneid];
        if (!z)
            return [
                new errors_1.zoneNotExist(zoneid)
            ];
        let pid = z.playerIndex;
        let targetZone = this.getPlayerZone(pid, zid);
        if (!targetZone)
            return [
                new errors_1.zoneNotExist(pid)
            ];
        return [
            actionGenrator_1.actionConstructorRegistry.a_pos_change_force(s, res[1])(targetZone[0].top)(actionGenrator_1.actionFormRegistry.system())
        ];
    }
    getZoneRespond(z, s, a) {
        const gen = z.getInput_ZoneRespond(a, s);
        if (gen === undefined)
            return z.getZoneRespond(a, s, undefined);
        return [
            actionGenrator_1.actionConstructorRegistry.a_get_input(actionGenrator_1.actionFormRegistry.system(), {
                requester: gen,
                applicator: new actionInputGenerator_1.inputApplicator(z.getZoneRespond, [a, s], z)
            })
        ];
    }
    handleZoneInteract(z, s, a) {
        const gen = z.getInput_interact(s, a.cause);
        if (gen === undefined)
            return z.interact(s, a.cause, undefined);
        return [
            actionGenrator_1.actionConstructorRegistry.a_get_input(actionGenrator_1.actionFormRegistry.system(), {
                requester: gen,
                applicator: new actionInputGenerator_1.inputApplicator(z.interact, [s, a.cause], z)
            })
        ];
    }
    respond(system, a, zoneResponsesOnly = false) {
        let arr = [];
        let infoLog = new Map(); //cardID, effectIDs[]
        this.zoneArr.forEach(i => {
            arr.push(...this.getZoneRespond(i, system, a));
        });
        if (zoneResponsesOnly)
            return [arr, []];
        this.zoneArr.forEach(i => {
            let respondMap = i.getCanRespondMap(a, system);
            respondMap.forEach((pidxArr, cardInfo) => {
                pidxArr.forEach(pidx => {
                    arr.push(actionGenrator_1.actionConstructorRegistry.a_activate_effect_internal(system, cardInfo)(pidx)(a.cause));
                    if (infoLog.has(cardInfo.id)) {
                        infoLog.get(cardInfo.id).push(cardInfo.effects[pidx].id);
                    }
                    else {
                        infoLog.set(cardInfo.id, [cardInfo.effects[pidx].id]);
                    }
                });
            });
        });
        return [arr, Object.entries(infoLog)];
    }
    forEach(depth, callback) {
        switch (depth) {
            case 0:
                return this.zoneArr.forEach((z, zid) => callback(z, zid));
            case 1:
                return this.zoneArr.forEach((z, zid) => z.cardArr.forEach((c, cid) => {
                    if (c)
                        callback(c, zid, cid);
                }));
            case 2:
                return this.zoneArr.forEach((z, zid) => z.cardArr.forEach((c, cid) => {
                    if (c)
                        c.totalEffects.forEach((e, eid) => callback(e, zid, cid, eid));
                }));
            case 3:
                return this.zoneArr.forEach((z, zid) => z.cardArr.forEach((c, cid) => {
                    if (c)
                        c.totalEffects.forEach((e, eid) => e.subTypes.forEach((st, stid) => callback(st, zid, cid, eid, stid)));
                }));
            default: return;
        }
    }
    map(depth, callback) {
        let final = [];
        this.forEach(depth, (c, ...index) => {
            final.push(callback(c, ...index));
        });
        return final;
    }
    filter(depth, callback) {
        let final = [];
        this.forEach(depth, (c, ...index) => {
            if (callback(c, ...index))
                final.push(c);
        });
        return final;
    }
    getEffectWithID(eid) {
        for (let i = 0; i < this.zoneArr.length; i++) {
            for (let j = 0; j < this.zoneArr[i].cardArr.length; j++) {
                let c = this.zoneArr[i].cardArr[j];
                if (!c)
                    continue;
                let x = c.findEffectIndex(eid);
                if (x < 0)
                    continue;
                return c.effects[x];
            }
        }
        return undefined;
    }
    getZoneWithType(type) {
        return this.zoneArr.filter(i => i.types.includes(type));
    }
    enforceCardIntoZone(zoneIdx, cardArr) {
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr);
    }
    getZoneWithDataID(dataID) {
        return this.zoneArr.filter(i => i.dataID === dataID);
    }
    getZoneWithClassID(classID) {
        return this.zoneArr.filter(i => i.classID === classID);
    }
    getZoneWithName(zoneName) {
        return this.zoneArr.find(a => a.name == zoneName);
    }
    getZoneWithID(id) {
        return this.zoneArr[id];
    }
    getCardWithID(cardID) {
        for (let i = 0; i < this.zoneArr.length; i++) {
            let index = this.zoneArr[i].cardArr.findIndex(i => i && i.id === cardID);
            if (index < 0)
                continue;
            return this.zoneArr[i].cardArr[index];
        }
        return undefined;
    }
    getCardWithPosition(pos) {
        let z = this.zoneArr[pos.zoneID];
        if (!z)
            return undefined;
        return z.getCardByPosition(pos);
    }
    //get stuff
    get system() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_system); }
    get void() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_void); }
    get decks() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_deck); }
    get storages() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_storage); }
    get hands() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_hand); }
    get abilityZones() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_ability); }
    get graves() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_grave); }
    get fields() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_field); }
    get drops() { return this.getZoneWithType(zoneRegistry_2.zoneRegistry.z_drop); }
    getPlayerZone(pid, type) {
        return this.zoneArr.filter(i => i.playerIndex === pid && i.types.includes(type));
    }
}
exports.default = zoneHandler;
/*
note:
this file isnt complete
i havent added the ability for zones and cards to respond to actions

*/ 
