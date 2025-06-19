import type dry_system from "../data/dry/dry_system";
import type Action_prototype from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";

import Effect from "../types/abstract/gameComponents/effect";
import enableCard from "../types/actions_old/enableCard";

export default class reactivateEffect extends Effect {
    protected targetCID? : string // undefined means self
    override activate_proto(c: Card, system: dry_system, a: Action_prototype): Action_prototype[] {
        return [
            new enableCard(
                (this.targetCID) ? this.targetCID : c.id, c.id, true
            )
        ]
    }
}