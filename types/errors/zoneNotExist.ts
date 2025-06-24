import error from "./error"

class zoneNotExist extends error {
    constructor(zid : number){
        super();
        this.messege = `Try to access something thats not a zone pretending to be a zone, accessing index : ${zid}`;
    }
}

export default zoneNotExist