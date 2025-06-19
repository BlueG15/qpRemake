import zone from "../abstract/gameComponents/zone";
import type { player_stat } from "../../data/systemRegistry";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type dry_system from "../../data/dry/dry_system";

import { actionConstructorRegistry, actionFormRegistry } from "../../_queenSystem/handler/actionGenrator";

class system extends zone {
    // constructor(){
    //     super("system");
    // }

    //only thing this class do is to do respond to actions with internal actions
    //like health 0 -> send to grave

    //i moved the things that activated when an action resolved outside in the resolve switch case
    //so this is now used for system reactions that needs to get added to the tree b4 the action resolves

    threat : number = this.startThreat 

    get startThreat() : number {return this.attr.get("startThreat") ?? 0}
    get maxThreat() : number {return this.attr.get("maxThreat") ?? 20}
    get clearThreatWhenBurn() : boolean {return this.attr.get("clearThreatWhenBurn") ?? false}

    doThreatBurn(s : dry_system, pdata : player_stat) : Action[]{
        if(pdata.heart === 1) {
            pdata.heart = 0;
            return [
                actionConstructorRegistry.a_force_end_game(actionFormRegistry.zone(s, this.toDry()))
            ]
        }
        pdata.heart = Math.floor(pdata.heart / 2)
        return this.clearThreatWhenBurn ? [
            actionConstructorRegistry.a_set_threat_level(actionFormRegistry.zone(s, this.toDry()), {
                newThreatLevel : 0
            })
        ] :[]
    }
}

export default system