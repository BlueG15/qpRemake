import type Action from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../data/dry/dry_system";
import { posChange } from "../../actions";
import triggerEffect from "./triggerEffect";

import effectTypeRegistry from "../../data/effectTypeRegistry";

export default class initEffect extends triggerEffect {

    override type: string = effectTypeRegistry[effectTypeRegistry.e_trigger]

    override canRespondAndActivate_type(c: Card, system: dry_system, a: Action): -1 | boolean {
        if(
            a instanceof posChange && 
            a.targetCardID === c.id &&
            a.toPos &&
            a.toPos.zoneID === system.playerField.id
        ) return super.canRespondAndActivate_type(c, system, a);

        return false;
    }
}