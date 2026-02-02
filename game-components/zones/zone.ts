//hand, grave, field, deck, etc extends from this, reserve index 0 for system
import type { Card } from "../cards";

import { Position } from "../positions";
import { PositionLike, Positionable, PlayerTypeID, PlayerSpecific, CardDry, SystemDry, ZoneDry, ZoneData, Action, errorID, PositionDry, ZoneTypeID, IdAble, TargetZone } from "../../core";
import { ZoneAttrRegistry, ZoneRegistry, Target, ActionGenerator } from "../../core";
import type QueenSystem from "../../queen-system";

export abstract class Zone implements ZoneDry {
    //list of boolean attributes:
    attr: Map<string, any>;
    protected cardArrInternal: (Card | undefined)[] = [];
    get cardArr() {
        if(!this.valid) return [];
        return this.cardArrInternal
    }

    types : ReadonlyArray<ZoneTypeID>
    readonly dataID: ZoneTypeID;    
    readonly name : string
    
    constructor(
        id : number, //changes on insert
        name : string, //fixxed identifier
        dataID: ZoneTypeID, 
        classID? : ZoneTypeID, 
        playerType : PlayerTypeID | -1 = -1, 
        playerIndex = -1, 
        data?: ZoneData
    ) {
        this.name = name;
        this.dataID = dataID;

        let t : ZoneTypeID[] | undefined = undefined
        if (data) {
            this.attr = new Map(Object.entries(data));
            t = data.types
        } else {
            this.attr = new Map();
        }
        if(t){
            this.types = t;
        } else {
            this.types = [dataID];   
        }
        this.attr.set("index", id);
        this.attr.set("playerIndex", playerIndex);
        this.attr.set("playerType", playerType);
        if(classID && classID !== dataID) this.attr.set("classID", classID)
    }

    get attrArr() : number[] {return this.attr.get("attriutesArr") ?? []}
    get playerIndex() : number {return this.attr.get("playerIndex") ?? -1}
    get playerType() : number {return this.attr.get("playerType") ?? ZoneRegistry.null}
    get classID() : ZoneTypeID {return this.attr.get("classID") ?? this.dataID}
    get identity() : TargetZone {return Target.zone(this)}

    //helper properties
    get isFull() {
        return this.cardArr.length >= this.capacity;
    }
    get valid() {
        return this.id >= 0;
    }
    
    //helper properties - quick attr access
    get boundX(): number {
        return this.attr.get("boundX") ?? 0;
    }
    get boundY(): number {
        return this.attr.get("boundY") ?? 0;
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

    get lastPos(): Position {
        return new Position(
            this.id,
            this.boundX - 1,
            this.boundY ? this.boundY - 1 : 0,
        );
    }
    get firstPos(): Position {
        return new Position(this.id, 0, 0);
    }

    get top() {return this.lastPos}
    get bottom() {return this.firstPos}

    getCardByPosition(p : Position) : Card | undefined {
        if(!this.validatePosition(p)) return undefined;
        let index = this.positionToIndex(p);
        return this.cardArr[index]
    }

    abstract isOpposite(c1: Positionable, c2: Positionable): boolean;

    getOppositeCards(c : CardDry) : Card[] {
        //default implementation
        return this.cardArr.filter(c2 => c2 !== undefined && this.isOpposite(c, c2)) as Card[]
    }

    //helper properties - initialized attributes
    get canReorderSelf(): boolean {
        return this.attrArr.includes(ZoneAttrRegistry.canReorderSelf)
    }
    get canMoveTo(): boolean {
        return this.attrArr.includes(ZoneAttrRegistry.canMoveTo)
    }
    get canMoveFrom(): boolean {
        return this.attrArr.includes(ZoneAttrRegistry.canMoveFrom)
    }
    get moveToNeedPosition(): boolean {
        return this.attrArr.includes(ZoneAttrRegistry.moveToNeedPosition)
    }
    get isField() : boolean {
        return this.types.includes(ZoneRegistry.field)
    }
    get isGrave() : boolean {
        return this.types.includes(ZoneRegistry.grave)
    }
    get minCapacity() : number {
        return this.attr.get("minCapacity") ?? 0;
    }

    set canReorderSelf(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([ZoneAttrRegistry.canReorderSelf]))
    }
    set canMoveTo(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([ZoneAttrRegistry.canMoveTo]))
    }
    set canMoveFrom(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([ZoneAttrRegistry.canMoveFrom]))
    }
    set moveToNeedPosition(value: boolean) {
        if(value) this.attr.set("attriutesArr", this.attrArr.concat([ZoneAttrRegistry.moveToNeedPosition]))
    }
    set minCapacity(value : number){
        this.attr.set("minCapacity", value);
    }

    get capacity(): number {
        return this.boundY ? this.boundX * this.boundY : this.boundX;
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
    isPositionInBounds(p: PositionLike) {
        if (this.capacity <= 0) return false;
        if (p.zoneID != this.id) return false;
        return p.x >= 0 && p.x < this.boundX && (!this.boundY || (p.y < this.boundY && p.y >= 0))
    }
    validatePosition(p: PositionLike) {
        return p.zoneID === this.id && this.valid && this.boundX !== 0 && this.isPositionInBounds(p);
    }
    protected positionToIndex(p?: PositionLike) {
        if (!p || !this.validatePosition(p)) return -1;
        return this.boundX * p.y + p.x
    }
    protected indexToPosition(i : number) {
        return [i % this.boundX, Math.floor(i / this.boundX), ].map(x => isNaN(x) ? 0 : x) as [number, number]
    }
    isPositionOccupied(p?: PositionLike): [number, boolean] {
        if (!p || !this.validatePosition(p)) return [-1, false];
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
    getAddAction(s : SystemDry, c: Card,  p?: PositionDry, cause : Target = Target.none()) : Action {
        if (!this.canMoveTo) 
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow);
        
        if (!p && this.moveToNeedPosition) 
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow);
        
        if (!p) p = this.lastPos;
        let idx = this.positionToIndex(p);
        if (idx < 0 || !this.validatePosition(p)) 
            return ActionGenerator.error(cause, errorID.err_invalidPosition);
        
        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[idx]) swapTargetID = (this.cardArr[idx] as card).id;
        //return new posChange(c.id, isChain, c.pos, p, swapTargetID);

        return ActionGenerator.a_move(c)(p)(cause)
    }

    getAction_remove(s : SystemDry, c: Card, newPos: Position, cause : Target = Target.none()) {
        //probably not gonna be used
        if (this.cardArr.length <= this.minCapacity)
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow);
        
        if (!this.canMoveFrom) 
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow);
        
        // return new posChange(c.id, isChain, c.pos, newPos);
        return ActionGenerator.a_move(c)(newPos)(cause)
    }

    //move within zone
    getAction_move(s : SystemDry, c: Card, newPos: Position, cause : Target = Target.none()) {
        if (!this.canReorderSelf) 
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow);
        
        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return ActionGenerator.error(cause, errorID.err_targetNotExist);

        let toIndex = this.positionToIndex(newPos);
        if (toIndex < 0 || !this.validatePosition(newPos))
            return ActionGenerator.error(cause, errorID.err_invalidPosition)

        // let swapTargetID: undefined | string = undefined;
        // if (this.cardArr[toIndex])
        //     swapTargetID = (this.cardArr[toIndex] as card).id;


        // return new posChange(c.id, isChain, c.pos, newPos, swapTargetID);

        return ActionGenerator.a_move(c)(newPos)(cause)
    }

    protected generateShuffleMap() { 
        let a: number[] = [];
        for (let i = 0; i < this.capacity; i++) a.push(i);
        a = a.sort((a, b) => Math.random() - 0.5);

        let k = new Map<number, number>();
        a.forEach((i, index) => k.set(index, i));
        return k;
    }

    getAction_shuffle(s : SystemDry, cause : Target = Target.none()) : Action {
        if (!this.canReorderSelf || !this.capacity) 
            return ActionGenerator.error(cause, errorID.err_zoneNotAllow)
        
        const shuffleMap = this.generateShuffleMap();
        return ActionGenerator.a_shuffle(this)(cause, {shuffleMap})
    }

    //functions for step 2
    protected addToIndex(cause : Target, c: Card, toIndex: number): Action[] {
        //assumes index is correct
        if (!c) return this.handleCardNotExist(cause);
        if (!this.canMoveTo) return this.handleNotAllow(cause);
        if (this.isFull) return this.handleFull(cause);
        if (this.cardArr[toIndex])
            return this.handleOccupied(cause, c, toIndex);

        //let oldPos = c.pos;
        c.pos = new Position(
            this.id,
            ...this.indexToPosition(toIndex)
        );
        this.cardArr[toIndex] = c;

        return [];
    }

    add(cause : Target, c: Card, p1: Position): Action[] {
        if (this.moveToNeedPosition) {
            let toIndex = this.positionToIndex(p1);
            if (toIndex < 0 || !this.validatePosition(p1))
                return this.handleInvalid(cause, true);

            return this.addToIndex(cause, c, toIndex);
        }
        return this.addToIndex(cause, c, this.cardArr.length);
    }

    remove(cause : Target, c: Card): Action[] {
        if (!this.canMoveFrom) return this.handleNotAllow(cause);
        if (this.cardArr.length <= this.minCapacity) return this.handleNotAllow(cause);

        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleInvalid(cause, this.cardArr[index]);

        //let oldPos = c.pos;
        this.cardArr[index] = undefined;
        if (c.pos.zoneID == this.id) c.pos.invalidate();

        return [];
    }

    move(cause : Target, c: Card, p: Position): Action[] {
        if (!this.canReorderSelf) return this.handleNotAllow(cause);

        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleInvalid(cause, this.cardArr[index]);

        let toIndex = this.positionToIndex(p);
        if (toIndex < 0 || !this.validatePosition(p))
            return this.handleInvalid(cause, true);

        if (this.cardArr[toIndex])
            return this.handleOccupied(cause, c, toIndex);

        //let oldPos = c.pos;
        c.pos = p;
        this.cardArr[toIndex] = c;

        return [];
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

    shuffle(cause : Target, orderMap: Map<number, number>): Action[] {
        if (!this.canReorderSelf || !this.capacity)
            return this.handleNotAllow(cause);
        let a = this.reorder(orderMap);
        if (!a) return this.handleInvalidOrderMap(cause);
        return [];
    }

    turnReset(a: Action) {

        let res: Action[] = [];
        this.cardArr.forEach((i) => {
            if(i) res.push(...i.reset());
        });
        return res;
    }

    //can override section
    handleCardNotExist(cause : Target): Action[] {
        return [ActionGenerator.error(cause, errorID.err_targetNotExist)]
    }
    handleInvalid(cause : Target, isInvalidPos? : any): Action[] {
        if (!isInvalidPos) return this.handleCardNotExist(cause);
        return [ActionGenerator.error(cause, errorID.err_invalidPosition)];
    }
    handleNotAllow(cause : Target): Action[] {
        return [ActionGenerator.error(cause, errorID.err_zoneNotAllow)];
    }
    handleFull(cause : Target): Action[] {
        return [ActionGenerator.error(cause, errorID.err_zoneFull)];
    }
    handleInvalidOrderMap(cause : Target): Action[] {
        return [ActionGenerator.error(cause, errorID.err_invalidShuffleInput)];
    }
    protected handleOccupiedSwap(
        cause : Target,
        c: Card,
        index: number
    ): Action[] {
        //default behavior: if
        // + can rearrange self and
        // + card has same zoneID with this one
        // --> swap
        // else throw error

        if (!this.canReorderSelf) return this.handleNotAllow(cause);
        if (c.pos.zoneID != this.id)
            return this.handleInvalid(cause, true);

        if (!this.cardArr[index])
            //technically not happenable but better be safe than sorry
            return [ActionGenerator.error(cause, errorID.err_unknown)];
        

        //swap the two indexes
        let cIndex = this.positionToIndex(c.pos);
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

        return [];
    }

    protected handleOccupiedPush(
        cause: Target,
        c: Card,
        index: number
    ): Action[] {
        if (!this.canReorderSelf) return this.handleNotAllow(cause);
        if (!this.cardArr[index]) 
            //technically not happenable but better be safe than sorry
            return [ActionGenerator.error(cause, errorID.err_unknown)];

        let temp = this.cardArr.slice(0, index);
        let temp2 = this.cardArr.slice(index);

        this.cardArrInternal = [...temp, c, ...temp2];
        this.cardArr.forEach((i, index) => {
            if (i) {
                i.pos.moveTo(...this.indexToPosition(index));
                i.pos.zoneID = this.id;
            }
        });

        return [];
    }

    handleOccupied(cause : Target, c: Card, index: number): Action[] {
        return this.handleOccupiedSwap(cause, c, index);
    }

    forceCardArrContent(permission : QueenSystem, newCardArr: (Card | undefined)[], shuffle = false) {
        this.cardArrInternal = newCardArr;
        if(shuffle) this.cardArrInternal = this.cardArr.sort((_, __) => Math.random() - 0.5)
        this.cardArr.forEach((i, index) => {
            let p: Position = new Position(
                this.id,
                ...this.indexToPosition(index)
            );
            (i as Card).pos = p;
            // console.log(
            //     `forcing ${(i as Card).dataID} in index ` +
            //         index +
            //         " to pos " +
            //         p.toString() +
            //         " whose validity is " +
            //         p.valid
            // );
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

    has(obj : Positionable){
        return this.id === obj.pos.zoneID
    }

    is(type : ZoneTypeID) : boolean;
    is(obj : IdAble | undefined) : boolean;
    is(p : ZoneTypeID | IdAble | undefined){
        if(p === undefined) return false;
        if(typeof p === "number"){
            return this.types.includes(p)
        }
        return p.id === this.id
    }

    of(pid : number) : boolean;
    of(obj : PlayerSpecific | undefined) : boolean;
    of(p : number | PlayerSpecific | undefined){
        if(typeof p === "number"){
            return this.playerIndex === p;
        }

        if(!p) return false;
        return p.playerIndex === this.playerIndex
    }

    get cardArrFiltered() : Card[] {return this.cardArr.filter(i => i !== undefined) as Card[]}

    getAllPos() : PositionDry[] {
        return this.cardArr.map((_, index) => new Position(this.id, ...this.indexToPosition(index)))
    }

    //Position check API

    isC2Behind(c1 : Positionable, c2 : Positionable){
        if(c1.pos.zoneID !== this.id || c2.pos.zoneID !== this.id) return false;
        const p = this.getFrontPos(c1)
        return c2.pos.x === p.x && c2.pos.y === p.y
    }

    isC2Infront(c1 : Positionable, c2 : Positionable){
        if(c1.pos.zoneID !== this.id || c2.pos.zoneID !== this.id) return false;
        const p = this.getBackPos(c1);
        return c2.pos.x === p.x && c2.pos.y === p.y
    }

    getFrontPos(c : Positionable) : PositionDry{
        return new Position(this.id, c.pos.x + 1, c.pos.y)
    }

    getBackPos(c : Positionable) : PositionDry{
        return new Position(this.id, c.pos.x - 1, c.pos.y)
    }

    isOccupied(pos : PositionLike){
        const n = this.positionToIndex(pos);
        if(isNaN(n) || n < 0) return false;
        return this.cardArr[n] !== undefined
    }

    isExposed(c1 : Positionable){
        //exposed = no card is infront of this
        return !this.isOccupied(this.getFrontPos(c1))
    }
} 
 