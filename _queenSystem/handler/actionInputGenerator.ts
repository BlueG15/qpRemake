import { dry_position, identificationInfo, inputData_pos, inputType, type dry_card, type dry_effect, type dry_effectSubType, type dry_system, type dry_zone, type inputData, type inputData_bool, type inputData_card, type inputData_effect, type inputData_num, type inputData_player, type inputData_subtype, type inputData_zone } from "../../data/systemRegistry";
import { notFull, StrictGenerator } from "../../types/misc";
import { Action, actionFormRegistry, actionInputObj } from "./actionGenrator";
import utils from "../../utils";

export const inputFormRegistry = {
    zone(s : dry_system, z : dry_zone){return {type : inputType.zone, data : actionFormRegistry.zone(s, z)} as const},
    card(s : dry_system, c : dry_card){return {type : inputType.card, data : actionFormRegistry.card(s, c)} as const},
    effect(s : dry_system, c : dry_card, e : dry_effect){return {type : inputType.effect, data : actionFormRegistry.effect(s, c, e)} as const},
    subtype(s : dry_system, c : dry_card, e : dry_effect, st : dry_effectSubType){return {type : inputType.effectSubtype, data : actionFormRegistry.subtype(s, c, e, st)} as const},

    player(s : dry_system, pid : number){return {type : inputType.player, data : actionFormRegistry.player(s, pid)} as const},
    pos(s : dry_system, pos : dry_position){return {type : inputType.position, data : actionFormRegistry.position(s, pos)} as const},

    num(num : number){return {type : inputType.number, data : num} as const},
    str(str : string){return {type : inputType.string, data : str} as const},
    bool(bool : boolean){return {type : inputType.boolean, data : bool} as const},

} as const

export type filter_func_full = [
        (s : dry_system, z : dry_zone) => boolean,
        (s : dry_system, c : dry_card) => boolean,
        (s : dry_system, e : dry_effect) => boolean,
        (s : dry_system, st : dry_effectSubType) => boolean,
    ]

export type filter_func_arr = Exclude<notFull<filter_func_full>, []>

export type filter_func_specific_arr<T extends dry_zone | dry_card | dry_effect | dry_effectSubType> = 
T extends dry_zone ? notFull<[filter_func_full[0]]> :
T extends dry_card ? notFull<[filter_func_full[0], filter_func_full[1]]> : 
T extends dry_effect ? notFull<[filter_func_full[0], filter_func_full[1], filter_func_full[2]]> :
T extends dry_effectSubType ? notFull<[filter_func_full[0], filter_func_full[1], filter_func_full[2], filter_func_full[3]]> : filter_func_arr | []

export type dry_to_inputData_map<T extends dry_zone | dry_card | dry_effect | dry_effectSubType> = 
T extends dry_zone ? inputData_zone :
T extends dry_card ? inputData_card :
T extends dry_effect ? inputData_effect :
T extends dry_effectSubType ? inputData_subtype : never

export class chained_filtered_input_obj<T extends 
    inputData_zone | inputData_card | inputData_effect | inputData_subtype,
    M extends Action[]
> implements actionInputObj<[T], M> {
    protected filter_funcs : filter_func_arr
    protected applyFunc : (system: dry_system, inputs: [T]) => M
    private s : dry_system
    constructor(s : dry_system, applyFunc : (system: dry_system, inputs: [T]) => M, ...f : filter_func_arr){
        this.filter_funcs = f.filter(f => f !== undefined) as filter_func_arr
        this.s = s
        this.applyFunc = applyFunc
    }
    private *__getValid() : StrictGenerator<[inputType, inputData[]], void, inputData>{
        const zarr = this.s.filter(0, z => this.filter_funcs[0](this.s, z))
        if(this.filter_funcs[1]) {
            const carr = zarr.reduce((c, ele) => c.concat(...ele.cardArr_filtered), [] as dry_card[])
                             .filter(c => this.filter_funcs[1]!(this.s, c))
            if(this.filter_funcs[2]){
                const earr = carr.map(c => [c, c.totalEffects.filter(e => this.filter_funcs[2]!(this.s, e))] as const)
                if(this.filter_funcs[3]){
                    yield [inputType.effectSubtype, utils.flat<inputData_subtype>(earr.map(([c, earr]) => earr.map(e => e.subTypes.map(st => inputFormRegistry.subtype(this.s, c, e, st)))))]
                } else yield [inputType.effect, earr.map(([c, earr]) => earr.map(e => inputFormRegistry.effect(this.s, c, e)))
                                 .reduce((c, ele) => c.concat(ele), [] as inputData_effect[])]
            } else yield [inputType.card, carr.map(c => inputFormRegistry.card(this.s, c))];
        } else yield [inputType.zone, zarr.map(z => inputFormRegistry.zone(this.s, z))];
    }
    getValid: StrictGenerator<[inputType, inputData[]], void, inputData> = this.__getValid();

    applyInput(system: dry_system, inputs: [T]){
        return this.applyFunc(system, inputs)
    };
}  

export class chained_filtered_input_obj_pos<M extends Action[]> implements actionInputObj<[inputData_pos], M> {
    protected filter_funcs : Exclude<notFull<[(s : dry_system, z : dry_zone) => boolean, (s : dry_system, z : dry_zone, pos : dry_position) => boolean]>, []>
    protected applyFunc : (system: dry_system, inputs: [inputData_pos]) => M
    private s : dry_system
    constructor(
        s : dry_system, 
        applyFunc : (system: dry_system, inputs: [inputData_pos]) => M, 
        ...f : Exclude<notFull<[(s : dry_system, z : dry_zone) => boolean, (s : dry_system, z : dry_zone, pos : dry_position) => boolean]>, []>
    ){
        this.filter_funcs = f.filter(f => f !== undefined) as Exclude<notFull<[(s : dry_system, z : dry_zone) => boolean, (s : dry_system, z : dry_zone, pos : dry_position) => boolean]>, []>
        this.s = s
        this.applyFunc = applyFunc
    }
    private *__getValid() : StrictGenerator<[inputType.position, inputData_pos[]], void, inputData>{
        const zarr = this.s.filter(0, z => this.filter_funcs[0](this.s, z))
        if(this.filter_funcs[1]) {
            yield [inputType.position, zarr.map(z => z.getAllPos().filter(p => this.filter_funcs[1]!(this.s, z, p)).map(p => inputFormRegistry.pos(this.s, p))).reduce((c, ele) => c.concat(ele), [] as inputData_pos[])];
        } else yield [inputType.position, zarr.map(z => z.getAllPos().map(p => inputFormRegistry.pos(this.s, p))).reduce((c, ele) => c.concat(ele), [] as inputData_pos[])];
    }
    getValid: StrictGenerator<[inputType, inputData[]], void, inputData> = this.__getValid();

    applyInput(system: dry_system, inputs: [inputData_pos]){
        return this.applyFunc(system, inputs)
    };
}

export class direct_input_obj<T extends inputData, M extends Action[]> implements actionInputObj<[T], M> {
    protected applyFunc : (system: dry_system, inputs: [T]) => M
    private __inputData : T
    constructor(inputData : T, f : (system: dry_system, inputs: [T]) => M){
        this.__inputData = inputData,
        this.applyFunc = f
    }

    private *__getValid() : StrictGenerator<[T["type"], [T]], void, T>{
        yield [this.__inputData.type, [this.__inputData]];
    }

    getValid = this.__getValid();
    applyInput(system: dry_system, inputs: [T]){
        return this.applyFunc(system, inputs);
    }
}

type spreadInputType<T extends actionInputObj<any>[], R extends any[] = []> = T extends [infer Head, ...infer Tail] ? (
    Head extends actionInputObj<infer X> ? (
        Tail extends actionInputObj[] ? spreadInputType<Tail, [...R, ...X]> : never
    ) : never
) : R

type spreadActionType<T extends actionInputObj<any>[], R extends any[] = []> = T extends [infer Head, ...infer Tail] ? (
    Head extends actionInputObj<infer X, infer Y> ? (
        Tail extends actionInputObj[] ? spreadInputType<Tail, [...R, ...Y]> : never
    ) : never
) : R

export class sequenced_independent_input_obj<T extends actionInputObj<any>[]> implements actionInputObj<spreadInputType<T>> {
    final_applicator? : (s : dry_system, inputs : spreadInputType<T>) => Action[];
    override_applicator? : (s : dry_system, inputs : spreadInputType<T>) => Action[];
    private inputObjArr : T
    constructor(...inputObj : T){
        this.inputObjArr = inputObj
    }

    private *__getValid() : StrictGenerator<[inputType, inputData[]], void, inputData>{
        let input : inputData | undefined = undefined;
        for(let i = 0; i < this.inputObjArr.length; i++){
            const cgen = this.inputObjArr[i]
            const t : void | [inputType, inputData[]] = cgen.getValid.next(input as any).value
            if(t === undefined) {input = undefined; continue}
            else input = yield t
        }
    }

    getValid = this.__getValid();

    applyInput(s : dry_system, inputs : spreadInputType<T>){

        //I have no idea if this travesty works ngl, preferably dont use this
        if(this.override_applicator){
            return this.override_applicator(s, inputs)
        } else {
            let c_global = 0;
            let res : Action[] = []

            while(true){
                let c = 0;

                while(true){
                    const t = this.getValid.next(inputs[c]).value
                    if(t === undefined) break;
                    if(!t.length) return []
                    c++;
                }

                const input_sliced = inputs.splice(0, c);

                if(input_sliced.length !== c){
                    throw new Error("not enough input");
                }

                res.push(...this.inputObjArr[c_global].applyInput(s, input_sliced));

                c_global++;

                if(this.inputObjArr.length <= c_global) break;
            }
            if(this.final_applicator) res.push(...this.final_applicator(s, inputs));
            return res;
        }
    }
}

// export class spread_input_action_arr<T extends Array<Action>> extends Array<Action> {
//     //enforces the first apply_input applies to all actions in this array
//     applyInput : (s : dry_system, obj : actionInputObj, actionArr : T, inputs : inputData[]) => void

//     constructor(applyInput : (s : dry_system, obj : actionInputObj, actionArr : T, inputs : inputData[]) => void, ...a : T){
//         super(...a)
//         this.applyInput = applyInput
//         if(!a.length) return;
//         const [first, ...rest] = this;
//         if(!first.inputs) return;

//         const obj = first.inputs

//         first.inputs.applyInput = (s : dry_system, a : Action, inputs : inputData[]) => {
//             this.applyInput(s, obj, this as any, inputs);
//         }

//         rest.forEach(i => i.deleteInputObj())
//     }
// }

