// import type { Setting } from "../../types/abstract/gameComponents/settings";
import { deckRegistry } from "../../data/deckRegistry";
import { operatorRegistry } from "../../data/operatorRegistry";
import { rarityRegistry } from "../../data/rarityRegistry";
import { playerTypeID } from "../../data/zoneRegistry";
import Parser, { loadOptions, parseOptions } from "../../effectTextParser";
import type Card from "../../types/abstract/gameComponents/card";
import type Zone from "../../types/abstract/gameComponents/zone";
import type queenSystem from "../queenSystem";
import type { dry_system } from "../../data/systemRegistry";

import { parseMode, component, textComponent } from "../../types/abstract/parser";
import { Localized_card, Localized_action, Localized_effect, Localized_player, Localized_system, Localized_zone } from "../../types/abstract/serializedGameComponents/Localized";
import localizationLoader from "../loader/loader_localization";
import registryHandler from "./registryHandler";

export default class Localizer {
    private loader : localizationLoader
    private parser = new Parser()
    private loaded = false
    private __s : dry_system
    get languageID() {return this.loader.currentLanguageID}
    get languageStr() {return this.loader.currentLanguageStr}
    get currLanguageData() {return this.loader.getSymbolMap()}
    
    constructor(s : dry_system, regs : registryHandler){
        this.__s = s
        this.loader = regs.localizationLoader
    }

    async load(l : loadOptions) : Promise<void> {
        this.loaded = false
        await this.loader.load();
        await this.parser.load(l)
        this.loaded = true
    }

    getLocalizedSymbol(s : string) : string | undefined {
        if(!this.loaded) return;
        if(!this.currLanguageData) return;
        return this.currLanguageData[s];
    }

    getAndParseLocalizedSymbol(
        s : string,
        mode : parseMode = parseMode.gameplay, 
        card? : Card, pid : number = 0, 
    ){
        if(!this.loaded) return;
        const res = this.getLocalizedSymbol(s)
        if(res === undefined) return [
            new textComponent(s, `Unknown key`)
        ];
        const o = new parseOptions(mode, card ? card.getPartitionDisplayInputs(this.__s, pid) : [], true, card)
        return this.parser.parse(res, o) as component[]
    }

    localizeCard(c : Card, mode : parseMode = parseMode.gameplay) : Localized_card | undefined {
        if(!this.loaded) return;
        const eArr = c.getAllDisplayEffects().map(
            p => new Localized_effect(
                p.pid,
                this.getAndParseLocalizedSymbol(p.key, mode, c, p.pid)!,
                this.getAndParseLocalizedSymbol(p.type, mode, c, p.pid)!,
                p.subtypes.map(st => this.getAndParseLocalizedSymbol(st, mode, c, p.pid)!)
            )
        )

        const eArr1 : typeof eArr = []
        const eArr2 : typeof eArr = []
        for(const p of eArr){
            if(c.isStatusPartition(p.id)) eArr2.push(p);
            else eArr1.push(p)
        }

        const testObj = new Localized_card(
            c.id,
            this.getAndParseLocalizedSymbol(c.dataID, mode, c)!,
            c.extensionArr.map(ex => this.getAndParseLocalizedSymbol("ex_" + ex, mode, c)!),
            eArr1, eArr2,
            c.pos.zoneID,
            c.pos.flat().map(c => c),
            c.atk,
            c.hp,
            c.maxAtk,
            c.maxHp,
            c.level,
            this.getAndParseLocalizedSymbol(rarityRegistry[c.rarityID], mode, c)!,
            c.belongTo.map(a => this.getAndParseLocalizedSymbol("a_" + a, mode, c)!)
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeZone(z : Zone, mode : parseMode = parseMode.gameplay) : Localized_zone | undefined {
        if(!this.loaded) return undefined;
        const testObj = new Localized_zone(
            z.id,
            z.playerIndex,
            this.getAndParseLocalizedSymbol(playerTypeID[z.playerType], mode)!,
            this.getAndParseLocalizedSymbol(z.classID, mode)!,
            z.cardArr.map(c => c ? this.localizeCard(c) : c),
            z.shape.map(c => c),
        )
        if( Object.values(testObj).some(v => v === undefined) ) return undefined;
        return testObj
    }

    localizeSystem(s : queenSystem, mode : parseMode = parseMode.gameplay){
        if(!this.loaded) return undefined;
        this.__s = s
        const testObj = new Localized_system(
            s.player_stat.map(
                player => new Localized_player(
                    player.playerIndex, 
                    this.getAndParseLocalizedSymbol(playerTypeID[player.playerType], mode)!, 
                    player.heart, 
                    player.maxHeart,
                    this.getAndParseLocalizedSymbol(operatorRegistry[player.operator], mode)!,
                    player.deck? this.getAndParseLocalizedSymbol(deckRegistry[player.deck], mode)! : this.getAndParseLocalizedSymbol("d_null_deck", mode)!
                )
            ),
            s.zoneArr.map(z => this.localizeZone(z, mode)!),
            s.turnAction ? new Localized_action(
                s.turnAction.id,
                this.getAndParseLocalizedSymbol(s.turnAction.type, mode)!,
            ) : new Localized_action(
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

    get isLoaded(){
        return this.loaded
    }
}
