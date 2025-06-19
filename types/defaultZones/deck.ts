//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
import type card from "../abstract/gameComponents/card";

import type Position from "../abstract/generics/position";
import zone_stack from "../abstract/gameComponents/zone_stackBased";

import { Action, actionConstructorRegistry, actionFormRegistry } from "../../_queenSystem/handler/actionGenrator";
import { identificationInfo } from "../../data/systemRegistry";
import type hand from "./hand";
import { ExtractReturn } from "../../data/misc";
// import Action from "../abstract/gameComponents/action";


class deck extends zone_stack {
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

    getAction_draw(cause : identificationInfo, isTurnDraw : boolean) : Action<"a_draw">{
        let cid : string | undefined;
        cid = (this.cardArr[0]) ? this.cardArr[0].id : undefined

        if(isTurnDraw){
            if(this.currentCoolDown != 0) {
                return actionConstructorRegistry.a_draw(this.id)(cause, {
                    cooldown : this.currentCoolDown - 1, 
                    doTurnReset : true,
                    actuallyDraw : false,
                })
            }
            return actionConstructorRegistry.a_draw(this.id)(cause, {
                cooldown : this.maxCoolDown,
                doTurnReset : true,
                actuallyDraw : true
            })
        }
        //not turn draw, bypass mode, keep turn count the same
        return actionConstructorRegistry.a_draw(this.id)(cause, {
            cooldown : NaN,
            doTurnReset : false,
            actuallyDraw : true
        })
    }

    override interact(cause : identificationInfo): [Action<"a_draw">] {
        //interacting with the deck means we draw
        return [this.getAction_draw(cause, true)];
    }

    draw(a : Action<"a_draw">, hand : hand) : res {
        //assume the hand passed in is of the correct player
        let res : res = [undefined, []]

        let attr = a.flatAttr();

        if(attr.cooldown >= 0 && !isNaN(attr.cooldown) && isFinite(attr.cooldown)) this.currentCoolDown = attr.cooldown
        if(attr.actuallyDraw){
            //draw the top card
            let card = this.getCardByPosition(this.top);
            if(card){
                res[1] = [actionConstructorRegistry.a_pos_change(card.id)(hand.top.toDry())(actionFormRegistry.zone(this.id))]
                
            } else console.log("draw has no card")
        }
        if(attr.doTurnReset) res[1].push(
            actionConstructorRegistry.a_turn_reset(actionFormRegistry.zone(this.id))
        )
        return res
    }

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line)
    }
}

export default deck