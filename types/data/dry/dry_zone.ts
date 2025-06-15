import type zone from "../../abstract/gameComponents/zone";
import dry_card from "./dry_card";
import type dry_position from "./dry_position";

class dry_zone {
    readonly id : number
    readonly name : string
    readonly priority : number
    readonly cardMap : Map<dry_position, dry_card>

    private ref : zone 

    constructor(zone : zone){
        this.id = zone.id
        this.name = zone.name
        this.priority = zone.priority
        this.cardMap = new Map();

        zone.cardArr.forEach((i, index) => {
            if(i){
                let x = i.toDry()
                this.cardMap.set(x.pos, x)
            }
        })

        this.ref = zone;
    }

    toString(spaces : number, simplify : boolean = false){
        let c : Record<string, string> = {}
        this.cardMap.forEach((value, key) => {
            c[key.toString()] = value.toString(spaces, simplify)
        })
        return JSON.stringify({
            id : this.id, 
            name : this.name,
            priority : this.priority,
            cardMap : c
        }, null, spaces)
    }

    getCardWithID(cid : string) : dry_card | undefined{
        let res : dry_card | undefined = undefined
        this.cardMap.forEach(i => {
            if(i.id === cid) res = i
        })
        return res
    }

    getCardWithDataID(cdid : string) : dry_card | undefined {
        let res : dry_card | undefined = undefined
        this.cardMap.forEach(i => {
            if(i.dataID === cdid) res = i
        })
        return res
    }

    get firstPos() {return this.ref.firstPos}
    get lastPos() {return this.ref.lastPos}
}

export default dry_zone
