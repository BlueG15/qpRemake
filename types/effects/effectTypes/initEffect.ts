import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type { dry_effect, dry_system } from "../../../data/systemRegistry";
import triggerEffect from "./triggerEffect";
import actionRegistry from "../../../data/actionRegistry";
import { zoneRegistry } from "../../../data/zoneRegistry";

export default class initEffect extends triggerEffect {

    override canRespondAndActivate(e : dry_effect, c: Card, system: dry_system, a: Action): -1 | boolean {
        if (a.typeID !== actionRegistry.a_pos_change && a.typeID !== actionRegistry.a_pos_change_force) return false;
        let targets = (a as Action<"a_pos_change">).targets

        let zone = system.getZoneWithID(targets[1].pos.zoneID);
        if(!zone) return false;

        if(
            targets[0].is(c) &&
            zone.types.includes(zoneRegistry.z_field)
        ) return super.canRespondAndActivate(e, c, system, a);

        return false;
    }
}