"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// import type { Setting } from "../../types/abstract/gameComponents/settings";
const deckRegistry_1 = require("../../data/deckRegistry");
const operatorRegistry_1 = require("../../data/operatorRegistry");
const rarityRegistry_1 = require("../../data/rarityRegistry");
const zoneRegistry_1 = require("../../data/zoneRegistry");
const effectTextParser_1 = __importStar(require("../../effectTextParser"));
const parser_1 = require("../../types/abstract/parser");
const Localized_1 = require("../../types/abstract/serializedGameComponents/Localized");
class Localizer {
    get languageID() { return this.loader.currentLanguageID; }
    get languageStr() { return this.loader.currentLanguageStr; }
    get currLanguageData() { return this.loader.getSymbolMap(); }
    constructor(s, regs) {
        this.parser = new effectTextParser_1.default();
        this.loaded = false;
        this.__s = s;
        this.loader = regs.localizationLoader;
    }
    load(l) {
        return __awaiter(this, void 0, void 0, function* () {
            this.loaded = false;
            yield this.loader.load();
            yield this.parser.load(l);
            this.loaded = true;
        });
    }
    getLocalizedSymbol(s) {
        if (!this.loaded)
            return;
        if (!this.currLanguageData)
            return;
        return this.currLanguageData[s];
    }
    getAndParseLocalizedSymbol(s, mode = parser_1.parseMode.gameplay, card, pid = 0) {
        if (!this.loaded)
            return;
        const res = this.getLocalizedSymbol(s);
        if (res === undefined)
            return [
                new parser_1.textComponent(s, `Unknown key`)
            ];
        const o = new effectTextParser_1.parseOptions(mode, card ? card.getPartitionDisplayInputs(this.__s, pid) : [], true, card);
        return this.parser.parse(res, o);
    }
    localizeCard(c, mode = parser_1.parseMode.gameplay) {
        if (!this.loaded)
            return;
        const eArr = c.getAllDisplayEffects().map(p => new Localized_1.Localized_effect(p.pid, this.getAndParseLocalizedSymbol(p.key, mode, c, p.pid), this.getAndParseLocalizedSymbol(p.type, mode, c, p.pid), p.subtypes.map(st => this.getAndParseLocalizedSymbol(st, mode, c, p.pid))));
        const eArr1 = [];
        const eArr2 = [];
        for (const p of eArr) {
            if (c.isStatusPartition(p.id))
                eArr2.push(p);
            else
                eArr1.push(p);
        }
        const testObj = new Localized_1.Localized_card(c.id, this.getAndParseLocalizedSymbol(c.dataID, mode, c), c.extensionArr.map(ex => this.getAndParseLocalizedSymbol("ex_" + ex, mode, c)), eArr1, eArr2, c.pos.zoneID, c.pos.flat().map(c => c), c.atk, c.hp, c.maxAtk, c.maxHp, c.level, this.getAndParseLocalizedSymbol(rarityRegistry_1.rarityRegistry[c.rarityID], mode, c), c.belongTo.map(a => this.getAndParseLocalizedSymbol("a_" + a, mode, c)));
        if (Object.values(testObj).some(v => v === undefined))
            return undefined;
        return testObj;
    }
    localizeZone(z, mode = parser_1.parseMode.gameplay) {
        if (!this.loaded)
            return undefined;
        const testObj = new Localized_1.Localized_zone(z.id, z.playerIndex, this.getAndParseLocalizedSymbol(zoneRegistry_1.playerTypeID[z.playerType], mode), this.getAndParseLocalizedSymbol(z.classID, mode), z.cardArr.map(c => c ? this.localizeCard(c) : c), z.shape.map(c => c));
        if (Object.values(testObj).some(v => v === undefined))
            return undefined;
        return testObj;
    }
    localizeSystem(s, mode = parser_1.parseMode.gameplay) {
        if (!this.loaded)
            return undefined;
        this.__s = s;
        const testObj = new Localized_1.Localized_system(s.player_stat.map(player => new Localized_1.Localized_player(player.playerIndex, this.getAndParseLocalizedSymbol(zoneRegistry_1.playerTypeID[player.playerType], mode), player.heart, player.maxHeart, this.getAndParseLocalizedSymbol(operatorRegistry_1.operatorRegistry[player.operator], mode), player.deck ? this.getAndParseLocalizedSymbol(deckRegistry_1.deckRegistry[player.deck], mode) : this.getAndParseLocalizedSymbol("d_null_deck", mode))), s.zoneArr.map(z => this.localizeZone(z, mode)), s.turnAction ? new Localized_1.Localized_action(s.turnAction.id, this.getAndParseLocalizedSymbol(s.turnAction.type, mode)) : new Localized_1.Localized_action(-1, this.getAndParseLocalizedSymbol("a_null", mode)), s.phaseIdx, s.turnCount, s.waveCount);
        if (Object.values(testObj).some(v => v === undefined))
            return undefined;
        return testObj;
    }
    get isLoaded() {
        return this.loaded;
    }
}
exports.default = Localizer;
