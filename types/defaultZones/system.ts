import zone from "../abstract/gameComponents/zone";
import type { player_stat } from "../data/systemRegistry";
import type Action from "../abstract/gameComponents/action";
import { forcefullyEndTheGame } from "../actions";

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

    doThreatBurn(pdata : player_stat) : Action[]{
        if(pdata.heart === 1) {
            pdata.heart = 0;
            return [new forcefullyEndTheGame(true, true)]
        }
        pdata.heart = Math.floor(pdata.heart / 2)
        return []
    }
}

export default system