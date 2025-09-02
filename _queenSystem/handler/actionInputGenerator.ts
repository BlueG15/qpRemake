import { dry_position, identificationInfo, inputData_pos, inputData_standard, inputData_str, inputDataSpecific, inputType, type dry_card, type dry_effect, type dry_effectSubType, type dry_system, type dry_zone, type inputData, type inputData_bool, type inputData_card, type inputData_effect, type inputData_num, type inputData_player, type inputData_subtype, type inputData_zone } from "../../data/systemRegistry";
import { Action, actionFormRegistry  } from "./actionGenrator";
import { validSetFormat } from "../../data/systemRegistry";
import { Last, Tuple_any } from "../../types/misc";

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

export type inputRequester_finalized<T_accu extends Exclude<inputData[], []>> = {
    next : inputRequester<never, [], T_accu>["next"]
}

export class inputRequester<
    K extends inputType = inputType, //initial type, for inference, useless after constructor is called
    T extends inputData[] = [inputDataSpecific<K>], //inputs tuple yet to apply, [] means finished
    T_accumulate extends Exclude<inputData[], []> = T, //inputs tuple as a whole, inference at first
    T_data_last extends inputData = inputDataSpecific<K>, //last entry of the array, deprecated
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
    protected __cursor : number = 0
    cache : inputRequestCache<T_accumulate>

    updateValidFlag(set : inputData[]){
        if (set === undefined) this.__valid_flag = true;
        else this.__valid_flag = (set.length !== 0)
    }

    get len(){
        return this.__len
    }

    constructor(type : K, validSet? : Exclude<inputDataSpecific<K>[], []>){
        this.__curr = [type, validSet]
        if (validSet === undefined) this.__valid_flag = true;
        else this.__valid_flag = (validSet.length !== 0)

        this.cache = new inputRequestCache(validSet)
    }

    hasInput() : this is this {
        return this.__valid_flag && (this.__curr === undefined || this.__curr[1] === undefined || this.__curr[1].length !== 0)
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

    protected apply_dry(s : dry_system){
        let f = this.__func_arr[this.__cursor]
        this.__cursor++
        if(f !== undefined){
            const t : inputData[] | validSetFormat = f(s, Array.from(this.__inner_res.values()))
            if(this.verify(t)) this.__curr = t;
            else this.__curr = [t[0].type, t]
        } else if(this.__queue.length !== 0){
            const next = this.__queue.shift()!
            this.__func_arr = next.__func_arr
            next.__inner_res.forEach((val, key) => this.__inner_res.set(key, val))
            this.__curr = next.__curr
            this.__queue.unshift(...next.__queue)
            this.__do_pre_fill_when_merge = next.__do_pre_fill_when_merge
            this.__cursor = next.__cursor
        } else {
            this.__curr = undefined
        }
        return this as any
    }

    apply(s : dry_system, input : T_head) 
    : T_tail extends [] 
    ? inputRequester_finalized<T_accumulate>
    : inputRequester<inputType, T_tail, T_accumulate, T_data_last>
    {
        let f = this.__func_arr[this.__cursor]
        this.__cursor++
        this.__inner_res.set(s.generateSignature(input), input)
        if(f !== undefined){
            const t : inputData[] | validSetFormat = f(s, Array.from(this.__inner_res.values()))
            if(this.verify(t)) this.__curr = t;
            else this.__curr = [t[0].type, t]
        } else if(this.__queue.length !== 0){
            const next = this.__queue.shift()!
            this.__func_arr = next.__func_arr
            next.__inner_res.forEach((val, key) => this.__inner_res.set(key, val))
            this.__curr = next.__curr
            this.__queue.unshift(...next.__queue)
            this.__do_pre_fill_when_merge = next.__do_pre_fill_when_merge
            this.__cursor = next.__cursor
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
    : inputRequester<inputType, [...T, T2], [...T_accumulate, T2], T2>
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
    : inputRequester<K, [...T, ...X], [...T_accumulate, ...X], T2>
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
    merge<T2 extends inputData[], T_accumulate2 extends Exclude<inputData[], []>, T_data_last_2 extends inputData>(
        requester : inputRequester<inputType, T2, T_accumulate2, T_data_last_2>
    )
    : inputRequester<inputType, [...T, ...T2], [...T_accumulate, ...T_accumulate2], T_data_last_2>
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

    //adds a new condition on top of the old condition of the last input required
    /**@deprecated */
    extendOverride(
        s : dry_system, 
        cond : (s : dry_system, prev : T_data_last) => boolean
    ) 
    : this
    {
        if(this.__func_arr.length === 0) {
            if(this.__queue.length === 0) {
                if(!this.__curr) return this;
                if(!this.__curr[1]) return this;
                this.__curr[1] = this.__curr[1].filter(i => cond(s, i as any));
                return this;
            };
            return this.__queue.at(-1)!.extendOverride(s, cond) as any
        };

        const oldCond = this.__func_arr.pop()!
        
        const newCond = function(f : typeof oldCond, f2 : typeof cond, thisParam : inputRequester<any, any>){
            return function(s : dry_system, prev : T_accumulate){
                const res = f(s, prev);
                const res2 = thisParam.verify(res) ? res[1] : res
                if(!res2) return res;
                return res2.filter(k => f2(s, k as any))
            }
        }

        const k = newCond(oldCond, cond, this) as any

        this.__func_arr.push(k as any)
        this.cache.extend(s, k as any)
        if(this.cache.tree.length === 0) this.__valid_flag = false;
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

    override updateValidFlag(set: inputData[]): void {
        this.__valid_flag = set.length >= this.__multiple_len
    }

    override apply(s: dry_system, input: Tuple_any<inputDataSpecific<K>, Len> extends [infer head, ...any[]] ? head : inputData_standard){
        // console.log("From inside requester: ", this.__multiple_len)
        if(this.__multiple_len === 0) return super.apply(s, input);
        const i : inputData = input as inputData
        this.__inner_res.set(s.generateSignature(i), i)
        this.__curr![1]! = this.__curr![1]!.filter(i => s.generateSignature(i) !== s.generateSignature(input as any))
        this.__multiple_len--;

        if(this.__multiple_len === 0) this.apply_dry(s)

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




