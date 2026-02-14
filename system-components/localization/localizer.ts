import { ActionRegistry, ArchtypeRegistry, CardDataRegistry, DeckDataRegistry, EffectDataRegistry, EffectSubtypeRegistry, EffectTypeRegistry, ExtensionRegistry, OperatorRegistry, RarityRegistry, ZoneRegistry } from "../../core";
import type { SystemDry, CardDry, EffectDry, ZoneDry, PositionDry, PlayerStat, CardDataID } from "../../core";
import { LocalizedSystem, LocalizedAction, LocalizedCard, LocalizedEffect, LocalizedPlayer, LocalizedZone } from "../../core/localized";
import type {QueenSystem} from "../../queen-system";
import type { Card } from "../../game-components/cards";
import type { Effect } from "../../game-components/effects";
import type { Zone } from "../../game-components/zones";
import { LanguageID, type Setting } from "../../core/settings";
import { DisplayComponent, Parser, LoadOptions, ParseMode, ParseOptions, ComponentID } from "./xml-text-parser";
import EN from "./localization-files/English"
//TODO : fix (add/merge missing entries) from ./English into other languages and import them here
//Note that ./English is the standard, handwritten, the script to generate the others is in ./progress_tracker (not commited to git rn)

const RegistryTranslator = {
    zone : ZoneRegistry,
    card : CardDataRegistry,
    effect : EffectDataRegistry,
    effectType : EffectTypeRegistry,
    effectSubtype : EffectSubtypeRegistry,

    action : ActionRegistry,

    deck : DeckDataRegistry,
    archtype : ArchtypeRegistry,
    operator : OperatorRegistry,
    rarity : RarityRegistry,

    extension : ExtensionRegistry
} as const

const PrefixMap = {
    action: "a",
    zone: "z",
    card: "c",
    effect: "e",
    effectType: "e_t",
    operator: "o",
    effectSubtype: "e_st",
    deck: "d",
    archtype: "a",
    rarity: "r",
    extension : "ex",
}

type SymbolType = keyof typeof RegistryTranslator


export default class Localizer {
    private setting : Setting
    private localizationMap = new Map<LanguageID, Record<string, string>>()
    private parser = new Parser()
    private loaded = false
    private boundSystem : QueenSystem
    
    get languageID() {return this.setting.languageID}
    get languageStr() {
        switch(this.languageID){
            case LanguageID.en : return "lang_en";
            case LanguageID.fr : return "lang_fr";
            case LanguageID.ja : return "lang_ja";

            //TODO : finish this switch
        }
    }
    
    constructor(s : QueenSystem){
        this.boundSystem = s
        this.setting = {} as Setting
        
        //TODO : load all of the languages
        this.add(LanguageID.en, EN)
    }

    async load(l : LoadOptions) : Promise<void> {
        this.loaded = false
        this.localizationMap.set(LanguageID.en, EN);
        await this.parser.load(l)
        this.loaded = true
    }

    add(lang : LanguageID, record : Record<string, string>) : void;
    add(lang : LanguageID, key : string, val : string) : void;
    add(lang : LanguageID, ...p2 : [string, string] | [Record<string, string>]){
        if(!this.localizationMap.has(lang)) return;
        if(p2.length === 1){
            Object.entries(p2[0]).forEach(([key, val]) => {
                this.localizationMap.get(lang)![key] = val;
            })
        } else {
            this.localizationMap.get(lang)![p2[0]] = p2[1];
        }
    }

    private parseKey(key : string, type : SymbolType, mode : ParseMode){
        key = `${PrefixMap[type]}_${key}`
        switch(mode){
            case ParseMode.help : return `h_${key}`;
            //... add more case here if needed
            default : return key;
        }
    }

    isCurrentLanguageHasKey(id : number, type : SymbolType){
        return this.getLocalizedXML(id, type) !== undefined
    }

    private getLocalizedXML(KeyOrID : string | number, type : SymbolType, mode : ParseMode = ParseMode.gameplay, lang? : LanguageID){
        let key : string | undefined;
        let map : Record<string, string> | undefined;

        const temp = this.localizationMap.get(lang ?? this.languageID)
        if(!temp) return;
        map = temp

        if(typeof KeyOrID === "number"){
            const id = KeyOrID
            key = RegistryTranslator[type].getKey(id as any)
        } else key = KeyOrID;
        
        if(!key) return;
        if(!map) return;
        key = this.parseKey(key, type, mode)
        return map[key]
    }

    localizeStandaloneXML(s : string, input : (number | string)[], mode = ParseMode.gameplay){
        if(!this.loaded) return;
        const o = new ParseOptions(mode, input)
        return this.parser.parse(s, o)
    }

    private parseLocalizeSymbol(XML : string | undefined, mode : ParseMode = ParseMode.gameplay, c? : Card, e? : Effect, ){
        if(XML === undefined) return [
            new DisplayComponent(ComponentID.error, "Unknown symbol")
        ];
        const i = (e && c) ? e.getDisplayInput(c, this.boundSystem) : []
        const o = new ParseOptions(mode, i, c)
        const ret = this.parser.parse(XML, o)

        let addSpaceStart = false
        let addSpaceEnd = false
        ret.forEach((k, index) => {
            addSpaceEnd = ret[index + 1] !== undefined && !ret[index + 1].is(ComponentID.text)
            if(k.is(ComponentID.text)){
                k.str = k.str.trim()
                if(addSpaceStart) k.str = " " + k.str
                if(addSpaceEnd) k.str += " "
            } else addSpaceStart = true
        })

        return ret
    }
  
    getAndParseLocalizedSymbol(
        keyOrID : string | number,
        type : SymbolType,
        mode : ParseMode = ParseMode.gameplay, 
        c? : Card, e? : Effect, 
    ) : DisplayComponent[] | undefined {
        if(!this.loaded) return;
        const XML = this.getLocalizedXML(keyOrID, type)
        if(!XML) return;
        return this.parseLocalizeSymbol(XML, mode, c, e)
    }


    localizeEffect(e? : Effect, mode : ParseMode = ParseMode.gameplay, c? : Card) : LocalizedEffect | undefined {
        if(!this.loaded) return;
        if(!e) return;

        return new LocalizedEffect(
            e.id,
            this.getAndParseLocalizedSymbol(e.displayID, "effect", mode, c, e)!,
            this.getAndParseLocalizedSymbol(e.type.dataID, "effectType", mode, c, e)!,
            e.subTypes.map(st => this.getAndParseLocalizedSymbol(st.dataID, "effectSubtype", mode, c, e)!),
            this.getAndParseLocalizedSymbol(e.type.dataID, "effectType", ParseMode.help, c, e),
            e.subTypes.map(st => this.getAndParseLocalizedSymbol(st.dataID, "effectSubtype", ParseMode.help, c, e))
        )
    }

    localizeCard(c? : Card, mode : ParseMode = ParseMode.gameplay) : LocalizedCard | undefined {
        if(!this.loaded) return;
        if(!c) return;
        const eArr1 = c.effects.map(
            e => this.localizeEffect(e, mode, c)!
        )
        const eArr2 = c.statusEffects.map(
            e => this.localizeEffect(e, mode, c)!
        )

        const testObj = new LocalizedCard(
            c.id,
            this.getAndParseLocalizedSymbol(c.dataID, "card", mode, c)!,
            c.extensionArr.map(ex => this.getAndParseLocalizedSymbol(ex, "extension", mode, c)!),
            eArr1, eArr2,
            c.pos.zoneID,
            c.pos.flat().map(c => c),
            c.atk,
            c.hp,
            c.maxAtk,
            c.maxHp,
            c.level,
            c.rarityID,
            this.getAndParseLocalizedSymbol(RarityRegistry.getKey(c.rarityID), "rarity",mode, c)!,
            c.archtype,
            c.archtype.map(a => this.getAndParseLocalizedSymbol(a, "archtype", mode, c)!),
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeZone(z? : Zone, mode : ParseMode = ParseMode.gameplay) : LocalizedZone | undefined {
        if(!this.loaded) return undefined;
        if(!z) return;

        const testObj = new LocalizedZone(
            z.id,
            z.playerIndex,
            z.types as any,
            z.types.map((t: any) => this.getAndParseLocalizedSymbol(t, "zone", mode)!),
            z.cardArr.map((c: any) => c ? this.localizeCard(c) : c),
            z.boundX,
            z.boundY
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizePlayer(stat : PlayerStat, mode : ParseMode = ParseMode.gameplay){
        const deckData = DeckDataRegistry.get(stat.deck)
        return new LocalizedPlayer(
            stat.playerIndex, 
            stat.playerType, 
            stat.heart, 
            stat.maxHeart,
            this.getAndParseLocalizedSymbol(deckData.operator, "operator", mode)!,
            this.getAndParseLocalizedSymbol(stat.deck ?? "null_deck", "deck", mode)!,
            deckData.img ? CardDataRegistry.getData(deckData.img, CardDataRegistry.getBaseKey()).imgURL : undefined
        )
    }

    localizeSystem(s? : QueenSystem, mode : ParseMode = ParseMode.gameplay){
        if(!this.loaded) return undefined;
        if(!s) return;

        // this.__s = s
        const testObj = new LocalizedSystem(
            s.playerData.map(
                player => this.localizePlayer(player, mode)
            ),
            s.zoneArr.map((z: any) => this.localizeZone(z, mode)!),
            s.turnAction ? new LocalizedAction(
                s.turnAction.id,
                this.getAndParseLocalizedSymbol(s.turnAction.type, "action", mode)!,
            ) : new LocalizedAction(
                -1,
                this.getAndParseLocalizedSymbol("null", "action", mode)!,
            ),
            s.phaseIdx,
            s.turnCount,
            s.waveCount
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeCardFromKey(s : QueenSystem | undefined, c_key : CardDataID, variants : string[] = [], mode : ParseMode = ParseMode.gameplay){
        if(!this.loaded) return undefined;
        if(!s) return;

        const card = s.cardLoader.getCard(c_key, s.setting, variants)
        return this.localizeCard(card, mode)
    }

    get isLoaded(){
        return this.loaded
    }
}