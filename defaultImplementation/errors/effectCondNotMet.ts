import error from "./error"

class effectCondNotMet extends error {
    constructor(eid : number, cid : string){
        super(cid);
        this.messege = `The card with id ${cid} cannot activate the effect with id ${eid}`;
    }
}

export default effectCondNotMet