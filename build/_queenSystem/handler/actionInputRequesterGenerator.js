"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zoneRegistry_1 = require("../../data/zoneRegistry");
const actionInputGenerator_1 = require("./actionInputGenerator");
const systemRegistry_1 = require("../../data/systemRegistry");
const e_status_1 = require("../../specificEffects/e_status");
class regen_cards {
    constructor(s, cards) {
        this.s = s;
        this.cards = cards;
    }
    ofArchtype(p) {
        this.cards = this.cards.filter(c => c.is(p));
        return this;
    }
    ofSameArchtype(c1) {
        this.cards = this.cards.filter(c => c.is(c1.extensionArr));
        return this;
    }
    ofSameField(c1) {
        this.cards = this.cards.filter(c => c.pos.zoneID === c1.pos.zoneID);
        return this;
    }
    hasStatus() {
        this.cards = this.cards.filter(c => c.hasStatusEffect);
        return this;
    }
    hasAutomate() {
        this.cards = this.cards.filter(c => c.hasStatusEffect && c.statusEffects.some(e => e instanceof e_status_1.e_automate_base));
        return this;
    }
    isExposed() {
        this.cards = this.cards.filter(c => c.___zone.isExposed(c));
        return this;
    }
    isCoverred() {
        this.cards = this.cards.filter(c => !c.___zone.isExposed(c));
        return this;
    }
    isBack() {
        this.cards = this.cards.filter(c => {
            //a card is in the back if its back pos is out of bounds
            const back = c.___zone.getBackPos(c);
            return Utils.isPositionOutOfBounds(back.flat(), c.___zone.shape);
        });
        return this;
    }
    isFront() {
        this.cards = this.cards.filter(c => {
            //a card is in the front if its front pos is out of bounds
            const front = c.___zone.getFrontPos(c);
            return Utils.isPositionOutOfBounds(front.flat(), c.___zone.shape);
        });
        return this;
    }
    ofLevel(l) {
        this.cards = this.cards.filter(c => c.level === l);
        return this;
    }
    ofAtLeastLevel(l) {
        this.cards = this.cards.filter(c => c.level <= l);
        return this;
    }
    ofDataID(s) {
        this.cards = this.cards.filter(c => c.dataID === s);
        return this;
    }
    ofSameDataID(c_) {
        this.cards = this.cards.filter(c => c.dataID === c_.dataID);
        return this;
    }
    pos() {
        return new regen_pos(this.s, this.cards.map(c => {
            const p1 = c.pos;
            p1.___zone = c.___zone;
            delete c.___zone;
            return p1;
        }));
    }
    zones() {
        return new regen_zone(this.s, this.cards.map(c => {
            const z1 = c.___zone;
            delete c.___zone;
            return z1;
        }));
    }
    filter(f) {
        if (f)
            this.cards.filter(f);
        return this;
    }
    once(e) {
        if (e)
            this.filter(e.addedInputConditionMap.c);
        return new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.card, this.cards.map(c => {
            delete c.___zone;
            return actionInputGenerator_1.inputFormRegistry.card(this.s, c);
        }));
    }
    many(l, e) {
        if (e)
            this.filter(e.addedInputConditionMap.c);
        return new actionInputGenerator_1.inputRequester_multiple(l, systemRegistry_1.inputType.card, this.cards.map(c => {
            delete c.___zone;
            return actionInputGenerator_1.inputFormRegistry.card(this.s, c);
        }));
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
    clean(e) {
        if (e)
            this.filter(e.addedInputConditionMap.c);
        return this.cards.map(p => {
            delete p.___zone;
            return p;
        });
    }
}
class regen_pos {
    constructor(s, pos) {
        this.s = s;
        this.pos = pos;
    }
    isEmpty() {
        this.pos = this.pos.filter(p => !p.___zone.isOccupied(p));
        return this;
    }
    isOccupied() {
        this.pos = this.pos.filter(p => p.___zone.isOccupied(p));
        return this;
    }
    isExposed() {
        this.pos = this.pos.filter(p => p.___zone.isExposed({ pos: p }));
        return this;
    }
    isCoverred() {
        this.pos = this.pos.filter(p => !p.___zone.isExposed({ pos: p }));
        return this;
    }
    isBack() {
        this.pos = this.pos.filter(p => {
            //a card is in the back if its back pos is out of bounds
            const back = p.___zone.getBackPos({ pos: p });
            return Utils.isPositionOutOfBounds(back.flat(), p.___zone.shape);
        });
        return this;
    }
    isFront() {
        this.pos = this.pos.filter(p => {
            //a card is in the front if its front pos is out of bounds
            const front = p.___zone.getFrontPos({ pos: p });
            return Utils.isPositionOutOfBounds(front.flat(), p.___zone.shape);
        });
        return this;
    }
    cards() {
        return new regen_cards(this.s, this.pos.map(p => {
            const card = p.___zone.cardArr[Utils.positionToIndex(p.flat(), p.___zone.shape)];
            if (!card) {
                delete p.___zone;
                return;
            }
            ;
            const c1 = card;
            c1.___zone = p.___zone;
            delete p.___zone;
            return c1;
        }).filter(p => p !== undefined));
    }
    zones() {
        return new regen_zone(this.s, this.pos.map(p => {
            const z1 = p.___zone;
            delete p.___zone;
            return z1;
        }));
    }
    filter(f) {
        if (f)
            this.pos.filter(f);
        return this;
    }
    once(e) {
        if (e)
            this.filter(e.addedInputConditionMap.p);
        return new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.position, this.pos.map(p => {
            delete p.___zone;
            return actionInputGenerator_1.inputFormRegistry.pos(this.s, p);
        }));
    }
    many(l, e) {
        if (e)
            this.filter(e.addedInputConditionMap.p);
        return new actionInputGenerator_1.inputRequester_multiple(l, systemRegistry_1.inputType.position, this.pos.map(p => {
            delete p.___zone;
            return actionInputGenerator_1.inputFormRegistry.pos(this.s, p);
        }));
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
    clean(e) {
        if (e)
            this.filter(e.addedInputConditionMap.p);
        return this.pos.map(p => {
            delete p.___zone;
            return p;
        });
    }
}
class regen_zone {
    constructor(s, zones) {
        this.s = s;
        this.zones = zones;
    }
    cards() {
        return new regen_cards(this.s, this.zones.flatMap(z => {
            const carr = z.cardArr_filtered;
            return carr.map(c => {
                const c1 = c;
                c1.___zone = z;
                return c1;
            });
        }));
    }
    pos() {
        return new regen_pos(this.s, this.zones.flatMap(z => {
            const pos = z.getAllPos();
            return pos.map(p => {
                const p1 = p;
                p1.___zone = z;
                return p1;
            });
        }));
    }
    ofSamePlayer(pstat) {
        this.zones = pstat ? this.zones.filter(z => z.playerIndex === pstat.playerIndex) : [];
        return this;
    }
    ofSamePlayerType(pstat) {
        this.zones = pstat ? this.zones.filter(z => z.playerType === pstat.playerType) : [];
        return this;
    }
    filter(f) {
        if (f)
            this.zones = this.zones.filter(f);
        return this;
    }
    once(e) {
        if (e)
            this.filter(e.addedInputConditionMap.z);
        return new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.zone, this.zones.map(z => actionInputGenerator_1.inputFormRegistry.zone(this.s, z)));
    }
    many(l, e) {
        if (e)
            this.filter(e.addedInputConditionMap.z);
        return new actionInputGenerator_1.inputRequester_multiple(l, systemRegistry_1.inputType.zone, this.zones.map(z => actionInputGenerator_1.inputFormRegistry.zone(this.s, z)));
    }
    // all(e? : Effect<any>){
    //     if(e) this.filter(e.addedInputConditionMap.z);
    //     return new inputRequester_multiple(
    //         this.zones.length,
    //         inputType.zone,
    //         this.zones.map(z => inputFormRegistry.zone(this.s, z))
    //     )
    // }
    clean(e) {
        if (e)
            this.filter(e.addedInputConditionMap.z);
        return this.zones;
    }
}
class regen_nums {
    constructor(s, nums) {
        this.s = s;
        this.nums = nums;
    }
    filter(f) {
        if (f)
            this.nums = this.nums.filter(f);
    }
    once(e) {
        if (e)
            this.filter(e.addedInputConditionMap.n);
        return new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.number, this.nums.map(n => actionInputGenerator_1.inputFormRegistry.num(n)));
    }
    many(l, e) {
        if (e)
            this.filter(e.addedInputConditionMap.n);
        return new actionInputGenerator_1.inputRequester_multiple(l, systemRegistry_1.inputType.number, this.nums.map(n => actionInputGenerator_1.inputFormRegistry.num(n)));
    }
}
class inputRequesterGenerator {
    //zones
    field(s, c) {
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry_1.zoneRegistry.z_field)));
    }
    grave(s, c) {
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry_1.zoneRegistry.z_grave)));
    }
    deck(s, c) {
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry_1.zoneRegistry.z_deck)));
    }
    hand(s, c) {
        return new regen_zone(s, s.filter(0, z => z.is(zoneRegistry_1.zoneRegistry.z_hand)));
    }
    specificType(s, c, zType) {
        return new regen_zone(s, s.filter(0, z => z.is(zType)));
    }
    oppositeZoneTo(s, c) {
        return new regen_zone(s, s.getZoneOf(c).getOppositeZone(this.field(s, c).clean()));
    }
    allZones(s, c) {
        return new regen_zone(s, s.filter(0, () => true));
    }
    //misc
    nums(s, ...nums) {
        const merged = nums.reduce((prev, cur) => {
            return [...prev, ...(typeof cur === "number" ? [cur] : cur)];
        }, []);
        return new regen_nums(s, merged);
    }
}
const Request = new inputRequesterGenerator();
exports.default = Request;
