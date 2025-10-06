"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**@deprecated */
const systemRegistry_1 = require("../../data/systemRegistry");
const effect_1 = __importDefault(require("../../types/abstract/gameComponents/effect"));
class eff_gen {
    constructor(input_f1, input_f2, activate_f) {
        this.input_f2 = input_f2;
        this.activate_f = activate_f;
        this.revealKeys = [];
        this.implyVar = [];
        this.input_f1_info = {
            init: input_f1,
            chained: []
        };
    }
    retarget(key, input_f1_new, input_f2_new, newActivate) {
        switch (key) {
            case "zone": {
                this.input_f1_info.chained.push(input_f1_new);
                this.input_f2 = input_f2_new;
                this.activate_f = newActivate(this.activate_f);
                return this;
            }
            case "card": {
                const res = new eff_gen_cards(this.input_f1_info.init, input_f2_new, newActivate(this.activate_f));
                res.revealKeys = this.revealKeys;
                res.implyVar = this.implyVar;
                res.input_f1_info.chained = this.input_f1_info.chained;
                res.input_f1_info.chained.push(input_f1_new);
                return res;
            }
            case "pos": {
                const res = new eff_gen_pos(this.input_f1_info.init, input_f2_new, newActivate(this.activate_f));
                res.revealKeys = this.revealKeys;
                res.implyVar = this.implyVar;
                res.input_f1_info.chained = this.input_f1_info.chained;
                res.input_f1_info.chained.push(input_f1_new);
                return res;
            }
        }
        throw new Error();
    }
    ;
    then(f) {
        this.input_f1_info.chained.push(f);
        return this;
    }
    shares(f) {
        this.implyVar.push(f);
        return this;
    }
    reveal(k) {
        if (typeof k === "string")
            this.revealKeys.push(k);
        else
            this.revealKeys.push(...k);
        return this;
    }
    fin() {
        const f1 = this.input_f1_info;
        const f2 = this.input_f2;
        const f3 = this.activate_f;
        const implyVar = this.implyVar;
        const revealKeys = this.revealKeys;
        const type = this.checkInputType;
        return class ExtendedEff extends effect_1.default {
            createInputObj(c, s, a) {
                let res = f1.init.bind(this)(c, s, a);
                res = f1.chained.reduce((prev, cur) => cur.bind(this)(prev), res);
                return f2.bind(this)(res);
            }
            activate_final(c, s, a, input) {
                if (!input)
                    return [];
                const res = input.next();
                const ret = res.flatMap(i => i.type === type ? f3.bind(this)(i) : []);
                implyVar.forEach(f => {
                    const [key, val] = f.bind(this)(ret, c, s, a);
                    c.addShareMemory(this, key, val);
                });
                return ret;
            }
            getDisplayInput(c, system) {
                return revealKeys.map(k => { var _a; return (_a = this.attr.get(k)) !== null && _a !== void 0 ? _a : 0; });
            }
        };
    }
}
class eff_gen_zones extends eff_gen {
    constructor() {
        super(...arguments);
        this.checkInputType = systemRegistry_1.inputType.zone;
    }
    /**Down pushes the input to cards */
    cards(input_f2_new, newActivate) {
        return this.retarget("card", (p) => p.cards(), input_f2_new, newActivate);
    }
    pos(input_f2_new, newActivate) {
        return this.retarget("pos", (p) => p.pos(), input_f2_new, newActivate);
    }
}
class eff_gen_cards extends eff_gen {
    constructor() {
        super(...arguments);
        this.checkInputType = systemRegistry_1.inputType.card;
    }
    zones(input_f2_new, newActivate) {
        return this.retarget("zone", (p) => p.zones(), input_f2_new, newActivate);
    }
    pos(input_f2_new, newActivate) {
        return this.retarget("pos", (p) => p.pos(), input_f2_new, newActivate);
    }
}
class eff_gen_pos extends eff_gen {
    constructor() {
        super(...arguments);
        this.checkInputType = systemRegistry_1.inputType.position;
    }
}
const eff_manip = {
    combine(regen1, regen2) {
    }
};
