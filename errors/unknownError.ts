import error from "../actionTypes/error"

class unknownError extends error {
    constructor(){
        super();
        this.messege = `Some error happened, I dunno what tho`;
    }
}

export default unknownError