import Action_prototype from "../abstract/gameComponents/action";

class attack extends Action_prototype {
    constructor(
        cid : string, //the card that is attacking, not the attack target
        cause : string = cid, //a card causes itself to attack is the most common
        isChain = false,
        numTimes = 1,
    ){
        super(
            "a_attack", 
            isChain,
            cause,
            cid,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
        this.attr.set("times", numTimes);
    }

    get times() : number {return this.attr.get("times")};
    set times(newVal : number) {this.attr.set("times", newVal)};

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "times" && typeof newVal === "number" && newVal >= 0 && isFinite(newVal)) return true;
        return super.verifyNewValue(key, newVal);
    }
}

export default attack