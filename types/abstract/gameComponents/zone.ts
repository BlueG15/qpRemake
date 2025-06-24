//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type Card from "./card";
import type res from "../generics/universalResponse";

import Position from "../generics/position";
import utils from "../../../utils";

import { playerTypeID, zoneAttributes, zoneRegistry, type zoneData } from "../../../data/zoneRegistry";

import type { dry_card, dry_zone, dry_system } from "../../../data/systemRegistry";

import { Action, actionConstructorRegistry, actionFormRegistry } from "../../../_queenSystem/handler/actionGenrator";
// import { actionFormRegistry_target } from "../../../data/actionRegistry";

import type { Positionable, Player_specific, HasTypesArr, id_able} from "../../misc";

import {
    cardNotInApplicableZone,
    invalidOrderMap,
    unknownError,
    cardNotExist,
    zoneAttrConflict,
    invalidPosition,
    zoneFull,
} from "../../errors";
import { identificationInfo } from "../../../data/systemRegistry";
import type system from "../../../types/defaultZones/system";
import type deck from "../../../types/defaultZones/deck";
import type storage from "../../../types/defaultZones/storage";
import type grave from "../../../types/defaultZones/grave";
import type hand from "../../../types/defaultZones/hand";
import type field from "../../../types/defaultZones/field";
import type abiltyZone from "../../../types/defaultZones/ability";
import type _void from "../../../types/defaultZones/void";

class Zone {
    //list of boolean attributes:
    attr: Map<string, any>;
    cardArr: (Card | undefined)[] = [];
    readonly types : ReadonlyArray<number>
    readonly dataID: string;    
    readonly name : string
    
    constructor(
        id : number, //changes on insert
        name : string, //fixxed identifier
        dataID: string, 
        classID? : string, 
        playerType : playerTypeID | -1 = -1, 
        playerIndex = -1, 
        data?: zoneData
    ) {
        this.name = name;
        this.dataID = dataID;

        let t : number[] | undefined = undefined
        if (data) {
            this.attr = new Map(Object.entries(data));
            t = data.types
        } else {
            this.attr = new Map();
        }
        if(t){
            this.types = t;
        } else {
            let t : string | undefined | number = zoneRegistry[dataID as any] 
            if(typeof t === "number") this.types = [t];
            else this.types = []      
        }
        this.attr.set("index", id);
        this.attr.set("playerIndex", playerIndex);
        this.attr.set("playerType", playerType);
        if(classID && classID !== dataID) this.attr.set("classID", classID)
    }


    get attrArr() : number[] {return this.attr.get("attriutesArr") ?? []}
    get playerIndex() : number {return this.attr.get("playerIndex") ?? -1}
    get playerType() : number {return this.attr.get("playerType") ?? -1}
    get classID() : string {return this.attr.get("classID") ?? this.dataID}

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

    get id(): number {
        return this.attr.get("index") ?? -1;
    }
    set id(newVal : number){
        this.attr.set("index", newVal);
    }
    get posLength(): number {
        return this.posBound.length;
    }
    get shape(): number[] {
        return this.posBound;
    }

    get lastPos(): Position {
        return new Position(
            this.id,
            this.name,
            ...utils.indexToPosition(
                this.isFull ? this.capacity - 1 : this.cardArr.length,
                this.shape
            )
        );
    }
    get firstPos(): Position {
        return new Position(this.id, this.name, ...utils.indexToPosition(0, this.shape));
    }

    get top() {return this.lastPos}
    get bottom() {return this.firstPos}

    getCardByPosition(p : Position) : Card | undefined {
        if(!this.validatePosition(p)) return undefined;
        let index = utils.positionToIndex(p.flat(), this.shape);
        return this.cardArr[index]
    }


    isOpposite(c1: Positionable, c2: Positionable): boolean;
    isOpposite(z: Player_specific & HasTypesArr): boolean;
    isOpposite(p1: Positionable | (Player_specific & HasTypesArr), p2?: Positionable): boolean {
        return false
    }

    getOppositeZone(zoneArr : ReadonlyArray<dry_zone>) : dry_zone[]{
        return zoneArr.filter(z => this.isOpposite(z))
    }

    getOppositeCards(c : Card | dry_card) : Card[] {
        //default implementation
        return this.cardArr.filter(i => i !== undefined && this.isOpposite(c, i)) as Card[]
    }

    //helper properties - initialized attributes
    get canReorderSelf(): boolean {
        return this.attrArr.includes(zoneAttributes.canReorderSelf)
    }
    get canMoveTo(): boolean {
        return this.attrArr.includes(zoneAttributes.canMoveTo)
    }
    get canMoveFrom(): boolean {
        return this.attrArr.includes(zoneAttributes.canMoveFrom)
    }
    get moveToNeedPosition(): boolean {
        return this.attrArr.includes(zoneAttributes.moveToNeedPosition)
    }
    get isField() : boolean {
        return this.types.includes(zoneRegistry.z_field)
    }
    get isGrave() : boolean {
        return this.types.includes(zoneRegistry.z_grave)
    }
    get minCapacity() : number {
        return this.attr.get("minCapacity") ?? 0;
    }

    set canReorderSelf(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([zoneAttributes.canReorderSelf]))
    }
    set canMoveTo(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([zoneAttributes.canMoveTo]))
    }
    set canMoveFrom(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([zoneAttributes.canMoveFrom]))
    }
    set moveToNeedPosition(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([zoneAttributes.moveToNeedPosition]))
    }
    set minCapacity(value : number){
        this.attr.set("minCapacity", value);
    }

    get capacity(): number {
        return this.posLength ? this.posBound.reduce((a, b) => a * b) : 0;
    }
    set capacity(newCap: number) {} //override if zone allow for overriding capacity

    setArbitraryAttribute(value : number){
        this.attr.set("attriutesArr", this.attrArr.concat([value]))
    }
    hasArbitraryAttribute(valueToCheck : number){
        return this.attrArr.includes(valueToCheck)
    }

    //helper functions
    // forEach = this.cardArr.forEach.bind(this.cardArr)
    // map = this.cardArr.map.bind(this.cardArr)
    // filter = this.cardArr.filter.bind(this.cardArr)

    findIndex(cid?: string) {
        if (!cid) return -1;
        for (let index = 0; index < this.cardArr.length; index++) {
            if (this.cardArr[index] && (this.cardArr[index] as Card).id === cid)
                return index;
        }
        return -1;
    }
    applyFuncToID<M>(
        func: (c: Card) => M | undefined,
        cid?: string
    ): M | undefined {
        //maybe obsolete
        if (!cid) return undefined;
        this.cardArr.forEach((i, index) => {
            if (i && i.id == cid) return func(i);
        });
        return undefined;
    }
    protected isPositionInBounds(p: Position) {
        if (this.capacity <= 0) return false;
        if (p.zoneID != this.id) return false;
        let res = true;
        p.forEach((i, index) => {
            if (i >= this.posBound[index]) res = false;
        });
        return res;
    }
    validatePosition(p?: Position) {
        return p && p.valid && this.valid && this.isPositionInBounds(p);
    }
    protected positionToIndex(p?: Position) {
        if (!this.validatePosition(p)) return -1;
        p = p as Position;
        if (this.posLength == 1) return p.x;
        return utils.positionToIndex(p.flat(), this.shape);
    }
    isPositionOccupied(p?: Position): [number, boolean] {
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
    getAction_add(s : dry_system, c: Card,  p?: Position, cause : identificationInfo = actionFormRegistry.none()) : Action {
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
            return new invalidPosition(c.id, p).add("zone.Dts", "getAction_add", 138);
        }
        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[idx]) swapTargetID = (this.cardArr[idx] as card).id;
        //return new posChange(c.id, isChain, c.pos, p, swapTargetID);

        return actionConstructorRegistry.a_pos_change(s, c.toDry())(p.toDry())(cause)
    }

    getAction_remove(s : dry_system, c: Card, newPos: Position, cause : identificationInfo = actionFormRegistry.none()) {
        //probably not gonna be used
        if (this.cardArr.length <= this.minCapacity){
                return new zoneAttrConflict(this.id, "moveFrom", c.id).add(
                "zone.ts",
                "getAction_remove",
                223
            );
        }
        if (!this.canMoveFrom) {
            return new zoneAttrConflict(this.id, "moveFrom", c.id).add(
                "zone.ts",
                "getAction_remove",
                147
            );
        }
        // return new posChange(c.id, isChain, c.pos, newPos);
        return actionConstructorRegistry.a_pos_change(s, c.toDry())(newPos.toDry())(cause)
    }

    //move within zone
    getAction_move(s : dry_system, c: Card, newPos: Position, cause : identificationInfo = actionFormRegistry.none()) {
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

        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[toIndex])
        //     swapTargetID = (this.cardArr[toIndex] as card).id;


        // return new posChange(c.id, isChain, c.pos, newPos, swapTargetID);

        return actionConstructorRegistry.a_pos_change(s, c.toDry())(newPos.toDry())(cause)
    }

    protected generateShuffleMap() {
        let a: number[] = [];
        for (let i = 0; i < this.capacity; i++) a.push(i);
        a = a.sort((a, b) => utils.rng(1, 0, false) - 0.5);

        let k = new Map<number, number>();
        a.forEach((i, index) => k.set(index, i));
        return k;
    }

    getAction_shuffle(s : dry_system, cause : identificationInfo = actionFormRegistry.none()) {
        if (!this.canReorderSelf || !this.capacity) {
            return new zoneAttrConflict(this.id, "shuffle").add(
                "zone.ts",
                "getAction_shuffle",
                181
            );
        }

        let map = this.generateShuffleMap();

        return actionConstructorRegistry.a_shuffle(s, this.toDry())(cause, {
            shuffleMap : map
        })

        // return new shuffle(this.id, isChain);
    }

    //functions for step 2
    protected addToIndex(c: Card, toIndex: number): res {
        //assumes index is correct
        if (!c) return this.handleCardNotExist("addToIndex", 189);
        if (!this.canMoveTo) return this.handleNoMoveTo(c, "addToIndex", 190);
        if (this.isFull) return this.handleFull(c, "addToIndex", 111);
        if (this.cardArr[toIndex])
            return this.handleOccupied(c, toIndex, "addToIndex", 192);

        //let oldPos = c.pos;
        c.pos = new Position(
            this.id,
            this.name,
            ...utils.indexToPosition(toIndex, this.shape)
        );
        this.cardArr[toIndex] = c;

        return [undefined, []];
    }

    add(c: Card, p1: Position): res {
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

    remove(c: Card): res {
        if (!this.canMoveFrom) return this.handleNoMoveFrom(c, "remove", 215);
        if (this.cardArr.length <= this.minCapacity) return this.handleBelowMinimum(c, "remove", 323)

        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleCardNotInApplicableZone(c, "remove", 219);

        //let oldPos = c.pos;
        this.cardArr[index] = undefined;
        if (c.pos.zoneID == this.id) c.pos.invalidate();

        return [undefined, []];
    }

    move(c: Card, p: Position): res {
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

    turnReset(a: Action) {

        let res: Action[] = [];
        this.cardArr.forEach((i) => {
            if(i) res.push(...i.reset());
        });
        return res;
    }
    
    getZoneRespond(a: Action, system: dry_system): Action[] {
        //zone responses bypasses cannot chain
        //only calls in chain phase
        return [];
    }
    getCanRespondMap(a: Action, system: dry_system) {
        let res = new Map<dry_card, number[]>();
        this.cardArr.forEach((i, idx) => {
            if (i) {
                res.set(i.toDry(), i.getResponseIndexArr(system, a));
            }
        });
        return res;
    }

    //should override
    interact(s : dry_system, cause : identificationInfo) : Action[] {return [] as Action[]}

    // activateEffect(
    //     cidx: number,
    //     eidx: number,
    //     system: dry_system,
    //     a: action
    // ): res {
    //     if (!this.cardArr[cidx]) return [new unknownError(), undefined];
    //     return (this.cardArr[cidx] as card).activateEffect(eidx, system, a);
    // }

    // activateEffectSubtypeSpecificFunc(
    //     cidx: number,
    //     eidx: number,
    //     subTypeidx: number,
    //     system: dry_system,
    //     a: action
    // ) : res {
    //     if (!this.cardArr[cidx]) return [new unknownError(), undefined];
    //     return (this.cardArr[cidx] as card).activateEffectSubtypeSpecificFunc(eidx, subTypeidx, system, a)
    // }

    //can override section
    handleCardNotExist(func: string, line?: number): res {
        return [new cardNotExist().add(this.name, func, line), undefined];
    }
    handleInvalidPos(
        cid: string | undefined,
        p: Position,
        func: string,
        line?: number
    ): res {
        if (!cid) return this.handleCardNotExist(func, line);
        return [new invalidPosition(cid, p).add(this.name, func, line), undefined];
    }
    handleNoMoveTo(c: Card, func: string, line?: number): res {
        return [
            new zoneAttrConflict(this.id, "move card to this zone").add(
                this.name,
                func,
                line
            ),
            undefined,
        ];
    }
    handleNoMoveFrom(c: Card, func: string, line?: number): res {
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
    handleFull(c: Card, func: string, line?: number): res {
        return [new zoneFull(this.id, c.id).add(this.name, func, line), undefined];
    }
    handleCardNotInApplicableZone(c: Card, func: string, line?: number): res {
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
    handleBelowMinimum(c: Card, func: string, line?: number) : res {
        return [
            new zoneAttrConflict(this.id, "move card away from this zone").add(
                this.name,
                func,
                line
            ),
            undefined,
        ];
    }
    protected handleOccupiedSwap(
        c: Card,
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
        let newPos = (this.cardArr[index] as Card).pos as Position;

        //swap the position
        (this.cardArr[index] as Card).pos = oldPos;
        c.pos = newPos;

        //swap the data
        let temp = this.cardArr[cIndex];
        this.cardArr[cIndex] = this.cardArr[index];
        this.cardArr[index] = temp;

        return [undefined, []];
    }

    protected handleOccupiedPush(
        c: Card,
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

    handleOccupied(c: Card, index: number, func: string, line?: number): res {
        return this.handleOccupiedSwap(c, index, func, line);
    }

    toDry() : dry_zone {
        return this;
    }

    forceCardArrContent(newCardArr: Card[]) {
        this.cardArr = newCardArr;
        this.cardArr.forEach((i, index) => {
            let p: Position = new Position(
                this.id,
                this.name,
                ...utils.indexToPosition(index, this.shape)
            );
            (i as Card).pos = p;
            console.log(
                `forcing ${(i as Card).dataID} in index ` +
                    index +
                    " to pos " +
                    p.toString() +
                    " whose validity is " +
                    p.valid
            );
        });
    }

    toString(spaces : number = 2, simplify : boolean = false){
        let c : Record<string, string> = {}
        this.cardArr.forEach((value, key) => {
            c[key.toString()] = (value === undefined) ? "undefined" : value.toString(spaces, simplify)
        })
        return JSON.stringify({
            id : this.id, 
            name : this.name,
            priority : this.priority,
            cardMap : c
        }, null, spaces)
    }

    count(callback : (c : dry_card) => boolean){
        let a = 0;
        this.cardArr.forEach(c => {if(c) a += callback(c) ? 1 : 0})
        return a;
    }

    has(obj : Positionable){
        return this.id === obj.pos.zoneID
    }

    is(type : zoneRegistry) : boolean;
    is(obj : id_able) : boolean;
    is(p : zoneRegistry | id_able){
        if(typeof p === "number"){
            return this.types.includes(p)
        }
        return p.id === this.id
    }

    get cardArr_filtered() : dry_card[] {return this.cardArr.filter(i => i !== undefined) as dry_card[]}
}

export default Zone;
