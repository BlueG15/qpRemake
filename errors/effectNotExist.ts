import error from "../specialActionTypes/error"

class effectNotExist extends error {
    constructor(eid: string, cid: string){
        super();
        this.messege = `The effect with id ${eid} doesnt exist on the card reference with id ${cid}, wrong activation time perhaps?`;
    }
}

export default effectNotExist