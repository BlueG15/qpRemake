import Action_prototype from "../abstract/gameComponents/action";
import { damageType } from "../../data/misc";

class dealDamage extends Action_prototype {
    constructor(
        target : string,
        cause? : string,
        isChain = false,
        dmg = 0,
        dmgType : number = damageType.physical
    ){
        super(
            "a_deal_damage", 
            isChain,
            cause,
            target,
            undefined,
            true, //can be chained to
            true //can be triggered to
        )
        this.attr.set("dmg", dmg);
        this.attr.set("dmgType", dmgType);
    }

    get dmg() : number {return this.attr.get("dmg")};
    set dmg(newVal : number) {this.attr.set("dmg", newVal)};

    get dmgType() : number {return this.attr.get("dmgType")};
    set dmgType(newVal : number) {this.attr.set("dmgType", newVal)};

    protected override verifyNewValue(key: string, newVal: any): boolean {
        if(key === "dmg" && typeof newVal === "number" && newVal >= 0 && isFinite(newVal)) return true;
        if(key === "dmgType" && typeof newVal === "number") return true;
        return super.verifyNewValue(key, newVal);
    }
}

export default dealDamage