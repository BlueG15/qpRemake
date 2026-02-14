//For saving / loading
import type { PlayerStat } from "./interface";
import type { DeckID, EffectTypeID, OperatorID, PlayerTypeID, EffectDataID, EffectSubtypeID, ZoneTypeID, CardDataID } from "./registry";

export class SerializedEffect {
    attr : Record<string, number> = {}
    variants : string[] = []
    constructor(
        // public id : string, //generated again
        public dataID : EffectDataID,
        public typeID : EffectTypeID,
        public subTypeIDs : EffectSubtypeID[],
        public displayID : string, //undefined means use effectID
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
        public dataID : CardDataID,
        public variants : string[] = [],
        public effects : SerializedEffect[],
        public statusEffects : SerializedEffect[],
        attr : Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
        effects.forEach(e => e.variants = this.variants)
        statusEffects.forEach(e => e.variants = this.variants)
    }
}

export class SerializedZone {
    attr : Record<string, any> = {}
    constructor(
        public classID : ZoneTypeID,
        public dataID: ZoneTypeID,
        public cardArr: (SerializedCard | undefined)[],
        public types : ZoneTypeID[],
        public pType : PlayerTypeID,
        public pid : number,
        attr: Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
    }
}

export type SerializedPlayer = PlayerStat

export class SerializedTransform {
    constructor(
        //origin either references another transformation or a number
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

