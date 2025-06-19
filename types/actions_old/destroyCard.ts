import type dry_card from "../../data/dry/dry_card";
import type dry_system from "../../data/dry/dry_system";
import posChange from "./posChange";
import Position from "../abstract/generics/position";

export default class destroyCard extends posChange {
    constructor(
        target : dry_card,
        system : dry_system,
        isChain = true,
        cause? : string
    ){
        let cardZone = system.zoneMap.get(target.pos.zoneName)  
        let pid = cardZone ? cardZone.playerIndex : -1
        super(
            target.id,
            isChain,
            new Position(target.pos),
            //top stack is lastpos
            pid === 0 ? system.playerGrave.lastPos : system.enemyGrave.lastPos,
            undefined,
            cause
        )
        this.type = "a_destroy"
    }
}