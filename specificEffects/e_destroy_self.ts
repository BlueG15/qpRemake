import type dry_card from "../data/dry/dry_card";
import type dry_system from "../data/dry/dry_system";
import type Action_prototype from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";
import Effect from "../types/abstract/gameComponents/effect";
import { destroyCard } from "../types/actions_old";

export default class destroyCardEffect extends Effect {
    protected target? : dry_card
    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action_prototype): boolean {
        return true
    }
    override activate_proto(c: Card, system: dry_system, a: Action_prototype): Action_prototype[] {
        return [
            new destroyCard(
                this.target ? this.target : c.toDry(), system, true
            )
        ]
    }
}