import type effect from "../baseClass/effect";

class dry_effect {
    readonly type: string
    readonly subTypes: string[]
    readonly desc: string
    readonly canRespondDuringChain : boolean
    readonly canRespondDuringTrigger : boolean
    readonly attr: Map<string, number> //position and stuff is in here

    constructor(eff : effect){
        this.type = eff.type
        this.subTypes = []
        this.subTypes.push(...eff.subTypes)
        this.desc = eff.desc
        this.canRespondDuringChain = eff.canRespondDuringChain
        this.canRespondDuringTrigger = eff.canRespondDuringTrigger
        this.attr = new Map<string, number>(Object.entries(eff.attr))
    }

    toString(spaces : number){
        return JSON.stringify({
            type : this.type,
            subTypes : this.subTypes,
            desc : this.desc,
            canRespondDuringChain : this.canRespondDuringChain,
            canRespondDuringTrigger : this.canRespondDuringTrigger,
            attr : JSON.stringify(Array.from(Object.entries(this.attr)))
        }, null, spaces)
    }
}

export default dry_effect