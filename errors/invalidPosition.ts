import error from "../specialActionTypes/error"
import type position from "../baseClass/position";

class invalidPosition extends error {
    constructor(cid : string, p : position){
        super(cid);
        this.messege = `Cannot place card with id ${cid} on position ${p.toString()}`;
    }
}

export default invalidPosition