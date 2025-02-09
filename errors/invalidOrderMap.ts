import error from "../actionTypes/error"

class invalidOrderMap extends error {
    orderMap : Map<number, number>
    constructor(orderMap : Map<number, number>){
        super();
        this.orderMap = orderMap
        this.messege = `Invalid order map`;
    }
}

export default invalidOrderMap