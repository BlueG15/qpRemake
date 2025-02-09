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
            s.push(valid[c]);
        }
    
        return s.join("");
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
            position[i] = remainingIndex % shapeArr[i];
            remainingIndex = Math.floor(remainingIndex / shapeArr[i]);
        }
    
        return position;
    },

    positionToIndex(position : number[], shapeArr :  number[]) {
        if(!shapeArr.length || !position.length) return -1;
        let flatIndex = 0;
        let stride = 1;
    
        for (let i = shapeArr.length - 1; i >= 0; i--) {
            flatIndex += position[i] * stride;
            stride *= shapeArr[i];
        }
    
        return flatIndex;
    }
}

export default utils