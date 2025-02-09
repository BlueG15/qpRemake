import turnStart from "../specificAction/turnStart";
import _node from "../baseClass/node";
import _tree from "../baseClass/tree";
import action from "../baseClass/action";
import turnEnd from "../specificAction/turnEnd";
import zoneHandler from "./zoneHandler";
import dry_system from "../dryData/dry_system";

import type error from "../actionTypes/error";
import type turnReset from "../specificAction/turnReset";
import type activateEffect from "../specificAction/activateEffect";
import type posChange from "../specificAction/posChange";
import drawAction from "../specificAction/draw";
import type shuffle from "../specificAction/shuffle";
import type card from "../baseClass/card";
import position from "../baseClass/position";

class queenSystem {
    threatLevel : number
    zoneHandler : zoneHandler
    
    phaseIdx : number = 0
    actionTree : _tree<action>

    constructor(zoneHandler : zoneHandler){
        this.threatLevel = 0
        this.zoneHandler = zoneHandler
        this.actionTree = new _tree<action>(new turnEnd())
        this.actionTree.attach(new turnStart())
    }

    initializesTurn(){
        this.actionTree = new _tree<action>(new turnEnd())
        this.actionTree.attach(new turnStart())
    }

    resolveError(a : error){
        console.log(a.toString())
    }

    private actionSwitch_resolve(a : action) : undefined | void | action[]{
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if(typeof a.typeID !== "number") return
        switch(a.typeID){
            case 0 : break
            case -1 : {
                return this.resolveError(a as error)
                break;
            }
            
            case 1 : break;
            case 2 : break;
            case 3 : {
                return this.zoneHandler.handleTurnReset(a as turnReset)
                break;
            }

            case 101 : {
                return this.zoneHandler.handleEffectActivation(a as activateEffect, this.toDry())
                break;
            }

            case 102 : {
                return this.zoneHandler.handlePosChange(a as posChange)
                break;
            }

            case 103 : {
                return this.zoneHandler.handlePosChange(a as drawAction)
                break;
            }

            case 104 : {
                return this.zoneHandler.handleShuffle(a as shuffle)
                break;
            }

            case 105 : {
                //to be implemented                    
                break;
            }

            case 106 : {
                //to be implemented                
                break;
            }

            case 107 : {
                //to be implemented                
                break;
            }
        }
    }

    processTurn(turnActionFromPlayer?: action){
        if(turnActionFromPlayer) this.actionTree.attachArbitrary(this.actionTree.root.id, turnActionFromPlayer)
        this.actionTree.recurAll((n : _node<action>) => {
            this.process(n)
        })   
    }

    process(n : _node<action>){
        //step 1 : declare
        //not do anything i guess
        console.log("declare action: " + n.data.type)
        
        //step 2 : chain
        let actionArr = this.zoneHandler.respond(n.data, this.toDry(), true)
        actionArr.forEach(i => {
            if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
            else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
        })

        //step 3 : recur until hit this node again
        this.actionTree.recurAll((m : _node<action>) => {
            this.process(m)
        }, n.id)
        
        //step 4 : resolve
        let x = this.actionSwitch_resolve(n.data)
        if(x) {
            x.forEach(i => {
                if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
            })
        }
        console.log("finish resolving acion: " + n.data.type)

        //step 5 : trigger
        actionArr = this.zoneHandler.respond(n.data, this.toDry(), false)
        actionArr.forEach(i => {
            if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
            else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
        })

        //step 6 : mark this as complete
        n.markComplete()
    }

    toDry(){
        return new dry_system(this)
    }

    initializeTestGame(cardArr : card[]){
        //draw 1 card to hand
        this.zoneHandler.deck.forceCardArrContent(cardArr)
        this.initializesTurn()
        let a = this.zoneHandler.deck.getAction_draw(true, false, this.zoneHandler.hand.lastPos)
        this.actionTree.attachArbitrary(this.actionTree.root.id, a)
    }
}

export default queenSystem