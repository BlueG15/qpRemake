"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zone_stackBased_1 = __importDefault(require("../abstract/gameComponents/zone_stackBased"));
const actionGenrator_1 = require("../../_queenSystem/handler/actionGenrator");
const actionInputRequesterGenerator_1 = __importDefault(require("../../_queenSystem/handler/actionInputRequesterGenerator"));
class deck extends zone_stackBased_1.default {
    constructor() {
        super(...arguments);
        //TODO : add editting ability
        this.isEditting = false;
        this.currentCoolDown = this.startCoolDown;
    }
    //quick data access
    //draw attributes
    get startCoolDown() { var _a; return (_a = this.attr.get("startCoolDown")) !== null && _a !== void 0 ? _a : -1; }
    ;
    // set startCoolDown(newVal : number) {this.attr.set("startCoolDown", newVal)};
    get maxCoolDown() { var _a; return (_a = this.attr.get("maxCoolDown")) !== null && _a !== void 0 ? _a : -1; }
    ;
    set maxCoolDown(newVal) { this.attr.set("maxCoolDown", newVal); }
    ;
    //deck editting attributes, unused rn
    get maxLoad() { var _a; return (_a = this.attr.get("maxLoad")) !== null && _a !== void 0 ? _a : -1; }
    ;
    set maxLoad(newVal) { this.attr.set("maxLoad", newVal); }
    ;
    get minLoad() { var _a; return (_a = this.attr.get("minLoad")) !== null && _a !== void 0 ? _a : -1; }
    ;
    set minLoad(newVal) { this.attr.set("minLoad", newVal); }
    ;
    getAction_draw(s, hand, cause, isTurnDraw = false) {
        let cid;
        cid = (this.cardArr[0]) ? this.cardArr[0].id : undefined;
        if (isTurnDraw) {
            if (this.currentCoolDown != 0) {
                return actionGenrator_1.actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
                    cooldown: this.currentCoolDown - 1,
                    doTurnReset: true,
                    actuallyDraw: false,
                });
            }
            return actionGenrator_1.actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
                cooldown: this.maxCoolDown,
                doTurnReset: true,
                actuallyDraw: true
            });
        }
        //not turn draw, bypass mode, keep turn count the same
        return actionGenrator_1.actionConstructorRegistry.a_draw(s, this)(hand)(cause, {
            cooldown: NaN,
            doTurnReset: false,
            actuallyDraw: true
        });
    }
    getInput_interact(s, cause) {
        return actionInputRequesterGenerator_1.default.hand(s, this).once();
    }
    interact(s, cause, input) {
        const hand = input.next()[0].data.zone;
        return [this.getAction_draw(s, hand, cause, true)];
    }
    draw(s, a, hand) {
        //assume the hand passed in is of the correct player
        let res = [undefined, []];
        let attr = a.flatAttr();
        let d = this;
        if (attr.cooldown >= 0 && !isNaN(attr.cooldown) && isFinite(attr.cooldown))
            this.currentCoolDown = attr.cooldown;
        if (attr.actuallyDraw) {
            //draw the top card
            let card = this.getCardByPosition(this.top);
            if (card) {
                res[1] = [actionGenrator_1.actionConstructorRegistry.a_pos_change(s, card)(hand.top)(actionGenrator_1.actionFormRegistry.zone(s, d))];
            }
            else
                console.log("draw has no card");
        }
        if (attr.doTurnReset)
            res[1].push(actionGenrator_1.actionConstructorRegistry.a_turn_reset(actionGenrator_1.actionFormRegistry.zone(s, d)));
        return res;
    }
    handleOccupied(c, index, func, line) {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line);
    }
}
exports.default = deck;
