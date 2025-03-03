import error from "../specialActionTypes/error"

class wrongEffectIdx extends error {
    constructor(eid : number, cid : string){
        super(cid);
        this.messege = `The card with id ${cid} do not have the effect with id ${eid}`;
    }
}

export default wrongEffectIdx