import type { cardData_unified, patchData } from "../data/cardRegistry";
import { type Setting, id_style } from "../types/abstract/gameComponents/settings";
// import { partitionData } from "../types/data/cardRegistry";
import { partitionSetting } from "../types/abstract/gameComponents/settings";
import Position from "../types/abstract/generics/position";
import type { nestedTree, Player_specific, Positionable, safeSimpleTypes, typeSignature } from "../types/misc";

type recursiveGenerator<T> = Generator<any, T | recursiveGenerator<T>, any>

class utils {

    static toProper(str : string){
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
    }

    static rng(max : number, min : number, round : boolean){
        return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
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
        id : string, 
        num : number, 
        s : Setting,
        ...append : string[]
    ){
        let randID = this.generateID(s.dynamic_id_len);
        let arr = [randID, num]
        switch(s.id_style){
            case id_style.MINIMAL: return arr.join(s.id_separator);
            case id_style.REDUCED: {
                arr.unshift(id);
                return arr.join(s.id_separator);
            }
            case id_style.FULL: {
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

    static indexToPosition(index : number, shapeArr : number[]) {
        const position : number[] = new Array(shapeArr.length);
        let remainingIndex = index;
    
        for (let i = shapeArr.length - 1; i >= 0; i--) {
            position[i] = remainingIndex % (shapeArr[i] as number);
            remainingIndex = Math.floor(remainingIndex / (shapeArr[i] as number));
        }
    
        return position;
    }

    static positionToIndex(position : ReadonlyArray<number>, shapeArr :  number[]) {
        if(!shapeArr.length || !position.length) return -1;
        let flatIndex = 0;
        let stride = 1;
    
        for (let i = shapeArr.length - 1; i >= 0; i--) {
            flatIndex += (position[i] as number) * stride;
            stride *= (shapeArr[i] as number);
        }
    
        return flatIndex;
    }

    static isPartitioningManual(ps : partitionSetting){
        return ps === partitionSetting.manual_mapping_no_ghost || ps === partitionSetting.manual_mapping_with_ghost || ps === partitionSetting.manual_mapping_with_ghost_spread
    }

    static isPartitioningAuto(ps : partitionSetting){
        return ps === partitionSetting.auto_mapping_one_to_one || ps === partitionSetting.auto_mapping_types || ps === partitionSetting.auto_mapping_subtypes || ps === partitionSetting.auto_mapping_ygo
    }

    static patchCardData(cData : cardData_unified, patchData : patchData){
        Object.keys(patchData).forEach(i => {
            if(
                patchData[i as keyof patchData] !== undefined &&
                cData[i as keyof cardData_unified] !== undefined
            ){
                (cData as any)[i] = patchData[i as keyof patchData]
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

    //generators API
    static *mergeGeneratorReturn<T>(gen1 : recursiveGenerator<T[]>, gen2 : recursiveGenerator<T[]>) : Generator<any, T[], any>{
        let input1 : any = undefined
        let input2 : any = undefined

        while(true){
            let n = gen1.next(input1);
            if(n.done) {
                if(Array.isArray(n.value)){
                    input1 = n.value; break;
                } else {
                    gen1 = n.value;
                    input1 = undefined;
                }
            }
            else input1 = yield n.value;
        }

        while(true){
            let n = gen2.next(input2);
            if(n.done) {
                if(Array.isArray(n.value)){
                    input2 = n.value; break;
                } else {
                    gen2 = n.value;
                    input2 = undefined;
                }
            }
            else input2 = yield n.value;
        }

        return [...input1, ...input2]
    }

    static *addFinalToGenerator<T>(gen : recursiveGenerator<T[]>, f : (arr : T[]) => T[] | void) : Generator<any, T[], any>{
        let input : any = undefined

        while(true){
            let n = gen.next(input);
            if(n.done) {
                if(Array.isArray(n.value)){
                    input = n.value; break;
                } else {
                    gen = n.value;
                    input = undefined;
                }
            }
            else input = yield n.value;
        }

        const res = f(input);
        if(res === undefined) return input;
        return res;
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

    static isPlayerSpecific(o : any) : o is Player_specific {
        return typeof o === "object" && typeof o.playerIndex === "number" && typeof o.playerType === "number"
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
}

export default utils