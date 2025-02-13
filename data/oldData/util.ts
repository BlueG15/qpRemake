import { EventEmitter } from "events";
import { Deck, DeckData, LootSet, getCard } from "./cards";
import charactersData from "./characters";
import { DropType, checkForDropCode } from "./drops";
import filterType from "./filterType";

const deckChangesEmitter = new EventEmitter();

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

export function getDeckName(i?: number): string {
  if (!i) i = Math.round(Math.random() * (deckTitle.length + 20));

  return deckTitle[i] ?? "Deck #" + (i + 1);
}

export function getGeneration(i: number) {
  i = Math.max(1, i);

  if (i > 3 && i < 21) {
    return i + "th Generation";
  }

  const t = Number(String(i).split("").pop());

  return (
    i +
    (["st Generation", "nd Generation", "rd Generation"][t - 1] ??
      "th Generation")
  );
}

export function delayMs(t: number): Promise<boolean> {
  return new Promise((resolve, _) => setTimeout(() => resolve(true), t));
}

export function saveDeck(
  code: string,
  override: boolean,
  data: DeckData
): "deck-exist" | "200" {
  const { localStorage } = window;

  const deckDataList = checkForPlaceToStoreDeckData();

  const oldItem = deckDataList[code];
  if (oldItem && !override) return "deck-exist";

  deckDataList[code] = data;

  localStorage.setItem("deck-data-list", JSON.stringify(deckDataList, null, 0));
  emitDeckListChanges("new");
  return "200";
}

export function getAllDeckAsArray(): DeckData[] {
  return Object.values(checkForPlaceToStoreDeckData());
}

export function getAllDeck(): { [n: string]: DeckData } {
  return { ...checkForPlaceToStoreDeckData() };
}

export function getSavedDeckCount() {
  return Object.keys(checkForPlaceToStoreDeckData()).length;
}

export function checkForPlaceToStoreDeckData() {
  const decksRawData = localStorage.getItem("deck-data-list");
  const deckDataList = JSON.parse(decksRawData ?? "null");

  if (!deckDataList || typeof deckDataList !== "object") {
    localStorage.setItem("deck-data-list", "{}");
    return {};
  }

  return deckDataList;
}

export function checkForCorruptedDeckData() {
  const data = getAllDeck();
  const keys = Object.keys(data);
  let count = 0;

  for (let i = 0; i < keys.length; i++) {
    let survive = true;

    if (typeof data[keys[i]] !== "object") return removeDeckData(keys[i]);

    const { deckName, deckCode, deckId, deckImg, deckTag, lootSets } =
      data[keys[i]];

    if (typeof deckName !== "string") survive = false;
    if (typeof deckCode !== "string") survive = false;
    if (typeof deckImg !== "string") survive = false;

    if (deckImg.startsWith("https://")) {
      data[keys[i]].deckImg = deckImg.split("/")[5];
    }

    if (typeof deckTag !== "string") survive = false;
    if (typeof deckId !== "string") survive = false;

    let newCode = keys[i];
    if (!deckCode.startsWith("L0CAL")) {
      newCode = generateString(20);
      data[newCode] = { ...data[deckCode] };
      data[newCode].deckCode = newCode;
      delete data[keys[i]];
    }

    if (!lootSets) {
      data[newCode].lootSets = [];
    }

    const filteredLootSet: (LootSet | 0)[] = lootSets.map((a) => {
      const validCodeName = checkForDropCode(a.setName);

      if (!validCodeName) return 0;

      return {
        setName: validCodeName,
        weight: 1,
      };
    });

    data[newCode].lootSets = filteredLootSet.filter(
      (a) => a !== 0
    ) as LootSet[];

    if (!survive) {
      removeDeckData(keys[i]);
      count++;
    }
  }

  localStorage.setItem("deck-data-list", JSON.stringify(data, null, 0));
}

export function removeDeckData(i: string) {
  const data = checkForPlaceToStoreDeckData();

  try {
    delete data[i];
    localStorage.setItem("deck-data-list", JSON.stringify(data, null, 0));

    emitDeckListChanges("delete");

    return true;
  } catch {
    return false;
  }
}

export const getDeckMaxCardCount = () => 200;

export function getDeckData(i: string): DeckData | null {
  const deckDataList = checkForPlaceToStoreDeckData();
  return deckDataList[i];
}

export function changeDeckName(i: string, nName: string) {
  const deck = getDeckData(i);
  if (!deck) return false;

  deck.deckName = nName;
  saveDeck(i, true, deck);

  emitDeckListChanges("name-change");
  return true;
}

export function changeDeckAvatar(i: string, code: string) {
  const deck = getDeckData(i);
  if (!deck) return false;

  deck.deckImg = code;
  saveDeck(i, true, deck);

  emitDeckListChanges("avatar-change");
  return true;
}

export function saveDeckAndStorage(
  i: string,
  deck: DeckData["deck"],
  storage: DeckData["storage"],
  drop: string[] = [],
  imgID?: string
) {
  const deckData = getDeckData(i);

  if (!deckData) return false;

  deckData.deck = deck;
  deckData.storage = storage;
  deckData.lootSets = drop.map((a) => ({ setName: a, weight: 1 }));
  deckData.deckImg = deckData.deckImg || imgID || "novaConvergence";

  saveDeck(i, true, deckData);
  return true;
}

export function listenDeckListChange(func: (eventCode: string) => void) {
  deckChangesEmitter.addListener("deck-list-change", func);
}

export function unlistenDeckListChange(func: (eventCode: string) => void) {
  deckChangesEmitter.removeListener("deck-list-change", func);
}

function emitDeckListChanges(type: string = "any") {
  deckChangesEmitter.emit("deck-list-change", type);
}

export function getDeckFromPathName(path: string) {
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

export function getCharacterAvatar(
  char: keyof typeof characterAvatars | string
) {
  const characters = Object.keys(charactersData);
  if (!characters.includes(char)) char = characters[0];

  return (
    window.location.origin +
    "/smol/" +
    characterAvatars[char as keyof typeof characterAvatars]
  );
}

export function getCharacter(char: string) {
  const characters = Object.keys(charactersData);
  if (!characters.includes(char)) char = characters[0];

  return {
    ...charactersData[char as keyof typeof charactersData],
    avatarUrl: getCharacterAvatar(char),
  };
}

export function addCardTo(
  type: "deck" | "storage",
  i: string,
  cardId: string,
  upgraded: boolean
) {
  const deckData = getDeckData(i);
  if (!deckData) return "Deck doesn't exist";

  const card = getCard(cardId);
  if (!card) return "Card doesn't exist";

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

export function addCompiledCodeToDeck(local: string, compiled: string) {
  const deck = getDeckData(local);
  if (!deck) return false;

  deck.compiledDeckCode = compiled;

  saveDeck(local, true, deck);
  return true;
}

export function generateString(n: number) {
  const c = "ABCDEFGIKLMNOPQRSTUVWXYZ0123456789";

  let res = "L0CAL";
  for (let i = 0; i < n - 5; i++) {
    res += c[Math.round(Math.random() * (c.length - 1))];
  }

  return res;
}

export function retrievePastFilterAndGroup() {
  const validFilter = Object.keys(filterType);

  const prevFilter = localStorage.getItem("catalog-filter") ?? validFilter[0];
  const prevGroup = localStorage.getItem("catalog-group") ?? "";

  const fFilter = validFilter.includes(prevFilter)
    ? prevFilter
    : validFilter[0];
  const validGroup = filterType[fFilter].groups;

  const fGroup = validGroup.map((a) => a.id).includes(prevGroup)
    ? prevGroup
    : validGroup[0]?.id ?? "";

  return [
    fFilter,
    fGroup,
    //fFilter === "active" ? prevGroup : fGroup
  ];
}

export function convertBaseToPage(b: Deck[]) {
  return b.map((a) => ({
    count: 1,
    cardTag: a.cardTag,
    upgraded: a.upgradeLevel ? true : false,
  }));
}

export async function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error("Unable to copy text to clipboard", err);
  }
}

listenDeckListChange(checkForCorruptedDeckData);
