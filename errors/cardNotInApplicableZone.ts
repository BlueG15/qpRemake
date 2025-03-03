import error from "../specialActionTypes/error"

class cardNotInApplicableZone extends error {
    constructor(zoneID : number, cardID : string){
        super(cardID);
        this.messege = `Action done when card is not in zone with id ${zoneID} is invalid, cardID = ${cardID}`;
    }
}

export default cardNotInApplicableZone