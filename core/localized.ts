//These Localized objects should be serializable
import type { ArchtypeID, PlayerTypeID, RarityID, ZoneTypeID } from "./registry";
import type { DisplayComponent } from "../system-components/localization/xml-text-parser";

type LocalizedString = DisplayComponent[]

export class LocalizedEffect {
    constructor(
        public id : string,
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
        public rarity : RarityID,
        public rarityName : LocalizedString,
        public archtypes : ArchtypeID[],
        public archtypeNames : LocalizedString[]
    ){}
}

export class LocalizedZone {
    constructor(
        public id : number,
        public pid : number,
        public type : ZoneTypeID[],
        public typeName : LocalizedString[],
        public cards : (LocalizedCard | undefined)[],
        public width : number,
        public height : number,
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
        public type : PlayerTypeID,
        public heart : number,
        public maxHeart : number,
        public operator : LocalizedString,
        public deckName : LocalizedString,
        public deckImg? : string,
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