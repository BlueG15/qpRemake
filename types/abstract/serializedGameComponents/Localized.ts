//These Localized objects should be serializable
// import type { dry_effect, dry_card, dry_zone, dry_system, dry_position } from "../../../data/systemRegistry";
// import type { nestedTree } from "../../misc";
import type { rarityRegistry } from "../../../data/rarityRegistry";
import type { playerTypeID, zoneRegistry } from "../../../data/zoneRegistry";
import type { DisplayComponent } from "../parser";

type LocalizedString = DisplayComponent[]

export class LocalizedEffect {
    constructor(
        public id : number, //pid technically
        public text : LocalizedString,
        public type : LocalizedString,
        public subtypes : LocalizedString[],
        public typeDesc? : LocalizedString,
        public subtypesDesc? : (LocalizedString | undefined)[]
    ){}
}

export class LocalizedCard {
    constructor(
        public id : string,
        public name : LocalizedString,
        public extensions : LocalizedString[],
        public effects : LocalizedEffect[],
        public statusEffects : LocalizedEffect[],
        public zoneID : number,
        public pos : number[],
        //stat
        public atk : number, //display stat
        public hp : number, //display stat
        public maxAtk : number,
        public maxHp : number,
        public level : number,
        public rarity : rarityRegistry,
        public rarityName : LocalizedString,
        public archtype : LocalizedString[],
    ){}
}

export class LocalizedZone {
    constructor(
        public id : number,
        public pid : number,
        public type : zoneRegistry[],
        public typeName : LocalizedString[],
        public name : LocalizedString,
        public cards : (LocalizedCard | undefined)[],
        public shape : number[],
    ){
        while(cards.length && cards.at(-1) === undefined) cards.splice(-1, 1);
        this.cards = cards
    }
}

export class LocalizedAction {
    constructor(
        public id : number,
        public name : LocalizedString,
    ){}
}

export class LocalizedPlayer {
    constructor(
        public id : number,
        public type : playerTypeID,
        public pType : LocalizedString,
        public heart : number,
        public maxHeart : number,
        public operator : LocalizedString,
        public deckName : LocalizedString,
    ){}
}

export class LocalizedSystem {
    constructor(
        public players : LocalizedPlayer[],
        public zones : LocalizedZone[],
        public action : LocalizedAction,
        public phase : number,
        
        public turn : number,
        public wave : number,
    ){}
}