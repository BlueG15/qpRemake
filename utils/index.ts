import type { cardData_unified, patchData } from "../types/data/cardRegistry";
import { Setting, id_style } from "../types/abstract/gameComponents/settings";
// import { partitionData } from "../types/data/cardRegistry";
import { partitionSetting } from "../types/abstract/gameComponents/settings";

const utils = {
    toProper(str : string){
        return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
    },

    rng(max : number, min : number, round : boolean){
        return (round) ? Math.round(Math.random() * (max - min) + min) : Math.random() * (max - min) + min
    },

    round(num : number, precision : number){ 
        return Math.round((num + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision)
    },

    generateID(length = 10){
        if (length <= 0) return "";
    
        const valid = "01234566789ABCDEF"; //stops at F to guaranteed hex
        const s:string[] = [];
    
        for (let i = 0; i < length; i++) {
            const c = this.rng(0, valid.length-1, true);
            s.push(valid[c] as string);
        }
    
        return s.join("");
    },

    dataIDToUniqueID(
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
    },

    removeDuplicates(...arr : any[][]){
        return [...new Set(([] as any[]).concat(...arr))];
    },

    pushReadOnlyReference(arr : any[], b : Record<string, any>, prop : string){
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value : any){},
            enumerable : true
        })
    },

    pushReference(arr : any[], b : Record<string, any>, prop : string){
        Object.defineProperty(arr, arr.length, {
            get() {
                return b[prop];
            },
            set(value : any){
                b[prop] = value
            },
            enumerable : true
        })
    },

    indexToPosition(index : number, shapeArr : number[]) {
        const position : number[] = new Array(shapeArr.length);
        let remainingIndex = index;
    
        for (let i = shapeArr.length - 1; i >= 0; i--) {
            position[i] = remainingIndex % (shapeArr[i] as number);
            remainingIndex = Math.floor(remainingIndex / (shapeArr[i] as number));
        }
    
        return position;
    },

    positionToIndex(position : number[], shapeArr :  number[]) {
        if(!shapeArr.length || !position.length) return -1;
        let flatIndex = 0;
        let stride = 1;
    
        for (let i = shapeArr.length - 1; i >= 0; i--) {
            flatIndex += (position[i] as number) * stride;
            stride *= (shapeArr[i] as number);
        }
    
        return flatIndex;
    },

    isPartitioningManual(ps : partitionSetting){
        return ps === partitionSetting.manual_mapping_no_ghost || ps === partitionSetting.manual_mapping_with_ghost || ps === partitionSetting.manual_mapping_with_ghost_spread
    },

    isPartitioningAuto(ps : partitionSetting){
        return ps === partitionSetting.auto_mapping_one_to_one || ps === partitionSetting.auto_mapping_types || ps === partitionSetting.auto_mapping_subtypes || ps === partitionSetting.auto_mapping_ygo
    },

    patchCardData(cData : cardData_unified, patchData : patchData){
        Object.keys(patchData).forEach(i => {
            if(
                patchData[i as keyof patchData] !== undefined &&
                cData[i as keyof cardData_unified] !== undefined
            ){
                (cData as any)[i] = patchData[i as keyof patchData]
            }
        })
    },

    //apply a partial onto an original
    patchGeneric<T extends Object>(original : T, patch : Partial<T>){
        Object.keys(patch).forEach(i => {
            if(
                original[i as keyof T] !== undefined &&
                patch[i as keyof T] !== undefined
            ){
                original[i as keyof T] = patch[i as keyof T] as any //as any here cause even though i checked b4, ts still says undefine is possible here, kinda dum
            }
        })
    },

    range(len : number, min : number = 0){
        return Array.from({length : len}, (_, index) => index + min)
    },

    //assumes arr is sorted
    insertionSort<T extends any>(arr : T[], insertElement : T, comparator : ((a : T, b : T) => number)){
        let indexToBeInserted = arr.findIndex((a) => {let x = comparator(a, insertElement); return isNaN(x) ? false : x >= 0});
        if(indexToBeInserted < 0) arr.push(insertElement);
        else arr.splice(indexToBeInserted, 0, insertElement);
    },
}

export default utils