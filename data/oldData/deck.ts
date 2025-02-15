const serverOrigin = window.origin;

const deckData: {
  [n: string]: {
    name: {
      codeName: string;
      displayName: string;
    };
    character: null | string;
    extension: string[];
    cardList: string[];
    imgUrl: string;
  };
} = {
  queenChess: {
    name: {
      codeName: "queenChess",
      displayName: "Checkmate",
    },
    character: "queen",
    extension: [],
    cardList: [
      "chessBishop",
      "chessKing",
      "chessKnight",
      "chessPawn",
      "chessQueen",
      "chessRook",
    ],
    imgUrl: serverOrigin + "/cards/chessPawn.png",
  },
  esperDungeon1: {
    name: {
      codeName: "esperDungeon1",
      displayName: "All Natural",
    },
    character: "esper",
    extension: [".fruit"],
    cardList: [
      "naturalApple",
      "naturalBanana",
      "naturalCherry",
      "naturalDemeter",
      "naturalFall",
      "naturalGreenhouse",
      "naturalGrowth",
      "naturalLemon",
      "naturalPersephone",
      "naturalPollination",
      "naturalPomegranate",
      "naturalPumpkin",
      "naturalSpring",
      "naturalSummer",
      "naturalWinter",
    ],
    imgUrl: serverOrigin + "/cards/naturalApple.png",
  },
  esperDungeon3: {
    name: {
      codeName: "esperDungeon3",
      displayName: "Magna Magicae",
    },
    character: "esper",
    extension: [".sorc", ".mage"],
    cardList: [
      "mageSorcIgnis",
      "mageSorcEffingo",
      "mageSorcCreo",
      "mageSorcGravitas",
      "mageSorcPotentia",
      "mageSorcTempus",
      "mageSorcLux",
      "mageLucia",
      "mageAurelia",
      "mageCamilla",
      "mageMariana",
      "mageOctavia",
      "mageValeria",
      "mageDecima",
    ],
    imgUrl: serverOrigin + "/cards/mageSorcIgnis.png",
  },
  auroraDungeon1: {
    name: {
      codeName: "auroraDungeon1",
      displayName: "Sakura Bloom",
    },
    character: "aurora",
    extension: [".hana"],
    cardList: [
      "sakuraBow",
      "sakuraKatana",
      "sakuraKunai",
      "sakuraLantern",
      "sakuraNinja1",
      "sakuraNinja2",
      "sakuraNinja3",
      "sakuraNinja4",
      "sakuraNinjaBoss",
      "sakuraPriestess",
      "sakuraShide",
      "sakuraStorm",
      "sakuraTorii",
    ],
    imgUrl: serverOrigin + "/cards/sakuraStorm.png",
  },
  auroraDungeonSpirit: {
    name: {
      codeName: "auroraDungeonSpirit",
      displayName: "Spirit Calling",
    },
    character: "aurora",
    extension: [".spirit"],
    cardList: [
      "spiritAmaterasu",
      "spiritKitsune",
      "spiritKusanagi",
      "spiritMagatama",
      "spiritNeko",
      "spiritNezumi",
      "spiritSika",
      "spiritTanzaku",
      "spiritTsukuyomi",
      "spiritTsuru",
      "spiritWatatsumi",
      "spiritYamata",
      "spiritYata",
    ],
    imgUrl: serverOrigin + "/cards/spiritTanzaku.png",
  },
  idolDungeon1: {
    name: {
      codeName: "idolDungeon1",
      displayName: "Center Stage",
    },
    character: "idol",
    extension: [".muse"],
    cardList: [
      "musicBass",
      "musicDoubleEighth",
      "musicEqualize",
      "musicFermata",
      "musicForte",
      "musicIdol1",
      "musicIdol2",
      "musicIdol3",
      "musicIdol4",
      "musicIdol5",
      "musicIdolBoss",
      "musicPiano",
      "musicQuarter",
      "musicQuarterRest",
      "musicTreble",
      "musicTriplet",
    ],
    imgUrl: serverOrigin + "/cards/musicQuarter.png",
  },
  idolDungeonMahou: {
    name: {
      codeName: "idolDungeonMahou",
      displayName: "Trial of Heart",
    },
    character: "idol",
    extension: [".mahou"],
    cardList: [
      "mahouBunnyFire",
      "mahouGirlFire",
      "mahouBunnyEarth",
      "mahouGirlEarth",
      "mahouBunnyWind",
      "mahouGirlWind",
      "mahouBunnyWater",
      "mahouGirlWater",
      "mahouBunnyDark",
      "mahouGirlDark",
      "mahouBunnyLight",
      "mahouGirlLight",
      "mahouWish",
      "mahouHeartTrial",
    ],
    imgUrl: serverOrigin + "/cards/mahouWish.png",
  },
  leoDungeon1: {
    name: {
      codeName: "leoDungeon1",
      displayName: "Mech Mayhem",
    },
    character: "leo",
    extension: [".mech"],
    cardList: [
      "mdvAxe",
      "mdvCore",
      "mdvGatling",
      "mdvHammer",
      "mdvHydro",
      "mdvPlasma",
      "mdvPod",
      "mdvRocket",
      "mdvSpear",
      "mdvSword",
      "mdvThunder",
      "mdvTower",
      "mdvUnity",
    ],
    imgUrl: serverOrigin + "/cards/mdvSword.png",
  },
  dragoonDungeonInf: {
    name: {
      codeName: "dragoonDungeonInf",
      displayName: "Infinite Curiosity",
    },
    character: "dragoon",
    extension: [".myth"],
    cardList: [
      "fantasyArae",
      "fantasyCockatrice",
      "fantasyGolem",
      "fantasyGriffin",
      "fantasyMermaid",
      "fantasyPhoenix",
      "fantasyUnicorn",
    ],
    imgUrl: serverOrigin + "/cards/fantasyPhoenix.png",
  },
  omegaDungeon1: {
    name: {
      codeName: "omegaDungeon1",
      displayName: "Legion's Command",
    },
    character: "omega",
    extension: [".legion", ".blood"],
    cardList: [
      "vampGen1",
      "vampGen2_minion",
      "vampGen2",
      "vampHyper",
      "vampLieu1",
      "vampLieu2",
      "vampOrb",
      "vampOrigin",
      "vampPlunge",
      "vampRevival",
      "vampShield",
      "vampSol1",
      "vampSol2",
      "vampSol3",
      "vampSpear",
      "vampSword",
    ],
    imgUrl: serverOrigin + "/cards/vampSol1.png",
  },
  collabEden: {
    name: {
      codeName: "collabEden",
      displayName: "Eden's Edge",
    },
    character: "aurora",
    extension: [".eden", ".edx"],
    cardList: [
      "edenSaffron",
      "edenThunder",
      "edenGunner",
      "edenReva",
      "edenHazel",
      "edenSelicy",
      "edenShiso",
      "edenTerra",
      "edenViolette",
      "edenStepSlash",
      "edenBowSnipe",
      "edenWave",
      "edenRagnarok",
      "edenShopkeeper",
      "edenCrossfire",
    ],
    imgUrl: serverOrigin + "/cards/edenSaffron.png",
  },
  collabCross: {
    name: {
      codeName: "collabCross",
      displayName: "World Seekers",
    },
    character: "leo",
    extension: [".element", ".cross"],
    cardList: [
      "crossEleHeat",
      "crossEleCold",
      "crossEleShock",
      "crossEleWave",
      "crossLea",
      "crossEmilienator",
      "crossCtron",
      "crossLukas",
      "crossApollo",
      "crossJoern",
      "crossHlin",
      "crossBuggy",
      "crossAlbert",
      "crossShizuka",
    ],
    imgUrl: serverOrigin + "/cards/crossLea.png",
  },
  collabVault: {
    name: {
      codeName: "collabVault",
      displayName: "Void's Vault",
    },
    character: "leo",
    extension: [".vault"],
    cardList: [
      "vaultCombo",
      "vaultSlash",
      "vaultBlade",
      "vaultJab",
      "vaultApprentice",
      "vaultMultiBlade",
      "vaultBide",
      "vaultJuggle",
      "vaultChar",
      "vaultOnceMore",
      "vaultAgility",
      "vaultLightUp",
      "vaultOpportunist",
      "vaultParry",
    ],
    imgUrl: serverOrigin + "/cards/vaultChar.png",
  },
  collabNova: {
    name: {
      codeName: "collabNova",
      displayName: "Supernova's Wake",
    },
    character: "esper",
    extension: [".nova", ".mod"],
    cardList: [
      "novaStandard",
      "novaAssault",
      "novaSentinel",
      "novaResearch",
      "novaCarrier",
      "novaCarrier_minion",
      "novaArchitect",
      "novaLeviathan",

      "novaFusillade",
      "novaHighExplosive",
      "novaHeavyCaliber",

      "novaTacLink",
      "novaBarrier",
      "novaStrike",
      "novaLance",
      "novaAtaraxia",
    ],
    imgUrl: serverOrigin + "/cards/novaStandard.png",
  },
  generic: {
    name: {
      codeName: "generic",
      displayName: "generic",
    },
    character: null,
    extension: [],
    cardList: [
      "genericAfterburner",
      "genericAvarice",
      "genericBattery",
      "genericBearTrap",
      "genericCapacitor",
      "genericCinder",
      "genericConstantCorrection",
      "genericCrystalBall",
      "genericDoubleExecute",
      "genericEmber",
      "genericFireball",
      "genericFlashAttack",
      "genericFlashbang",
      "genericForce",
      "genericInferno",
      "genericMagicEmber",
      "genericMagicFlare",
      "genericMegaRush",
      "genericOmen",
      "genericPendulum",
      "genericPureHeart",
      "genericReincarnation",
      "genericScalpel",
      "genericShatter",
      "genericSpark",
      "genericThunderclap",
      "genericTreasure",
      "genericUpdraft",
      "genericTaser",
      "genericAmbush",
      "genericRupture",
    ],
    imgUrl: serverOrigin + "/cards/genericFireball.png",
  },
  sp: {
    name: {
      codeName: "sp",
      displayName: "special",
    },
    character: null,
    extension: [],
    cardList: [
      "spDeckEdit",
      "spDeckReload",
      "spInitialize",
      "spInstantDraft",
      "spStorageHit",
      "dragoonFlame",
    ],
    imgUrl: serverOrigin + "/cards/spDeckEdit.png",
  },
  potion: {
    name: {
      codeName: "potion",
      displayName: "potion",
    },
    character: null,
    extension: [".potion"],
    cardList: [
      "consumablePotionHealth",
      "consumablePotionStorage",
      "consumablePotionVoid",
    ],
    imgUrl: serverOrigin + "/cards/consumablePotionHealth.png",
  },
  algo: {
    name: {
      codeName: "algo",
      displayName: ".algo",
    },
    character: null,
    extension: [".algo"],
    cardList: [
      "artifactGreed",
      "artifactMemory",
      "artifactMomentum",
      "artifactSpire",
    ],
    imgUrl: serverOrigin + "/cards/artifactMemory.png",
  },
  ability: {
    name: {
      codeName: "ability",
      displayName: "abilities",
    },
    character: null,
    extension: [],
    cardList: [
      "abilityAurora",
      "abilityDragoon",
      "abilityEsper",
      "abilityIdol",
      "abilityLeo",
      "abilityOmega",
      "abilityQueen",
    ],
    imgUrl: serverOrigin + "/cards/abilityQueen.png",
  },
  boss: {
    name: {
      codeName: "boss",
      displayName: "bosses",
    },
    character: null,
    extension: [".z", ".virus", ".dark", ".x"],
    cardList: [
      "boss1",
      "boss1Minion",
      "boss2",
      "boss2Minion",
      "boss3",
      "boss3Virus",
      "boss4",
      "boss4Scythe",
      "boss4Dagger",
      "boss4Soul",
      "boss5",
      "boss5AttackMinion",
      "boss5BombMinion",
      "boss5Left",
      "boss5Right",
      "bossB1",
      "bossB1Minion",
      "bossB2",
      "bossB2Minion",
      "bossB3",
      "bossB3Minion1",
      "bossB3Minion2",
      "bossB3Minion3",
      "bossB3Minion4",
      "bossB4",
      "bossB4Minion",
      "bossB5",
      "bossB5Minion",
      "bossB6",
      "bossB6Extra",
      "bossB6Minion",
      "bossB7",
      "bossB7Minion1",
      "bossB7Minion2",
      "bossB7Minion3",
      "bossB8",
      "bossB8Minion",
      "bossB9",
      "bossB9Minion",
      "bossB10",
      "bossB10Minion1",
      "bossB10Minion2",
      "bossB10Minion3",
      "bossB10MinionSpawn",
      "bossComet1",
      "bossComet1Minion",
      "bossComet2",
      "bossComet3",
      "bossComet3Minion",
      "bossComet3Minion2",
      "bossCometDefeat",
      "bossWaystone",
      "enemyBossCandle",
      "miniboss1",
      "omegaboss",
      "omegabossUnstable",
      "omegacore",
      "bossMahou",
    ],
    imgUrl: serverOrigin + "/cards/boss1.png",
  },
  enemy: {
    name: {
      codeName: "enemy",
      displayName: "enemies",
    },
    character: null,
    extension: [
      ".sc",
      ".virus",
      ".mw",
      ".ex",
      ".ghst",
      ".scx",
      ".tlsm",
      ".wrm",
    ],
    cardList: [
      "enemySentryNoAttack",
      "enemyArtillery",
      "enemyBlackVirus",
      "enemyBug",
      "enemyCache",
      "enemyCacheDrafting",
      "enemyCacheRandom",
      "enemyChandelier",
      "enemyCollapse",
      "enemyDaggers",
      "enemyDisruptor",
      "enemyGhostBlue",
      "enemyGhostRed",
      "enemyGuardian",
      "enemyInterceptor",
      "enemyMiasma",
      "enemyMine",
      "enemyMirrorShard",
      "enemyObserver",
      "enemyPassiveBug",
      "enemyPathogen",
      "enemyPredator",
      "enemyRail",
      "enemySentry",
      "enemySentry2",
      "enemySignal",
      "enemyStageTarget",
      "enemyStealerTutorial",
      "enemyStrongBug",
      "enemyStrongWall",
      "enemyTalismanBlack",
      "enemyTalismanWhite",
      "enemyVenom",
      "enemyVirusBlue",
      "enemyVirusRed",
      "enemyWeakTarget",
      "enemyWeakWall",
      "enemyWormBlue",
      "enemyWormRed",
      "enemyZombie",
    ],
    imgUrl: serverOrigin + "/cards/enemyBug.png",
  },
  other: {
    name: {
      codeName: "other",
      displayName: "others",
    },
    character: null,
    extension: [".hck", ".x", ".txt", ".sc", ".z", ".lock", ".mw", ".debug"],
    cardList: [
      "syncMarker",
      "novaBurstFire",
      "novaConvergence",
      "syncMarker1",
      "syncMarker2",
      "syncMarker4",
      "timeBomb2",
      "timeBomb3",
      "timeBomb4",
      "timeBomb7",
      "timeBomb_h5_t6",
      "timeBomb_h5_t5",
      "timeBomb_h5_t4",
      "puzzleBlank",
      "storyVolatileCircuit_t2",
      "storyVolatileCircuit_t3",
      "storyVolatileCircuit_t4",
      "storyVolatileCircuit_t5",
      "storyVolatileCircuit_t6",
      "storyVolatileCircuit_t7",
      "storyVolatileCircuit_t8",
      "storyExplosiveCircuit_t4",
      "storyFragileCircuit_t6",
      "volatileCircuit_h4_t8",
      "volatileCircuit_h5_t4",
      "volatileCircuit_h5_t6",
      "volatileCircuit_h5_t7",
      "volatileCircuit_h5_t8",
      "infiniteReload",
      "infiniteInstantDraft",
      "quantumKnifeTutorial",
      "quantumSigil",
      "stageMarker",
      "securityLock",
      "objectiveData1",
      "openingDungeonMark",
      "puzzleDummy",
      "lootDummy",
      "puzzleIronWall",
      "puzzleIronWall2",
      "auroraAntiSentry",
      "queenLock",
      "queenLockCore",
      "machineBlock",
      "machineBlock2",
      "machineGear",
      "machineCoin",
      "brainThorn",
      "brainHeart",
      "brainQueen",
      "endgameLockGeneral",
      "endgameLock1",
      "endgameLock2",
      "endgameLock3",
      "endgameLock4",
      "endgameLock5",
      "storyOxygen",
      "storyHydrogen",
      "storyBackdoor",
      "flowerHologram",
      "haloShield",
      "cometRuinSanctum",
      "cometSanctum1",
      "cometSanctum2",
      "depthsSanctum",
      "dungeonBug",
      "debugKnife",
      "tutorialFireball",
      "potionHealth",
      "potionStorage",
    ],
    imgUrl: serverOrigin + "/cards/debugKnife.png",
  },
};

export default deckData;
