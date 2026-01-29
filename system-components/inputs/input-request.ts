import type { InputData } from "../../core/target-type";
import type { SystemDry } from "../../core/system";

export class InputRequestData<T extends InputData = any>{
    choices : T[]
    numTargets : number = 1
    private signatureSet : Set<string>
    constructor(s : SystemDry, numTargets = 1, ...p : T[]){
        this.choices = p
        this.numTargets = numTargets
        this.signatureSet = new Set(p.map(x => s.generateSignature(x)))
    }

    get length(){
        return this.choices.length
    }

    toMany(k : number){
        this.numTargets = k
        return this
    }

    toOne(){
        this.numTargets = 1
        return this
    }

    valid(){
        return this.length >= this.numTargets
    }

    isValidInput(s : SystemDry, i : InputData[]){
        return i.length === this.numTargets && i.every(x => this.signatureSet.has(s.generateSignature(x)))
    }

    isAutoApplicable(){
        return this.length === this.numTargets
    }
} 

export class InputRequest<
    T_Arr extends InputData[] = InputData[],
    T_Head extends InputData = T_Arr[0],
    T_Tails extends InputData[] = T_Arr extends [any, ...infer T] ? T : never
> {
    private chain : InputRequestData[]
    private applied : InputData[] = []
    next() : InputRequestData<T_Head> | undefined {
        return this.chain[0] as any
    }

    constructor(...requests : InputRequestData[]){
        this.chain = requests
    }

    isFinalized() : this is {applied : InputData[]} {
        return this.next() === undefined
    }

    hasInput(){
        return !this.isFinalized()
    }

    isApplicable(s : SystemDry, i : InputData[]) : i is T_Head[] {
        return !!this.next()?.isValidInput(s, i)
    }

    then<T_Arr2 extends InputData[]>(r : InputRequest<T_Arr>) {
        this.chain.push(...r.chain)
        return this as InputRequest<[...T_Arr, ...T_Arr2]>
    }

    apply(s : SystemDry, input : T_Head[]) {
        this.applied.push(...input)
        this.chain.shift()
        return this as InputRequest<T_Tails>
    }
}