import _node from "../baseClass/node";
import _tree from "../baseClass/tree";
import Action from "../baseClass/action";
import zoneHandler from "./zoneHandler";
import dry_system from "../dryData/dry_system";

import type error from "../specialActionTypes/error";
import type turnReset from "../specificAction/turnReset";
import type activateEffect from "../specificAction/activateEffect";
import type posChange from "../specificAction/posChange";
import { drawAction, turnEnd, turnStart } from "./actionHandler";
import type shuffle from "../specificAction/shuffle";
import type card from "../baseClass/card";
// import position from "../baseClass/position";

class queenSystem {
    threatLevel : number
    zoneHandler : zoneHandler

    private processStack : number[] = [] 
    //stores id of node before step "recur until meet this again"
    private suspendID : number = -1; 
    //^ node id of the node before suspended, 
    //when unsuspended, continue processing this node from phaseIdx 3

    phaseIdx : number = 0
    actionTree : _tree<Action>

    constructor(zoneHandler : zoneHandler){
        this.threatLevel = 0
        this.zoneHandler = zoneHandler
        this.actionTree = new _tree<Action>(new turnEnd())
    }

    restartTurn(){
        this.actionTree.clear()
        this.actionTree.attach(new turnStart())
    }

    resolveError(a : error){
        console.log(a.toString())
    }

    private actionSwitch_resolve(a : Action) : undefined | void | Action[]{
        //ok this is just a bunch of ifs
        //lord forgive me for this
        if(typeof a.typeID !== "number") return
        switch(a.typeID){
            case 0 : break
            case -1 : return this.resolveError(a as error)
            
            
            case 1 : break; //turn start
            case 2 : break; //turn end
            case 3 : return this.zoneHandler.handleTurnReset(a as turnReset)
            case 4 : {
                //to be implemented                
                break;
            }
            

            case 101 : return this.zoneHandler.handleEffectActivation(a as activateEffect, this.toDry())
            

            case 102 : return this.zoneHandler.handlePosChange(a as posChange)

            case 103 : return this.zoneHandler.handlePosChange(a as drawAction)

            case 104 : return this.zoneHandler.handleShuffle(a as shuffle)

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

            case 108 : {
                //to be implemented                
                break;
            }

            case 109 : {
                //to be implemented                
                break;
            }
        }
    }

    processTurn(turnActionFromPlayer?: Action){
        if(turnActionFromPlayer) this.actionTree.attach(turnActionFromPlayer)
        this.phaseIdx = 1;
        this.process(this.actionTree.getNext())
    }

    process(n : _node<Action> | undefined) : void {
        //[phase progression graph:

        //v--------------\--------------\
        //1 -> 2 -> 3 -> 4    5 -> 6 -> 7
        //\--if visited once--^

        //technically 6 needs to go to 1 and loop through all again but screw it, 
        //we already resolved the dang thing, just mark it as complete and move on
        
        if(!n) {
            console.log("finish processing turn, clearing tree");
            this.restartTurn();
            return;
        }
        switch(this.phaseIdx){
            case 1: {
                //declare step
                if(n.id === this.processStack.at(-1)) {
                    this.phaseIdx = 5;
                    return this.process(n);
                }
                console.log("declare action: " + n.data.type)
                this.phaseIdx = 2;
                return this.process(n);
            }
            case 2: {
                //handle input
                this.phaseIdx = 3;
                if(n.data.requireInput) this.suspend(n.id);
                return this.process(n);
            }
            case 3: {
                //chain step
                let actionArr = this.zoneHandler.respond(n.data, this.toDry(), true)
                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                    else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                })
                this.phaseIdx = 4;
                return this.process(n)
            }
            case 4: {
                //recur step
                //recur until the last element of processStack is reached
                //then that element is removed
                this.processStack.push(n.id)
                this.phaseIdx = 1;
                return this.process(this.actionTree.getNext());
            }
            case 5: {
                //resolve
                this.processStack.pop();
                let x = this.actionSwitch_resolve(n.data)
                if(x) {
                    x.forEach(i => {
                        if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                        else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                    })
                }
                console.log("finish resolving acion: " + n.data.type)
                this.phaseIdx = 6;
                return this.process(n);
            }
            case 6: {
                //trigger
                let actionArr = this.zoneHandler.respond(n.data, this.toDry(), false)
                actionArr.forEach(i => {
                    if(i.isChain) this.actionTree.attachArbitrary(n.id, i);
                    else this.actionTree.attachArbitrary(this.actionTree.root.id, i);
                })
                this.phaseIdx = 7;
                return this.process(n);  
            }
            case 7: {
                //complete 
                n.markComplete();
                this.phaseIdx = 1;
                return this.process(this.actionTree.getNext());
            }
        }
        console.log("accessed invalid phaseIdx: " + this.phaseIdx)
    }

    suspend(nid : number){
        this.suspendID = nid;
    }

    continue(){
        let n = this.actionTree.getNode(this.suspendID)
        this.suspendID = -1;
        this.process(n)
    }

    toDry(){
        return new dry_system(this)
    }

    initializeTestGame(cardArr : card[]){
        //draw 1 card to hand
        this.zoneHandler.deck.forceCardArrContent(cardArr)
        this.restartTurn()
        let a = this.zoneHandler.deck.getAction_draw(true, false, this.zoneHandler.hand.lastPos)
        this.actionTree.attachArbitrary(this.actionTree.root.id, a)
    }
}

export default queenSystem