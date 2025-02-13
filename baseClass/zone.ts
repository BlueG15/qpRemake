//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type card from "./card";
import type action from "./action";
import type res from "./universalResponse";

import position from "./position";
import utils from "./util";

import zoneRegistry from "../data/zoneRegistry";

import {
  turnReset,
  posChange, 
  shuffle,
} from "../handlers/actionHandler"

import dry_zone from "../dryData/dry_zone";
import dry_card from "../dryData/dry_card";
import type dry_system from "../dryData/dry_system";

import {
  cardNotInApplicableZone,
  invalidOrderMap,
  unknownError,
  cardNotExist,
  zoneAttrConflict,
  invalidPosition,
  zoneFull,
} from "../handlers/errorHandler";

class Zone {
  //list of boolean attributes:
  attr: Map<string, any>;
  cardArr: (card | undefined)[];
  name: string;
  //Infinity is uncapped
  //game function, empty for now, need to be overwritten later
  init() {}
  constructor(n: string) {
    this.name = n;
    if (zoneRegistry[n]) {
      this.attr = new Map(Object.entries(zoneRegistry[n]));
    } else this.attr = new Map();
    this.cardArr = []; //new Array(Math.min(this.capacity, 100)).fill(undefined)
  }
  //helper properties
  get isFull() {
    return this.cardArr.length >= this.capacity;
  }
  get valid() {
    return this.id >= 0;
  }

  //helper properties - quick attr access
  get posBound(): number[] {
    return this.attr.get("posBound") ?? [];
  }
  set posBound(bound: number[]) {
    this.attr.set("posBound", bound);
  }

  get priority(): number {
    return this.attr.get("priority") ?? -1;
  }
  set priority(p: number) {
    this.attr.set("priority", p);
  }

  get id(): number {
    return this.attr.get("index") ?? -1;
  }
  get posLength(): number {
    return this.posBound.length;
  }
  get shape(): number[] {
    return this.posBound;
  }

  get lastPos(): position {
    return new position(
      this.id,
      ...utils.indexToPosition(
        this.isFull ? this.capacity - 1 : this.cardArr.length,
        this.shape
      )
    );
  }
  get firstPos(): position {
    return new position(this.id, ...utils.indexToPosition(0, this.shape));
  }
  //helper properties - boolean attributes
  get canReorderSelf(): boolean {
    return Boolean(this.attr.get("canReorderSelf"));
  }
  get canMoveTo(): boolean {
    return Boolean(this.attr.get("canMoveTo"));
  }
  get canMoveFrom(): boolean {
    return Boolean(this.attr.get("canMoveFrom"));
  }
  get moveToNeedPosition(): boolean {
    return Boolean(this.attr.get("moveToNeedPosition"));
  }
  get reorderNeedPosition(): boolean {
    return Boolean(this.attr.get("reorderNeedPosition"));
  }

  set canReorderSelf(value: boolean) {
    this.attr.set("canReorderSelf", value);
  }
  set canMoveTo(value: boolean) {
    this.attr.set("canMoveTo", value);
  }
  set canMoveFrom(value: boolean) {
    this.attr.set("canMoveFrom", value);
  }
  set moveToNeedPosition(value: boolean) {
    this.attr.set("moveToNeedPosition", value);
  }
  set reorderNeedPosition(value: boolean) {
    this.attr.set("reorderNeedPosition", value);
  }

  get capacity(): number {
    return this.posLength ? this.posBound.reduce((a, b) => a * b) : 0;
  }
  set capacity(newCap: number) {} //override if zone allow for overriding capacity

  //helper functions
  // forEach = this.cardArr.forEach.bind(this.cardArr)
  // map = this.cardArr.map.bind(this.cardArr)
  // filter = this.cardArr.filter.bind(this.cardArr)

  findIndex(cid?: string) {
    if (!cid) return -1;
    for (let index = 0; index < this.cardArr.length; index++) {
      if (this.cardArr[index] && (this.cardArr[index] as card).id === cid)
        return index;
    }
    return -1;
  }
  applyFuncToID<M>(
    func: (c: card) => M | undefined,
    cid?: string
  ): M | undefined {
    //maybe obsolete
    if (!cid) return undefined;
    this.cardArr.forEach((i, index) => {
      if (i && i.id == cid) return func(i);
    });
    return undefined;
  }
  protected isPositionInBounds(p: position) {
    if (this.capacity <= 0) return false;
    if (p.zoneID != this.id) return false;
    p.forEach((i, index) => {
      if (i >= this.posBound[index]) return false;
    });
    return true;
  }
  validatePosition(p?: position) {
    return p && p.valid && this.valid && this.isPositionInBounds(p);
  }
  protected positionToIndex(p?: position) {
    if (!this.validatePosition(p)) return -1;
    p = p as position;
    if (this.posLength == 1) return p.x;
    return utils.positionToIndex(p.flat(), this.shape);
  }
  isPositionOccupied(p?: position): [number, boolean] {
    if (!this.validatePosition(p)) return [-1, false];
    let i = this.positionToIndex(p);
    if (i < 0) return [i, false];
    if (this.cardArr[i]) return [i, false];
    else return [i, true];
  } //[index, result], index -1 is error code,
  // distinguising the false from error with the false from actual result

  //zone functionality functions
  //zone has 2 jobs
  //1. provides an action if the player wanna do something
  //2. perform an action using API/func calls, not action (not enough info)

  //functions for step 1
  //get actions only checks for wrong params
  getAction_add(isChain: boolean, c: card, p?: position) {
    if (!this.canMoveTo) {
      return new zoneAttrConflict(this.id, "moveTo", c.id).add(
        "zone.ts",
        "getAction_add",
        130
      );
    }
    if (!p && this.moveToNeedPosition) {
      return new zoneAttrConflict(this.id, "moveTo", c.id).add(
        "zone.ts",
        "getAction_add",
        133
      );
    }
    if (!p) p = this.lastPos;
    let idx = utils.positionToIndex(p.flat(), this.shape);
    if (idx < 0 || !this.validatePosition(p)) {
      return new invalidPosition(c.id, p).add("zone.ts", "getAction_add", 138);
    }
    let swapTargetID: undefined | string = undefined;
    if (this.cardArr[idx]) swapTargetID = (this.cardArr[idx] as card).id;
    return new posChange(c.id, isChain, c.pos, p, swapTargetID);
  }

  getAction_remove(isChain: boolean, c: card, newPos?: position) {
    //probably not gonna be used
    if (!this.canMoveFrom) {
      return new zoneAttrConflict(this.id, "moveFrom", c.id).add(
        "zone.ts",
        "getAction_remove",
        147
      );
    }
    return new posChange(c.id, isChain, c.pos, newPos);
  }

  getAction_move(isChain: boolean, c: card, newPos: position) {
    if (!this.canReorderSelf) {
      return new zoneAttrConflict(this.id, "moveFrom", c.id).add(
        "zone.ts",
        "getAction_move",
        154
      );
    }
    let index = this.findIndex(c.id);
    if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
      return new cardNotInApplicableZone(this.id, c.id).add(
        "zone.ts",
        "getAction_move",
        158
      );

    let toIndex = utils.positionToIndex(newPos.flat(), this.shape);
    if (toIndex < 0 || !this.validatePosition(newPos))
      return new invalidPosition(c.id, newPos).add(
        "zone.ts",
        "getAction_move",
        162
      );

    let swapTargetID: undefined | string = undefined;
    if (this.cardArr[toIndex])
      swapTargetID = (this.cardArr[toIndex] as card).id;
    return new posChange(c.id, isChain, c.pos, newPos, swapTargetID);
  }

  protected generateShuffleMap() {
    let a: number[] = [];
    for (let i = 0; i < this.capacity; i++) a.push(i);
    a = a.sort((a, b) => utils.rng(1, 0, false) - 0.5);

    let k = new Map<number, number>();
    a.forEach((i, index) => k.set(index, i));
    return k;
  }

  getAction_shuffle(isChain: boolean) {
    if (!this.canReorderSelf || !this.capacity) {
      return new zoneAttrConflict(this.id, "shuffle").add(
        "zone.ts",
        "getAction_shuffle",
        181
      );
    }
    return new shuffle(this.id, isChain, this.generateShuffleMap());
  }

  //functions for step 2
  protected addToIndex(c: card, toIndex: number): res {
    //assumes index is correct
    if (!c) return this.handleCardNotExist("addToIndex", 189);
    if (!this.canMoveTo) return this.handleNoMoveTo(c, "addToIndex", 190);
    if (this.isFull) return this.handleFull(c, "addToIndex", 111);
    if (this.cardArr[toIndex])
      return this.handleOccupied(c, toIndex, "addToIndex", 192);

    //let oldPos = c.pos;
    c.pos = new position(
      this.id,
      ...utils.indexToPosition(toIndex, this.shape)
    );
    this.cardArr[toIndex] = c;

    return [undefined, []];
  }

  add(c: card, p1: position): res {
    if (this.moveToNeedPosition) {
      let toIndex = utils.positionToIndex(p1.flat(), this.shape);
      if (toIndex < 0 || !this.validatePosition(p1))
        return this.handleInvalidPos(c ? c.id : undefined, p1, "add", 204);
      let res = this.addToIndex(c, toIndex);
      if (res[0]) res[0].add(this.name, "add", 133);
      return res;
    }
    let res = this.addToIndex(c, this.cardArr.length);
    if (res[0]) res[0].add(this.name, "add", 210);
    return res;
  }

  remove(c: card): res {
    if (!this.canMoveFrom) return this.handleNoMoveFrom(c, "remove", 215);

    let index = this.findIndex(c.id);
    if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
      return this.handleCardNotInApplicableZone(c, "remove", 219);

    //let oldPos = c.pos;
    this.cardArr[index] = undefined;
    if (c.pos.zoneID == this.id) c.pos.invalidate();

    return [undefined, []];
  }

  move(c: card, p: position): res {
    if (!this.canReorderSelf) return this.handleNoReorder("move", 229);

    let index = this.findIndex(c.id);
    if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
      return this.handleCardNotInApplicableZone(c, "remove", 233);

    let toIndex = utils.positionToIndex(p.flat(), this.shape);
    if (toIndex < 0 || !this.validatePosition(p))
      return this.handleInvalidPos(c.id, p, "move", 237);

    if (this.cardArr[toIndex])
      return this.handleOccupied(c, toIndex, "move", 239);

    //let oldPos = c.pos;
    c.pos = p;
    this.cardArr[toIndex] = c;

    return [undefined, []];
  }

  protected reorder(orderMap: Map<number, number>): boolean {
    if (!this.isValidOrderMap(orderMap, this.cardArr.length)) return false;
    const visited: boolean[] = new Array(orderMap.size).fill(false);

    // Iterate through the map to process each cycle
    orderMap.forEach((newIndex, oldIndex) => {
      if (visited[oldIndex]) return; // Skip if already processed

      let current = oldIndex;
      let temp = this.cardArr[current];
      do {
        visited[current] = true;

        const next = orderMap.get(current)!;
        const nextTemp = this.cardArr[next];
        this.cardArr[next] = temp;

        temp = nextTemp;
        current = next;
      } while (current !== oldIndex);
    });

    return true;
  }

  protected isValidOrderMap(
    orderMap: Map<number, number>,
    arrayLength: number
  ): boolean {
    const visited: boolean[] = new Array(arrayLength).fill(false);
    let c = 0;

    // Check each entry in the map
    for (const [oldIndex, newIndex] of orderMap.entries()) {
      // Ensure indices are within bounds
      if (
        oldIndex < 0 ||
        oldIndex >= arrayLength ||
        newIndex < 0 ||
        newIndex >= arrayLength
      ) {
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

  shuffle(orderMap: Map<number, number>): res {
    if (!this.canReorderSelf || !this.capacity)
      return this.handleNoReorder("shuffle", 298);
    let a = this.reorder(orderMap);
    if (!a) return this.handleInvalidOrderMap(orderMap, "shuffle", 300);
    return [undefined, []];
  }

  turnReset(a: turnReset) {
    let res: action[] = [];
    this.cardArr.forEach((i) => {
      if (i) res.push(...i.turnReset(a));
    });
    return res;
  }
  getZoneRespond(a: action, isChain: boolean): action[] {
    return [];
  }
  getCanRespondMap(a: action, system: dry_system) {
    let res = new Map<number, [number[], dry_card]>();
    this.cardArr.forEach((i, idx) => {
      if (i) {
        res.set(idx, [i.getResponseIndexArr(system, a), i.toDry()]);
      }
    });
    return res;
  }

  activateEffect(
    cidx: number,
    eID: number,
    system: dry_system,
    a: action
  ): res {
    if (!this.cardArr[cidx]) return [new unknownError(), undefined];
    return (this.cardArr[cidx] as card).activateEffect(eID, system, a);
  }

  //can override section
  handleCardNotExist(func: string, line?: number): res {
    return [new cardNotExist().add(this.name, func, line), undefined];
  }
  handleInvalidPos(
    cid: string | undefined,
    p: position,
    func: string,
    line?: number
  ): res {
    if (!cid) return this.handleCardNotExist(func, line);
    return [new invalidPosition(cid, p).add(this.name, func, line), undefined];
  }
  handleNoMoveTo(c: card, func: string, line?: number): res {
    return [
      new zoneAttrConflict(this.id, "move card to this zone").add(
        this.name,
        func,
        line
      ),
      undefined,
    ];
  }
  handleNoMoveFrom(c: card, func: string, line?: number): res {
    return [
      new zoneAttrConflict(this.id, "move card away from this zone").add(
        this.name,
        func,
        line
      ),
      undefined,
    ];
  }
  handleNoReorder(func: string, line?: number): res {
    return [
      new zoneAttrConflict(this.id, "move card within this zone").add(
        this.name,
        func,
        line
      ),
      undefined,
    ];
  }
  handleFull(c: card, func: string, line?: number): res {
    return [new zoneFull(this.id, c.id).add(this.name, func, line), undefined];
  }
  handleCardNotInApplicableZone(c: card, func: string, line?: number): res {
    return [
      new cardNotInApplicableZone(this.id, c.id).add(this.name, func, line),
      undefined,
    ];
  }
  handleInvalidOrderMap(
    orderMap: Map<number, number>,
    func: string,
    line?: number
  ): res {
    return [
      new invalidOrderMap(orderMap).add(this.name, func, line),
      undefined,
    ];
  }
  protected handleOccupiedSwap(
    c: card,
    index: number,
    func: string,
    line?: number
  ): res {
    //default behavior: if
    // + can rearrange self and
    // + card has same zoneID with this one
    // --> swap
    // else throw error

    if (!this.canReorderSelf) return this.handleNoReorder(func, line);
    if (c.pos.zoneID != this.id)
      return this.handleCardNotInApplicableZone(c, func, line);
    if (!this.cardArr[index]) {
      //technically not happenable but better be safe than sorry
      let err = new unknownError();
      err.add(this.name, func, line);
      return [err, undefined];
    }

    //swap the two indexes
    let cIndex = utils.positionToIndex(c.pos.flat(), this.shape);
    //let swapTargetID = this.cardArr[index].id

    let oldPos = c.pos;
    let newPos = (this.cardArr[index] as card).pos as position;

    //swap the position
    (this.cardArr[index] as card).pos = oldPos;
    c.pos = newPos;

    //swap the data
    let temp = this.cardArr[cIndex];
    this.cardArr[cIndex] = this.cardArr[index];
    this.cardArr[index] = temp;

    return [undefined, []];
  }

  protected handleOccupiedPush(
    c: card,
    index: number,
    func: string,
    line?: number
  ): res {
    if (!this.canReorderSelf) return this.handleNoReorder(func, line);
    if (!this.cardArr[index]) {
      //technically not happenable but better be safe than sorry
      let err = new unknownError();
      err.add(this.name, func, line);
      return [err, undefined];
    }

    let temp = this.cardArr.slice(0, index);
    let temp2 = this.cardArr.slice(index);

    this.cardArr = [...temp, c, ...temp2];
    this.cardArr.forEach((i, index) => {
      if (i) {
        i.pos.arr = utils.indexToPosition(index, this.shape);
        i.pos.zoneID = this.id;
      }
    });

    return [undefined, []];
  }

  handleOccupied(c: card, index: number, func: string, line?: number): res {
    return this.handleOccupiedSwap(c, index, func, line);
  }

  toDry() {
    return new dry_zone(this);
  }

  forceCardArrContent(newCardArr: card[]) {
    this.cardArr = newCardArr;
    this.cardArr.forEach((i, index) => {
      let p: position = new position(
        this.id,
        ...utils.indexToPosition(index, this.shape)
      );
      (i as card).pos = p;
      console.log(
        "forcing card in index " +
          index +
          " to pos " +
          p.toString() +
          " whose validity is " +
          p.valid
      );
    });
  }
}

export default Zone;
