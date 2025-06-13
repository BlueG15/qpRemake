import error from "./error"

class cannotLoad extends error {
    constructor(itemID : string, type? : string){
        super();
        this.messege = `Cannot load item ${itemID} ${type ? `type = ${type}` : ""}`;
    }
}

export default cannotLoad