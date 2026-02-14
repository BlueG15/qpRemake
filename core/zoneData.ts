import type { safeSimpleTypes } from "./misc"
import type { ZoneAttrID, PlayerTypeID, ZoneTypeID } from "./registry"

type ZoneDataFixxed = {
    priority: number, //priority high = act first
    boundX? : number,
    boundY? : number,
    minCapacity : number, //defaults to 0
    attriutesArr: ZoneAttrID[]
    instancedFor: PlayerTypeID[]
    types? : ZoneTypeID[]
}

type ZoneDataVariable = {
    [key : string] : safeSimpleTypes
}

export type ZoneData = (ZoneDataFixxed) | (ZoneDataFixxed & ZoneDataVariable)