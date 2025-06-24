import { CardData } from "./cards";
const serverOrigin = window.origin;

const getEffIco = (i: string) => serverOrigin + "/icons/" + i + ".png";

const getLvlIco = (i: string | number) =>
  `https://placehold.co/128/0000/FFF?text=${i}&font=Montserrat`;

enum FILTERTYPEOPTION {
  EFFECT = "effect",
  RARITY = "rarity",
  LEVEL = "level",
  DECK = "deck",
}

type GroupType = {
  id: string;
  name: string;
  imgUrl?: string;
  iconClass?: string;
  length: number | null;
};

type FilterInterface = {
  [n: string]: {
    groups: GroupType[];
    filterFunc: (card: CardData, id: string) => boolean;
    name?: string;
  };
};

export class CustomGroup {
  filters: { [n: string]: string[] };

  constructor(str: string = "undefined") {
    this.filters = {};

    const list = Object.keys(filterType).filter((a) => a !== "active");

    for (let i = 0; i < list.length; i++) {
      this.filters[list[i]] = [];
    }
    try {
      const obj = JSON.parse(str);
      if (typeof obj !== "object") {
        // console.log("Obj is not object");
        return;
      }

      Object.keys(obj).forEach((a) => {
        if (!this.filters[a]) {
          // console.log("Filter does not have type:", a);
          return;
        }
        if (!Array.isArray(obj[a])) {
          // console.log("Filter is not an array:", a);
          return;
        }

        for (let i = 0; i < obj[a].length; i++) {
          if (!filterType[a].groups.includes(obj[a][i])) {
            this.filters[a].push(obj[a][i]);
          }
        }
      });
    } catch (err) {
      // console.log(err);
    }
  }

  addToList(filter: string, group: string): string {
    if (this.filters[filter]) {
      if (!this.isActive(group)) this.filters[filter].push(group);
    }
    return this.getGroupString();
  }

  removeFromList(filter: string, group: string): string {
    if (this.filters[filter]) {
      if (this.isActive(group))
        this.filters[filter] = this.filters[filter].filter((a) => a !== group);
    }
    return this.getGroupString();
  }

  getGroupString(): string {
    return JSON.stringify(this.filters);
  }

  isActive(group: string) {
    const arr: string[] = [];
    return arr.concat(...Object.values(this.filters)).includes(group);
  }

  getActiveGroups(type: string) {
    return this.filters[type];
  }

  acceptAll(type?: string) {
    if (type && this.filters[type]) {
      this.filters[type] = Object.values(filterType[type].groups).map(
        (a) => a.id
      );
    } else {
      Object.keys(this.filters).forEach((a) => {
        this.filters[a] = Object.values(filterType[a].groups.map((i) => i.id));
      });
    }

    return this.getGroupString();
  }

  clearAll(type?: string) {
    if (type && this.filters[type]) {
      this.filters[type] = [];
    } else {
      Object.keys(this.filters).forEach((a) => {
        this.filters[a] = [];
      });
    }

    return this.getGroupString();
  }
}

const effectFilter = (card: CardData, id: string) => {
  if (id === "none") return card.effectCount === 0;

  const eff = card.effects.map((e) => e.effectType);
  const empty: string[] = [];
  const allFFS = empty.concat(...eff);

  return allFFS.includes(id);
};

const rarityFilter = (card: CardData, id: string) => {
  return card.rarity === id;
};

const levelFilter = (card: CardData, id: string) => {
  return id === "level-" + (card.level ?? 0);
};

const archtypeFilter = (card: CardData, id: string) => {
  return card.belongTo === id;
};

const upgradeabilityFilter = (card: CardData, id: string) => {
  if (id === "upgradable") {
    return card.isUpgradable;
  } else {
    return !card.isUpgradable;
  }
};

const func: { [n: string]: (card: CardData, id: string) => boolean } = {
  effect: effectFilter,
  rarity: rarityFilter,
  level: levelFilter,
  archtype: archtypeFilter,
  upgradeability: upgradeabilityFilter,
};

const filterType: FilterInterface = {
  active: {
    groups: [],
    name: "Custom",
    filterFunc: (card: CardData, id: string) => {
      if (id === "all") return true;
      const customGroup = new CustomGroup(id);

      const list = Object.keys(customGroup.filters);
      let acceptingLength = list.length;
      let passes = Array(list.length).fill(false);

      for (let i = 0; i < list.length; i++) {
        const arr = customGroup.getActiveGroups(list[i]);

        passes[i] = false;
        for (let j = 0; j < arr.length; j++) {
          let pass = func[list[i]](card, arr[j]);
          if (pass) {
            passes[i] = true;
            break;
          }
        }

        if (!arr.length) acceptingLength--;
      }

      // console.log(passes.join(" "));

      return passes.filter((a) => a).length === acceptingLength;
    },
  },
  effect: {
    filterFunc: effectFilter,
    groups: [
      {
        id: "none",
        name: "No effect",
        imgUrl: getLvlIco("~"),
        iconClass: "blend",
        length: 35,
      },
      {
        id: "trigger",
        name: "Trigger",
        imgUrl: getEffIco("trigger"),
        iconClass: "blend",
        length: 94,
      },
      {
        id: "unique",
        name: "Unique",
        imgUrl: getEffIco("unique"),
        iconClass: "blend",
        length: 50,
      },
      {
        id: "manual",
        name: "Manual",
        imgUrl: getEffIco("manual"),
        iconClass: "blend",
        length: 162,
      },
      {
        id: "passive",
        name: "Passive",
        imgUrl: getEffIco("passive"),
        iconClass: "blend",
        length: 105,
      },
      {
        id: "init",
        name: "Init",
        imgUrl: getEffIco("init"),
        iconClass: "blend",
        length: 195,
      },
      {
        id: "defense",
        name: "Defense",
        imgUrl: getEffIco("defense"),
        iconClass: "blend",
        length: 22,
      },
      {
        id: "void",
        name: "Void",
        imgUrl: getEffIco("void"),
        length: 26,
      },
      {
        id: "death",
        name: "Death",
        imgUrl: getEffIco("death"),
        iconClass: "blend",
        length: 15,
      },
      {
        id: "once",
        name: "Once",
        imgUrl: getEffIco("once"),
        length: 27,
      },
      {
        id: "execute",
        name: "Execute",
        imgUrl: getEffIco("execute"),
        iconClass: "blend",
        length: 8,
      },
      {
        id: "crash",
        name: "Crash",
        imgUrl: getEffIco("crash"),
        length: 2,
      },
      {
        id: "instant",
        name: "Instant",
        imgUrl: getEffIco("instant"),
        iconClass: "blend",
        length: 44,
      },
      {
        id: "chain",
        name: "Chain",
        imgUrl: getEffIco("chain"),
        iconClass: "blend",
        length: 7,
      },
      {
        id: "hardUnique",
        name: "Hard Unique",
        imgUrl: getEffIco("hardUnique"),
        iconClass: "blend",
        length: 3,
      },
      {
        id: "preload",
        name: "Preload",
        imgUrl: getEffIco("preload"),
        iconClass: "blend",
        length: 6,
      },
      {
        id: "cache",
        name: "Cache",
        imgUrl: getEffIco("cache"),
        iconClass: "blend",
        length: 4,
      },
      {
        id: "bonded",
        name: "Bonded",
        imgUrl: getEffIco("bonded"),
        iconClass: "blend",
        length: 4,
      },
      {
        id: "consumable",
        name: "Consumable",
        imgUrl: getEffIco("consumable"),
        iconClass: "blend",
        length: 4,
      },
      {
        id: "dragoonLink",
        name: "Dragoon Link",
        imgUrl: getEffIco("dragoonLink"),
        length: 7,
      },
      {
        id: "lock",
        name: "Lock",
        imgUrl: getEffIco("lock"),
        iconClass: "blend",
        length: 46,
      },
    ],
  },
  rarity: {
    filterFunc: rarityFilter,
    groups: [
      {
        id: "white",
        name: "White",
        imgUrl: "https://placehold.co/128/0000/FFF?text=W&font=Montserrat",
        iconClass: "blend",
        length: 210,
      },
      {
        id: "blue",
        name: "Blue",
        length: 84,
        imgUrl: "https://placehold.co/128/0000/0089ff?text=B&font=Montserrat",
      },
      {
        id: "green",
        name: "Green",
        length: 42,
        imgUrl: "https://placehold.co/128/0000/00ff00?text=G&font=Montserrat",
      },
      {
        id: "red",
        name: "Red",
        length: 56,
        imgUrl: "https://placehold.co/128/0000/b10000?text=R&font=Montserrat",
      },
      {
        id: "broken",
        name: "Broken",
        length: 2,
        imgUrl: "https://placehold.co/128/0000/ff008a?text=X&font=Montserrat",
      },
      {
        id: "yellow",
        name: "Ability",
        length: 7,
        imgUrl: "https://placehold.co/128/0000/cc0?text=Y&font=Montserrat",
      },
      {
        id: "purple",
        name: "Algo",
        length: 4,
        imgUrl: "https://placehold.co/128/0000/aa00aa?text=Z&font=Montserrat",
      },
    ],
  },
  level: {
    filterFunc: levelFilter,
    groups: [
      {
        id: "level-0",
        name: "NULL",
        imgUrl: getLvlIco(0),
        iconClass: "blend",
        length: 42,
      },
      {
        id: "level-1",
        name: "Level 1",
        imgUrl: getLvlIco(1),
        iconClass: "blend",
        length: 225,
      },
      {
        id: "level-2",
        name: "Level 2",
        imgUrl: getLvlIco(2),
        iconClass: "blend",
        length: 79,
      },
      {
        id: "level-3",
        name: "Level 3",
        imgUrl: getLvlIco(3),
        iconClass: "blend",
        length: 56,
      },
      {
        id: "level-4",
        name: "Level 4",
        imgUrl: getLvlIco(4),
        iconClass: "blend",
        length: 3,
      },
    ],
  },
  archtype: {
    filterFunc: archtypeFilter,
    groups: [
      {
        id: "queenChess",
        name: "Checkmate",
        imgUrl: serverOrigin + "/cards/chessPawn.png",
        length: 6,
      },
      {
        id: "esperDungeon1",
        name: "All Natural",
        imgUrl: serverOrigin + "/cards/naturalApple.png",
        length: 15,
      },
      {
        id: "esperDungeon3",
        name: "Magna Magicae",
        imgUrl: serverOrigin + "/cards/mageSorcIgnis.png",
        length: 14,
      },
      {
        id: "auroraDungeon1",
        name: "Sakura Bloom",
        imgUrl: serverOrigin + "/cards/sakuraStorm.png",
        length: 13,
      },
      {
        id: "auroraDungeonSpirit",
        name: "Spirit Calling",
        imgUrl: serverOrigin + "/cards/spiritTanzaku.png",
        length: 13,
      },
      {
        id: "idolDungeon1",
        name: "Center Stage",
        imgUrl: serverOrigin + "/cards/musicQuarter.png",
        length: 16,
      },
      {
        id: "idolDungeonMahou",
        name: "Trial of Heart",
        imgUrl: serverOrigin + "/cards/mahouWish.png",
        length: 14,
      },
      {
        id: "leoDungeon1",
        name: "Mech Mayhem",
        imgUrl: serverOrigin + "/cards/mdvSword.png",
        length: 13,
      },
      {
        id: "dragoonDungeonInf",
        name: "Infinite Curiosity",
        imgUrl: serverOrigin + "/cards/fantasyPhoenix.png",
        length: 7,
      },
      {
        id: "omegaDungeon1",
        name: "Legion's Command",
        imgUrl: serverOrigin + "/cards/vampSol1.png",
        length: 16,
      },
      {
        id: "collabEden",
        name: "Eden's Edge",
        imgUrl: serverOrigin + "/cards/edenSaffron.png",
        length: 15,
      },
      {
        id: "collabCross",
        name: "World Seekers",
        imgUrl: serverOrigin + "/cards/crossLea.png",
        length: 14,
      },
      {
        id: "collabVault",
        name: "Void's Vault",
        imgUrl: serverOrigin + "/cards/vaultChar.png",
        length: 14,
      },
      {
        id: "collabNova",
        name: "Supernova's Wake",
        imgUrl: serverOrigin + "/cards/novaStandard.png",
        length: 16,
      },
      {
        id: "generic",
        name: "generic",
        imgUrl: serverOrigin + "/cards/genericFireball.png",
        length: 31,
      },
      {
        id: "sp",
        name: "special",
        imgUrl: serverOrigin + "/cards/spDeckEdit.png",
        length: 6,
      },
      {
        id: "potion",
        name: "potion",
        imgUrl: serverOrigin + "/cards/consumablePotionHealth.png",
        length: 3,
      },
      {
        id: "algo",
        name: ".algo",
        imgUrl: serverOrigin + "/cards/artifactMemory.png",
        length: 3,
      },
      {
        id: "ability",
        name: "abilities",
        imgUrl: serverOrigin + "/cards/abilityQueen.png",
        length: 7,
      },
      {
        id: "boss",
        name: "bosses",
        imgUrl: serverOrigin + "/cards/boss1.png",
        length: 58,
      },
      {
        id: "enemy",
        name: "enemies",
        imgUrl: serverOrigin + "/cards/enemyBug.png",
        length: 40,
      },
      {
        id: "other",
        name: "others",
        imgUrl: serverOrigin + "/cards/debugKnife.png",
        length: 70,
      },
    ],
  },
  upgradeability: {
    filterFunc: upgradeabilityFilter,
    groups: [
      {
        id: "upgradable",
        name: "Upgradeable",
        length: 204,
        imgUrl: getLvlIco("YU"),
        iconClass: "blend",
      },
      {
        id: "non-upgradable",
        name: "Not Upgradeable",
        imgUrl: getLvlIco("NU"),
        length: 201,
        iconClass: "blend",
      },
    ],
  },
};

export function getGroupNameFromID(filterID: string, id: string) {
  const groups = filterType[filterID].groups;

  const grpName = groups.filter((i) => i.id === id).map((a) => a.name);
  return grpName.length ? grpName[0] : "Unnamed";
}

export default filterType as FilterInterface;
