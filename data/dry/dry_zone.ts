import type Zone from "../../types/abstract/gameComponents/zone";
import dry_card from "./dry_card";
import type dry_position from "./dry_position";

class dry_zone {
    readonly id : number
    readonly name : string
    readonly priority : number
    readonly cardMap : Map<dry_position, dry_card>
    readonly attrArr : ReadonlyArray<number>
    readonly types : ReadonlyArray<number>

    readonly firstPos : dry_position
    readonly lastPos : dry_position

    readonly playerIndex : number

    // private ref : Zone 

    constructor(zone : Zone){
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

        this.attrArr = zone.attrArr.map(i => Number(i))

        this.types = zone.types.map(i => Number(i))

        this.firstPos = zone.firstPos.toDry();
        this.lastPos = zone.lastPos.toDry();

        this.playerIndex = zone.playerIndex
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

    count(predicate : ((c : dry_card) => boolean | undefined | void)) : number{
        let c = 0;
        this.cardMap.forEach(i => {
            if( predicate(i) ) c++
        })
        return c;
    }

    get top() {return this.lastPos}
    get bottom() {return this.firstPos}
}

export default dry_zone
