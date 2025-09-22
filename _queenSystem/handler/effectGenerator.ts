
/**@deprecated */
import { dry_card, dry_system, inputData, inputData_card, inputData_num, inputData_pos, inputData_standard, inputData_zone, inputDataSpecific, inputType } from "../../data/systemRegistry"
import Effect from "../../types/abstract/gameComponents/effect"
import { Action } from "./actionGenrator"
import { inputRequester, inputRequester_finalized } from "./actionInputGenerator"
import { T_regen } from "./actionInputRequesterGenerator"

type request_f_p1<
    requesterType extends T_regen
> = (
    this : Effect<any>,
    c : dry_card,
    s : dry_system,
    a : Action
) => requesterType

type request_f_p2<
    requesterType extends T_regen
> = (
    p1_result : requesterType
) => inputRequester<any, any>

//Handle each input separately
type activate_function<T extends inputData> = (
    this : Effect<any>,
    data : T
) => Action[]

type quickTypes = "card" | "zone" | "pos" | "nums"
type inputDataMap<K extends quickTypes> = {
    card : inputData_card,
    zone : inputData_zone,
    pos : inputData_pos,
    nums : inputData_num
}[K]

class eff_gen<
    K extends quickTypes = quickTypes,
> {
    protected checkInputType? : inputType
    protected revealKeys : string[] = []
    protected implyVar : (
        (
            this : Effect<any>, 
            res : Action[], 
            c : dry_card, s : dry_system, a : Action
        ) => [string, number]
    )[] = []
    protected input_f1_info : {
        init : request_f_p1<T_regen<K>>,
        chained : (
            (
                this : Effect<any>, 
                prev : T_regen<K>
            ) => T_regen<K>
        )[]
    }

    constructor(
        input_f1 : request_f_p1<T_regen<K>>,
        protected input_f2 : request_f_p2<T_regen<K>>,
        protected activate_f : activate_function<inputDataMap<K>>,
    ){
        this.input_f1_info = {
            init : input_f1,
            chained : []
        }
    }

    retarget<K_new extends "card" | "zone" | "pos" | "nums">(
        key : K_new,
        input_f1_new : (this : Effect<any>, prev : T_regen<K>) => T_regen<K_new>,
        input_f2_new : request_f_p2<T_regen<K_new>>,
        newActivate: (oldActivate : activate_function<inputDataMap<K>>) => activate_function<inputDataMap<K_new>>,
    ) : {
        card : eff_gen_cards,
        zone : eff_gen_zones,
        pos : eff_gen_zones,
        nums : eff_gen_zones
    }[K_new]{
        switch(key){
            case "zone" : {
                this.input_f1_info.chained.push(input_f1_new as any);
                this.input_f2 = input_f2_new as any
                this.activate_f = newActivate(this.activate_f) as any
                return this as any
            }

            case "card" : {
                const res = new eff_gen_cards(
                    this.input_f1_info.init as any, 
                    input_f2_new as any, 
                    newActivate(this.activate_f) as any
                )
                res.revealKeys = this.revealKeys
                res.implyVar = this.implyVar
                res.input_f1_info.chained = this.input_f1_info.chained as any
                res.input_f1_info.chained.push(input_f1_new as any)
                return res as any
            }

            case "pos" : {
                const res = new eff_gen_pos(
                    this.input_f1_info.init as any, 
                    input_f2_new as any, 
                    newActivate(this.activate_f) as any
                )
                res.revealKeys = this.revealKeys
                res.implyVar = this.implyVar
                res.input_f1_info.chained = this.input_f1_info.chained as any
                res.input_f1_info.chained.push(input_f1_new as any)
                return res as any
            }
        }

        throw new Error()
    };

    then(
        f : (this : Effect<any>, prev : T_regen<K>) => T_regen<K>
    ){
        this.input_f1_info.chained.push(f as any)
        return this
    }

    shares(f : (this : Effect<any>, res : Action[], c : dry_card, s : dry_system, a : Action) => [string, number]){
        this.implyVar.push(f)
        return this
    }

    reveal(k : string | string[]){
        if(typeof k === "string") this.revealKeys.push(k);
        else this.revealKeys.push(...k) 
        return this
    }



    fin(){
        const f1 = this.input_f1_info
        const f2 = this.input_f2
        const f3 = this.activate_f
        const implyVar = this.implyVar
        const revealKeys = this.revealKeys
        const type = this.checkInputType
        return class ExtendedEff extends Effect<any> {
            override createInputObj(c: dry_card, s: dry_system, a: Action) : any {
                let res = f1.init.bind(this)(c, s, a);
                res = f1.chained.reduce((prev, cur) => cur.bind(this)(prev), res)
                return f2.bind(this)(res)
            }

            override activate_final(
                c: dry_card, 
                s: dry_system, 
                a: Action, 
                input: undefined | inputRequester_finalized<inputData[]>
            ): Action[] {
                if(!input) return []
                const res = input.next()
                const ret = res.flatMap(i => i.type === type ? f3.bind(this)(i as any) : [])
                implyVar.forEach(f => {
                    const [key, val] = f.bind(this)(ret, c, s, a)
                    c.addShareMemory(this, key, val)
                })
                return ret
            }

            override getDisplayInput(c: dry_card, system: dry_system): (string | number)[] {
                return revealKeys.map(k => this.attr.get(k) ?? 0)
            }
        }
    }
}

class eff_gen_zones extends eff_gen<"zone"> {
    protected override checkInputType = inputType.zone
    /**Down pushes the input to cards */
    cards(
        input_f2_new : request_f_p2<T_regen<"card">>,
        newActivate : (oldActivate : activate_function<inputDataMap<"zone">>) => activate_function<inputDataMap<"card">>
    ){
        return this.retarget("card", (p) => p.cards(), input_f2_new, newActivate)
    }

    pos(
        input_f2_new : request_f_p2<T_regen<"pos">>,
        newActivate : (oldActivate : activate_function<inputDataMap<"zone">>) => activate_function<inputDataMap<"pos">>
    ){
        return this.retarget("pos", (p) => p.pos(), input_f2_new, newActivate)
    }
}
class eff_gen_cards extends eff_gen<"card"> {
    protected override checkInputType = inputType.card
    zones(
        input_f2_new : request_f_p2<T_regen<"zone">>,
        newActivate : (oldActivate : activate_function<inputDataMap<"card">>) => activate_function<inputDataMap<"zone">>
    ){
        return this.retarget("zone", (p) => p.zones(), input_f2_new, newActivate)
    }

    pos(
        input_f2_new : request_f_p2<T_regen<"pos">>,
        newActivate : (oldActivate : activate_function<inputDataMap<"card">>) => activate_function<inputDataMap<"pos">>
    ){
        return this.retarget("pos", (p) => p.pos(), input_f2_new, newActivate)
    }
}
class eff_gen_pos extends eff_gen<"pos"> {
    protected override checkInputType = inputType.position
}

const eff_manip = {
    combine<
        M extends quickTypes, N extends Exclude<quickTypes, M>
    >(
        regen1 : eff_gen<M>, regen2 : eff_gen<N>, 
    ){
        
    }
}



