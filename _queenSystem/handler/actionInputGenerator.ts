import { dry_position, identificationInfo, inputData_pos, inputData_standard, inputData_str, inputDataSpecific, inputType, type dry_card, type dry_effect, type dry_effectSubType, type dry_system, type dry_zone, type inputData, type inputData_bool, type inputData_card, type inputData_effect, type inputData_num, type inputData_player, type inputData_subtype, type inputData_zone } from "../../data/systemRegistry";
import { Action, actionFormRegistry  } from "./actionGenrator";
import { validSetFormat } from "../../data/systemRegistry";
import { lambda_number, LambdaToNum, NumToLambda, precursor, Tuple_any } from "../../types/misc";

export const inputFormRegistry = {
    zone(s : dry_system, z : dry_zone){
        const o = actionFormRegistry.zone(s, z)
        return {
            type : inputType.zone, 
            data : o, 
            is : o.is,
            of : o.of,
        } as inputData_zone
    },
    card(s : dry_system, c : dry_card){
        const o = actionFormRegistry.card(s, c);
        return {
            type : inputType.card, 
            data : o,
            is : o.is
        } as inputData_card
    },
    effect(s : dry_system, c : dry_card, e : dry_effect){
        const o = actionFormRegistry.effect(s, c, e)
        return {
            type : inputType.effect, 
            data : o,
            is : o.is
        } as inputData_effect
    },
    subtype(s : dry_system, c : dry_card, e : dry_effect, st : dry_effectSubType){
        const o = actionFormRegistry.subtype(s, c, e, st);
        return {
            type : inputType.effectSubtype, 
            data : o,
            is : o.is
        } as inputData_subtype
    },

    player(s : dry_system, pid : number){
        const o = actionFormRegistry.player(s, pid)
        return {
            type : inputType.player, 
            data : o,
            is : o.is,
        } as inputData_player
    },
    pos(s : dry_system, pos : dry_position){
        const o = actionFormRegistry.position(s, pos)
        return {
            type : inputType.position, 
            data : o,
            is : o.is
        } as inputData_pos
    },

    num(num : number){return {type : inputType.number, data : num} as inputData_num},
    str(str : string){return {type : inputType.string, data : str} as inputData_str},
    bool(bool : boolean){return {type : inputType.boolean, data : bool} as inputData_bool},
} as const

export type inputRequester_finalized<T_accu extends Exclude<inputData[], []>> = Omit<inputRequester<never, [], T_accu>, "apply">

export class inputRequester<
    K extends inputType = inputType, //initial type, for inference, useless after constructor is called
    T extends inputData[] = [inputDataSpecific<K>], //inputs tuple yet to apply, [] means finished
    T_accumulate extends Exclude<inputData[], []> = T, //inputs tuple as a whole, inference at first
    T_head extends inputData = T extends [infer head, ...any[]] ? head : inputData, //inference
    T_tail extends inputData[] = T extends [any, ...infer tail] ? tail : inputData[], //inference
>{

    protected __inner_res : Map<string, inputData> = new Map()
    protected __func_arr : ((s : dry_system, prev : inputData[]) => Exclude<inputData[], []> | validSetFormat)[] = []
    protected __curr : validSetFormat | undefined
    protected __queue : inputRequester<any, inputData[], inputData[], any, any>[] = []
    protected __valid_flag : boolean
    protected __do_pre_fill_when_merge : boolean = false
    protected __len : number = 1
    cache : inputRequestCache<T_accumulate>

    get len(){
        return this.__len
    }

    constructor(type : K, validSet? : Exclude<inputDataSpecific<K>[], []>){
        this.__curr = [type, validSet]
        if (validSet === undefined) this.__valid_flag = true;
        else this.__valid_flag = (validSet.length !== 0)

        this.cache = new inputRequestCache(validSet)
    }

    hasInput() : this is inputRequester<K, T, T_accumulate, T_head, T_tail> {
        return this.__valid_flag
    }
    
    private verify(a : any[]) : a is validSetFormat {
        return a.length === 2 && typeof a[0] === "number" //rough check
    }

    private isCurrentInputAllows(s : dry_system, k : inputData | undefined) : k is T_head {
        if(k === undefined) return false
        const t : T_accumulate | validSetFormat<inputType> = this.next()
        const c1 = this.verify(t) 
        const c2 = t[0] === k.type 
        const c3 = (t[1] === undefined || (t[1] as Array<inputData>).some(i => i !== undefined && s.generateSignature(i) === s.generateSignature(k)))
        //console.log("Checking applicavbility of input : ", k, " -- ",  [c1, c2, c3, (t[1] as inputData[]).map(i => s.generateSignature(i))])
        return c1 && c2 && c3
    }

    apply(s : dry_system, input : T_head) 
    : T_tail extends [] 
    ? inputRequester_finalized<T_accumulate>
    : inputRequester<inputType, T_tail, T_accumulate>
    {
        let f = this.__func_arr[this.__inner_res.size]
        this.__inner_res.set(s.generateSignature(input), input)
        if(f !== undefined){
            const t : inputData[] | validSetFormat = f(s, Array.from(this.__inner_res.values()))
            if(this.verify(t)) this.__curr = t;
            else this.__curr = [t[0].type, t]
        } else if(this.__queue.length !== 0){
            const next = this.__queue.shift()!
            this.__func_arr.push(...next.__func_arr)
            next.__inner_res.forEach((val, key) => this.__inner_res.set(key, val))
            this.__curr = next.__curr
            this.__queue.unshift(...next.__queue)
            this.__do_pre_fill_when_merge = next.__do_pre_fill_when_merge
            if(this.__do_pre_fill_when_merge) this.applyMultiple(s, [...Array.from(this.__inner_res.values()), input])
            else this.apply(s, input)
        } else {
            this.__curr = undefined
        }
        return this as any
    }

    applyMultiple(
        s : dry_system, inputs : inputData[], 
        preProcess? : (s : dry_system, index : number, input: inputData) => undefined | inputData[]
    ) : this {

        let mark : boolean[] = new Array(inputs.length).fill(false)
        //console.log("logging from applyMultiple, trying to apply ", inputs, " to this Object")

        let i = 0
        while(i < inputs.length && !this.isFinalized()){
            const x = preProcess ? preProcess(s, i, inputs[i]) : undefined
            if(x){
                x.forEach(k => {
                    if(this.isCurrentInputAllows(s, k)){
                        this.apply(s, k)
                    }
                })
            }
            else if(this.isCurrentInputAllows(s, inputs[i])){
                mark[i] = true;
                this.apply(s, inputs[i] as T_head)
            }
            i++
        }

        console.log("Applied mask: ", mark)
        return this
    }

    next() 
    : T extends []
    ? T_accumulate
    : validSetFormat<T[0]["type"]> 
    {
        return (this.__curr === undefined) ? Array.from(this.__inner_res.values()) as any : this.__curr as any
    }

    isFinalized() : this is inputRequester_finalized<T_accumulate>{
        return this.__curr === undefined
    }

    //extend DO check for chained validity
    extend<T2 extends inputData>(
        s : dry_system, 
        f : (s : dry_system, prev : T_accumulate) => T2[] | validSetFormat<T2["type"]>
    ) 
    : inputRequester<inputType, [...T, T2], [...T_accumulate, T2]>
    {
        this.__func_arr.push(f as any)
        this.__len++;
        this.cache.extend<T2>(s, f as any)
        if(this.cache.tree.length === 0) this.__valid_flag = false;
        return this as any
    }

    extendMultiple<T2 extends inputData, Len extends number, X extends inputData[] = Tuple_any<T2, Len>>(
        s : dry_system, 
        len : Len,
        f : (s : dry_system, prev : T_accumulate) => T2[]
    )
    : inputRequester<K, [...T, ...X], [...T_accumulate, ...X]>
    {
        if(len <= 0) {
            this.__valid_flag = false;
            return this as any;
        }
        this.__len+=len;
        this.cache.extend<T2>(s, f as any, (s : any, k : T2[]) => k.length >= len);

        this.__func_arr.push(f as any);

        let k = len - 1
        while(k !== 0){
            this.__func_arr.push((s : dry_system, prev : inputData[]) => {
                return f(s, prev as any).filter(i => s.generateSignature(i) !== s.generateSignature(prev.at(-1)!))
            })
            k--
        }


        if(this.cache.tree.length === 0) this.__valid_flag = false;
        return this as any
    }

    //merge DO NOT check for chained validity
    merge<T2 extends inputData[], T_accumulate2 extends Exclude<inputData[], []>>(
        requester : inputRequester<inputType, T2, T_accumulate2>
    )
    : inputRequester<inputType, [...T, ...T2], [...T_accumulate, ...T_accumulate2]>
    {
        this.__queue.push(requester)
        if(requester.__valid_flag === false) this.__valid_flag = false;
        this.__len += requester.__len
        this.cache.merge(requester.cache)
        return this as any
    }

    merge_with_signature(requester : inputRequester<any, inputData[], inputData[]>) : this {
        requester.__do_pre_fill_when_merge = true;
        this.merge(requester)
        return this
    }

    fill(s : dry_system, requester : inputRequester<any, inputData[], inputData[]>) : this {
        this.applyMultiple(s, Array.from(requester.__inner_res.values()));
        return this
    }
}

export class inputRequester_multiple<
    K extends inputType,
    Len extends number
> extends inputRequester<K, Tuple_any<inputDataSpecific<K>, Len>>{

    __multiple_len : Len

    constructor(len : Len, type : K, validSet : Exclude<inputDataSpecific<K>[], []>){
        super(type, validSet);
        this.__valid_flag = validSet.length >= len ;
        this.__len = len
        this.__multiple_len = len
    }    

    override apply(s: dry_system, input: Tuple_any<inputDataSpecific<K>, Len> extends [infer head, ...any[]] ? head : inputData_standard){
        if(this.__multiple_len === 0) return super.apply(s, input);
        const i : inputData = input as inputData
        this.__inner_res.set(s.generateSignature(i), i)
        this.__curr![1]! = this.__curr![1]!.filter(i => s.generateSignature(i) !== s.generateSignature(i))
        this.__multiple_len--;
        return this as any;
    }
}


class leaf<T extends inputData>{
    path : inputData[] = []
    cache : T[];
    allIsValid : boolean = false;
    constructor(data : T[] | undefined, path : inputData[] = []){
        if(data === undefined) {
            this.allIsValid = true;
            data = []
        }
        this.cache = data; this.path = path
    }
}

class inputRequestCache<
    T extends Exclude<inputData[], []>
>{
    tree : leaf<inputData>[]
    constructor(initial : T | [] = []){
        this.tree = initial.map(i => new leaf([i]))
    }

    private verify(a : any[]) : a is validSetFormat{
        return a.length === 2 && typeof a[0] === "number"
    }

    extend<T2 extends inputData>(
        s : dry_system, 
        f : (s : dry_system, prev : inputData[]) => T2[] | validSetFormat,
        extraCond : (s : dry_system, k : T2[]) => boolean = (s : any, k : any[]) => k.length !== 0
    ){
        const limit = this.tree.length;
        for(let i = 0; i < limit; i++){
            const curr_leaf = this.tree.shift()!;
            if(curr_leaf instanceof leaf){
                const datum = curr_leaf.cache;
                datum.forEach(k => {
                    const newPath = [...curr_leaf.path, k]
                    const res = f(s, newPath)
                    if(this.verify(res)){
                        if(res[1] === undefined || res[1].length !== 0){
                            this.tree.push(
                                new leaf(res[1], newPath)
                            )
                        }
                    } else {
                        if(extraCond(s, res)){
                                this.tree.push(
                                new leaf(res, newPath)
                            )
                        }
                    }
                })
            } else {
                this.tree.push(curr_leaf)
            }
        }
    }

    merge(requester : inputRequestCache<any>){
        this.tree.push(...requester.tree)
    }

    get(depth : number){ //1 indexing
        return this.tree.filter(i => i.path.length === depth)
    }
}


export class inputApplicator<
    ParamType extends any[],
    InputType extends Exclude<inputData[], []>,
>{
    private __p : ParamType
    private __f : (...param : [...ParamType, inputRequester_finalized<InputType>]) => Action[]
    constructor(
        f : (...param : [...ParamType, inputRequester_finalized<InputType>]) => Action[],
        p : ParamType,
        thisParam? : any,
    ){
        this.__p = p
        this.__f = thisParam ? f.bind(thisParam) : f
    }

    apply(input : inputRequester_finalized<InputType>) : Action[]{
        let k = [...this.__p, input] as const
        return this.__f(...k)
    }
}




