import card from "../baseClass/card";

class blankCard extends card {
    constructor(num : number){
        super()
        this.id = `blank_${num}` 
    }
}

export default blankCard