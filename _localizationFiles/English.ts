export default {
    //generic symbols
    yes : "YES",
    no : "NO",
    true : "TRUE",
    false : "FALSE",

    //operator names
    o_aurora : "Aurora",
    o_esper : "Esper",
    o_idol : "Idol",
    o_leo : "Leo",
    o_queen : "Queen",
    o_omega : "Omega",
    o_kaia : "Dragoon",

    //operator real names
    o_real_aurora : "Alyssa Neskara",
    o_real_esper : "Irene",
    o_real_idol : "Lisa",
    o_real_leo : "Leo",
    o_real_queen : "Elaine Myras",
    o_real_omega : "Kyril",
    o_real_kaia : "Kaia",

    //archtype names
    //TODO : insert all, just have fruit for now
    a_fruit : "All Natural",

    //UI element names
    ui_catalog : "catalog",
    ui_gallery : "gallery",
    ui_play : "play",
    ui_setting : "setting",
    ui_credit : "credit",

    //setting options:
    ui_s_language : "language",
    ui_s_mods : "mods",

    //helps
    h_activate: "<green>[click to activate]</>",

    //errors
    err_noActivate: "<yellow>[ will not activate ]</>",
    err_notActiveTurn: "<red>[ card not active ]</>",
    err_usedOnce: "<red>[</> <icon id=\"once\"></> <red>used ]</>",
    err_disabled: "<red>[ disabled ]</>",
    err_conditionNotMet: "<red>[ condition not met ]</>",
    err_noValidTargets: "<yellow>[ no targets ]</>",
    err_notLocation: "<red>[ cannot activate from this location ]</>",
    err_noCounters: "<red>[ not enough counters ]</>",
    err_tooManyCounters: "<red>[ too many counters ]</>",
    err_noAttackPower: "<red>[ no attack power ]</>",
    err_noSlots: "<red>[ no available field slots ]</>",
    err_maxReached: "<yellow>[ max reached ]</>",
    err_editNoAllow: "Not enough health.",

    //keyword desc
    key_void: "<void/> - Voided cards are removed from play until the deck is RELOADED.",
    key_suspend: "<suspend/> - Delay the target, but does not make the target immune to further delays.",
    key_decompile: "<decompile/> - Send the card to the trash without destroying it. Does not claim loot on the target.",
    key_exposed: "<expose/> - Card has no other card in front of it.",
    key_covered: "<cover/> - Card has another card in front of it.",
    key_automate: "<automate/> - Card acts on its own.",
    key_decaybuff: "<specialbuff>DECAY BUFF</> - Buff is reduced at the end of each turn.",
    key_singlebuff: "<specialbuff>SINGLE ATTACK BUFF</> - Buff is removed after attacking.",
    key_aligned: "<align/> - In the same column as this card.",
    key_pathed: "<pathed/> - There exists a continuous line of cards between two of your cards (excluding diagonals).",
    
    //effect type/subtype name
    //TODO : add more later once coded
    e_manual : "MANUAL",
    e_desc_manual : "Click to activate. This card cannot attack afterwards.",

    e_trigger : "TRIGGER",
    e_desc_trigger : "Activates automatically when something specific happens. Does not take a turn.",

    e_passive : "PASSIVE",
    e_desc_passive : "Happens automatically, does not activate.",

    e_status : "STATUS EFFECT",
    e_desc_status : "Status effects are temporary effects.",

    // effectTypeInit,"INITIALIZE"
    // effectTypeInit_desc,"Activates when this card is played to the field."
    // effectTypeCondition,"CONDITION"
    // effectTypeCondition_desc,"You must do something in order to play this card from your hand manually."
    // effectTypeExec,"EXECUTE"
    // effectTypeExec_desc,"Activates when this card is EXECUTED."
    // effectTypeDestruction,"DESTRUCTION"
    // effectTypeDestruction_desc,"Activates when this card is destroyed (DECOMPILE and EXECUTE do not count as destruction)."
    // effectTypeVolatile,"VOLATILE"
    // effectTypeVolatile_desc,"VOID this card when it leaves the field."
    // effectTypeDefense,"DEFENSE"
    // effectTypeDefense_desc,"This card cannot take more than a certain amount of damage at once."
    // effectTypeQuick,"QUICK"
    // effectTypeQuick_desc,"This card does not take a turn to play to the field."
    // effectTypeDragoon,"DRAGOON'S LINK"
    // effectTypeDragoon_desc,"Programs created from the same Dragoon are linked."
    // effectTypeSingle,"CONSUMABLE"
    // effectTypeSingle_desc,"After this card uses its effect, remove it from the game and your decklist."
    // effectTypeArtifact,"PRELOAD"
    // effectTypeArtifact_desc,"This card starts in your hand."
    // effectTypeStorage,"CACHED"
    // effectTypeStorage_desc,"This effect applies while this card is in Storage."
    // effectFlagOnce,"ONCE"
    // effectFlagOnce_desc,"This effect can only be activated once."
    // effectFlagInstant,"INSTANT"
    // effectFlagInstant_desc,"This effect does not take a turn to use."
    // effectFlagUnique,"UNIQUE"
    // effectFlagUnique_desc,"This effect can only activate once in a turn."
    // effectFlagGlobal,"HARD UNIQUE"
    // effectFlagGlobal_desc,"This effect can only activate exactly once in a turn, even if multiple cards have this same effect."
    // effectFlagBonded,"BONDED"
    // effectFlagBonded_desc,"This effect cannot be removed."
    // effectFlagExclusive,"EXCLUSIVE"
    // effectFlagExclusive_desc,"This effect will not activate if this card has used another effect this turn."
    // effectFlagChained,"CHAINED"
    // effectFlagChained_desc,"This effect chains directly to the event that triggered it."
    

    //card extension
    //TODO : fill this in, only fruit for now
    ex_fruit : "fruit",

    //cardID -> cardName, except the extension part
    //TODO : fill this in, only simple fruits for now
    c_apple : "Apple",
    c_banana : "Banana",
    c_cherry : "Cherry",

    //effect types name

    //effect types desc

    //effectID -> display XML

    //zone names
    z_deck : "deck",
    z_p1_field : "player field",
    z_p2_field : "enemy field",
    z_grave : "grave",
    z_hand : "hand",

    //Log command
    //action names
    l_turnStart : "turnStart",
    l_turnReset : "turnReset",
    l_turnEnd :"turnEnd",

    l_posChange : "posChange",
    l_drawAction : "drawAction",
    l_activateEffect : "activateEffect",
    l_shuffle : "shuffle", 
    l_addStatusEffect : "addStatusEffect",
    l_removeStatusEffect : "removeStatusEffect",
    l_activateEffectSubtypeSpecificFunc : "activateEffectSubtypeSpecificFunc",
    l_modifyAnotherAction : "modifyAnotherAction",
    
    l_increaseTurnCount : "increaseTurnCount",
    l_setThreatLevel : "setThreatLevel",
    l_doThreatLevelBurn : "doThreatLevelBurn",
    l_forcefullyEndTheGame : "forcefullyEndTheGame",
    l_nullAction : "nullAction",
    l_internalActivateEffectSignal : "[internal action] activateEffectSignal",
    l_freeUpStatusIDs : "[internal action] free up status ids",

    //Preset-deck names ? Maybe no need
    //maybe just rewrite this whole section
    d_queenIntro: "Queen's Kit 1",
    d_esperIntro: "All Natural",
    d_auroraIntro: "Sakura Bloom",
    d_leoIntro: "Mech Mayhem",
    d_idolIntro: "Performing Art",
    d_esperPuzzle1: "Puzzle Kit",
    d_auroraReprogram: "Puzzle Kit",
    d_auroraStarter1: "Sakura MKI",
    d_idolStarter1: "Performing Art",
    d_esperStarter1: "All Natural",
    d_queenChess: "Checkmate",
    d_esperDungeon1: "All Natural",
    d_esperDungeon2: "Year's End",
    d_esperDungeon3: "Magna Magicae",
    d_auroraDungeon1: "Sakura Bloom",
    d_auroraDungeonSpirit: "Spirit Calling",
    d_idolDungeon1: "Center Stage",
    d_idolDungeonMahou: "Trial of Heart",
    d_leoDungeon1: "Mech Mayhem",
    d_dragoonDungeon1: "Old and New",
    d_dragoonDungeon2: "Stronger Together",
    d_dragoonDungeonInf: "Infinite Curiosity",
    d_omegaDungeon1: "Legion's Command",
    d_collabEden: "Eden's Edge",
    d_collabCross: "World Seekers",
    d_collabVault: "Void's Vault",
    d_collabNova: "Supernova's Wake",
    d_auroraSide1: "Sakura MKII",
    d_queenSide1: "Queen's Royal",
    d_queenOmegaDuel: "Queen's Royal",
    d_idolSide1: "Live Performance",
    d_idolSide2: "Live Performance",
    d_dragoonStory1: "Myths and Legends",
    d_dragoonStoryFlame: "The Flame",
    d_esperSide1: "Presentation Kit",
    d_esperSide2: "Presentation Kit?",
    d_leoSide1: "Mech Kit",
    d_leoSide2: "Fire Kit",
    d_idolExPuzzle1: "Puzzle Kit",
    d_leoExPuzzle1: "Puzzle Kit",
    d_exPuzzleMage: "Puzzle Kit",
    d_collabEdenDemo: "Eden's Edge",
    d_collabCrossDemo: "World Seekers",
    d_collabVaultDemo: "Void's Vault",
    d_collabNovaDemo: "Supernova's Wake",


    //TODO : fill this in once we do story or dialog or tutorials
    //Story dialog
    //Tutorial
    //Ability unlocks

    //Credits
} as Record<string, string>