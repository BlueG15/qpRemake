import type effect from "../baseClass/effect";
import type dry_effectSubType from "./dry_effectSubType";

class dry_effect {
    readonly id : string
    readonly type: string
    readonly subTypes: dry_effectSubType[]
    readonly desc: string
    readonly isDisabled : boolean
    readonly attr: Map<string, number> //position and stuff is in here

    constructor(eff : effect){
        this.id = eff.id
        this.type = eff.type
        this.subTypes = []
        this.subTypes.push(...eff.subTypes.map(i => i.toDry()))
        this.desc = eff.desc
        this.attr = new Map<string, number>(Object.entries(eff.attr))
        this.isDisabled = eff.isDisabled
    }

    toString(spaces : number){
        return JSON.stringify({
            type : this.type,
            subTypes : this.subTypes,
            desc : this.desc,
            attr : JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces)
    }
}

export default dry_effect