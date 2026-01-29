import { Effect } from "../../game-components/effects";
import type { CardDataUnified, EffectData, Setting, EffectModifier, EffectDataID } from "../../core";
import type EffectTypeOrSubtypeLoader from "./loader_type_subtype";
import { EffectDataRegistry, EffectTypeRegistry } from "../../core";

import {e_dmg_reduction, e_dmgcap, e_dmgcap_magic, e_dmgcap_physical, e_undamagable, e_undamagable_magic, e_undamagable_physical} from "../../game-components/effects/default/e_defense"
import {e_attack, e_deathcrave, e_decompile_self, e_destroy_self, e_grave_to_hand, e_quick, e_reflect, e_revenge, e_void_self, e_volatile} from "../../game-components/effects/default/e_generic"
import {e_any_extension, e_automate_attack, e_automate_base} from "../../game-components/effects/default/e_status"

type EffectContructor = new (...p : ConstructorParameters<typeof Effect>) => Effect
//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction scheme, similar to paging  
export default class effectLoader {
    private classCache : Map<EffectDataID, EffectContructor> = new Map()
    private countCache : Map<EffectDataID, number> = new Map()

    constructor(
        private typeoOrSubtypeLoader : EffectTypeOrSubtypeLoader,
    ){
        //load all default effects
        
        this.add("dmg_reduction", e_dmg_reduction)

        this.add("dmgcap", e_dmgcap)
        this.add("dmgcap_magic", e_dmgcap_magic)
        this.add("dmgcap_physical", e_dmgcap_physical)
        
        this.add("undamagable", e_undamagable)
        this.add("undamagable_magic", e_undamagable_magic)
        this.add("undamagable_physical", e_undamagable_physical)

        this.add("attack", e_attack)
        this.add("deathcrave", e_deathcrave)
        this.add("decompile_self", e_decompile_self)
        this.add("destroy_self", e_destroy_self)
        this.add("void_self", e_void_self)
        this.add("volatile", e_volatile)
        this.add("grave_to_hand", e_grave_to_hand)
        this.add("quick", e_quick)
        this.add("reflect", e_reflect)
        this.add("revenge", e_revenge)

        this.add("any_extension", e_any_extension)
        this.add("automate", e_automate_attack)
    }

    add(
        key : string, 
        constructor : (new (...p : ConstructorParameters<typeof Effect>) => Effect) & {getEffData?() : {base : EffectData}}, 
        data : EffectData | undefined = constructor.getEffData ? constructor.getEffData().base : undefined 
    ){
        if(!data) return;
        const ID = EffectDataRegistry.add(key, data)
        this.classCache.set(ID, constructor)
    }

    getData(id : EffectDataID, edata? : Partial<EffectData>){
        let data = EffectDataRegistry.get(id)
        if(!data) return undefined

        if(edata) Utils.patchGeneric(data, edata);
        return data
    }

    //most hacky fix ever
    //ahhhh
    //TODO : find a better solution
    private validator(x : Function) : x is EffectContructor {
        try {
            x()
            return false
        } catch(e : any){
            try{
                return (e as Error).message.includes("cannot be invoked without 'new'")
            } catch(e : any){
                return false
            }
        }
    }

    getEffect(dataID : EffectDataID, s : Setting, edata? : Partial<EffectData>) : Effect | undefined {
        let data = this.getData(dataID, edata)
        if(!data) return undefined

        let eclass = this.classCache.get(Number(dataID) as any)
        if(!eclass) {console.log("No class Data for key ", dataID); return undefined}

        return this.getDirect(dataID, s, eclass, data)
    }

    getDirect(eid : EffectDataID, s : Setting, eclass : typeof Effect | Function, data : EffectData) : Effect | undefined {
        let c = this.countCache.get(eid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(eid, c); 

        //load type
        let type = this.typeoOrSubtypeLoader.getType(data.typeID, s)
        if(!type) return undefined

        let runID = Utils.dataIDToUniqueID(eid, c, s, ...data.subTypeIDs)
            
        //load subtypes
        let k : EffectModifier[] = []
        data.subTypeIDs.forEach(i => {
            let st = this.typeoOrSubtypeLoader.getSubType(i, s)
            if(st) k.push(st);
        })

        if(k.length != data.subTypeIDs.length && !s.ignore_undefined_subtype){
            return undefined
        }


        if(this.validator(eclass)){
            const res = new eclass(runID, eid, type, k, data);
            return (res instanceof Effect) ? res : undefined
        }
        return undefined
    }
}