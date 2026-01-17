import { Action, actionConstructorRegistry } from "../../_queenSystem/handler/actionGenrator";
import Effect from "../../types/gameComponents/effect";
import { damageType } from "../../data/systemRegistry";
import { quickEffectData } from "../../data/effectRegistry";
import type { effectData } from "../../data/cardRegistry";
import type { dry_card, dry_system, dry_zone, inputData_zone } from "../../data/systemRegistry";
import { zoneRegistry } from "../../data/zoneRegistry";
import Request from "../../_queenSystem/handler/actionInputRequesterGenerator";

export class e_attack extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        let atkCount = this.count
        const res : Action[] = []
        while(atkCount--) res.push(
            actionConstructorRegistry.a_attack(s, c)(this.toCause(s, c), {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        )
        return res
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return [this.count]
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.manual.num("count", 1)()
        }
    }
}

export class e_destroy_self extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_destroy(s, c)(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.manual()
        }
    }
}

export class e_void_self extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_void(s, c)(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.manual()
        }
    }
}

export class e_decompile_self extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_decompile(s, c)(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.manual()
        }
    }
}

export class e_quick extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return []
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.instant()
        }
    }
}

export class e_deathcrave extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_destroy") && !!s.getResolveOrigin(a, "a_attack")?.targets[0].is(c)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_reset_card(s, c)(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.trigger()
        }
    }
}

export class e_revenge extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].is(c)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_attack(s, c)(this.toCause(s, c), {
                dmg : c.atk,
                dmgType : damageType.physical
            })
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.trigger()
        }
    }
}

export class e_reflect extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_deal_damage_card") && a.targets[0].is(c)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_attack(s, c)(this.toCause(s, c), {
                dmg : a.flatAttr().dmg,
                dmgType : damageType.physical
            })
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.trigger()
        }
    }
}

export class e_volatile extends Effect<[]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return a.is("a_play", s, c, zoneRegistry.z_field)
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action): void | undefined {
        return;
    }
    protected override activate(c: dry_card, s: dry_system, a: Action<"a_deal_damage_card">, input: undefined): Action[] {
        return [
            actionConstructorRegistry.a_replace_action(s, (
                actionConstructorRegistry.a_void(s, c)(this.toCause(s, c))
            ))(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.passive()
        }
    }
}

export class e_grave_to_hand extends Effect<[inputData_zone]> {
    protected override canRespondAndActivate(c: dry_card, s: dry_system, a: Action): boolean {
        return true;
    }
    protected override getInputObj(c: dry_card, s: dry_system, a: Action){
        return Request.hand(s, c).once();
    }
    protected override activate(c: dry_card, s: dry_system, a: Action<"a_deal_damage_card">, input: [dry_zone]): Action[] {
        const hand = input[0]
        return [
            actionConstructorRegistry.a_move(s, c)(hand.top)(this.toCause(s, c))
        ]
    }
    override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
        return []
    }

    static override getEffData(): { base: effectData; upgrade?: Partial<effectData>; } {
        return {
            base : quickEffectData.manual()
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