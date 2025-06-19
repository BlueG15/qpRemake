import error from "./error"

class incorrectActiontype extends error {
    constructor(got: string, expected: string){
        super();
        this.messege = `wrong action type received : got : ${got}, expected : ${expected}`;
    }
}

export default incorrectActiontype