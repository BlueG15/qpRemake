// import type { dry_system, dry_zone, inputData_card, inputData_num, inputData_pos, inputData_zone } from "../../data/systemRegistry";
import type { SystemDry, ZoneDry, CardDry, PositionDry, ZoneTypeID, TargetCard, TargetPos, TargetZone, ArchtypeID, PlayerSpecific, TargetNumber } from "../../core";
import type { Tuple_any } from "../../core/misc";
import { Target, ZoneRegistry } from "../../core";

import { InputRequest, InputRequestData } from "./input-request";
import { e_automate_base } from "../../game-components/effects/default/e_status";


//regen = short for RequesterGenerator

type Internal_regen_card = CardDry & {___zone : ZoneDry}
type Internal_regen_pos = PositionDry & {___zone : ZoneDry}

class CardRequester {
    constructor(
        public s : SystemDry,
        public cards : Internal_regen_card[]
    ){}

    ofArchtype(p : ArchtypeID){
        this.cards = this.cards.filter(c => c.is(p))
        return this
    }

    ofSameArchtype(c1 : CardDry){
        this.cards = this.cards.filter(c => c.is(c1.archtype))
        return this
    }

    ofSameField(c1 : CardDry){
        this.cards = this.cards.filter(c => c.pos.zoneID === c1.pos.zoneID)
        return this
    }

    hasEffects(){
        this.cards = this.cards.filter(c => c.effects.length)
        return this
    }

    hasStatus(){
        this.cards = this.cards.filter(c => c.statusEffects.length !== 0)
        return this
    }

    hasAutomate(){
        this.cards = this.cards.filter(c => c.statusEffects.some(e => e instanceof e_automate_base))
        return this
    }

    isExposed(){
        this.cards = this.cards.filter(c => c.___zone.isExposed(c))
        return this
    }

    isCoverred(){
        this.cards = this.cards.filter(c => !c.___zone.isExposed(c))
        return this
    }

    isBack(){
        this.cards = this.cards.filter(c => {
            //a card is in the back if its back pos is out of bounds
            const back = c.___zone.getBackPos(c);
            return !c.___zone.validatePosition(back)
        })
        return this
    }

    isFront(){
        this.cards = this.cards.filter(c => {
            //a card is in the front if its front pos is out of bounds
            const front = c.___zone.getFrontPos(c);
            return !c.___zone.validatePosition(front)
        })
        return this
    }

    ofLevel(l : number){
        this.cards = this.cards.filter(c => c.level === l)
        return this
    }

    ofAtLeastLevel(l : number){
        this.cards = this.cards.filter(c => c.level >= l)
        return this
    }

    ofLevelOrBelow(l : number){
        this.cards = this.cards.filter(c => c.level <= l)
        return this
    }

    ofName(s : string){
        this.cards = this.cards.filter(c => c.name === s)
        return this
    }

    ofSameName(c_ : CardDry){
        this.cards = this.cards.filter(c => c.name === c_.name)
        return this
    }
    ofDifferentName(c_ : CardDry){
        this.cards = this.cards.filter(c => c.name !== c_.name)
        return this
    }

    pos(){
        return new PosRequester(
            this.s,
            this.cards.map(c => {
                const p1 = c.pos as Internal_regen_pos
                p1.___zone = c.___zone
                delete (c as any).___zone
                return p1
            })
        )
    }

    zones(){
        return new ZoneRequester(
            this.s,
            this.cards.map(c => {
                const z1 = c.___zone
                delete (c as any).___zone
                return z1
            })
        )
    }

    filter(f? : (c : Internal_regen_card) => boolean, thisArg? : Object){
        if(f) this.cards = this.cards.filter(f.bind(thisArg));
        return this as CardRequester
    }

    once() {       
        return new InputRequest<[TargetCard]>(
            new InputRequestData(this.s, 1, ...this.cards.map(c => c.identity))
        )
    }

    many<L extends number>(l : L) {
        return new InputRequest<Tuple_any<TargetCard, L>>(
            new InputRequestData(this.s, l, ...this.cards.map(c => c.identity))
        )
    }

    all() : CardDry[] {
        return this.cards.map(p => {
            delete (p as any).___zone
            return p
        })
    }
}

class PosRequester {
    constructor(
        public s : SystemDry,
        public pos : Internal_regen_pos[]
    ){}

    isEmpty(){
        this.pos = this.pos.filter(p => !p.___zone.isOccupied(p))
        return this
    }

    isOccupied(){
        this.pos = this.pos.filter(p => p.___zone.isOccupied(p))
        return this
    }

    isExposed(){
        this.pos = this.pos.filter(p => p.___zone.isExposed({pos : p}))
        return this
    }

    isCoverred(){
        this.pos = this.pos.filter(p => !p.___zone.isExposed({pos : p}))
        return this
    }

    isBack(){
        this.pos = this.pos.filter(p => {
            //a card is in the back if its back pos is out of bounds
            const back = p.___zone.getBackPos({pos : p});
            return !p.___zone.validatePosition(back)
        })
        return this
    }

    isFront(){
        this.pos = this.pos.filter(p => {
            //a card is in the front if its front pos is out of bounds
            const front = p.___zone.getFrontPos({pos : p});
            return !p.___zone.validatePosition(front)
        })
        return this
    }

    cards(){
        return new CardRequester(
            this.s, 
            this.pos.map(p => {
                const card = p.___zone.getCardByPosition(p as any)
                if(!card) {
                    delete (p as any).___zone
                    return
                };
                const c1 = card as any as Internal_regen_card
                c1.___zone = p.___zone
                delete (p as any).___zone
                return c1
            }).filter(p => p !== undefined) as any
        )
    }
    
    zones(){
        return new ZoneRequester(
            this.s, 
            this.pos.map(p => {
                const z1 = p.___zone
                delete (p as any).___zone
                return z1
            })
        )
    }

    filter(f? : (p : Internal_regen_pos) => boolean, thisArg? : Object){
        if(f) this.pos = this.pos.filter(f.bind(thisArg))
        return this as PosRequester
    }

    once() {       
        return new InputRequest<[TargetPos]>(
            new InputRequestData(this.s, 1, ...this.pos.map(p => p.identity))
        )
    }

    many<L extends number>(l : L) {
        return new InputRequest<Tuple_any<TargetPos, L>>(
            new InputRequestData(this.s, l, ...this.pos.map(p => p.identity))
        )
    }

    all() : PositionDry[] {
        return this.pos.map(p => {
                delete (p as any).___zone
                return p
            })
    }
}

class ZoneRequester {
    constructor(
        public s : SystemDry,
        public zones : ZoneDry[]
    ){}

    cards(){
        return new CardRequester(
            this.s,
            this.zones.flatMap(z => {
                const carr = z.cardArrFiltered
                return carr.map(c => {
                    const c1 = c as Internal_regen_card;
                    c1.___zone = z;
                    return c1
                })
            })
        )
    }

    pos(){
        return new PosRequester(
            this.s,
            this.zones.flatMap(z => {
                const pos = z.getAllPos()
                return pos.map(p => {
                    const p1 = p as any as Internal_regen_pos;
                    p1.___zone = z;
                    return p1
                })
            })
        )
    }

    ofSamePlayer(pstat? : PlayerSpecific){
        this.zones = pstat ? this.zones.filter(z => z.playerIndex === pstat.playerIndex) : []
        return this
    }

    ofSamePlayerType(pstat? : PlayerSpecific){
        this.zones = pstat ? this.zones.filter(z => z.playerType === pstat.playerType) : []
        return this
    }

    filter(f : (z : ZoneDry) => boolean, thisArg? : Object){
        if(f) this.zones = this.zones.filter(f.bind(thisArg))
        return this as ZoneRequester
    }

    once() {       
        return new InputRequest<[TargetZone]>(
            new InputRequestData(this.s, 1, ...this.zones.map(z => z.identity))
        )
    }

    many<L extends number>(l : L) {
        return new InputRequest<Tuple_any<TargetZone, L>>(
            new InputRequestData(this.s, l, ...this.zones.map(z => z.identity))
        )
    }

    all(){
        return this.zones
    }
}

class NumberRequester {
    constructor(
        public s : SystemDry,
        public nums : number[]
    ){}

    filter(f? : (n : number) => boolean, thisArg? : Object){
        if(f) this.nums = this.nums.filter(f.bind(thisArg));
        return this as NumberRequester;
    }

    once() {       
        return new InputRequest<[TargetNumber]>(
            new InputRequestData(this.s, 1, ...this.nums.map(n => Target.num(n)))
        )
    }

    many<L extends number>(l : L) {
        return new InputRequest(
            new InputRequestData(this.s, l, ...this.nums.map(n => Target.num(n)))
        ) as any as InputRequest<Tuple_any<TargetNumber, L>>
    }

    all(){
        return this.nums
    }
}

const Request = {
    //zones
    field(s : SystemDry, c : CardDry){
        return new ZoneRequester(s, s.zoneArr.filter(z => z.is(ZoneRegistry.field))).ofSamePlayer(s.getZoneOf(c))
    },

    grave(s : SystemDry, c : CardDry){
        return new ZoneRequester(s, s.zoneArr.filter(z => z.is(ZoneRegistry.grave))).ofSamePlayer(s.getZoneOf(c))
    },

    deck(s : SystemDry, c : CardDry){
        return new ZoneRequester(s, s.zoneArr.filter(z => z.is(ZoneRegistry.deck))).ofSamePlayer(s.getZoneOf(c))
    },

    hand(s : SystemDry, c : CardDry){
        return new ZoneRequester(s, s.zoneArr.filter(z => z.is(ZoneRegistry.hand))).ofSamePlayer(s.getZoneOf(c))
    },

    specificType(s : SystemDry, c : CardDry | PlayerSpecific, zType : ZoneTypeID){ 
        return new ZoneRequester(s, s.zoneArr.filter(z => z.is(zType))).ofSamePlayer(Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c))
    },

    oppositeZoneTo(s : SystemDry, c : CardDry){
        const layout = s.getLayout()
        if(!layout) return new ZoneRequester(s, []);

        const oppositeZoneID = layout.getOppositeZoneID(s.getZoneOf(c) as any)
        if(oppositeZoneID === undefined) return new ZoneRequester(s, []);

        const oppositeZone = s.getZoneWithID(oppositeZoneID)
        if(!oppositeZone) return new ZoneRequester(s, []);

        return new ZoneRequester(s, [oppositeZone])
    },

    enemy(s : SystemDry, c : CardDry){
        return this.oppositeZoneTo(s, c).cards()
    },

    allZones(s : SystemDry, c : CardDry){
        return new ZoneRequester(s, s.zoneArr.filter(z => z.of(s.getZoneOf(c))))
    },

    //misc
    nums(s : SystemDry, ...nums : (number[] | number)[]){
        const merged = nums.reduce((prev : number[], cur : number | number[]) => {
            return [...prev, ...(typeof cur === "number" ? [cur] : cur)]
        }, [])
        return new NumberRequester(s, merged)
    },
}

export default Request