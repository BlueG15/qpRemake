import error from "../specialActionTypes/error"

class zoneFull extends error {
    constructor(zoneID : number, cardID : string){
        super(cardID);
        this.messege = `Cannot add card with id ${cardID} to zone with id ${zoneID} full, extra card discarded`;
    }
}

export default zoneFull