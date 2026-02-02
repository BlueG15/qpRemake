import { ActionGenerator, type Action } from "../../../core/registry/action";
import { damageType } from "../../../data/systemRegistry";
import { Effect } from "../effect";
import type { CardDry } from "../../cards/type";
import type { SystemDry } from "../../../core";
import type { EffectData } from "..";
import type { ZoneDry } from "../../zones";
import { EffectDataGenerator } from "..";
import { ZoneRegistry } from "../../../core/registry/zone";
import { InputDataZone } from "../../../system-components/inputs";
import Request from "../../../system-components/inputs/input-request-maker";

export class e_attack extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        let atkCount = this.count
        const res : Action[] = []
        while(atkCount--) res.push(
            ActionGenerator.attack(s, c)(this.identity, {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        )
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.count]
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.manual.num("count", 1)()
        }
    }
}

export class e_destroy_self extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.destroy(s, c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.manual()
        }
    }
}

export class e_void_self extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.a_void(s, c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.manual()
        }
    }
}

export class e_decompile_self extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.a_decompile(s, c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.manual()
        }
    }
}

export class e_quick extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return []
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.instant()
        }
    }
}

export class e_deathcrave extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_destroy") && !!s.getResolveOrigin(a, "a_attack")?.targets[0].is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.a_reset_card(s, c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.trigger()
        }
    }
}

export class e_revenge extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.attack(s, c)(this.identity, {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.trigger()
        }
    }
}

export class e_reflect extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            ActionGenerator.attack(s, c)(this.identity, {
                dmg : a.flatAttr().dmg,
                dmgType : damageType.physical
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.trigger()
        }
    }
}

export class e_volatile extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_play", s, c, ZoneRegistry.z_field)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            ActionGenerator.a_replace_action(s, (
                ActionGenerator.a_void(s, c)(this.identity)
            ))(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.passive()
        }
    }
}

export class e_grave_to_hand extends Effect<[InputDataZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        return Request.hand(s, c).once();
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: [ZoneDry]): Action[] {
        const hand = input[0]
        return [
            ActionGenerator.move(s, c)(hand.top)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(): { base: EffectData; upgrade?: Partial<EffectData>; } {
        return {
            base : EffectDataGenerator.manual()
        }
    }
}

export default {
    e_attack,
    e_deathcrave,
    e_decompile_self,
    e_destroy_self,
    e_grave_to_hand,
    e_quick,
    e_reflect,
    e_revenge,
    e_void_self,
    e_volatile
}