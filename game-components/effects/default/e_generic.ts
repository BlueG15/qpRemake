import { ActionGenerator, type Action } from "../../../core/registry/action";
import { DamageType } from "../../../core";
import { Effect } from "../effect";
import type { CardDry } from "../../../core";
import type { SystemDry } from "../../../core";
import type { ZoneDry } from "../../../core";
import { EffectData } from "../../../core";
import { ZoneRegistry } from "../../../core/registry/zone";
import { TargetZone } from "../../../core";
import { Request } from "../../../system-components/inputs";

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
            ActionGenerator.a_attack(c)(this.identity, {
                dmg : c.atk,
                dmgType : DamageType.physical
            })
        )
        return res
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return [this.count]
    }

    static override getEffData(){
        return EffectData.manual.num("count", 1)
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
            ActionGenerator.a_destroy(c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData(){
        return EffectData.manual
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
            ActionGenerator.a_void(c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.manual
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
            ActionGenerator.a_decompile(c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.manual
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

    static override getEffData() {
        return EffectData.instant
    }
}

export class e_deathcrave extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_destroy") && !!s.getResolveOrigin(a, "a_attack")?.targets[0].data.is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.a_reset_card(c)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.trigger
    }
}

export class e_revenge extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].data.is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action, input: undefined): Action[] {
        return [
            ActionGenerator.a_attack(c)(this.identity, {
                dmg : c.atk,
                dmgType : DamageType.physical
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.trigger
    }
}

export class e_reflect extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].data.is(c)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            ActionGenerator.a_attack(c)(this.identity, {
                dmg : a.flatAttr().dmg,
                dmgType : DamageType.physical
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.trigger
    }
}

export class e_volatile extends Effect<[]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return a.is("a_play", s, c, ZoneRegistry.field)
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action): void | undefined {
        return;
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            ActionGenerator.a_negate_action(this.identity, {
                replaceWith : [ActionGenerator.a_void(c)(this.identity)]
            })
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.passive
    }
}

export class e_grave_to_hand extends Effect<[TargetZone]> {
    protected override canRespondAndActivate(c: CardDry, s: SystemDry, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: CardDry, s: SystemDry, a: Action){
        return Request.hand(s, c).once();
    }
    protected override activate(c: CardDry, s: SystemDry, a: Action<"a_deal_damage_card">, input: [ZoneDry]): Action[] {
        const hand = input[0]
        return [
            ActionGenerator.a_move(c)(hand.top)(this.identity)
        ]
    }
    override getDisplayInput(c: CardDry, system: SystemDry): (string | number)[] {
        return []
    }

    static override getEffData() {
        return EffectData.manual
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