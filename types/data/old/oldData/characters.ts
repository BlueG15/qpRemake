const cOrigin = window.location.origin + "/memories";
const bOrigin = window.location.origin + "/gallery";

const charactersData = {
  esper: {
    name: "Esper",
    color: "#5d7bc8",
    decks: [
      {
        codeName: "esperDungeon1",
        displayName: "All Natural",
      },
      {
        codeName: "esperDungeon3",
        displayName: "Magna Magicae",
      },
      {
        codeName: "collabNova",
        displayName: "Supernova's Wake",
      },
    ],
    portrait: {
      url: bOrigin + "/esper portrait.png",
      width: 1500,
      height: 2000,
    },
    skill: "abilityEsper",
    quote: "Everyone can change.",
    age: 17,
    des: "Young high school girl who is very shy but also very observant. She wants to change and become more talkative, but struggles with expressing her thoughts with words. Computers make her feel safe and comfortable and she quickly developed world-class programming skills.\n\nEsper has a very personal relationship with Queen. Queen really looks after Esper, mostly out of seeing how shyness holds Esper back from achieving her full potential.",
    memories: [
      cOrigin + "/26.png",
      cOrigin + "/Ria.png",
      cOrigin + "/EsperConcept.jpg",
    ],
  },
  aurora: {
    name: "Aurora",
    color: "#c91d29",
    decks: [
      {
        codeName: "auroraDungeon1",
        displayName: "Sakura Bloom",
      },
      {
        codeName: "auroraDungeonSpirit",
        displayName: "Spirit Calling",
      },
      {
        codeName: "collabEden",
        displayName: "Eden's Edge",
      },
    ],
    portrait: {
      url: bOrigin + "/aurora portrait.png",
      width: 1500,
      height: 2000,
    },
    quote: "Appearances only deceive those who see with their eyes",
    age: 25,
    skill: "abilityAurora",
    des: "Daughter of the owner of the largest AI company in the world. She was raised to be a proper lady to one day inherit the company. While Aurora is grateful for the many opportunities she has, she does not like the fakeness of her life. She was taught to act cute and submissive when meeting other company executives, and this combined with her natural beauty let her get what she wanted very easily. But she rejects this and hungers for something more real. During her free time she learned how to program computers and became captivated by the merit-based world of hacking.",
    memories: [
      cOrigin + "/25.png",
      cOrigin + "/20.png",
      cOrigin + "/auroraConcept.jpg",
    ],
  },
  idol: {
    name: "Idol",
    color: "#febbc7",
    decks: [
      {
        codeName: "idolDungeon1",
        displayName: "Center Stage",
      },
      {
        codeName: "idolDungeonMahou",
        displayName: "Trial of Heart",
      },
    ],
    quote: "A center is nothing without others behind them.",
    age: 23,
    portrait: {
      url: bOrigin + "/idol portrait.png",
      width: 750,
      height: 1000,
    },
    skill: "abilityIdol",
    des: "A famous pop star who has a weird hobby: hacking. She got into it by programming her own shows. Despite her happy outward appearance, Idol had a rough childhood. Her parents divorced when she was young so she never really had a normal family growing up. Over time she found her own voice and her performance talents let her rise above her circumstances. But something was alwaus missing from her life, true friendship. She found this as she got involved with Quantum. The camaraderie she felt with her fellow hackers was unlike anything she experienced before.",
    memories: [
      cOrigin + "/33.png",
      cOrigin + "/31.png",
      cOrigin + "/idolConcept.jpg",
    ],
  },
  leo: {
    name: "Leo",
    color: "#98b624",
    decks: [
      {
        codeName: "leoDungeon1",
        displayName: "Mech Mayhem",
      },
      {
        codeName: "collabCross",
        displayName: "World Seekers",
      },
      {
        codeName: "collabVault",
        displayName: "Void's Vault",
      },
    ],
    portrait: {
      url: bOrigin + "/leo portrait.png",
      width: 1500,
      height: 2200,
    },
    skill: "abilityLeo",
    quote: "Break em now, we can fix em later.",
    age: 35,
    des: "Worked as the field leader of a construction crew. There was once an accident caused by a software malfunction that resulted in the death of one of his crew. After that incident, Leo took it upon himself to learn how computers worked so he could be more prepared to discover and prevent this tragedy from ever happening again.",
    memories: [
      cOrigin + "/lukeDiamond.png",
      cOrigin + "/27.png",
      cOrigin + "/leoConcept.jpg",
    ],
  },
  dragoon: {
    name: "Dragoon",
    color: "#5d69e4",
    decks: [
      {
        codeName: "dragoonDungeonInf",
        displayName: "Infinite Curiosity",
      },
    ],
    portrait: {
      url: bOrigin + "/dragoon portrait.png",
      width: 750,
      height: 1000,
    },
    skill: "abilityDragoon",
    age: 120,
    quote: "Truth is made by both facts and lies",
    des: "Kaia is the last of the Dragoons - whose scales are being used to create computer chips. QUEEN once met a Dragoon in the past, and together they created the most powerful computer programs in the world. But the Dragoon died because Dragoon scales do not regrow, and Dragoons are succeptable to a deadly disease when they loose the protection of their scales. Queen seeks out Kaia to protect her from being exploited for her power.",
    memories: [
      cOrigin + "/b2550b4db392c7889cea95b021e025ec95257c1e.png",
      cOrigin + "/dragoonTail.png",
      cOrigin + "/dragoon.jpg",
    ],
  },
  omega: {
    name: "Omega",
    color: "#9d2e60",
    decks: [
      {
        codeName: "omegaDungeon1",
        displayName: "Legion's Command",
      },
    ],
    portrait: {
      url: bOrigin + "/omega portrait.png",
      width: 1500,
      height: 2000,
    },
    age: 29,
    quote: "In order to make the rules, you have to break the rules",
    skill: "abilityOmega",
    des: "Omega is rivals with Queen. To help get ahead, Omega got a dangerous brain implant. This allowed him to create a new breed of programs to hack into the most secure systems in the world. But the implant itself was part of a bigger plot. The implant had a virus in it. And one day it triggered, haunting Omega with nightmares and controlling his thoughts. After the plot, Omega joins Quantum, finally accepting that he has a lot he could learn a thin or two from Queen.",
    memories: [cOrigin + "/10.png", cOrigin + "/3.png", cOrigin + "/omega.jpg"],
  },
  queen: {
    name: "Queen",
    color: "#777777",
    decks: [
      {
        codeName: "queenChess",
        displayName: "Checkmate",
      },
    ],
    portrait: {
      url: bOrigin + "/queen portrait.png",
      width: 1500,
      height: 2000,
    },

    age: 29,
    quote: "Practicality is for those who lack imagination",
    skill: "abilityQueen",
    des: "Quantum is a secret society that specializes in cyber investigations. Queen is the leader, and she makes appearances at various government meetings. That said, the exact activities of Quantum are kept secret, as are the offices, which are hidden in various cities of the world, marked only by small Q sumbols. (wow, rivetting backstory, as if the game doesn't take place in one singular floating city)",
    memories: [
      cOrigin + "/32.png",
      cOrigin + "/21.png",
      cOrigin + "/queenConcept2.jpg",
    ],
  },
};

export interface Character {
  name: string;
  color: string;
  decks: Deck[];
  portrait: { url: string; width: number; height: number };
  skill: string;
  quote: string;
  age: number;
  des: string;
  memories: string[];
}

export interface Deck {
  codeName: string;
  displayName: string;
}

export default charactersData;
