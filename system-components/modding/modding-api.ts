import type { CardDataWithVariantKeys, CardPatchDataFull, DeckData, EffectDataPartial } from "../../core";
import { ActionRegistry, ArchtypeRegistry, ColorRegistry, DeckDataRegistry, ExtensionID, ExtensionRegistry, GameRule, OperatorRegistry, type Action, type ActionBase, type ActionID, type ActionName, type ArchtypeID, type CardDataID, type ColorData, type DeckID, type EffectDataID, type EffectSubtypeID, type EffectTypeID, type OperatorData, type OperatorID, type ZoneTypeID } from "../../core/registry";
import { IDRegistry, Registry } from "../../core/registry/base";
import type { QueenSystem } from "../../queen-system";
import type CardLoader from "../loader/card-loader";
import type EffectLoader from "../loader/effect-loader";
import type EffectTypeOrSubtypeLoader from "../loader/loader_type_subtype";
import type ZoneLoader from "../loader/loader_zone";

export function loadModdingAPI(system: QueenSystem) {
    ModdingAPI.bindSystem(system)
}

export class ModdingAPI {
    private constructor() { }
    static readonly system : QueenSystem = undefined as any
    static bindSystem(system : QueenSystem){
        (this as any).system = system
    }

    //add stuff
    static addCard(
        key : string,
        data : CardDataWithVariantKeys | (() => CardDataWithVariantKeys),
        c? : Parameters<CardLoader["loadNew"]>[2]
    ): CardDataID {
        if(typeof data === "function") data = data();
        return this.system.cardLoader.loadBulk(key, data)
    }

    static addEffect(
        key : string,
        constructor : Parameters<EffectLoader["load"]>[1],
        data? : EffectDataPartial,
    ): EffectDataID;
    static addEffect(
        constructor : Parameters<EffectLoader["load"]>[1] & {name : string},
        data? : EffectDataPartial
    ): EffectDataID;
    static addEffect(
        ...p: any[] 
    ): EffectDataID {
        if(typeof p[0] === "function"){
            p.unshift((p[0] as any).name)
        }
        return this.system.effectLoader.load(...(p as Parameters<EffectLoader["load"]>))
    }

    static addEffectType(
        ...p: Parameters<EffectTypeOrSubtypeLoader["loadType"]>
    ): EffectTypeID {
        return this.system.effectModifierLoader.loadType(...p)
    }
    static addEffectSubtype(
        ...p: Parameters<EffectTypeOrSubtypeLoader["loadSubtype"]>
    ): EffectSubtypeID {
        return this.system.effectModifierLoader.loadSubtype(...p)
    }
    static addZone(
        ...p: Parameters<ZoneLoader["load"]>
    ): ZoneTypeID {
        return this.system.zoneLoader.load(...p)
    }
    static addExtension(name: string) {
        return IDRegistry.add(ExtensionRegistry, name)
    }
    static addArchtype(name: string, asociatedExtension: string | ExtensionID): ArchtypeID {
        if (typeof asociatedExtension === "string") {
            asociatedExtension = this.addExtension(asociatedExtension)
        }
        return Registry.add(ArchtypeRegistry, name, asociatedExtension)
    }
    static addGameRule(gamerule : GameRule | (new (...p : ConstructorParameters<typeof GameRule>) => GameRule)) {
        this.system.addGameRule(gamerule instanceof GameRule ? gamerule : new gamerule())
    }
    static addDeck(name: string, data: DeckData): DeckID {
        return Registry.add(DeckDataRegistry, name, data)
    }
    static addOperator(name: string, data: OperatorData): OperatorID {
        return Registry.add(OperatorRegistry, name, data)
    }
}
