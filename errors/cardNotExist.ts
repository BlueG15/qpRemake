import error from "../specialActionTypes/error"

class cardNotExist extends error {
    constructor(){
        super();
        this.messege = `Try to access something thats not a card pretending to be a card`;
    }
}

export default cardNotExist