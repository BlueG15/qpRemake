//import zone from "../baseClass/zone";
import type res from "../abstract/generics/universalResponse";
import type card from "../abstract/gameComponents/card";

import type Position from "../abstract/generics/position";
import zone_stack from "../abstract/gameComponents/zone_stackBased";

import drawAction from "../actions/draw";
import turnReset from "../actions/turnReset";


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

    getAction_draw(isChain : boolean, isTurnDraw : boolean, toPos? : Position){
        let cid : string | undefined;
        cid = (this.cardArr[0]) ? this.cardArr[0].id : undefined

        if(isTurnDraw){
            if(this.currentCoolDown != 0) {
                return new drawAction(
                    undefined, 
                    isChain,
                    this.firstPos, 
                    this.currentCoolDown - 1, 
                    true,
                    toPos
                )
            }
            return new drawAction(
                cid, 
                isChain,
                this.firstPos, 
                this.maxCoolDown, 
                true,
                toPos
            )
        }
        //not turn draw, bypass mode, keep turn count the same
        return new drawAction(
            cid, 
            isChain,
            this.firstPos, 
            NaN,
            false,
            toPos
        )
    }

    draw(a : drawAction) : res {
        let res : res = [undefined, []]
        if(a.doChangeCooldown) this.currentCoolDown = a.cooldown
        if(a.hasCard){
            let idx = this.findIndex(a.targetCardID)
            if(idx < 0 || !this.cardArr[idx]) res = this.handleCardNotExist("draw", 63)
            else {
                let c = this.cardArr[idx] as card
                res = this.remove(c)
            }
        } else console.log("draw has no card")
        if(res[0]) return res
        if(a.doTurnReset) res[1].push(new turnReset(true))
        return res
    }

    override handleOccupied(c: card, index: number, func: string, line?: number): res {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line)
    }
}

export default deck