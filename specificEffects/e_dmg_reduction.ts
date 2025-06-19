import type dry_system from "../data/dry/dry_system";
import type Action_prototype from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";
import Effect from "../types/abstract/gameComponents/effect";
import { modifyAnotherAction } from "../types/actions_old";
import dealDamage from "../types/actions_old/dealDamage";

export default class damageReductionEffect extends Effect {

    get reductionAmmount() : number {return this.attr.get("reductionAmmount") ?? 0};
    set reductionAmmount(val : number) {this.attr.set("reductionAmmount", val)};

    get minDmg() : number {return this.attr.get("minDmg") ?? 0};
    set minDmg(val : number) {this.attr.set("minDmg", val)};

    get reductionDmgType() : number | undefined {return this.attr.get("reductionDmgType")} //undefined is all damage
    set reductionDmgType(val : number | undefined) {
        if(val === undefined) this.attr.delete("reductionDmgType"); 
        else this.attr.set("reductionDmgType", val)
    }

    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action_prototype): boolean {
        //all dmg
        if(a instanceof dealDamage){
            if(this.reductionDmgType === undefined) return true;
            return a.dmgType === this.reductionDmgType
        }
        return false;
    }

    override activate_proto(c: Card, system: dry_system, a: Action_prototype): Action_prototype[] {
        if(a instanceof dealDamage){
            let oldDmg = (a as dealDamage).dmg ?? 0;
            let newDmg = oldDmg - this.reductionAmmount;
            if(newDmg < this.minDmg) newDmg = 0
            return [
                new modifyAnotherAction(
                    a.id, 
                    "dmg",
                    newDmg,
                    true, 
                    c.id
                )
            ]
        }
        return []
    }

    override getDisplayInput(c: Card, system: dry_system): (string | number)[] {
        return [this.reductionAmmount, this.minDmg, this.reductionDmgType ?? "all"]
    }

}