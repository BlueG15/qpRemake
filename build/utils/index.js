"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../types/abstract/gameComponents/settings");
// import { partitionData } from "../types/data/cardRegistry";
const settings_2 = require("../types/abstract/gameComponents/settings");
const position_1 = __importDefault(require("../types/abstract/generics/position"));
class utils {
    static toProper(str) {
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
            return match.toUpperCase();
        });
    }
    //find the element occurs the most in an array
    static most(arr) {
        var _a;
        const countMap = new Map();
        let maxCount = 0;
        let mostElement = undefined;
        for (const item of arr) {
            const count = ((_a = countMap.get(item)) !== null && _a !== void 0 ? _a : 0) + 1;
            countMap.set(item, count);
            if (count > maxCount) {
                maxCount = count;
                mostElement = item;
            }
        }
        // If arr is empty, mostElement will be undefined
        return mostElement;
    }
    static rng(max, min, round) {
        return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min;
    }
    static round(num, precision) {
        return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision);
    }
    static clamp(num, max, min = num) {
        return Math.min(Math.max(num, min), max);
    }
    static toSafeNumber(n, doTruncation = false) {
        if (!n)
            return 0;
        if (n === true) {
            return 1;
        }
        if (typeof n === "string") {
            n = doTruncation ? parseInt(n) : parseFloat(n);
        }
        if (isNaN(n))
            return 0;
        if (isFinite(n))
            return n;
        return doTruncation ? Math.trunc(n) : n;
    }
    static generateID(length = 10) {
        if (length <= 0)
            return "";
        const valid = "01234566789ABCDEF"; //stops at F to guaranteed hex
        const s = [];
        for (let i = 0; i < length; i++) {
            const c = this.rng(0, valid.length - 1, true);
            s.push(valid[c]);
        }
        return s.join("");
    }
    static dataIDToUniqueID(id, num, s, ...append) {
        let randID = this.generateID(s.dynamic_id_len);
        let arr = [randID, num];
        switch (s.id_style) {
            case settings_1.id_style.MINIMAL: return arr.join(s.id_separator);
            case settings_1.id_style.REDUCED: {
                arr.unshift(id);
                return arr.join(s.id_separator);
            }
            case settings_1.id_style.FULL: {
                arr.unshift(...append);
                arr.unshift(id);
                return arr.join(s.id_separator);
            }
        }
    }
    static removeDuplicates(...arr) {
        return [...new Set([].concat(...arr))];
    }
    static pushReadOnlyReference(arr, b, prop) {
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value) { },
            enumerable: true
        });
    }
    static pushReference(arr, b, prop) {
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value) {
                b[prop] = value;
            },
            enumerable: true
        });
    }
    static indexToPosition(index, shapeArr) {
        const position = new Array(shapeArr.length);
        let remainingIndex = index;
        const l = shapeArr.length - 1;
        for (let i = l; i >= 0; i--) {
            position[l - i] = remainingIndex % shapeArr[l - i];
            remainingIndex = Math.floor(remainingIndex / shapeArr[l - i]);
        }
        return position;
    }
    /**
     *
     * @param position
     * @param shapeArr the base
     * @returns
     * Imagine counting up in the base [2, 2]
     * That would go: [0, 0], [1, 0], [0, 1], [1, 1] [x, y]
     * Once the previous index hits the limit, the next count up and this index is back to 0
     * so Pos -> index of [1, 0] is 1 (0 indexing)
     *
     * Invalid indexes like [0, 3] in base [2, 2] would be disallow but i didnt code this part in
     */
    static positionToIndex(position, shapeArr) {
        if (!shapeArr.length || !position.length)
            return -1;
        let flatIndex = 0;
        let stride = 1;
        const l = shapeArr.length - 1;
        for (let i = l; i >= 0; i--) {
            flatIndex += position[l - i] * stride;
            stride *= shapeArr[l - i];
        }
        return flatIndex;
    }
    static isPositionOutOfBounds(position, shapeArr) {
        return position.some((i, index) => i >= shapeArr[index] || i < 0);
    }
    static isPartitioningManual(ps) {
        return ps === settings_2.partitionSetting.manual_mapping_no_ghost || ps === settings_2.partitionSetting.manual_mapping_with_ghost || ps === settings_2.partitionSetting.manual_mapping_with_ghost_spread;
    }
    static isPartitioningAuto(ps) {
        return ps === settings_2.partitionSetting.auto_mapping_one_to_one || ps === settings_2.partitionSetting.auto_mapping_types || ps === settings_2.partitionSetting.auto_mapping_subtypes || ps === settings_2.partitionSetting.auto_mapping_ygo;
    }
    static patchCardData(cData, patchData) {
        Object.keys(patchData).forEach(i => {
            if (patchData[i] !== undefined &&
                cData[i] !== undefined) {
                cData[i] = patchData[i];
            }
        });
    }
    //apply a partial onto an original
    static patchGeneric(original, patch, merge = false) {
        let k = Object.keys(patch);
        if (merge) {
            const temp = new Set(k.concat(...Object.keys(patch)));
            k = Array.from(temp);
        }
        k.forEach(i => {
            if (original[i] !== undefined &&
                patch[i] !== undefined) {
                original[i] = patch[i]; //as any here cause even though i checked b4, ts still says undefine is possible here, kinda dum
            }
        });
    }
    static range(len, min = 0) {
        return Array.from({ length: len }, (_, index) => index + min);
    }
    //assumes arr is sorted
    static insertionSort(arr, insertElement, comparator) {
        let indexToBeInserted = arr.findIndex((a) => { let x = comparator(a, insertElement); return isNaN(x) ? false : x > 0; });
        //changed x >= 0 to x > 0 for new equal elements be inserted last
        if (indexToBeInserted < 0)
            arr.push(insertElement);
        else
            arr.splice(indexToBeInserted, 0, insertElement);
    }
    static getTypeSigature(val, simpleParse = false) {
        let k = typeof val;
        if (k !== "object")
            return k;
        if (Array.isArray(val)) {
            if (val.length === 0)
                return "empty[]";
            if (simpleParse)
                return "any[]";
            let t = typeof val[0];
            for (let i = 1; i < val.length; i++) {
                let t2 = typeof val[i];
                if (t2 !== t)
                    return "any[]";
            }
            return `${t}[]`;
        }
        return k;
    }
    static genericCurrier(f, callback, res = []) {
        if (!f.length)
            return callback([]);
        const [first, ...rest] = f;
        if (typeof first === "function") {
            return (...p) => {
                res.push(first(...p));
                if (rest.length === 0)
                    return callback(res);
                return this.genericCurrier(rest, callback, res);
            };
        }
        else {
            res.push(first);
            return this.genericCurrier(rest, callback, res);
        }
        ;
    }
    static clone(obj, recurDepth = 0) {
        if (recurDepth >= 1e8) {
            throw new Error("Maximum recursion depth reached when cloning object");
        }
        const res = {};
        Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === "object")
                res[key] = this.clone(val, recurDepth + 1);
            else
                res[key] = val;
        });
        return res;
    }
    static flat(nested) {
        if (!Array.isArray(nested))
            return [nested];
        const res = [];
        nested.forEach(i => res.push(...this.flat(i)));
        return res;
    }
    static splitArrToShape(arr, shape) {
        let res = new Array(shape.length).fill([]);
        let c = 0;
        shape.forEach((i, index) => {
            while (i !== 0) {
                res[index].push(arr[c]);
                i--;
                c++;
            }
        });
        return res;
    }
    static getRandomElement(arr) {
        if (!arr.length)
            return undefined;
        if (arr.length === 1)
            return arr[0];
        const n = this.rng(arr.length - 1, 0, true);
        return arr[n];
    }
    //generators API
    static *mergeGeneratorReturn(gen1, gen2) {
        let input1 = undefined;
        let input2 = undefined;
        while (true) {
            let n = gen1.next(input1);
            if (n.done) {
                if (Array.isArray(n.value)) {
                    input1 = n.value;
                    break;
                }
                else {
                    gen1 = n.value;
                    input1 = undefined;
                }
            }
            else
                input1 = yield n.value;
        }
        while (true) {
            let n = gen2.next(input2);
            if (n.done) {
                if (Array.isArray(n.value)) {
                    input2 = n.value;
                    break;
                }
                else {
                    gen2 = n.value;
                    input2 = undefined;
                }
            }
            else
                input2 = yield n.value;
        }
        return [...input1, ...input2];
    }
    static *addFinalToGenerator(gen, f) {
        let input = undefined;
        while (true) {
            let n = gen.next(input);
            if (n.done) {
                if (Array.isArray(n.value)) {
                    input = n.value;
                    break;
                }
                else {
                    gen = n.value;
                    input = undefined;
                }
            }
            else
                input = yield n.value;
        }
        const res = f(input);
        if (res === undefined)
            return input;
        return res;
    }
    static getRandomNumberArr(len) {
        const res = [];
        if (!isNaN(len) && Number.isFinite(len) && len > 0) {
            for (let i = 0; i < len; i++) {
                res.push(this.rng(100, 0, true));
            }
        }
        return res;
    }
    static isPositionable(o) {
        return typeof o === "object" && o.pos instanceof position_1.default;
    }
    static isPlayerSpecific(o) {
        return typeof o === "object" && typeof o.playerIndex === "number" && typeof o.playerType === "number";
    }
    /**
     *
     * @param arr1
     * @param arr2
     * Returns the intersection of the two array
     */
    static intersect(arr1, arr2) {
        const hasMap = new Set(arr2);
        return arr1.filter(i => hasMap.has(i));
    }
    static assert(a, b, returns = false, depth = 0) {
        if (depth >= 20) {
            throw new Error(`Assertion error, stack overflowed`);
        }
        const t1 = typeof a;
        const t2 = typeof b;
        if (t1 !== t2) {
            if (returns)
                return false;
            throw new Error(`Assertion error: ${a} is not ${b}, type check fails ${t1} is not ${t2}.`);
        }
        const equallableTypes = ["bigint", "boolean", "number", "string", "symbol", "undefined"];
        if (equallableTypes.includes(t1))
            return returns ? true : undefined;
        if (a === b)
            return returns ? true : undefined; //reference checking
        const c1 = Array.isArray(a);
        const c2 = Array.isArray(b);
        if (c1 !== c2) {
            if (returns)
                return false;
            throw new Error(`Assertion error: ${a} is not ${b}, array check fails ${c1} is not ${c2}.`);
        }
        //recursive section
        if (c1) {
            //both are arrays
            if (a.length !== b.length) {
                if (returns)
                    return false;
                throw new Error(`Assertion error: ${a} is not ${b}, not same len arrays.`);
            }
            const c3 = a.every((k, i) => this.assert(k, b[i], true));
            if (c3)
                return returns ? true : undefined;
            if (returns)
                return false;
            throw new Error(`Assertion error: ${a} is not ${b}, arrays have not the same elements.`);
        }
        //both are objects
        const k1 = Object.keys(a);
        const k2 = Object.keys(b);
        if (k1.length !== k2.length) {
            if (returns)
                return false;
            throw new Error(`Assertion error: ${a} is not ${b}, not same len objects.`);
        }
        const c4 = k1.every((k, i) => k === k2[i]);
        if (!c4) {
            if (returns)
                return false;
            throw new Error(`Assertion error: ${a} is not ${b}, not same key-ed objects.`);
        }
        const c5 = k1.every((k, i) => this.assert(a[k], b[k2[i]], true));
        if (c5)
            return returns ? true : undefined;
        if (returns)
            return false;
        throw new Error(`Assertion error: ${a} is not ${b}, objects not have the same values.`);
    }
}
exports.default = utils;
