import error from "./error";

class subTypeOverrideConflict extends error {
    effectID : string;
    conflictIndexes : number[]
    constructor(cid : string, eid : string, conflictIndexes : number[]){
        super(cid);
        this.effectID = eid;
        this.conflictIndexes = conflictIndexes
        this.messege = conflictIndexes.length + " subtypes attempted to override the result differently in card with id " + cid + " on effect " + eid;
    }
}

export default subTypeOverrideConflict