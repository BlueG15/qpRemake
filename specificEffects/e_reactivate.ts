import type dry_system from "../data/dry/dry_system";
import { Action, actionConstructorRegistry, actionFormRegistry } from "../_queenSystem/handler/actionGenrator";
import type Card from "../types/abstract/gameComponents/card";
import type dry_card from "../data/dry/dry_card";
import Effect from "../types/abstract/gameComponents/effect";

export default class reactivateEffect extends Effect {
    protected target? : dry_card // undefined means self
    override activate(c: Card, system: dry_system, a: Action): Action[] {
        let dry = c.toDry()
        this.target = this.target ? this.target : dry
        return [
            actionConstructorRegistry.a_enable_card(system, this.target)(actionFormRegistry.card(system, dry))
        ]
    }
}