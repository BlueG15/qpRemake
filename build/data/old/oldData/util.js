"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeckMaxCardCount = void 0;
exports.getDeckName = getDeckName;
exports.getGeneration = getGeneration;
exports.delayMs = delayMs;
exports.saveDeck = saveDeck;
exports.getAllDeckAsArray = getAllDeckAsArray;
exports.getAllDeck = getAllDeck;
exports.getSavedDeckCount = getSavedDeckCount;
exports.checkForPlaceToStoreDeckData = checkForPlaceToStoreDeckData;
exports.checkForCorruptedDeckData = checkForCorruptedDeckData;
exports.removeDeckData = removeDeckData;
exports.getDeckData = getDeckData;
exports.changeDeckName = changeDeckName;
exports.changeDeckAvatar = changeDeckAvatar;
exports.saveDeckAndStorage = saveDeckAndStorage;
exports.listenDeckListChange = listenDeckListChange;
exports.unlistenDeckListChange = unlistenDeckListChange;
exports.getDeckFromPathName = getDeckFromPathName;
exports.getCharacterAvatar = getCharacterAvatar;
exports.getCharacter = getCharacter;
exports.addCardTo = addCardTo;
exports.addCompiledCodeToDeck = addCompiledCodeToDeck;
exports.generateString = generateString;
exports.retrievePastFilterAndGroup = retrievePastFilterAndGroup;
exports.convertBaseToPage = convertBaseToPage;
exports.copyToClipboard = copyToClipboard;
const events_1 = require("events");
const cards_1 = require("./cards");
const characters_1 = __importDefault(require("./characters"));
const drops_1 = require("./drops");
const filterType_1 = __importDefault(require("./filterType"));
const deckChangesEmitter = new events_1.EventEmitter();
const deckTitle = [
    "My first deck",
    "My second deck",
    "My third deck",
    "My fourth deck",
    "Burger whooper",
    "Sandvich",
    "We've got company",
    "Logitech G102",
    "Venti Latte Pumkin Spice",
    "Imported deck",
    "C0ol deck",
    "Wow, nice name",
    "This is very nice",
    "Hamburger",
    "The hell is this",
    "Hohohohoh",
    "Merry Christmas",
    "Happy New Year",
    "Let's go to the zoo",
];
function getDeckName(i) {
    var _a;
    if (!i)
        i = Math.round(Math.random() * (deckTitle.length + 20));
    return (_a = deckTitle[i]) !== null && _a !== void 0 ? _a : "Deck #" + (i + 1);
}
function getGeneration(i) {
    var _a;
    i = Math.max(1, i);
    if (i > 3 && i < 21) {
        return i + "th Generation";
    }
    const t = Number(String(i).split("").pop());
    return (i +
        ((_a = ["st Generation", "nd Generation", "rd Generation"][t - 1]) !== null && _a !== void 0 ? _a : "th Generation"));
}
function delayMs(t) {
    return new Promise((resolve, _) => setTimeout(() => resolve(true), t));
}
function saveDeck(code, override, data) {
    const { localStorage } = window;
    const deckDataList = checkForPlaceToStoreDeckData();
    const oldItem = deckDataList[code];
    if (oldItem && !override)
        return "deck-exist";
    deckDataList[code] = data;
    localStorage.setItem("deck-data-list", JSON.stringify(deckDataList, null, 0));
    emitDeckListChanges("new");
    return "200";
}
function getAllDeckAsArray() {
    return Object.values(checkForPlaceToStoreDeckData());
}
function getAllDeck() {
    return Object.assign({}, checkForPlaceToStoreDeckData());
}
function getSavedDeckCount() {
    return Object.keys(checkForPlaceToStoreDeckData()).length;
}
function checkForPlaceToStoreDeckData() {
    const decksRawData = localStorage.getItem("deck-data-list");
    const deckDataList = JSON.parse(decksRawData !== null && decksRawData !== void 0 ? decksRawData : "null");
    if (!deckDataList || typeof deckDataList !== "object") {
        localStorage.setItem("deck-data-list", "{}");
        return {};
    }
    return deckDataList;
}
function checkForCorruptedDeckData() {
    const data = getAllDeck();
    const keys = Object.keys(data);
    let count = 0;
    for (let i = 0; i < keys.length; i++) {
        let survive = true;
        if (typeof data[keys[i]] !== "object")
            return removeDeckData(keys[i]);
        const { deckName, deckCode, deckId, deckImg, deckTag, lootSets } = data[keys[i]];
        if (typeof deckName !== "string")
            survive = false;
        if (typeof deckCode !== "string")
            survive = false;
        if (typeof deckImg !== "string")
            survive = false;
        if (deckImg.startsWith("https://")) {
            data[keys[i]].deckImg = deckImg.split("/")[5];
        }
        if (typeof deckTag !== "string")
            survive = false;
        if (typeof deckId !== "string")
            survive = false;
        let newCode = keys[i];
        if (!deckCode.startsWith("L0CAL")) {
            newCode = generateString(20);
            data[newCode] = Object.assign({}, data[deckCode]);
            data[newCode].deckCode = newCode;
            delete data[keys[i]];
        }
        if (!lootSets) {
            data[newCode].lootSets = [];
        }
        const filteredLootSet = lootSets.map((a) => {
            const validCodeName = (0, drops_1.checkForDropCode)(a.setName);
            if (!validCodeName)
                return 0;
            return {
                setName: validCodeName,
                weight: 1,
            };
        });
        data[newCode].lootSets = filteredLootSet.filter((a) => a !== 0);
        if (!survive) {
            removeDeckData(keys[i]);
            count++;
        }
    }
    localStorage.setItem("deck-data-list", JSON.stringify(data, null, 0));
}
function removeDeckData(i) {
    const data = checkForPlaceToStoreDeckData();
    try {
        delete data[i];
        localStorage.setItem("deck-data-list", JSON.stringify(data, null, 0));
        emitDeckListChanges("delete");
        return true;
    }
    catch (_a) {
        return false;
    }
}
const getDeckMaxCardCount = () => 200;
exports.getDeckMaxCardCount = getDeckMaxCardCount;
function getDeckData(i) {
    const deckDataList = checkForPlaceToStoreDeckData();
    return deckDataList[i];
}
function changeDeckName(i, nName) {
    const deck = getDeckData(i);
    if (!deck)
        return false;
    deck.deckName = nName;
    saveDeck(i, true, deck);
    emitDeckListChanges("name-change");
    return true;
}
function changeDeckAvatar(i, code) {
    const deck = getDeckData(i);
    if (!deck)
        return false;
    deck.deckImg = code;
    saveDeck(i, true, deck);
    emitDeckListChanges("avatar-change");
    return true;
}
function saveDeckAndStorage(i, deck, storage, drop = [], imgID) {
    const deckData = getDeckData(i);
    if (!deckData)
        return false;
    deckData.deck = deck;
    deckData.storage = storage;
    deckData.lootSets = drop.map((a) => ({ setName: a, weight: 1 }));
    deckData.deckImg = deckData.deckImg || imgID || "novaConvergence";
    saveDeck(i, true, deckData);
    return true;
}
function listenDeckListChange(func) {
    deckChangesEmitter.addListener("deck-list-change", func);
}
function unlistenDeckListChange(func) {
    deckChangesEmitter.removeListener("deck-list-change", func);
}
function emitDeckListChanges(type = "any") {
    deckChangesEmitter.emit("deck-list-change", type);
}
function getDeckFromPathName(path) {
    const extract = path.split("/deck/")[1];
    return getDeckData(extract);
}
const characterAvatars = {
    esper: "smolesper.png",
    aurora: "smolaurora.png",
    idol: "smolidol.png",
    leo: "smolleo.png",
    dragoon: "smoldragoon.png",
    omega: "smolomega.png",
    queen: "smolqueen.png",
};
function getCharacterAvatar(char) {
    const characters = Object.keys(characters_1.default);
    if (!characters.includes(char))
        char = characters[0];
    return (window.location.origin +
        "/smol/" +
        characterAvatars[char]);
}
function getCharacter(char) {
    const characters = Object.keys(characters_1.default);
    if (!characters.includes(char))
        char = characters[0];
    return Object.assign(Object.assign({}, characters_1.default[char]), { avatarUrl: getCharacterAvatar(char) });
}
function addCardTo(type, i, cardId, upgraded) {
    const deckData = getDeckData(i);
    if (!deckData)
        return "Deck doesn't exist";
    const card = (0, cards_1.getCard)(cardId);
    if (!card)
        return "Card doesn't exist";
    deckData[type].push({
        cardTag: card.name.codeName,
        displayText: card.name.displayName,
        count: 1,
        upgradeLevel: upgraded ? 1 : 0,
    });
    alert(saveDeck(i, true, deckData));
    emitDeckListChanges("card-added");
    return "";
}
function addCompiledCodeToDeck(local, compiled) {
    const deck = getDeckData(local);
    if (!deck)
        return false;
    deck.compiledDeckCode = compiled;
    saveDeck(local, true, deck);
    return true;
}
function generateString(n) {
    const c = "ABCDEFGIKLMNOPQRSTUVWXYZ0123456789";
    let res = "L0CAL";
    for (let i = 0; i < n - 5; i++) {
        res += c[Math.round(Math.random() * (c.length - 1))];
    }
    return res;
}
function retrievePastFilterAndGroup() {
    var _a, _b, _c, _d;
    const validFilter = Object.keys(filterType_1.default);
    const prevFilter = (_a = localStorage.getItem("catalog-filter")) !== null && _a !== void 0 ? _a : validFilter[0];
    const prevGroup = (_b = localStorage.getItem("catalog-group")) !== null && _b !== void 0 ? _b : "";
    const fFilter = validFilter.includes(prevFilter)
        ? prevFilter
        : validFilter[0];
    const validGroup = filterType_1.default[fFilter].groups;
    const fGroup = validGroup.map((a) => a.id).includes(prevGroup)
        ? prevGroup
        : (_d = (_c = validGroup[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : "";
    return [
        fFilter,
        fGroup,
        //fFilter === "active" ? prevGroup : fGroup
    ];
}
function convertBaseToPage(b) {
    return b.map((a) => ({
        count: 1,
        cardTag: a.cardTag,
        upgraded: a.upgradeLevel ? true : false,
    }));
}
function copyToClipboard(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (navigator.clipboard) {
                yield navigator.clipboard.writeText(text);
            }
            else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
        }
        catch (err) {
            console.error("Unable to copy text to clipboard", err);
        }
    });
}
listenDeckListChange(checkForCorruptedDeckData);
