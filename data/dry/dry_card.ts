import type card from "../../types/abstract/gameComponents/card";
import type dry_position from "./dry_position";
import type dry_effect from "./dry_effect";

class dry_card {
    readonly id: string;
    readonly effects : ReadonlyArray<dry_effect>;
    readonly statusEffect : ReadonlyArray<dry_effect>
    readonly pos : dry_position;
    readonly attr : ReadonlyMap<string, number>;
    readonly canAct : boolean
    readonly extensionArr : ReadonlyArray<string>
    readonly variants : ReadonlyArray<string>
    readonly belongTo : ReadonlyArray<string>
    readonly dataID : string
    readonly imgUrl : string

    constructor(c : card){
        this.id = c.id
        this.effects = c.effects.map(i => i.toDry())
        this.statusEffect = c.statusEffects.map(i => i.toDry())
        this.pos = c.pos.toDry()
        this.extensionArr = c.extensionArr.map(i => String(i))
        this.attr = new Map<string, number>(Object.entries(c.attr))
        this.canAct = c.canAct
        this.variants = c.variant.map(i => String(i))
        this.belongTo = c.belongTo.map(i => String(i))
        this.dataID = String(c.dataID)
        this.imgUrl = String(c.imgUrl)
    }

    toString(spaces : number = 4, simplify : boolean = false) {
        if(simplify) return this.id
        return JSON.stringify({
            id : this.id,
            effects : this.effects.map(i => i.toString(spaces)),
            statusEffects : this.statusEffect,
            pos : this.pos.toString(),
            canAct : this.canAct,
            attr : Array.from(Object.entries(this.attr)),
            extensionArr : this.extensionArr,
            variants : this.variants,
            belongTo : this.belongTo,
            dataID : this.dataID,
            imgUrl : this.imgUrl,
        }, null, spaces)
    }
}

export default dry_card