//For saving / loading

import type { effectData, partitionData } from "../../../data/cardRegistry";
import type { deckRegistry } from "../../../data/deckRegistry";
import type effectTypeRegistry from "../../../data/effectTypeRegistry";
import type { operatorID } from "../../../data/operatorRegistry";
import type { subtypeName } from "../../../data/subtypeRegistry";
import type { playerTypeID } from "../../../data/zoneRegistry";

export class Serialized_effect {
    attr : Record<string, number> = {}
    constructor(
        // public id : string, //generated again
        public dataID : string,
        public typeID : keyof typeof effectTypeRegistry,
        public subTypeIDs : subtypeName[],
        public displayID_default : string = dataID, //undefined means use effectID
        attr : Map<string, any>,
    ){
        attr.forEach((val, key) => {
            if(typeof val === "number") this.attr[key] = val
        })
    }
}

export class Serialized_card {
    attr : Record<string, any> = {}
    constructor(
        // public id : string, //generated again
        public dataID : string,
        public variants : string[] = [],
        //I have to save partition too ahhh
        public effects : Serialized_effect[],
        public statusEffects : Serialized_effect[],
        public partitions : partitionData[],
        attr : Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
    }
}

export class Serialized_zone {
    attr : Record<string, any> = {}
    constructor(
        public classID : string,
        public dataID: string,
        public cardArr: (Serialized_card | undefined)[],
        public types : number[],
        attr: Map<string, any>,
    ){
        attr.forEach((val, key) => {
            this.attr[key] = val //Hopefully serializable
        })
    }
}

export class Serialized_player {
    constructor(
        public pType : playerTypeID,
        public heart : number,
        public operator : operatorID,
        public deckName? : deckRegistry,
    ){}
}

export class Serialized_system {
     constructor(
            public players : Serialized_player[],
            public zones : Serialized_zone[],
            
            public turn : number,
            public wave : number,
        ){}
}

