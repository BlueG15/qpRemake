import type { inputData } from "../../data/systemRegistry";
import type { dry_system } from "../../data/systemRegistry";

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

export enum InputRequestType {
    one,
    choose_2,
    choose_3,
    choose_4,
    choose_5,
}

export class InputArr<T extends inputData = any> extends Array<T>{
    type : InputRequestType
    constructor(RType : InputRequestType, ...p : T[]){
        super(...p)
        this.type = RType
    }

    toMany(k : 2 | 3 | 4 | 5){
        switch(k){
            case 2 : {this.type = InputRequestType.choose_2; break;}
            case 3 : {this.type = InputRequestType.choose_3; break;}
            case 4 : {this.type = InputRequestType.choose_4; break;}
            case 5 : {this.type = InputRequestType.choose_5; break;}
        }
        return this
    }

    toOne(){
        this.type = InputRequestType.one
        return this
    }

    valid(){
        switch(this.type){
            case InputRequestType.one :      {return this.length > 0}
            case InputRequestType.choose_2 : {return this.length >= 2}
            case InputRequestType.choose_3 : {return this.length >= 3}
            case InputRequestType.choose_4 : {return this.length >= 4}
            case InputRequestType.choose_5 : {return this.length >= 5}
        }
        return false
    }

    isValidInput(...i : inputData[]){
        switch(this.type){
            case InputRequestType.one :      {return i.length > 0}
            case InputRequestType.choose_2 : {return i.length >= 2}
            case InputRequestType.choose_3 : {return i.length >= 3}
            case InputRequestType.choose_4 : {return i.length >= 4}
            case InputRequestType.choose_5 : {return i.length >= 5}
        }
        return false
    }

    updateSelfBasedOnInput(s : dry_system, ...i : inputData[]){
        switch(this.type){
            case InputRequestType.one :      {return}
            default : {
                const set = new Set(i.map(x => s.generateSignature(x)))
                for(let i = 0; i < this.length; i++){
                    if(set.has(s.generateSignature(this[i]))){
                        delete this[i]
                    }
                }
            }
        }
    }

    autoApplicable(){
        switch(this.type){
            case InputRequestType.one :      {return this.length === 0}
            case InputRequestType.choose_2 : {return this.length === 2}
            case InputRequestType.choose_3 : {return this.length === 3}
            case InputRequestType.choose_4 : {return this.length === 4}
            case InputRequestType.choose_5 : {return this.length === 5}
        }
    }
} 

export class InputRequest<T_in extends inputData, T_out extends inputData> {
    T_in : T_in = 0 as any
    T_out : T_out = 0 as any
    protected constructor(public chain : ( (x : InputArr) => InputArr )[]){}

    static wrap<T1 extends inputData, T2 extends inputData>(f : (x : InputArr<T1>) => InputArr<T2> | T2[]) {
        return function(x : InputArr<T1>){
            const res = f(x)
            if(!(res instanceof InputArr)){
                return new InputArr(InputRequestType.one, ...res)
            }
            return res
        }
    }

    static new<T1 extends inputData, T2 extends inputData>(f : (x : InputArr<T1>) => InputArr<T2> | T2[]){
        return new InputRequest<T1, T2>([InputRequest.wrap(f)])
    }

    to<T2 extends inputData>(f : (x : InputArr<T_in>) => InputArr<T2> | T2[]) {
        this.chain.push(InputRequest.wrap(f))
        return this as unknown as InputRequest<T_in, T2>
    }

    apply(x : T_in[] | InputArr<T_in>) : InputArr<T_out> {
        let arrIn : InputArr<T_in> 
        if(x instanceof InputArr) arrIn = x;
        else arrIn = new InputArr(InputRequestType.one, ...x)
        return this.chain.reduce((prev, cur) => cur(prev), arrIn)
    }

    concat<T2 extends inputData>(c2 : InputRequest<T_out, T2>){
        this.chain = this.chain.concat(c2.chain)
        return this as unknown as InputRequest<T_in, T2>
    }
}

export class InputManager {
    private valid : boolean
    applied : inputData[] = []
    private __n? : InputArr 
    private data : InputArr[]

    constructor(data : inputData[][] | InputArr[]){
        this.data = data.map(arr => arr instanceof InputArr ? arr : new InputArr(InputRequestType.one, ...arr))
        this.valid = this.data.every(r => r.valid())
        this.__n = this.data.shift()
    }

    next(){
        return this.__n
        // return  n? [n[0].type as inputType, n] as const : undefined;
    }

    apply(s : dry_system, ...i : inputData[]){
        this.applied.push(...i)
        if(this.__n && !this.__n.isValidInput(...i)){
            this.__n.updateSelfBasedOnInput(s, ...i)
        }
        else this.__n = this.data.shift()
    }

    hasInput(){
        return this.valid
    }

    isFinalized(){
        return this.data.length === 0
    }
}