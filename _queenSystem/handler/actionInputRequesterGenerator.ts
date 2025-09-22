import type { dry_card, dry_position, dry_system, dry_zone } from "../../data/systemRegistry";
import type Effect from "../../types/abstract/gameComponents/effect";
import { zoneRegistry } from "../../data/zoneRegistry";
import Position from "../../types/abstract/generics/position";
import type { id_able, Player_specific, Positionable } from "../../types/misc";
import type { Action } from "./actionGenrator";
import { 
    inputFormRegistry,
    inputRequester, 
    inputRequester_multiple,
} from "./actionInputGenerator";
import { inputType } from "../../data/systemRegistry";
import { e_automate_base } from "../../specificEffects/e_status";


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
            return Utils.isPositionOutOfBounds(back.flat(), c.___zone.shape)
        })
        return this
    }

    isFront(){
        this.cards = this.cards.filter(c => {
            //a card is in the front if its front pos is out of bounds
            const front = c.___zone.getFrontPos(c);
            return Utils.isPositionOutOfBounds(front.flat(), c.___zone.shape)
        })
        return this
    }

    ofLevel(l : number){
        this.cards = this.cards.filter(c => c.level === l)
        return this
    }

    ofAtLeastLevel(l : number){
        this.cards = this.cards.filter(c => c.level <= l)
        return this
    }

    ofDataID(s : string){
        this.cards = this.cards.filter(c => c.dataID === s)
        return this
    }

    ofSameDataID(c_ : dry_card){
        this.cards = this.cards.filter(c => c.dataID === c_.dataID)
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

    filter(f? : (c : Internal_regen_card) => boolean){
        if(f) this.cards.filter(f);
        return this
    }

    once(e? : Effect<any>) {
        if(e) this.filter(e.addedInputConditionMap.c);        
        return new inputRequester(
            inputType.card,
            this.cards.map(c => {
                delete (c as any).___zone
                return inputFormRegistry.card(this.s, c)
            })
        )
    }

    many<L extends number>(l : L, e? : Effect<any>) {
        if(e) this.filter(e.addedInputConditionMap.c);
        return new inputRequester_multiple(
            l,
            inputType.card,
            this.cards.map(c => {
                delete (c as any).___zone
                return inputFormRegistry.card(this.s, c)
            })
        )
    }

    // all(e? : Effect<any>){
    //     if(e) this.filter(e.addedInputConditionMap.c);
    //     return new inputRequester_multiple(
    //         this.cards.length,
    //         inputType.card,
    //         this.cards.map(c => {
    //             delete (c as any).___zone
    //             return inputFormRegistry.card(this.s, c)
    //         })
    //     )
    // }

    clean(e? : Effect<any>) : dry_card[] {
        if(e) this.filter(e.addedInputConditionMap.c);
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
            return Utils.isPositionOutOfBounds(back.flat(), p.___zone.shape)
        })
        return this
    }

    isFront(){
        this.pos = this.pos.filter(p => {
            //a card is in the front if its front pos is out of bounds
            const front = p.___zone.getFrontPos({pos : p});
            return Utils.isPositionOutOfBounds(front.flat(), p.___zone.shape)
        })
        return this
    }

    cards(){
        return new regen_cards(
            this.s, 
            this.pos.map(p => {
                const card = p.___zone.cardArr[Utils.positionToIndex(p.flat(), p.___zone.shape)]
                if(!card) {
                    delete (p as any).___zone
                    return
                };
                const c1 = card as Internal_regen_card
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

    filter(f? : (p : Internal_regen_pos) => boolean){
        if(f) this.pos.filter(f)
        return this
    }

    once(e? : Effect<any>){
        if(e) this.filter(e.addedInputConditionMap.p);
        return new inputRequester(
            inputType.position,
            this.pos.map(p => {
                delete (p as any).___zone
                return inputFormRegistry.pos(this.s, p)
            })
        )
    }

    many<L extends number>(l : L, e? : Effect<any>){
        if(e) this.filter(e.addedInputConditionMap.p);
        return new inputRequester_multiple(
            l,
            inputType.position,
            this.pos.map(p => {
                delete (p as any).___zone
                return inputFormRegistry.pos(this.s, p)
            })
        )
    }

    // all(e? : Effect<any>){
    //     if(e) this.filter(e.addedInputConditionMap.p);
    //     return new inputRequester_multiple(
    //         this.pos.length,
    //         inputType.position,
    //         this.pos.map(p => {
    //             delete (p as any).___zone
    //             return inputFormRegistry.pos(this.s, p)
    //         })
    //     )
    // }

    clean(e? : Effect<any>) : dry_position[] {
        if(e) this.filter(e.addedInputConditionMap.p);
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

    filter(f? : (z : dry_zone) => boolean){
        if(f) this.zones = this.zones.filter(f)
        return this
    }

    once(e? : Effect<any>) {
        if(e) this.filter(e.addedInputConditionMap.z);
        return new inputRequester(
            inputType.zone,
            this.zones.map(z => inputFormRegistry.zone(this.s, z))
        )
    }

    many<L extends number>(l : L, e? : Effect<any>){
        if(e) this.filter(e.addedInputConditionMap.z);
        return new inputRequester_multiple(
            l,
            inputType.zone,
            this.zones.map(z => inputFormRegistry.zone(this.s, z))
        )
    }

    // all(e? : Effect<any>){
    //     if(e) this.filter(e.addedInputConditionMap.z);
    //     return new inputRequester_multiple(
    //         this.zones.length,
    //         inputType.zone,
    //         this.zones.map(z => inputFormRegistry.zone(this.s, z))
    //     )
    // }

    clean(e? : Effect<any>){
        if(e) this.filter(e.addedInputConditionMap.z);
        return this.zones
    }
}

class regen_nums {
    constructor(
        public s : dry_system,
        public nums : number[]
    ){}

    filter(f? : (n : number) => boolean){
        if(f) this.nums = this.nums.filter(f)
    }

    once(e? : Effect<any>) {
        if(e) this.filter(e.addedInputConditionMap.n);
        return new inputRequester(
            inputType.number,
            this.nums.map(n => inputFormRegistry.num(n))
        )
    }

    many<L extends number>(l : L, e? : Effect<any>){
        if(e) this.filter(e.addedInputConditionMap.n);
        return new inputRequester_multiple(
            l,
            inputType.number,
            this.nums.map(n => inputFormRegistry.num(n))
        )
    }

    // all(e? : Effect<any>){
    //     if(e) this.filter(e.addedInputConditionMap.n);
    //     return new inputRequester_multiple(
    //         this.nums.length,
    //         inputType.number,
    //         this.nums.map(n => inputFormRegistry.num(n))
    //     )
    // }
}



class inputRequesterGenerator {
    //zones
    field(s : dry_system, c : Player_specific | Positionable){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_field)))
    }

    grave(s : dry_system, c : Player_specific | Positionable){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_grave)))
    }

    deck(s : dry_system, c : Player_specific | Positionable){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_deck)))
    }

    hand(s : dry_system, c : Player_specific | Positionable){
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry.z_hand)))
    }

    specificType(s : dry_system, c : Player_specific | Positionable, zType : zoneRegistry){
        return new regen_zone(s, s.filter(0, z => z.is(zType)))
    }

    oppositeZoneTo(s : dry_system, c : dry_card){
        return new regen_zone(s, s.getZoneOf(c)!.getOppositeZone(this.field(s, c).clean()))
    }

    allZones(s : dry_system, c : Player_specific | Positionable){
        return new regen_zone(s, s.filter(0, () => true))
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