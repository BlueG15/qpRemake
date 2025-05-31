import type card from "../../abstract/gameComponents/card";
import type dry_position from "./dry_position";
import type dry_effect from "./dry_effect";

class dry_card {
    readonly id: string;
    readonly effects : dry_effect[];
    readonly pos : dry_position;
    readonly img : string;
    readonly attr : Map<string, number>;
    readonly canAct : boolean
    
    constructor(c : card){
        this.id = c.id
        this.effects = c.effects.map(i => i.toDry())
        this.pos = c.pos.toDry()
        this.img = c.img
        this.attr = new Map<string, number>(Object.entries(c.attr))
        this.canAct = c.canAct
    }

    toString(spaces : number, simplify : boolean = false) {
        if(simplify) return this.id
        return JSON.stringify({
            id : this.id,
            effects : this.effects.map(i => i.toString(spaces)),
            pos : this.pos.toString(),
            img : this.img,
            canAct : this.canAct,
            attr : JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces)
    }
}

export default dry_card