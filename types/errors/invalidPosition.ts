import error from "./error"
import type Position from "../abstract/generics/position";

class invalidPosition extends error {
    constructor(cid : string, p : Position){
        super(cid);
        this.messege = `Cannot place card with id ${cid} on position ${p.toString()}`;
    }
}

export default invalidPosition