import { Effect } from "../../game-components/effects";
import type { CardDataUnified, EffectData, Setting, EffectModifier, EffectDataID, EffectDataWithVariantKeys, EffectSubtypeID } from "../../core";
import type EffectTypeOrSubtypeLoader from "./loader_type_subtype";
import { EffectDataRegistry, EffectTypeRegistry } from "../../core";

import { e_dmg_reduction, e_dmgcap, e_dmgcap_magic, e_dmgcap_physical, e_undamagable, e_undamagable_magic, e_undamagable_physical } from "../../game-components/effects/default/e_defense"
import { e_attack, e_deathcrave, e_decompile_self, e_destroy_self, e_grave_to_hand, e_quick, e_reflect, e_revenge, e_void_self, e_volatile } from "../../game-components/effects/default/e_generic"
import { e_any_extension, e_automate_attack, e_automate_base, generic_stat_change_diff, generic_stat_change_override } from "../../game-components/effects/default/e_status"
import { DoubleKeyRegistry } from "../../core/registry/base";

type EffectContructor = (
    (new (...p: ConstructorParameters<typeof Effect>) => Effect) 
    & {__dataID? : EffectDataID}
    & {getEffData? : (typeof Effect)["getEffData"]}
)
//Cards have 2 parts

//Data and Code

//As denoted b4 in the README file, there are 3 approaches
// naive -> load everything into mem
// dynamic -> async load both class and data if needed
// fixxed size cache -> use some kind of eviction scheme, similar to paging  
export default class EffectLoader {
    private classCache: Map<EffectDataID, EffectContructor> = new Map()
    private countCache: Map<EffectDataID, number> = new Map()

    constructor(
        private typeoOrSubtypeLoader: EffectTypeOrSubtypeLoader,
    ) {
        //load all default effects

        this.load("dmg_reduction", e_dmg_reduction)

        this.load("dmgcap", e_dmgcap)
        this.load("dmgcap_magic", e_dmgcap_magic)
        this.load("dmgcap_physical", e_dmgcap_physical)

        this.load("undamagable", e_undamagable)
        this.load("undamagable_magic", e_undamagable_magic)
        this.load("undamagable_physical", e_undamagable_physical)

        this.load("attack", e_attack)
        this.load("deathcrave", e_deathcrave)
        this.load("decompile_self", e_decompile_self)
        this.load("destroy_self", e_destroy_self)
        this.load("void_self", e_void_self)
        this.load("volatile", e_volatile)
        this.load("grave_to_hand", e_grave_to_hand)
        this.load("quick", e_quick)
        this.load("reflect", e_reflect)
        this.load("revenge", e_revenge)

        this.load("any_extension", e_any_extension)
        this.load("automate", e_automate_attack)

        this.load("generic_stat_change_diff", generic_stat_change_diff)
        this.load("generic_stat_change_override", generic_stat_change_override)
    }
    
    private addClass(id : EffectDataID, c : EffectContructor) {
        c.__dataID = id
        this.classCache.set(id, c)
    }

    load(key : string, c : EffectContructor, data? : EffectDataWithVariantKeys){
        if(!c.getEffData) throw new Error(`Failed to load new effect with name: ${key}, constructor have no getEffData`);

        const getter = c.getEffData()
        if(typeof getter === "function"){
            data = getter()
        } else data = getter;

        const id = DoubleKeyRegistry.addBulk(EffectDataRegistry, key, data)
        this.addClass(id, c)

        return id
    }

    loadClass(id: EffectDataID, c: EffectContructor) {
        this.addClass(id, c)
    }

    loadNewVariantData(id: EffectDataID, variantName: string, data: Partial<EffectData>) {
        DoubleKeyRegistry.addExisting(EffectDataRegistry, id, variantName, data)
    }

    getData(id: EffectDataID, variant: string[], edata?: Partial<EffectData>) {
        let data = EffectDataRegistry.getAllData(id)

        let d = data[EffectDataRegistry.getBaseKey()]
        if (!d) return undefined

        const patchDatas = variant.flatMap(id => EffectDataRegistry.isBaseKey(id) ? [] : data[id])
        if(edata) patchDatas.push(edata);
        if (patchDatas.length) d = Utils.patch(d, ...patchDatas);

        return d
    }

    getEffect(dataID: EffectDataID, variants : string[], s: Setting, edata?: Partial<EffectData>): Effect | undefined {
        let data = this.getData(dataID, variants, edata)
        if (!data) { console.log("In effect Loader, No Data for key ", EffectDataRegistry.getKey(dataID)); return undefined }

        let eclass = this.classCache.get(dataID)
        if (!eclass) { console.log("In effect Loader, No Class for key ", EffectDataRegistry.getKey(dataID)); return undefined }

        return this.getDirect(dataID, s, eclass, data)
    }

    private getDirect(eid: EffectDataID, s: Setting, eclass: EffectContructor, patchedData: EffectData): Effect | undefined {
        let c = this.countCache.get(eid);
        c = (c) ? (c + 1) % s.max_id_count : 0;
        this.countCache.set(eid, c);

        //load type
        let type = this.typeoOrSubtypeLoader.getType(patchedData.typeID, s)
        if (!type) { console.log("In effect Loader, No Type for key ", EffectTypeRegistry.getKey(patchedData.typeID)); return undefined }

        let runID = Utils.formatDataIDtoUniqueID(eid, c, s, ...patchedData.subTypeIDs)

        //load subtypes
        let k: EffectModifier[] = []
        const undefSubtype : EffectSubtypeID[] = []
        patchedData.subTypeIDs.forEach(i => {
            let st = this.typeoOrSubtypeLoader.getSubType(i, s)
            if (st) k.push(st);
            else undefSubtype.push(i)
        })

        if (k.length != patchedData.subTypeIDs.length && !s.ignore_undefined_subtype) { 
            console.log("In effect Loader, Some subtype is undefined and setting set to not ignore: ", undefSubtype); 
            return undefined 
        }
        
        const res = new eclass(runID, type, k, patchedData);
        return (res instanceof Effect) ? res : undefined
    }
}