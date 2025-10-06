"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputApplicator = exports.inputRequester_multiple = exports.inputRequester = exports.inputFormRegistry = void 0;
const systemRegistry_1 = require("../../data/systemRegistry");
const actionGenrator_1 = require("./actionGenrator");
/**
 * Merge with signature example:
 * A has input [X, Y, Z, K]
 * B has input [X, Y, K, L, Z]
 *
 * Merging these will yield C having input [...A, ...exclude B from A, stop at first not match in B]
 * the previous example will results to [X, Y, Z, K, L, Z]
 * [X, Y, Z, K] from A
 * and [L, Z] from B after filling A's input into B as best as we can
 * well..not rlly but I do not want to recur try to apply every input every time we apply new inputs
 *
 * oh also apply returns, please make sure to overwrite the val after apply
 */
exports.inputFormRegistry = {
    zone(s, z) {
        const o = actionGenrator_1.actionFormRegistry.zone(s, z);
        return {
            type: systemRegistry_1.inputType.zone,
            data: o,
            is: o.is,
            of: o.of,
        };
    },
    card(s, c) {
        const o = actionGenrator_1.actionFormRegistry.card(s, c);
        return {
            type: systemRegistry_1.inputType.card,
            data: o,
            is: o.is
        };
    },
    effect(s, c, e) {
        const o = actionGenrator_1.actionFormRegistry.effect(s, c, e);
        return {
            type: systemRegistry_1.inputType.effect,
            data: o,
            is: o.is
        };
    },
    subtype(s, c, e, st) {
        const o = actionGenrator_1.actionFormRegistry.subtype(s, c, e, st);
        return {
            type: systemRegistry_1.inputType.effectSubtype,
            data: o,
            is: o.is
        };
    },
    player(s, pid) {
        const o = actionGenrator_1.actionFormRegistry.player(s, pid);
        return {
            type: systemRegistry_1.inputType.player,
            data: o,
            is: o.is,
        };
    },
    pos(s, pos) {
        const o = actionGenrator_1.actionFormRegistry.position(s, pos);
        return {
            type: systemRegistry_1.inputType.position,
            data: o,
            is: o.is
        };
    },
    num(num) { return { type: systemRegistry_1.inputType.number, data: num }; },
    str(str) { return { type: systemRegistry_1.inputType.string, data: str }; },
    bool(bool) { return { type: systemRegistry_1.inputType.boolean, data: bool }; },
};
class inputRequester {
    emplaceReserve() {
        this.__curr = undefined;
        this.__inner_res = this.reserved_inner_res;
    }
    updateValidFlag(set) {
        if (set === undefined)
            this.__valid_flag = true;
        else
            this.__valid_flag = (set.length !== 0);
    }
    get len() {
        return this.__len;
    }
    constructor(type, validSet) {
        this.__inner_res = [];
        this.__func_arr = [];
        this.__queue = [];
        this.__do_pre_fill_when_merge = false;
        this.__len = 1;
        this.__cursor_f_arr = 0;
        this.reserved_inner_res = [];
        this.__curr = [type, validSet];
        if (validSet === undefined)
            this.__valid_flag = true;
        else
            this.__valid_flag = (validSet.length !== 0);
        this.cache = new inputRequestCache(validSet);
    }
    hasInput() {
        return this.__valid_flag && (this.__curr === undefined || this.__curr[1] === undefined || this.__curr[1].length !== 0);
    }
    verify(a) {
        return a.length === 2 && typeof a[0] === "number"; //rough check
    }
    isCurrentInputAllows(s, k) {
        if (k === undefined)
            return false;
        const t = this.next();
        const c1 = this.verify(t);
        const c2 = t[0] === k.type;
        const c3 = (t[1] === undefined ||
            t[1].some(i => i !== undefined && s.generateSignature(i) === s.generateSignature(k)));
        //console.log("Checking applicavbility of input : ", k, " -- ",  [c1, c2, c3, (t[1] as inputData[]).map(i => s.generateSignature(i))])
        return c1 && c2 && c3;
    }
    copyToNext(next) {
        next.__queue.unshift(...this.__queue);
        next.__inner_res = this.__inner_res;
    }
    // protected apply_dry(s : dry_system){
    //     let f = this.__func_arr[this.__cursor_f_arr]
    //     this.__cursor_f_arr++
    //     if(f !== undefined){
    //         const t : inputData[] | validSetFormat = f(s, Array.from(this.__inner_res.values()))
    //         if(this.verify(t)) this.__curr = t;
    //         else this.__curr = [t[0].type, t]
    //     } else if(this.__queue.length !== 0){
    //         const next = this.__queue.shift()!
    //         this.copyToNext(next)
    //         return next as any
    //     } else {
    //         this.__curr = undefined
    //     }
    //     return this as any
    // }
    apply(s, input) {
        let f = this.__func_arr[this.__cursor_f_arr];
        this.__cursor_f_arr++;
        const sig = s.generateSignature(input);
        this.__inner_res.push(input);
        this.reserved_inner_res.push(input);
        if (f !== undefined) {
            const t = f(s, Array.from(this.__inner_res.values()));
            if (this.verify(t))
                this.__curr = t;
            else
                this.__curr = [t[0].type, t];
        }
        else if (this.__queue.length !== 0) {
            const next = this.__queue.shift();
            this.copyToNext(next);
            if (next.__do_pre_fill_when_merge)
                next.applyMultiple(s, [...Array.from(next.__inner_res.values()), input]);
            else
                next.apply(s, input);
            return next;
        }
        else {
            this.__curr = undefined;
        }
        return this;
    }
    applyMultiple(s, inputs, preProcess) {
        let mark = new Array(inputs.length).fill(false);
        //console.log("logging from applyMultiple, trying to apply ", inputs, " to this Object")
        let i = 0;
        while (i < inputs.length && !this.isFinalized()) {
            const x = preProcess ? preProcess(s, i, inputs[i]) : undefined;
            if (x) {
                x.forEach(k => {
                    if (this.isCurrentInputAllows(s, k)) {
                        this.apply(s, k);
                    }
                });
            }
            else if (this.isCurrentInputAllows(s, inputs[i])) {
                mark[i] = true;
                this.apply(s, inputs[i]);
            }
            i++;
        }
        console.log("Applied mask: ", mark);
        return this;
    }
    next() {
        return (this.__curr === undefined) ? this.__inner_res : this.__curr;
    }
    isFinalized() {
        return this.__curr === undefined;
    }
    //extend DO check for chained validity
    extend(s, f) {
        this.__func_arr.push(f);
        this.__len++;
        this.cache.extend(s, f);
        if (this.cache.tree.length === 0)
            this.__valid_flag = false;
        return this;
    }
    extendMultiple(s, len, f) {
        if (len <= 0) {
            this.__valid_flag = false;
            return this;
        }
        this.__len += len;
        this.cache.extend(s, f, (s, k) => k.length >= len);
        this.__func_arr.push(f);
        let k = len - 1;
        while (k !== 0) {
            this.__func_arr.push((s, prev) => {
                return f(s, prev).filter(i => s.generateSignature(i) !== s.generateSignature(prev.at(-1)));
            });
            k--;
        }
        if (this.cache.tree.length === 0)
            this.__valid_flag = false;
        return this;
    }
    //merge DO NOT check for chained validity
    merge(requester) {
        this.__queue.push(requester);
        if (requester.__valid_flag === false)
            this.__valid_flag = false;
        this.__len += requester.__len;
        this.cache.merge(requester.cache);
        return this;
    }
    merge_with_signature(requester) {
        requester.__do_pre_fill_when_merge = true;
        this.merge(requester);
        return this;
    }
    fill(s, requester) {
        this.applyMultiple(s, Array.from(requester.__inner_res.values()));
        return this;
    }
    //adds a new condition on top of the old condition of the last input required
    /**@deprecated */
    extendOverride(s, cond) {
        if (this.__func_arr.length === 0) {
            if (this.__queue.length === 0) {
                if (!this.__curr)
                    return this;
                if (!this.__curr[1])
                    return this;
                this.__curr[1] = this.__curr[1].filter(i => cond(s, i));
                return this;
            }
            ;
            return this.__queue.at(-1).extendOverride(s, cond);
        }
        ;
        const oldCond = this.__func_arr.pop();
        const newCond = function (f, f2, thisParam) {
            return function (s, prev) {
                const res = f(s, prev);
                const res2 = thisParam.verify(res) ? res[1] : res;
                if (!res2)
                    return res;
                return res2.filter(k => f2(s, k));
            };
        };
        const k = newCond(oldCond, cond, this);
        this.__func_arr.push(k);
        this.cache.extend(s, k);
        if (this.cache.tree.length === 0)
            this.__valid_flag = false;
        return this;
    }
}
exports.inputRequester = inputRequester;
class inputRequester_multiple extends inputRequester {
    constructor(len, type, validSet) {
        if (len < 0 || !Number.isFinite(len)) {
            console.warn(`Something tried to create multiple inputs with len invalid (len = ${len})`);
            len = 0;
        }
        super(type, validSet);
        this.__valid_flag = validSet.length >= len;
        this.__len = len;
        this.__multiple_len = len;
    }
    updateValidFlag(set) {
        this.__valid_flag = set.length >= this.__multiple_len;
    }
    apply(s, input) {
        // console.log("From inside requester: ", this.__multiple_len, "Applying : ", input)
        this.__multiple_len--;
        if (this.__multiple_len === 0) {
            // console.log("Len reaches 0, switching to super's apply")
            return super.apply(s, input);
        }
        const i = input;
        const sig = s.generateSignature(i);
        this.__inner_res.push(i);
        this.reserved_inner_res.push(i);
        this.__curr[1] = this.__curr[1].filter(i => s.generateSignature(i) !== s.generateSignature(input));
        // if(this.__multiple_len === 0) this.apply_dry(s)
        return this;
    }
    applyMultiple(s, inputs, preProcess) {
        super.applyMultiple(s, inputs, preProcess);
        // console.log("From apply Multiple, afterwards: ", this.__multiple_len)
        return this;
    }
}
exports.inputRequester_multiple = inputRequester_multiple;
class leaf {
    constructor(data, path = []) {
        this.path = [];
        this.allIsValid = false;
        if (data === undefined) {
            this.allIsValid = true;
            data = [];
        }
        this.cache = data;
        this.path = path;
    }
}
class inputRequestCache {
    constructor(initial = []) {
        this.tree = initial.map(i => new leaf([i]));
    }
    verify(a) {
        return a.length === 2 && typeof a[0] === "number";
    }
    extend(s, f, extraCond = (s, k) => k.length !== 0) {
        const limit = this.tree.length;
        for (let i = 0; i < limit; i++) {
            const curr_leaf = this.tree.shift();
            if (curr_leaf instanceof leaf) {
                const datum = curr_leaf.cache;
                datum.forEach(k => {
                    const newPath = [...curr_leaf.path, k];
                    const res = f(s, newPath);
                    if (this.verify(res)) {
                        if (res[1] === undefined || res[1].length !== 0) {
                            this.tree.push(new leaf(res[1], newPath));
                        }
                    }
                    else {
                        if (extraCond(s, res)) {
                            this.tree.push(new leaf(res, newPath));
                        }
                    }
                });
            }
            else {
                this.tree.push(curr_leaf);
            }
        }
    }
    merge(requester) {
        this.tree.push(...requester.tree);
    }
    get(depth) {
        return this.tree.filter(i => i.path.length === depth);
    }
}
class inputApplicator {
    constructor(f, p, thisParam) {
        this.__p = p;
        this.__f = thisParam ? f.bind(thisParam) : f;
    }
    apply(input) {
        let k = [...this.__p, input];
        return this.__f(...k);
    }
}
exports.inputApplicator = inputApplicator;
