"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone_base = void 0;
const position_1 = __importDefault(require("../generics/position"));
const zoneRegistry_1 = require("../../../data/zoneRegistry");
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
const errors_1 = require("../../errors");
class Zone_base {
    constructor(id, //changes on insert
    name, //fixxed identifier
    dataID, classID, playerType = -1, playerIndex = -1, data) {
        this.cardArr = [];
        this.name = name;
        this.dataID = dataID;
        let t = undefined;
        if (data) {
            this.attr = new Map(Object.entries(data));
            t = data.types;
        }
        else {
            this.attr = new Map();
        }
        if (t) {
            this.types = t;
        }
        else {
            let t = zoneRegistry_1.zoneRegistry[dataID];
            if (typeof t === "number")
                this.types = [t];
            else
                this.types = [];
        }
        this.attr.set("index", id);
        this.attr.set("playerIndex", playerIndex);
        this.attr.set("playerType", playerType);
        if (classID && classID !== dataID)
            this.attr.set("classID", classID);
    }
    get attrArr() { var _a; return (_a = this.attr.get("attriutesArr")) !== null && _a !== void 0 ? _a : []; }
    get playerIndex() { var _a; return (_a = this.attr.get("playerIndex")) !== null && _a !== void 0 ? _a : -1; }
    get playerType() { var _a; return (_a = this.attr.get("playerType")) !== null && _a !== void 0 ? _a : -1; }
    get classID() { var _a; return (_a = this.attr.get("classID")) !== null && _a !== void 0 ? _a : this.dataID; }
    //helper properties
    get isFull() {
        return this.cardArr.length >= this.capacity;
    }
    get valid() {
        return this.id >= 0;
    }
    //helper properties - quick attr access
    get posBound() {
        var _a;
        return (_a = this.attr.get("posBound")) !== null && _a !== void 0 ? _a : [];
    }
    set posBound(bound) {
        this.attr.set("posBound", bound);
    }
    get priority() {
        var _a;
        return (_a = this.attr.get("priority")) !== null && _a !== void 0 ? _a : -1;
    }
    get id() {
        var _a;
        return (_a = this.attr.get("index")) !== null && _a !== void 0 ? _a : -1;
    }
    set id(newVal) {
        this.attr.set("index", newVal);
    }
    get posLength() {
        return this.posBound.length;
    }
    get shape() {
        return this.posBound;
    }
    get lastPos() {
        return new position_1.default(this.id, this.name, ...Utils.indexToPosition(this.isFull ? this.capacity - 1 : this.cardArr.length, this.shape));
    }
    get firstPos() {
        return new position_1.default(this.id, this.name, ...Utils.indexToPosition(0, this.shape));
    }
    get top() { return this.lastPos; }
    get bottom() { return this.firstPos; }
    getCardByPosition(p) {
        if (!this.validatePosition(p))
            return undefined;
        let index = Utils.positionToIndex(p.flat(), this.shape);
        return this.cardArr[index];
    }
    isOpposite(p1, p2) {
        return false;
    }
    getOppositeZone(zoneArr) {
        return zoneArr.filter(z => this.isOpposite(z));
    }
    getOppositeCards(c) {
        //default implementation
        return this.cardArr.filter(i => i !== undefined && this.isOpposite(c, i));
    }
    //helper properties - initialized attributes
    get canReorderSelf() {
        return this.attrArr.includes(zoneRegistry_1.zoneAttributes.canReorderSelf);
    }
    get canMoveTo() {
        return this.attrArr.includes(zoneRegistry_1.zoneAttributes.canMoveTo);
    }
    get canMoveFrom() {
        return this.attrArr.includes(zoneRegistry_1.zoneAttributes.canMoveFrom);
    }
    get moveToNeedPosition() {
        return this.attrArr.includes(zoneRegistry_1.zoneAttributes.moveToNeedPosition);
    }
    get isField() {
        return this.types.includes(zoneRegistry_1.zoneRegistry.z_field);
    }
    get isGrave() {
        return this.types.includes(zoneRegistry_1.zoneRegistry.z_grave);
    }
    get minCapacity() {
        var _a;
        return (_a = this.attr.get("minCapacity")) !== null && _a !== void 0 ? _a : 0;
    }
    set canReorderSelf(value) {
        if (value)
            this.attr.set("attriutesArr", this.attrArr.concat([zoneRegistry_1.zoneAttributes.canReorderSelf]));
    }
    set canMoveTo(value) {
        if (value)
            this.attr.set("attriutesArr", this.attrArr.concat([zoneRegistry_1.zoneAttributes.canMoveTo]));
    }
    set canMoveFrom(value) {
        if (value)
            this.attr.set("attriutesArr", this.attrArr.concat([zoneRegistry_1.zoneAttributes.canMoveFrom]));
    }
    set moveToNeedPosition(value) {
        if (value)
            this.attr.set("attriutesArr", this.attrArr.concat([zoneRegistry_1.zoneAttributes.moveToNeedPosition]));
    }
    set minCapacity(value) {
        this.attr.set("minCapacity", value);
    }
    get capacity() {
        return this.posLength ? this.posBound.reduce((a, b) => a * b) : 0;
    }
    set capacity(newCap) { } //override if zone allow for overriding capacity
    setArbitraryAttribute(value) {
        this.attr.set("attriutesArr", this.attrArr.concat([value]));
    }
    hasArbitraryAttribute(valueToCheck) {
        return this.attrArr.includes(valueToCheck);
    }
    //helper functions
    // forEach = this.cardArr.forEach.bind(this.cardArr)
    // map = this.cardArr.map.bind(this.cardArr)
    // filter = this.cardArr.filter.bind(this.cardArr)
    findIndex(cid) {
        if (!cid)
            return -1;
        for (let index = 0; index < this.cardArr.length; index++) {
            if (this.cardArr[index] && this.cardArr[index].id === cid)
                return index;
        }
        return -1;
    }
    applyFuncToID(func, cid) {
        //maybe obsolete
        if (!cid)
            return undefined;
        this.cardArr.forEach((i, index) => {
            if (i && i.id == cid)
                return func(i);
        });
        return undefined;
    }
    isPositionInBounds(p) {
        if (this.capacity <= 0)
            return false;
        if (p.zoneID != this.id)
            return false;
        let res = true;
        p.forEach((i, index) => {
            if (i >= this.posBound[index])
                res = false;
        });
        return res;
    }
    validatePosition(p) {
        return p && p.valid && this.valid && this.isPositionInBounds(p);
    }
    positionToIndex(p) {
        if (!this.validatePosition(p))
            return -1;
        p = p;
        if (this.posLength == 1)
            return p.x;
        return Utils.positionToIndex(p.flat(), this.shape);
    }
    isPositionOccupied(p) {
        if (!this.validatePosition(p))
            return [-1, false];
        let i = this.positionToIndex(p);
        if (i < 0)
            return [i, false];
        if (this.cardArr[i])
            return [i, false];
        else
            return [i, true];
    } //[index, result], index -1 is error code,
    // distinguising the false from error with the false from actual result
    //zone functionality functions
    //zone has 2 jobs
    //1. provides an action if the player wanna do something
    //2. perform an action using API/func calls, not action (not enough info)
    //functions for step 1
    //get actions only checks for wrong params
    getAction_add(s, c, p, cause = actionGenrator_1.actionFormRegistry.none()) {
        if (!this.canMoveTo) {
            return new errors_1.zoneAttrConflict(this.id, "moveTo", c.id).add("zone.ts", "getAction_add", 130);
        }
        if (!p && this.moveToNeedPosition) {
            return new errors_1.zoneAttrConflict(this.id, "moveTo", c.id).add("zone.ts", "getAction_add", 133);
        }
        if (!p)
            p = this.lastPos;
        let idx = Utils.positionToIndex(p.flat(), this.shape);
        if (idx < 0 || !this.validatePosition(p)) {
            return new errors_1.invalidPosition(c.id, p).add("zone.Dts", "getAction_add", 138);
        }
        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[idx]) swapTargetID = (this.cardArr[idx] as card).id;
        //return new posChange(c.id, isChain, c.pos, p, swapTargetID);
        return actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(p)(cause);
    }
    getAction_remove(s, c, newPos, cause = actionGenrator_1.actionFormRegistry.none()) {
        //probably not gonna be used
        if (this.cardArr.length <= this.minCapacity) {
            return new errors_1.zoneAttrConflict(this.id, "moveFrom", c.id).add("zone.ts", "getAction_remove", 223);
        }
        if (!this.canMoveFrom) {
            return new errors_1.zoneAttrConflict(this.id, "moveFrom", c.id).add("zone.ts", "getAction_remove", 147);
        }
        // return new posChange(c.id, isChain, c.pos, newPos);
        return actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(newPos)(cause);
    }
    //move within zone
    getAction_move(s, c, newPos, cause = actionGenrator_1.actionFormRegistry.none()) {
        if (!this.canReorderSelf) {
            return new errors_1.zoneAttrConflict(this.id, "moveFrom", c.id).add("zone.ts", "getAction_move", 154);
        }
        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return new errors_1.cardNotInApplicableZone(this.id, c.id).add("zone.ts", "getAction_move", 158);
        let toIndex = Utils.positionToIndex(newPos.flat(), this.shape);
        if (toIndex < 0 || !this.validatePosition(newPos))
            return new errors_1.invalidPosition(c.id, newPos).add("zone.ts", "getAction_move", 162);
        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[toIndex])
        //     swapTargetID = (this.cardArr[toIndex] as card).id;
        // return new posChange(c.id, isChain, c.pos, newPos, swapTargetID);
        return actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(newPos)(cause);
    }
    generateShuffleMap() {
        let a = [];
        for (let i = 0; i < this.capacity; i++)
            a.push(i);
        a = a.sort((a, b) => Utils.rng(1, 0, false) - 0.5);
        let k = new Map();
        a.forEach((i, index) => k.set(index, i));
        return k;
    }
    getAction_shuffle(s, cause = actionGenrator_1.actionFormRegistry.none()) {
        if (!this.canReorderSelf || !this.capacity) {
            return new errors_1.zoneAttrConflict(this.id, "shuffle").add("zone.ts", "getAction_shuffle", 181);
        }
        let map = this.generateShuffleMap();
        return actionGenrator_1.actionConstructorRegistry.a_shuffle(s, this)(cause, {
            shuffleMap: map
        });
        // return new shuffle(this.id, isChain);
    }
    //functions for step 2
    addToIndex(c, toIndex) {
        //assumes index is correct
        if (!c)
            return this.handleCardNotExist("addToIndex", 189);
        if (!this.canMoveTo)
            return this.handleNoMoveTo(c, "addToIndex", 190);
        if (this.isFull)
            return this.handleFull(c, "addToIndex", 111);
        if (this.cardArr[toIndex])
            return this.handleOccupied(c, toIndex, "addToIndex", 192);
        //let oldPos = c.pos;
        c.pos = new position_1.default(this.id, this.name, ...Utils.indexToPosition(toIndex, this.shape));
        this.cardArr[toIndex] = c;
        return [undefined, []];
    }
    add(c, p1) {
        if (this.moveToNeedPosition) {
            let toIndex = Utils.positionToIndex(p1.flat(), this.shape);
            if (toIndex < 0 || !this.validatePosition(p1))
                return this.handleInvalidPos(c ? c.id : undefined, p1, "add", 204);
            let res = this.addToIndex(c, toIndex);
            if (res[0])
                res[0].add(this.name, "add", 133);
            return res;
        }
        let res = this.addToIndex(c, this.cardArr.length);
        if (res[0])
            res[0].add(this.name, "add", 210);
        return res;
    }
    remove(c) {
        if (!this.canMoveFrom)
            return this.handleNoMoveFrom(c, "remove", 215);
        if (this.cardArr.length <= this.minCapacity)
            return this.handleBelowMinimum(c, "remove", 323);
        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleCardNotInApplicableZone(c, "remove", 219);
        //let oldPos = c.pos;
        this.cardArr[index] = undefined;
        if (c.pos.zoneID == this.id)
            c.pos.invalidate();
        return [undefined, []];
    }
    move(c, p) {
        if (!this.canReorderSelf)
            return this.handleNoReorder("move", 229);
        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleCardNotInApplicableZone(c, "remove", 233);
        let toIndex = Utils.positionToIndex(p.flat(), this.shape);
        if (toIndex < 0 || !this.validatePosition(p))
            return this.handleInvalidPos(c.id, p, "move", 237);
        if (this.cardArr[toIndex])
            return this.handleOccupied(c, toIndex, "move", 239);
        //let oldPos = c.pos;
        c.pos = p;
        this.cardArr[toIndex] = c;
        return [undefined, []];
    }
    reorder(orderMap) {
        if (!this.isValidOrderMap(orderMap, this.cardArr.length))
            return false;
        const visited = new Array(orderMap.size).fill(false);
        // Iterate through the map to process each cycle
        orderMap.forEach((newIndex, oldIndex) => {
            if (visited[oldIndex])
                return; // Skip if already processed
            let current = oldIndex;
            let temp = this.cardArr[current];
            do {
                visited[current] = true;
                const next = orderMap.get(current);
                const nextTemp = this.cardArr[next];
                this.cardArr[next] = temp;
                temp = nextTemp;
                current = next;
            } while (current !== oldIndex);
        });
        return true;
    }
    isValidOrderMap(orderMap, arrayLength) {
        const visited = new Array(arrayLength).fill(false);
        let c = 0;
        // Check each entry in the map
        for (const [oldIndex, newIndex] of orderMap.entries()) {
            // Ensure indices are within bounds
            if (oldIndex < 0 ||
                oldIndex >= arrayLength ||
                newIndex < 0 ||
                newIndex >= arrayLength) {
                return false;
            }
            // Ensure newIndex is unique
            if (visited[newIndex]) {
                return false;
            }
            visited[newIndex] = true;
            c++;
        }
        // Ensure the map is complete (contains exactly arrayLength entries)
        return c === arrayLength;
    }
    shuffle(orderMap) {
        if (!this.canReorderSelf || !this.capacity)
            return this.handleNoReorder("shuffle", 298);
        let a = this.reorder(orderMap);
        if (!a)
            return this.handleInvalidOrderMap(orderMap, "shuffle", 300);
        return [undefined, []];
    }
    turnReset(a) {
        let res = [];
        this.cardArr.forEach((i) => {
            if (i)
                res.push(...i.reset());
        });
        return res;
    }
    //should override
    getInput_ZoneRespond(a, s) { return undefined; }
    getZoneRespond(a, system, input) {
        //zone responses bypasses cannot chain
        //only calls in chain phase
        return [];
    }
    //should override
    getInput_interact(s, cause) { return undefined; }
    interact(s, cause, input) {
        return [];
    }
    getCanRespondMap(a, system) {
        let res = new Map();
        this.cardArr.forEach((i, idx) => {
            if (i) {
                res.set(i, i.getResponseIndexArr(system, a));
            }
        });
        return res;
    }
    //can override section
    handleCardNotExist(func, line) {
        return [new errors_1.cardNotExist().add(this.name, func, line), undefined];
    }
    handleInvalidPos(cid, p, func, line) {
        if (!cid)
            return this.handleCardNotExist(func, line);
        return [new errors_1.invalidPosition(cid, p).add(this.name, func, line), undefined];
    }
    handleNoMoveTo(c, func, line) {
        return [
            new errors_1.zoneAttrConflict(this.id, "move card to this zone").add(this.name, func, line),
            undefined,
        ];
    }
    handleNoMoveFrom(c, func, line) {
        return [
            new errors_1.zoneAttrConflict(this.id, "move card away from this zone").add(this.name, func, line),
            undefined,
        ];
    }
    handleNoReorder(func, line) {
        return [
            new errors_1.zoneAttrConflict(this.id, "move card within this zone").add(this.name, func, line),
            undefined,
        ];
    }
    handleFull(c, func, line) {
        return [new errors_1.zoneFull(this.id, c.id).add(this.name, func, line), undefined];
    }
    handleCardNotInApplicableZone(c, func, line) {
        return [
            new errors_1.cardNotInApplicableZone(this.id, c.id).add(this.name, func, line),
            undefined,
        ];
    }
    handleInvalidOrderMap(orderMap, func, line) {
        return [
            new errors_1.invalidOrderMap(orderMap).add(this.name, func, line),
            undefined,
        ];
    }
    handleBelowMinimum(c, func, line) {
        return [
            new errors_1.zoneAttrConflict(this.id, "move card away from this zone").add(this.name, func, line),
            undefined,
        ];
    }
    handleOccupiedSwap(c, index, func, line) {
        //default behavior: if
        // + can rearrange self and
        // + card has same zoneID with this one
        // --> swap
        // else throw error
        if (!this.canReorderSelf)
            return this.handleNoReorder(func, line);
        if (c.pos.zoneID != this.id)
            return this.handleCardNotInApplicableZone(c, func, line);
        if (!this.cardArr[index]) {
            //technically not happenable but better be safe than sorry
            let err = new errors_1.unknownError();
            err.add(this.name, func, line);
            return [err, undefined];
        }
        //swap the two indexes
        let cIndex = Utils.positionToIndex(c.pos.flat(), this.shape);
        //let swapTargetID = this.cardArr[index].id
        let oldPos = c.pos;
        let newPos = this.cardArr[index].pos;
        //swap the position
        this.cardArr[index].pos = oldPos;
        c.pos = newPos;
        //swap the data
        let temp = this.cardArr[cIndex];
        this.cardArr[cIndex] = this.cardArr[index];
        this.cardArr[index] = temp;
        return [undefined, []];
    }
    handleOccupiedPush(c, index, func, line) {
        if (!this.canReorderSelf)
            return this.handleNoReorder(func, line);
        if (!this.cardArr[index]) {
            //technically not happenable but better be safe than sorry
            let err = new errors_1.unknownError();
            err.add(this.name, func, line);
            return [err, undefined];
        }
        let temp = this.cardArr.slice(0, index);
        let temp2 = this.cardArr.slice(index);
        this.cardArr = [...temp, c, ...temp2];
        this.cardArr.forEach((i, index) => {
            if (i) {
                i.pos.arr = Utils.indexToPosition(index, this.shape);
                i.pos.zoneID = this.id;
            }
        });
        return [undefined, []];
    }
    handleOccupied(c, index, func, line) {
        return this.handleOccupiedSwap(c, index, func, line);
    }
    forceCardArrContent(newCardArr) {
        this.cardArr = newCardArr;
        this.cardArr.forEach((i, index) => {
            let p = new position_1.default(this.id, this.name, ...Utils.indexToPosition(index, this.shape));
            i.pos = p;
            console.log(`forcing ${i.dataID} in index ` +
                index +
                " to pos " +
                p.toString() +
                " whose validity is " +
                p.valid);
        });
    }
    toString(spaces = 2, simplify = false) {
        let c = {};
        this.cardArr.forEach((value, key) => {
            c[key.toString()] = (value === undefined) ? "undefined" : value.toString(spaces, simplify);
        });
        return JSON.stringify({
            id: this.id,
            name: this.name,
            priority: this.priority,
            cardMap: c
        }, null, spaces);
    }
    count(callback) {
        let a = 0;
        this.cardArr.forEach(c => { if (c)
            a += callback(c) ? 1 : 0; });
        return a;
    }
    has(obj) {
        return this.id === obj.pos.zoneID;
    }
    is(p) {
        if (p === undefined)
            return false;
        if (typeof p === "number") {
            return this.types.includes(p);
        }
        return p.id === this.id;
    }
    of(p) {
        if (typeof p === "number") {
            return this.playerIndex === p;
        }
        if (!p)
            return false;
        return p.playerIndex === this.playerIndex;
    }
    get cardArr_filtered() { return this.cardArr.filter(i => i !== undefined); }
    getAllPos() {
        return this.cardArr.map((_, index) => new position_1.default(this.id, this.name, ...Utils.indexToPosition(index, this.shape)));
    }
    //Position check API
    isC2Behind(c1, c2) {
        if (c1.pos.zoneID !== this.id || c2.pos.zoneID !== this.id)
            return false;
        const p = this.getFrontPos(c1);
        return c2.pos.x === p.x && c2.pos.y === p.y;
    }
    isC2Infront(c1, c2) {
        if (c1.pos.zoneID !== this.id || c2.pos.zoneID !== this.id)
            return false;
        const p = this.getBackPos(c1);
        return c2.pos.x === p.x && c2.pos.y === p.y;
    }
    getFrontPos(c) {
        return new position_1.default(this.id, this.name, c.pos.x + 1, c.pos.y);
    }
    getBackPos(c) {
        return new position_1.default(this.id, this.name, c.pos.x - 1, c.pos.y);
    }
    isOccupied(pos) {
        const n = Utils.positionToIndex(pos.flat(), this.shape);
        if (isNaN(n) || n < 0)
            return false;
        return this.cardArr[n] !== undefined;
    }
    isExposed(c1) {
        //exposed = no card is infront of this
        return !this.isOccupied(this.getFrontPos(c1));
    }
}
exports.Zone_base = Zone_base;
class Zone extends Zone_base {
}
exports.default = Zone;
