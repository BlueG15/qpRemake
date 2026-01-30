//For saving / loading
import type { DeckID, EffectTypeID, OperatorID, EffectSubtypeName, PlayerTypeID } from "./registry";

export class SerializedEffect {
    attr : Record<string, number> = {}
    constructor(
        // public id : string, //generated again
        public dataID : string,
        public typeID : EffectTypeID,
        public subTypeIDs : EffectSubtypeName[],
        public displayID_default : string = dataID, //undefined means use effectID
        attr : Map<string, any>,
    ){
        attr.forEach((val, key) => {
            if(typeof val === "number") this.attr[key] = val
        })
    }
}

export class SerializedCard {
    attr : Record<string, any> = {}
    constructor(
        // public id : string, //generated again
        public dataID : string,
        public variants : string[] = [],
        //I have to save partition too ahhh
        public effects : SerializedEffect[],
        public statusEffects : SerializedEffect[],
        attr : Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
    }
}

export class SerializedZone {
    attr : Record<string, any> = {}
    constructor(
        public classID : number,
        public dataID: number,
        public cardArr: (SerializedCard | undefined)[],
        public types : number[],
        attr: Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
    }
}

export class SerializedPlayer {
    constructor(
        public pType : PlayerTypeID,
        public heart : number,
        public operator : OperatorID,
        public deckName? : DeckID,
    ){}
}

export class SerializedTransform {
    constructor(
        public originX : {type : "transform", id : number} | {type : "number", num : number},
        public originY : {type : "transform", id : number} | {type : "number", num : number},
        public flipHoz: boolean,
        public rotation: 0 | 90 | 180 | 270,
    ){}
}

export class SerializedLayout {
    constructor(
        public transforms : Record<number, SerializedTransform>,
        public oppositeZones : number[][]
    ){}
}

export class SerializedSystem {
     constructor(
            public players : SerializedPlayer[],
            public zones : SerializedZone[],
            public zoneLayout : SerializedLayout | undefined,
            
            public turn : number,
            public wave : number,
        ){}
}

