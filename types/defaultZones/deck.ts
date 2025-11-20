//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
import type Card from "../abstract/gameComponents/card";

import zone_stack from "../abstract/gameComponents/zone_stackBased";

import { type Action, actionConstructorRegistry, actionFormRegistry } from "../../_queenSystem/handler/actionGenrator";
import { identificationInfo } from "../../data/systemRegistry";
import type Hand from "./hand";
import type { dry_system, dry_zone, inputData, inputData_zone, inputType } from "../../data/systemRegistry";
import { zoneRegistry } from "../../data/zoneRegistry";
import { inputRequester, inputRequester_finalized } from "../../_queenSystem/handler/actionInputGenerator";
import Request from "../../_queenSystem/handler/actionInputRequesterGenerator";

class Deck extends zone_stack<undefined, [inputData_zone]> {
    //TODO : add editting ability
    isEditting : boolean = false;

    //quick data access

    //draw attributes

    get startCoolDown() {return this.attr.get("startCoolDown") ?? -1};
    // set startCoolDown(newVal : number) {this.attr.set("startCoolDown", newVal)};

    get maxCoolDown() {return this.attr.get("maxCoolDown") ?? -1};
    set maxCoolDown(newVal : number) {this.attr.set("maxCoolDown", newVal)};

    //deck editting attributes, unused rn

    get maxLoad() {return this.attr.get("maxLoad") ?? -1};
    set maxLoad(newVal : number) {this.attr.set("maxLoad", newVal)};

    get minLoad() {return this.attr.get("minLoad") ?? -1};
    set minLoad(newVal : number) {this.attr.set("minLoad", newVal)};

    currentCoolDown : number = this.startCoolDown

    getAction_draw(s : dry_system, hand : dry_zone, cause : identificationInfo, isTurnDraw : boolean = false) : Action<"a_draw">{
        let cid : string | undefined;
        cid = (this.cardArr[0]) ? this.cardArr[0].id : undefined

        if(isTurnDraw){
            if(this.currentCoolDown != 0) {
                return actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
                    cooldown : this.currentCoolDown - 1, 
                    doTurnReset : true,
                    actuallyDraw : false,
                })
            }
            return actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
                cooldown : this.maxCoolDown,
                doTurnReset : true,
                actuallyDraw : true
            })
        }
        //not turn draw, bypass mode, keep turn count the same
        return actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
            cooldown : NaN,
            doTurnReset : false,
            actuallyDraw : true
        })
    }

    override getInput_interact(s: dry_system, cause: identificationInfo) {
        return Request.hand(s, this).once()
    }

    override interact(s: dry_system, cause: identificationInfo, input: inputRequester_finalized<[inputData_zone]>): Action[] {
        const hand = input.next()[0].data.zone;
        return [this.getAction_draw(s, hand, cause, true)];
    }

    draw(s : dry_system, a : Action<"a_draw">, hand : Hand) : res {
        //assume the hand passed in is of the correct player
        let res : res = [undefined, []]

        let attr = a.flatAttr();
        let d = this

        if(attr.cooldown >= 0 && !isNaN(attr.cooldown) && isFinite(attr.cooldown)) this.currentCoolDown = attr.cooldown
        if(attr.actuallyDraw){
            //draw the top card
            let card = this.getCardByPosition(this.top);
            if(card){
                res[1] = [actionConstructorRegistry.a_pos_change(s, card)(hand.top)(actionFormRegistry.zone(s, d))]
                
            } else console.log("draw has no card")
        }
        if(attr.doTurnReset) res[1].push(
            actionConstructorRegistry.a_turn_reset(actionFormRegistry.zone(s, d))
        )
        return res
    }

    override handleOccupied(c: Card, index: number, func: string, line?: number): res {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line)
    }
}

export default Deck