import { ActionGenerator, type Action } from "../../../core/registry/action";
import { damageType } from "../../../data/systemRegistry";
import { Effect } from "../effect";
import type { CardDry } from "../../cards/type";
import type { SystemDry } from "../../../core";
import type { EffectData } from "..";
import { EffectDataGenerator } from "..";

abstract class e_defense_base extends Effect<[]>{
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): a is Action<"a_deal_damage_card"> {
        return a.is("a_deal_damage_card") && a.targets[0].is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected abstract getNewDmg(a : Action<"a_deal_damage_card">) : number;
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">): Action[] {
        return [
            ActionGenerator.modify_action("a_deal_damage_card")(s, a)(this.identity)({
                dmg : Math.max(this.getNewDmg(a), 0)
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [];
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.defense()
        }
    }
}

export class e_undamagable extends e_defense_base {
    protected override getNewDmg(): number {
        return 0
    }
}

export class e_undamagable_physical extends e_undamagable{
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action) : a is Action<"a_deal_damage_card"> {
        return super.canRespondAndActivate(c, s, a) && a.flatAttr().dmgType === damageType.physical
    }
}

export class e_undamagable_magic extends e_undamagable{
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action) : a is Action<"a_deal_damage_card"> {
        return super.canRespondAndActivate(c, s, a) && a.flatAttr().dmgType === damageType.magic
    }
}

export class e_dmgcap extends e_defense_base {
    protected override getNewDmg(): number {
        return this.attr.number("dmgCap")
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("dmgCap")]
    }

    static override getEffData(){
        return {
            base : EffectDataGenerator.defense.num("dmgCap")()
        }
    }
}

export class e_dmgcap_physical extends e_dmgcap{
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action) : a is Action<"a_deal_damage_card"> {
        return super.canRespondAndActivate(c, s, a) && a.flatAttr().dmgType === damageType.physical
    }
}

export class e_dmgcap_magic extends e_dmgcap{
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action) : a is Action<"a_deal_damage_card"> {
        return super.canRespondAndActivate(c, s, a) && a.flatAttr().dmgType === damageType.magic
    }
}

export class e_dmg_reduction extends e_defense_base {
    protected override getNewDmg(a: Action<"a_deal_damage_card">): number {
        const oldDmg = a.flatAttr().dmg
        return oldDmg - this.attr.number("reduction")
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.attr.number("reduction")]
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.defense.num("reduction")()
        }
    }
}

export default {
    e_dmg_reduction,
    e_dmgcap,
    e_dmgcap_magic,
    e_dmgcap_physical,
    e_undamagable,
    e_undamagable_magic,
    e_undamagable_physical,
}