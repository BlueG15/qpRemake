import type dry_card from "../data/dry/dry_card";
import type dry_system from "../data/dry/dry_system";
import type { Action } from "../_queenSystem/handler/actionGenrator";
import type Card from "../types/abstract/gameComponents/card";
import Effect from "../types/abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry } from "../_queenSystem/handler/actionGenrator";

export default class destroyCardEffect extends Effect {
    protected target? : dry_card
    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action): boolean {
        return true
    }
    override activate_proto(c: Card, system: dry_system, a: Action): Action[] {
        let dry = c.toDry()
        this.target = this.target ? this.target : dry
        return [
            actionConstructorRegistry.a_destroy(system, this.target)(actionFormRegistry.card(system, dry))
        ]
    }
}