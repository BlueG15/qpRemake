import type { CardDataUnified, CardPatchData } from "../core";
import { type Setting, id_style } from "../core/settings";
// import { partitionData } from "../types/data/cardRegistry";
import {Position} from "../game-components/positions";
import type { nestedTree, safeSimpleTypes, typeSignature } from "../core/misc";
import type { PlayerSpecific, Positionable } from "../core";

class utils {

    static toProper(str : string){
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
    }

    //find the element occurs the most in an array
    static most<T extends safeSimpleTypes>(arr : T[]) : T | undefined {
        const countMap = new Map<T, number>();
        let maxCount = 0;
        let mostElement: T | undefined = undefined;

        for (const item of arr) {
            const count = (countMap.get(item) ?? 0) + 1;
            countMap.set(item, count);
            if (count > maxCount) {
                maxCount = count;
                mostElement = item;
            }
        }

        // If arr is empty, mostElement will be undefined
        return mostElement;
    }

    static rng(max : number, min : number, round : boolean){
        return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
    }

    static rngArr(len : number, max : number, min : number, round : boolean){
        return new Array(len).fill(0).map(_ => utils.rng(max, min, round))
    }

    static rngChoice<T>(choices : T[]) : T {
        return choices[ this.rng(choices.length - 1, 0, true) ]
    }

    static rngArrChoice<T>(len : number, choices : T[]) : T[] {
        return new Array(len).fill(0).map(_ => this.rngChoice(choices))
    }

    static round(num : number, precision : number){ 
        return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)
    }

    static clamp(num : number, max : number, min : number = num){
        return Math.min( Math.max(num, min), max)
    }

    static toSafeNumber(n? : number | boolean | string, doTruncation = false) : number{
        if(!n) return 0;
        if(n === true){
            return 1;
        }
        if(typeof n === "string"){
            n = doTruncation ?  parseInt(n) : parseFloat(n);
        }

        if( isNaN(n) ) return 0;
        if( isFinite(n) ) return n;
        return doTruncation ? Math.trunc(n) : n;
    }

    static generateID(length = 10){
        if (length <= 0) return "";
    
        const valid = "01234566789ABCDEF"; //stops at F to guaranteed hex
        const s:string[] = [];
    
        for (let i = 0; i < length; i++) {
            const c = this.rng(0, valid.length-1, true);
            s.push(valid[c] as string);
        }
    
        return s.join("");
    }

    static dataIDToUniqueID(
        id : safeSimpleTypes, 
        num : number, 
        s : Setting,
        ...append : safeSimpleTypes[]
    ){
        let randID = this.generateID(s.dynamic_id_len);
        let arr : safeSimpleTypes[] = [randID, num]
        switch(s.id_style){
            case id_style.minimal: return arr.join(s.id_separator);
            case id_style.reduced: {
                arr.unshift(id);
                return arr.join(s.id_separator);
            }
            case id_style.full: {
                arr.unshift(...append);
                arr.unshift(id);
                return arr.join(s.id_separator);
            }
        }
    }

    static removeDuplicates(...arr : any[][]){
        return [...new Set(([] as any[]).concat(...arr))];
    }

    static pushReadOnlyReference(arr : any[], b : Record<string, any>, prop : string){
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value : any){},
            enumerable : true
        })
    }

    static pushReference(arr : any[], b : Record<string, any>, prop : string){
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value : any){
                b[prop] = value
            },
            enumerable : true
        })
    }

    static patchCardData(cData : CardDataUnified, CardPatchData : CardPatchData){
        Object.keys(CardPatchData).forEach(i => {
            if(
                CardPatchData[i as keyof CardPatchData] !== undefined &&
                cData[i as keyof CardDataUnified] !== undefined
            ){
                (cData as any)[i] = CardPatchData[i as keyof CardPatchData]
            }
        })
    }

    //apply a partial onto an original
    static patchGeneric<T extends Object>(original : T, patch : Partial<T>, merge = false){
        let k = Object.keys(patch)
        if(merge) {
            const temp = new Set(k.concat(...Object.keys(patch)));
            k = Array.from(temp)
        }

        k.forEach(i => {
            if(
                original[i as keyof T] !== undefined &&
                patch[i as keyof T] !== undefined
            ){
                original[i as keyof T] = patch[i as keyof T] as any //as any here cause even though i checked b4, ts still says undefine is possible here, kinda dum
            }
        })
    }

    static range(len : number, min : number = 0){
        return Array.from({length : len}, (_, index) => index + min)
    }

    //assumes arr is sorted
    static insertionSort<T extends any>(arr : T[], insertElement : T, comparator : ((a : T, b : T) => number)){
        let indexToBeInserted = arr.findIndex((a) => {let x = comparator(a, insertElement); return isNaN(x) ? false : x > 0});
        //changed x >= 0 to x > 0 for new equal elements be inserted last
        if(indexToBeInserted < 0) arr.push(insertElement);
        else arr.splice(indexToBeInserted, 0, insertElement);
    }

    static getTypeSigature(val : any, simpleParse = false) : typeSignature {
        let k = typeof val;
        if(k !== "object") return k;
        if(Array.isArray(val)) {
            if(val.length === 0) return "empty[]"
            if(simpleParse) return "any[]"

            let t = typeof val[0]
            for(let i = 1; i < val.length; i++){
                let t2 = typeof val[i]
                if(t2 !== t) return "any[]"
            }
            return `${t}[]`
        }
        return k
    }

    static genericCurrier(f : any[], callback : (p : any[]) => any, res : any[] = []) : any{
        if(!f.length) return callback([]);
        const [first, ...rest] = f;
        if(typeof first === "function"){
            return (...p : any[]) => {
                res.push(first(...p))
                if(rest.length === 0) return callback(res);
                return this.genericCurrier(rest, callback, res);
            }
        } else {
            res.push(first);
            return this.genericCurrier(rest, callback, res);
        };
    }

    static clone<T extends Object>(obj : T, recurDepth : number = 0) : T {
        if(recurDepth >= 1e8){
            throw new Error("Maximum recursion depth reached when cloning object")
        }

        const res = {} as any

        Object.entries(obj).forEach(([key, val]) => {
            if(typeof val === "object") res[key] = this.clone(val, recurDepth + 1);
            else res[key] = val;
        })

        return res as T
    }

    static flat<T extends Exclude<any, Array<any> | any[]>>(nested : nestedTree<T> | T) : T[] {
        if(!Array.isArray(nested)) return [nested];
        const res : T[] = []
        nested.forEach(i => res.push(...this.flat(i)));
        return res;
    }

    static splitArrToShape<T>(arr : T[], shape : number[]) : T[][] {
        let res : T[][] = new Array(shape.length).fill([])
        let c = 0;
        shape.forEach((i, index) => {
            while(i !== 0){
                res[index].push(arr[c])
                i--;
                c++;
            }
        })
        return res;
    }

    static getRandomElement<T extends any[]>(arr : T) : (T extends Array<infer R> ? R : never) | undefined {
        if(!arr.length) return undefined;
        if(arr.length === 1) return arr[0]
        const n = this.rng(arr.length - 1, 0, true);
        return arr[n];
    }

    static getRandomNumberArr(len : number) : number[]{
        const res : number[] = []
        if(!isNaN(len) && Number.isFinite(len) && len > 0){
            for(let i = 0; i < len; i++){
                res.push(this.rng(100, 0, true))
            }
        }
        return res;
    }

    static isPositionable(o : any) : o is Positionable {
        return typeof o === "object" && o.pos instanceof Position
    }

    static isPlayerSpecific(o : any) : o is PlayerSpecific {
        return typeof o === "object" && typeof o.playerIndex === "number" && typeof o.playerType === "number"
    }

    static hasProperty<T_Obj extends Object, T_Key extends string>(a : T_Obj, key : T_Key) : a is T_Obj & {[K in T_Key] : Exclude<any, undefined>} {
        return a.hasOwnProperty(key) && (a as any)[key] !== undefined
    }

    /**
     * 
     * @param arr1 
     * @param arr2 
     * Returns the intersection of the two array
     */
    static intersect<T extends safeSimpleTypes>(arr1 : T[], arr2 : T[]) : T[] {
        const hasMap = new Set(arr2);
        return arr1.filter(i => hasMap.has(i))
    }

    static assert(a : any, b : any) : void;
    static assert(a : any, b : any, returns : true) : boolean;
    static assert(a : any, b : any, returns? : boolean) : void;
    static assert(a : any, b : any, returns = false, depth = 0) : boolean | void {

        if(depth >= 20) {
            throw new Error(`Assertion error, stack overflowed`)
        }
        
        const t1 = typeof a
        const t2 = typeof b
        
        if(t1 !== t2) {
            if(returns) return false;
            throw new Error(`Assertion error: ${a} is not ${b}, type check fails ${t1} is not ${t2}.`)
        }
        
        const equallableTypes : (typeof t1)[] = ["bigint", "boolean", "number", "string", "symbol", "undefined"]
        if(equallableTypes.includes(t1)) return returns ? true : undefined
        
        if(a === b) return returns ? true : undefined //reference checking

        const c1 = Array.isArray(a)
        const c2 = Array.isArray(b)

        if(c1 !== c2) {
            if(returns) return false;
            throw new Error(`Assertion error: ${a} is not ${b}, array check fails ${c1} is not ${c2}.`)
        }

        //recursive section
        if(c1){
            //both are arrays
            if(a.length !== b.length){
                if(returns) return false;
                throw new Error(`Assertion error: ${a} is not ${b}, not same len arrays.`)
            }

            const c3 = a.every((k, i) => this.assert(k, b[i], true))
            if(c3) return returns ? true : undefined
            if(returns) return false;
            throw new Error(`Assertion error: ${a} is not ${b}, arrays have not the same elements.`)
        }

        //both are objects
        const k1 = Object.keys(a)
        const k2 = Object.keys(b)

        if(k1.length !== k2.length){
            if(returns) return false;
            throw new Error(`Assertion error: ${a} is not ${b}, not same len objects.`)
        }

        const c4 = k1.every((k, i) => k === k2[i])
        if(!c4) {
            if(returns) return false;
            throw new Error(`Assertion error: ${a} is not ${b}, not same key-ed objects.`)
        }

        const c5 = k1.every((k, i) => this.assert(a[k], b[k2[i]], true))
        if(c5) return returns ? true : undefined
        if(returns) return false;
        throw new Error(`Assertion error: ${a} is not ${b}, objects not have the same values.`)
    }

    static * mergeSort<T>(
        arr1: readonly T[],
        arr2: readonly T[],
        compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
    ): Iterable<T, void, void> {
        let i = 0;
        let j = 0;

        while (i < arr1.length && j < arr2.length) {
            if (compare(arr1[i], arr2[j]) <= 0) {
                yield arr1[i++];
            } else {
                yield arr2[j++];
            }
        }

        // Drain remaining elements
        while (i < arr1.length) {
            yield arr1[i++];
        }

        while (j < arr2.length) {
            yield arr2[j++];
        }
    }

}
export default utils