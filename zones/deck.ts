//import zone from "../baseClass/zone";
import type res from "../baseClass/universalResponse";
import type card from "../baseClass/card";

import position from "../baseClass/position";
import drawAction from "../specificAction/draw";
import turnReset from "../specificAction/turnReset";
import zone_stack from "../baseClass/zone_stackBased";


class deck extends zone_stack {
    //add editting ability
    isEditting : boolean = false;
    maxCardCount = 20;
    minCardCount = 1;
    maxCoolDown = 10;
    currentCoolDown = 10;

    constructor(){
        super("deck");
    }

    getAction_draw(isChain : boolean, isTurnDraw : boolean, toPos? : position){
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