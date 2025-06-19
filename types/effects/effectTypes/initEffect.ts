import type Action_prototype from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../../data/dry/dry_system";
import { posChange } from "../../actions_old";
import triggerEffect from "./triggerEffect";

export default class initEffect extends triggerEffect {

    override canRespondAndActivate(c: Card, system: dry_system, a: Action_prototype): -1 | boolean {
        if(
            a instanceof posChange && 
            a.targetCardID === c.id &&
            a.toPos &&
            a.toPos.zoneID === system.playerField.id
        ) return super.canRespondAndActivate(c, system, a);

        return false;
    }
}