import error from "../actionTypes/error"

class zoneAttrConflict extends error {
    constructor(zoneID : number, actionName? : string, cardID? : string){
        super(cardID);
        this.messege = `Attempts to interact with zone with id ${zoneID} is not allowed by zone attribute`;
        if(actionName) this.messege += ", forbidden action: " + actionName
    }
}

export default zoneAttrConflict