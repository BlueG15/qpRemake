import type { Target } from "../../core";
import type { SystemDry } from "../../core";

export class InputRequestData<T extends Target = any>{
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

    isValidInput(s : SystemDry, i : Target[]){
        return i.length === this.numTargets && i.every(x => this.signatureSet.has(s.generateSignature(x)))
    }

    isAutoApplicable(){
        return this.length === this.numTargets
    }
} 

export class InputRequest<
    T_Arr extends Target[] = Target[],
    T_Head extends Target = T_Arr[0],
    T_Tails extends Target[] = T_Arr extends [any, ...infer T] ? T : never
> {
    private chain : InputRequestData[]
    protected applied : Target[] = []
    next() : InputRequestData<T_Head> | undefined {
        return this.chain[0] as any
    }

    constructor(...requests : InputRequestData[]){
        this.chain = requests
    }

    isFinalized() : this is {applied : Target[]} {
        return this.next() === undefined
    }

    hasInput(){
        return !this.isFinalized()
    }

    isApplicable(s : SystemDry, i : Target[]) : i is T_Head[] {
        return !!this.next()?.isValidInput(s, i)
    }

    then<T_Arr2 extends Target[]>(r : InputRequest<T_Arr2>) {
        this.chain.push(...r.chain)
        return this as InputRequest<[...T_Arr, ...T_Arr2]>
    }

    apply(s : SystemDry, input : T_Head[]) {
        this.applied.push(...input)
        this.chain.shift()
        return this as InputRequest<T_Tails>
    }
}