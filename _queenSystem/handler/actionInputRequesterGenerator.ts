import type { dry_card, dry_position, dry_system, dry_zone, inputData_card, inputData_num, inputData_pos, inputData_zone } from "../../data/systemRegistry";
import { zoneRegistry } from "../../data/zoneRegistry";
import type { Player_specific, Positionable, Tuple_any } from "../../types/misc";
import { 
    inputFormRegistry,
    InputRequester, 
    InputRequester_multiple,
} from "./actionInputGenerator";
import { inputType } from "../../data/systemRegistry";
import { e_automate_base } from "../../defaultImplementation/effects/e_status";


//regen = short for RequesterGenerator

type Internal_regen_card = dry_card & {___zone : dry_zone}
type Internal_regen_pos = dry_position & {___zone : dry_zone}

class regen_cards {
    constructor(
        public s : dry_system,
        public cards : Internal_regen_card[]
    ){}

    ofArchtype(p : string){
        this.cards = this.cards.filter(c => c.is(p))
        return this
    }

    ofSameArchtype(c1 : dry_card){
        this.cards = this.cards.filter(c => c.is(c1.extensionArr))
        return this
    }

    ofSameField(c1 : dry_card){
        this.cards = this.cards.filter(c => c.pos.zoneID === c1.pos.zoneID)
        return this
    }

    hasEffects(){
        this.cards = this.cards.filter(c => c.effects.length)
        return this
    }

    hasStatus(){
        this.cards = this.cards.filter(c => c.hasStatusEffect)
        return this
    }

    hasAutomate(){
        this.cards = this.cards.filter(c => c.hasStatusEffect && c.statusEffects.some(e => e instanceof e_automate_base))
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

    ofSameName(c_ : dry_card){
        this.cards = this.cards.filter(c => c.name === c_.name)
        return this
    }
    ofDifferentName(c_ : dry_card){
        this.cards = this.cards.filter(c => c.name !== c_.name)
        return this
    }

    pos(){
        return new regen_pos(
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
        return new regen_zone(
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
        return this as regen_cards
    }

    once() {       
        return new InputRequester(
            inputType.card,
            this.cards.map(c => {
                delete (c as any).___zone
                return inputFormRegistry.card(this.s, c)
            })
        )
    }

    many<L extends number>(l : L) {
        return new InputRequester_multiple(
            l,
            inputType.card,
            this.cards.map(c => {
                delete (c as any).___zone
                return inputFormRegistry.card(this.s, c)
            })
        ) as InputRequester<inputType.card, Tuple_any<inputData_card, L>>
    }

    all() : dry_card[] {
        return this.cards.map(p => {
            delete (p as any).___zone
            return p
        })
    }
}

class regen_pos {
    constructor(
        public s : dry_system,
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
        return new regen_cards(
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
        return new regen_zone(
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
        return this as regen_pos
    }

    once(){
        return new InputRequester(
            inputType.position,
            this.pos.map(p => {
                delete (p as any).___zone
                return inputFormRegistry.pos(this.s, p)
            })
        )
    }

    many<L extends number>(l : L){
        return new InputRequester_multiple(
            l,
            inputType.position,
            this.pos.map(p => {
                delete (p as any).___zone
                return inputFormRegistry.pos(this.s, p)
            })
        ) as InputRequester<inputType.position, Tuple_any<inputData_pos, L>>
    }

    all() : dry_position[] {
        return this.pos.map(p => {
                delete (p as any).___zone
                return p
            })
    }
}

class regen_zone {
    constructor(
        public s : dry_system,
        public zones : dry_zone[]
    ){}

    cards(){
        return new regen_cards(
            this.s,
            this.zones.flatMap(z => {
                const carr = z.cardArr_filtered
                return carr.map(c => {
                    const c1 = c as Internal_regen_card;
                    c1.___zone = z;
                    return c1
                })
            })
        )
    }

    pos(){
        return new regen_pos(
            this.s,
            this.zones.flatMap(z => {
                const pos = z.getAllPos()
                return pos.map(p => {
                    const p1 = p as Internal_regen_pos;
                    p1.___zone = z;
                    return p1
                })
            })
        )
    }

    ofSamePlayer(pstat? : Player_specific){
        this.zones = pstat ? this.zones.filter(z => z.playerIndex === pstat.playerIndex) : []
        return this
    }

    ofSamePlayerType(pstat? : Player_specific){
        this.zones = pstat ? this.zones.filter(z => z.playerType === pstat.playerType) : []
        return this
    }

    filter(f : (z : dry_zone) => boolean, thisArg? : Object){
        if(f) this.zones = this.zones.filter(f.bind(thisArg))
        return this as regen_zone
    }

    once() {
        return new InputRequester(
            inputType.zone,
            this.zones.map(z => inputFormRegistry.zone(this.s, z))
        )
    }

    many<L extends number>(l : L, ){
        return new InputRequester_multiple(
            l,
            inputType.zone,
            this.zones.map(z => inputFormRegistry.zone(this.s, z))
        ) as InputRequester<inputType.zone, Tuple_any<inputData_zone, L>>
    }

    all(){
        return this.zones
    }
}

class regen_nums {
    constructor(
        public s : dry_system,
        public nums : number[]
    ){}

    filter(f? : (n : number) => boolean, thisArg? : Object){
        if(f) this.nums = this.nums.filter(f.bind(thisArg));
        return this as regen_nums;
    }

    once() {
        return new InputRequester(
            inputType.number,
            this.nums.map(n => inputFormRegistry.num(n))
        )
    }

    many<L extends number>(l : L){
        return new InputRequester_multiple(
            l,
            inputType.number,
            this.nums.map(n => inputFormRegistry.num(n))
        ) as InputRequester<inputType.number, Tuple_any<inputData_num, L>>
    }

    all(){
        return this.nums
    }
}



class inputRequesterGenerator {
    //zones
    field(s : dry_system, c : dry_card){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_field))).ofSamePlayer(s.getZoneOf(c))
    }

    grave(s : dry_system, c : dry_card){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_grave))).ofSamePlayer(s.getZoneOf(c))
    }

    deck(s : dry_system, c : dry_card){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_deck))).ofSamePlayer(s.getZoneOf(c))
    }

    hand(s : dry_system, c : dry_card){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_hand))).ofSamePlayer(s.getZoneOf(c))
    }

    specificType(s : dry_system, c : dry_card | Player_specific, zType : zoneRegistry){
        return new regen_zone(s, s.filter(0, z => z.is(zType))).ofSamePlayer(Utils.isPlayerSpecific(c) ? c : s.getZoneOf(c))
    }

    oppositeZoneTo(s : dry_system, c : dry_card){
        const layout = s.getLayout()
        if(!layout) return new regen_zone(s, []);

        const oppositeZoneID = layout.getOppositeZoneID(s.getZoneOf(c) as any)
        if(oppositeZoneID === undefined) return new regen_zone(s, []);

        const oppositeZone = s.getZoneWithID(oppositeZoneID)
        if(!oppositeZone) return new regen_zone(s, []);

        return new regen_zone(s, [oppositeZone])
    }

    enemy(s : dry_system, c : dry_card){
        return this.oppositeZoneTo(s, c).cards()
    }

    allZones(s : dry_system, c : dry_card){
        return new regen_zone(s, s.filter(0, () => true)).ofSamePlayer(s.getZoneOf(c))
    }

    //misc
    nums(s : dry_system, ...nums : (number[] | number)[]){
        const merged = nums.reduce((prev : number[], cur : number | number[]) => {
            return [...prev, ...(typeof cur === "number" ? [cur] : cur)]
        }, [])
        return new regen_nums(s, merged)
    }
}


export type T_regen<T extends "card" | "zone" | "pos" | "nums" = "card" | "zone" | "pos" | "nums"> = {
    card : regen_cards,
    zone : regen_zone,
    pos : regen_pos,
    nums : regen_nums
}[T]
const Request = new inputRequesterGenerator()
export default Request