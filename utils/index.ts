import { cardData, patchData } from "../types/data/cardRegistry";

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
        type : string, 
        num : number, 
        len? : number,
        ...append : string[]
    ){
        let runID = this.generateID(len);
        return type + '_' + append.join("_") + '_' + runID + '_' + num;
    },

    uniqueIDTodataID(id : string){
        return id.split("_")[0]
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

    patchCardData(cData : cardData, patchData : patchData){
        Object.entries(patchData).forEach(([key, val]) => {
            (cData as any)[key] = val //have to force type, idk how to not
        })
    }
}

export default utils