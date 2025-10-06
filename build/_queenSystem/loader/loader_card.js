"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = __importDefault(require("../../types/abstract/gameComponents/card"));
//Cards have 2 parts
//Data and Code
//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction sheme, similar to paging  
class cardLoader {
    constructor(effectHandler) {
        this.dataCache = new Map();
        this.customClassCache = new Map();
        this.countCache = new Map();
        this.effectHandler = effectHandler;
    }
    get classkeys() {
        return Array.from(this.customClassCache.keys());
    }
    get datakeys() {
        return Array.from(this.dataCache.keys());
    }
    load(key, data, c) {
        this.dataCache.set(key, data);
        if (c) {
            if (typeof c === "function")
                this.customClassCache.set(key, c);
            else {
                for (const key in Object.keys(c)) {
                    this.customClassCache.set(key, c[key]);
                }
            }
        }
    }
    getCard(cid, s, variantid) {
        let data = this.dataCache.get(cid);
        if (!data)
            return undefined;
        let cclass = this.customClassCache.get(cid);
        if (!cclass)
            cclass = card_1.default;
        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c);
        let runID = variantid ? Utils.dataIDToUniqueID(cid, c, s, ...variantid) : Utils.dataIDToUniqueID(cid, c, s);
        if (!data.variantData) {
            console.log("invalid data somehow", JSON.stringify(data));
            return undefined;
        }
        let baseData = data.variantData.base;
        let d = Object.assign({ id: runID, dataID: cid, variants: variantid !== null && variantid !== void 0 ? variantid : ["base"] }, baseData);
        if (variantid) {
            variantid.forEach(i => {
                Utils.patchCardData(d, data.variantData[i]);
            });
        }
        let effArr = [];
        Object.keys(d.effects).forEach(i => {
            var _a, _b;
            const eObj = d.effects[i];
            function Load(t, eObj) {
                // console.log("Trying to load eff: ", JSON.stringify(eObj))
                let e = t.effectHandler.getEffect(i, s, eObj);
                if (e)
                    effArr.push(e);
                else
                    console.log(`Effect id not found: ${i}\n`);
            }
            if (eObj && typeof eObj.__loadOptions === "object") {
                if (eObj.__loadOptions.___internalMultipleLoadCount || eObj.__loadOptions.__additionalPatches) {
                    let t1 = (_a = eObj.__loadOptions.___internalMultipleLoadCount) !== null && _a !== void 0 ? _a : 0;
                    let t2 = ((_b = eObj.__loadOptions.__additionalPatches) !== null && _b !== void 0 ? _b : []).length;
                    let t = Math.max(t1, t2);
                    if (!Number.isFinite(t))
                        console.log("Trying to load an infinite ammounnt of effects: ", cid, eObj);
                    else if (t > 0) {
                        for (let z = 0; z < t; z++) {
                            Load(this, eObj.__loadOptions.__additionalPatches ? eObj.__loadOptions.__additionalPatches[z] : eObj);
                        }
                    }
                }
            }
            else {
                Load(this, eObj);
            }
        });
        if (effArr.length != Object.keys(d.effects).length && !s.ignore_undefined_effect) {
            return undefined;
        }
        // console.log(`
        //     debug log: loading card ${cid}, loaded ${effArr.length} effects\n`)
        return new cclass(s, d, effArr);
    }
    getDirect(cid, s, ...eff) {
        //default partiton scheme: all eff into one partiton
        let data = this.dataCache.get("c_test");
        if (!data)
            return undefined;
        let c = this.countCache.get(cid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(cid, c);
        let runID = Utils.dataIDToUniqueID(cid, c, s);
        let baseData = data.variantData.base;
        let d = Object.assign({ id: runID, dataID: cid, variants: ["base"] }, baseData);
        d.effects = Object.fromEntries(eff.map(e => [e.dataID, e.originalData]));
        d.partition[0].mapping = Utils.range(eff.length);
        d.partition[0].displayID = cid;
        return new card_1.default(s, d, eff);
    }
}
exports.default = cardLoader;
