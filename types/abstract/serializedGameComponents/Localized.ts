//These Localized objects should be serializable
// import type { dry_effect, dry_card, dry_zone, dry_system, dry_position } from "../../../data/systemRegistry";
// import type { nestedTree } from "../../misc";
import type { component } from "../parser";

type LocalizedString = component[]

export class Localized_effect {
    constructor(
        public id : number, //pid technically
        public text : LocalizedString,
        public type : LocalizedString,
        public subtypes : LocalizedString[],
    ){}
}

export class Localized_card {
    constructor(
        public id : string,
        public name : LocalizedString,
        public extensions : LocalizedString[],
        public effects : Localized_effect[],
        public statusEffects : Localized_effect[],
        public zoneID : number,
        public pos : number[],
        //stat
        public atk : number, //display stat
        public hp : number, //display stat
        public maxAtk : number,
        public maxHp : number,
        public level : number,
        public rarity : LocalizedString,
        public archtype : LocalizedString[],
    ){}
}

export class Localized_zone {
    constructor(
        public id : number,
        public pid : number,
        public pType : LocalizedString,
        public name : LocalizedString,
        public cards : (Localized_card | undefined)[],
        public shape : number[],
    ){
        while(cards.length && cards.at(-1) === undefined) cards.splice(-1, 1);
        this.cards = cards
    }
}

export class Localized_action {
    constructor(
        public id : number,
        public name : LocalizedString,
    ){}
}

export class Localized_player {
    constructor(
        public id : number,
        public pType : LocalizedString,
        public heart : number,
        public maxHeart : number,
        public operator : LocalizedString,
        public deckName : LocalizedString,
    ){}
}

export class Localized_system {
    constructor(
        public players : Localized_player[],
        public zones : Localized_zone[],
        public action : Localized_action,
        public phase : number,
        
        public turn : number,
        public wave : number,
    ){}
}