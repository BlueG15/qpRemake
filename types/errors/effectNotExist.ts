import error from "./error"

class effectNotExist extends error {
    constructor(eid_or_index: string | number, cid: string){
        super();
        this.messege = `The effect with id / index ${eid_or_index} doesnt exist on the card reference with id ${cid}, wrong activation time perhaps?`;
    }
}

export default effectNotExist