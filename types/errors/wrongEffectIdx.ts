import error from "./error"

//For accessing effect using idx instead of eid
class wrongEffectIdx extends error {
    constructor(eidx : number, cid : string){
        super(cid);
        this.messege = `The card with id ${cid} do not have the effect at index ${eidx}`;
    }
}

export default wrongEffectIdx