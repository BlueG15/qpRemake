"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qpFieldModule = void 0;
const zoneRegistry_1 = require("../../../../data/zoneRegistry");
const menuModule_1 = require("./menuModule");
const chalk_1 = __importDefault(require("chalk"));
class qpFieldModule extends menuModule_1.TerminalMenuModule {
    constructor(s) {
        super([]);
        this.s = s;
        this.tiles = [];
        this.commands = [
            "View player info"
        ];
        this.currX = 0;
        this.currY = 0;
        this.currFieldIndex = 0;
        this.choices = this.commands;
    }
    stringifyLocalizedString(str) {
        return str.map(s => s.is("text") ? "[" + s.sectionIDs.join("_") + "] " + s.str : s.raw).join("");
    }
    log() {
        if (!this.terminalPtr)
            return;
        this.terminalPtr.clear();
        let currentCard;
        let currentTile = "";
        let currentChoices = [];
        //draw the field
        const players = this.s.player_stat;
        players.forEach((p) => {
            var _a, _b, _c;
            const zones = this.s.getAllZonesOfPlayer(p.playerIndex);
            let field = (_a = zones[zoneRegistry_1.zoneRegistry.z_field]) !== null && _a !== void 0 ? _a : [];
            let deck = (_b = zones[zoneRegistry_1.zoneRegistry.z_deck]) !== null && _b !== void 0 ? _b : [];
            let grave = (_c = zones[zoneRegistry_1.zoneRegistry.z_grave]) !== null && _c !== void 0 ? _c : [];
            let totalFieldHeight = 0;
            if (p.playerType === zoneRegistry_1.playerTypeID.enemy) {
                field = field.reverse();
            }
            this.tiles = [];
            field.forEach(f => {
                const dim0 = f.shape[0];
                const dim1 = f.shape[1];
                if (dim0 <= 0 || dim1 <= 0)
                    return;
                const specificTiles = [];
                for (let y = 0; y < dim1; y++) {
                    const res = ["[>]", " ", " "];
                    const beginLen = res.length;
                    const checkX = this.currX - beginLen;
                    const checkY = this.currY - totalFieldHeight;
                    for (let x = 0; x < dim0; x++) {
                        const temp_c = f.cardArr[Utils.positionToIndex([x, y], f.shape)];
                        let temp = temp_c ? "[c]" : "[ ]";
                        if (x === checkX && y === checkY) {
                            currentCard = f.cardArr[x];
                            temp = chalk_1.default.green(temp);
                        }
                        res.push(temp);
                        res.push(" ");
                    }
                    if (y === 0) {
                        const addedDecks = new Array(deck.length).fill("[d]").join(" ");
                        res.push(" ");
                        res.push(addedDecks);
                    }
                    if ((y === 1 && dim1 > 1) || (y === 0 && dim1 <= 1)) {
                        const addedGraves = new Array(grave.length).fill("[g]").join(" ");
                        res.push(" ");
                        res.push(addedGraves);
                    }
                    p.playerType === zoneRegistry_1.playerTypeID.enemy ?
                        specificTiles.unshift(res) :
                        specificTiles.push(res);
                }
                this.tiles.concat(specificTiles);
                totalFieldHeight += dim1;
            });
            this.tiles.forEach(line => {
                this.terminalPtr.log(...line);
            });
        });
        try {
            currentTile = this.tiles[this.currY][this.currX][1];
        }
        catch (e) { }
        //draw the card Info
        if (currentCard) {
            const localizedCard = this.s.localizer.localizeCard(currentCard);
            if (localizedCard) {
                this.terminalPtr.log(this.stringifyLocalizedString(localizedCard.name) + "." +
                    localizedCard.extensions.map(ex => this.stringifyLocalizedString(ex)).join('.'));
                this.terminalPtr.log("atk:", localizedCard.atk, "/", localizedCard.maxAtk);
                this.terminalPtr.log("hp:", localizedCard.hp, "/", localizedCard.maxHp);
                this.terminalPtr.log("level:", localizedCard.level);
                this.terminalPtr.log("rarity:", this.stringifyLocalizedString(localizedCard.rarity));
                localizedCard.effects.forEach(e => this.terminalPtr.log("[" + this.stringifyLocalizedString(e.type) + "]" +
                    "[" + e.subtypes.map(st => this.stringifyLocalizedString(st)).join(", ") + "]" +
                    this.stringifyLocalizedString(e.text)));
                if (localizedCard.statusEffects)
                    localizedCard.statusEffects.forEach(e => this.terminalPtr.log("[" + this.stringifyLocalizedString(e.type) + "]" +
                        "[" + e.subtypes.map(st => this.stringifyLocalizedString(st)).join(", ") + "]" +
                        this.stringifyLocalizedString(e.text)));
                else
                    this.terminalPtr.log("<No status effects>");
            }
            else
                this.terminalPtr.log("<No card selected>");
        }
        //draw the tiles's stuff
        switch (currentTile) {
            case "g": {
                currentChoices.push("View detailed GY's content");
                break;
            }
            case ">": {
                currentChoices.push("Execute this row");
                break;
            }
        }
        //draw choices
        this.choices = currentChoices.concat(this.commands);
        this.branchToTargets = this.choices; //wont work but this hack prints what choice is selected
        if (this.terminalPtr.ignoreClear)
            this.terminalPtr.ignoreClear();
        super.log();
    }
    updateChoice(data) {
        switch (data) {
            case 0: {
                if (this.currChoice === 0) {
                    this.currY--;
                    this.___i = -1;
                    if (this.currY < 0)
                        this.currY = 0;
                }
                else {
                    this.currChoice--;
                }
                break;
            }
            case 1: {
                if (this.___i === -1) {
                    this.currX--;
                    if (this.currX < 0)
                        this.currX = 0;
                }
                break;
            }
            case 2: {
                this.currY++;
                if (this.tiles[this.currY + 1] === undefined) {
                    this.currChoice++;
                }
                break;
            }
            case 3: {
                if (this.___i === -1) {
                    this.currX++;
                    if (this.currX >= 5)
                        this.currX = 0;
                }
                break;
            }
        }
    }
}
exports.qpFieldModule = qpFieldModule;
