import type dry_system from "../data/dry/dry_system";
import { actionConstructorRegistry, actionFormRegistry, type Action } from "../_queenSystem/handler/actionGenrator";
import type Card from "../types/abstract/gameComponents/card";
import Effect from "../types/abstract/gameComponents/effect";
import actionRegistry from "../data/actionRegistry";

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

    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action): boolean {
        //all dmg
        if(
            a.typeID === actionRegistry.a_deal_damage_card ||
            a.typeID === actionRegistry.a_deal_damage_internal ||
            a.typeID === actionRegistry.a_deal_damage_position
        ){
            if(this.reductionDmgType === undefined) return true;
            return a.flatAttr().dmgType === this.reductionDmgType
        }
        return false;
    }

    override activate_proto(c: Card, system: dry_system, a: Action<"a_deal_damage_card"> | Action<"a_deal_damage_internal"> | Action<"a_deal_damage_position">): Action[] {
        const attr = a.flatAttr()
        let oldDmg = attr.dmg ?? 0;
        let newDmg = oldDmg - this.reductionAmmount;
        if(newDmg < this.minDmg) newDmg = 0
        return [
            actionConstructorRegistry.a_modify_action("a_deal_damage_card")(system, a as any)(actionFormRegistry.card(system, c.toDry()))({
                dmg : newDmg
            })
        ]
    }

    override getDisplayInput(c: Card, system: dry_system): (string | number)[] {
        return [this.reductionAmmount, this.minDmg, this.reductionDmgType ?? "all"]
    }

}