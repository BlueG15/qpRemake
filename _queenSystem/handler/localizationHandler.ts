// import type { Setting } from "../../types/abstract/gameComponents/settings";
import { deckRegistry } from "../../data/deckRegistry";
import { operatorRegistry } from "../../data/operatorRegistry";
import { rarityRegistry } from "../../data/rarityRegistry";
import { playerTypeID, zoneRegistry } from "../../data/zoneRegistry";
import Parser, { loadOptions, parseOptions } from "../../effectTextParser";
import Card from "../../types/gameComponents/card";
import type Zone from "../../types/gameComponents/zone";
import type QueenSystem from "../queenSystem";
import type { dry_system, player_stat } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";

import { parseMode, DisplayComponent, TextComponent } from "../../types/parser";
import { LocalizedCard, LocalizedAction, LocalizedEffect, LocalizedPlayer, LocalizedSystem, LocalizedZone } from "../../types/serializedGameComponents/Localized";
import localizationLoader from "../loader/loader_localization";
import registryHandler from "./registryHandler";

export default class Localizer {
    private loader : localizationLoader
    private parser = new Parser()
    private loaded = false
    private boundSystem : dry_system
    get languageID() {return this.loader.currentLanguageID}
    get languageStr() {return this.loader.currentLanguageStr}
    get currLanguageData() {return this.loader.getSymbolMap()}
    
    constructor(s : dry_system, regs : registryHandler){
        this.boundSystem = s
        this.loader = regs.localizationLoader
    }

    async load(l : loadOptions) : Promise<void> {
        this.loaded = false
        await this.loader.load();
        await this.parser.load(l)
        this.loaded = true
    }

    localizeStandaloneString(s : string, input : (number | string)[]){
        if(!this.loaded) return;
        const o = new parseOptions(parseMode.gameplay, input, true)
        return this.parser.parse(s, o) as DisplayComponent[]
    }

    getLocalizedSymbol(s : string) : string | undefined {
        if(!this.loaded) return;
        if(!this.currLanguageData) return;
        return this.currLanguageData[s];
    }

    getAndParseLocalizedSymbol(
        s : string,
        mode : parseMode = parseMode.gameplay, 
        c? : Card, e? : Effect, 
    ){
        if(!this.loaded) return;
        const res = this.getLocalizedSymbol(s)
        if(res === undefined) return [
            new TextComponent(s, `Unknown key`)
        ];
        const i = (e && c) ? e.getDisplayInput(c, this.boundSystem) : []
        const o = new parseOptions(mode, i, true, c)
        const ret = this.parser.parse(res, o) as DisplayComponent[]

        let addSpaceStart = false
        let addSpaceEnd = false
        ret.forEach((k, index) => {
            addSpaceEnd = ret[index + 1] !== undefined && !ret[index + 1].is("text")
            if(k.is("text")){
                k.str = k.str.trim()
                if(addSpaceStart) k.str = " " + k.str
                if(addSpaceEnd) k.str += " "
            } else addSpaceStart = true
        })

        return ret
    }

    localizeCard(c? : Card, mode : parseMode = parseMode.gameplay) : LocalizedCard | undefined {
        if(!this.loaded) return;
        if(!c) return;
        const eArr1 = c.effects.map(
            e =>new LocalizedEffect(
                e.id,
                this.getAndParseLocalizedSymbol("e_" + e.displayID, mode, c, e)!,
                this.getAndParseLocalizedSymbol("e_t_" + e.type, mode, c, e)!,
                e.subTypes.map(st => this.getAndParseLocalizedSymbol("e_st_" + st.dataID, mode, c, e)!),
                this.getAndParseLocalizedSymbol("e_t_" + e.type + "_desc", mode, c, e),
                e.subTypes.map(st => this.getAndParseLocalizedSymbol("e_st_" + st + "_desc", mode, c, e))
            )
        )
        const eArr2 = c.statusEffects.map(
            e =>new LocalizedEffect(
                e.id,
                this.getAndParseLocalizedSymbol("e_" + e.displayID, mode, c, e)!,
                this.getAndParseLocalizedSymbol("e_t_" + e.type, mode, c, e)!,
                e.subTypes.map(st => this.getAndParseLocalizedSymbol("e_st_" + st.dataID, mode, c, e)!),
                this.getAndParseLocalizedSymbol("e_t_" + e.type + "_desc", mode, c, e),
                e.subTypes.map(st => this.getAndParseLocalizedSymbol("e_st_" + st + "_desc", mode, c, e))
            )
        )

        const testObj = new LocalizedCard(
            c.id,
            this.getAndParseLocalizedSymbol("c_" + c.dataID, mode, c)!,
            c.extensionArr.map(ex => this.getAndParseLocalizedSymbol("ex_" + ex, mode, c)!),
            eArr1, eArr2,
            c.pos.zoneID,
            c.pos.flat().map(c => c),
            c.atk,
            c.hp,
            c.maxAtk,
            c.maxHp,
            c.level,
            c.rarityID,
            this.getAndParseLocalizedSymbol(rarityRegistry[c.rarityID], mode, c)!,
            c.belongTo.map(a => this.getAndParseLocalizedSymbol("a_" + a, mode, c)!)
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeZone(z? : Zone, mode : parseMode = parseMode.gameplay) : LocalizedZone | undefined {
        if(!this.loaded) return undefined;
        if(!z) return;

        const testObj = new LocalizedZone(
            z.id,
            z.playerIndex,
            z.types as any,
            z.types.map(t => this.getAndParseLocalizedSymbol("z_t_" + zoneRegistry[t], mode)!),
            this.getAndParseLocalizedSymbol("z_" + z.classID, mode)!,
            z.cardArr.map(c => c ? this.localizeCard(c) : c),
            z.boundX,
            z.boundY
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizePlayer(player : player_stat, mode : parseMode = parseMode.gameplay){
        return new LocalizedPlayer(
                    player.playerIndex, 
                    player.playerType,
                    this.getAndParseLocalizedSymbol(playerTypeID[player.playerType], mode)!, 
                    player.heart, 
                    player.maxHeart,
                    this.getAndParseLocalizedSymbol(operatorRegistry[player.operator], mode)!,
                    player.deck? this.getAndParseLocalizedSymbol(deckRegistry[player.deck], mode)! : this.getAndParseLocalizedSymbol("d_null_deck", mode)!
                )
    }

    localizeSystem(s? : QueenSystem, mode : parseMode = parseMode.gameplay){
        if(!this.loaded) return undefined;
        if(!s) return;

        // this.__s = s
        const testObj = new LocalizedSystem(
            s.player_stat.map(
                player => this.localizePlayer(player, mode)
            ),
            s.zoneArr.map(z => this.localizeZone(z, mode)!),
            s.turnAction ? new LocalizedAction(
                s.turnAction.id,
                this.getAndParseLocalizedSymbol(s.turnAction.type, mode)!,
            ) : new LocalizedAction(
                -1,
                this.getAndParseLocalizedSymbol("a_null", mode)!,
            ),
            s.phaseIdx,
            s.turnCount,
            s.waveCount
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeCardFromKey(s : QueenSystem | undefined, c_key : string, variants : string[] = [], mode : parseMode = parseMode.gameplay){
        if(!this.loaded) return undefined;
        if(!s) return;

        const card = s.cardHandler.getCard(c_key, variants)
        return this.localizeCard(card)
    }
    get isLoaded(){
        return this.loaded
    }
}
