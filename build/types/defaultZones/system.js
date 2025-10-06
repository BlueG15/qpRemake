"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zone_1 = require("../abstract/gameComponents/zone");
const actionGenrator_1 = require("../../_queenSystem/handler/actionGenrator");
class system extends zone_1.Zone_base {
    constructor() {
        // constructor(){
        //     super("system");
        // }
        super(...arguments);
        //only thing this class do is to do respond to actions with internal actions
        //like health 0 -> send to grave
        //i moved the things that activated when an action resolved outside in the resolve switch case
        //so this is now used for system reactions that needs to get added to the tree b4 the action resolves
        this.threat = this.startThreat;
    }
    get startThreat() { var _a; return (_a = this.attr.get("startThreat")) !== null && _a !== void 0 ? _a : 0; }
    get maxThreat() { var _a; return (_a = this.attr.get("maxThreat")) !== null && _a !== void 0 ? _a : 20; }
    get clearThreatWhenBurn() { var _a; return (_a = this.attr.get("clearThreatWhenBurn")) !== null && _a !== void 0 ? _a : false; }
    doThreatBurn(s, pdata) {
        if (pdata.heart === 1) {
            pdata.heart = 0;
            return [
                actionGenrator_1.actionConstructorRegistry.a_force_end_game(actionGenrator_1.actionFormRegistry.zone(s, this))
            ];
        }
        pdata.heart = Math.floor(pdata.heart / 2);
        return this.clearThreatWhenBurn ? [
            actionGenrator_1.actionConstructorRegistry.a_set_threat_level(actionGenrator_1.actionFormRegistry.zone(s, this), {
                newThreatLevel: 0
            })
        ] : [];
    }
}
exports.default = system;
