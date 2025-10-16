export default {
    //generic symbols
    yes : "YES",
    no : "NO",
    true : "TRUE",
    false : "FALSE",

    //operator names
    o_null : "No operator",
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

    //operator description, not filled
    o_desc_aurora : "",
    o_desc_esper : "",
    o_desc_idol : "",
    o_desc_leo : "",
    o_desc_queen : "",
    o_desc_omega : "",
    o_desc_kaia : "",

    //rarities
    r_white : "<white> white </>",
    r_blue : "<blue> blue </>",
    r_green : "<green> green </>",
    r_red : "<red> red </>",
    r_ability : "<yellow> ability </>",
    r_algo : "<purple> algo </>",

    //archtype full names
    //TODO : insert all
    a_fruit : "All Natural",
    a_legion : "Legion's Commanđ",
    a_nova : "Supernova's Wake",
    a_generic : "Generic",
    a_other : "No archtype",
    a_enemy : "Enemy",
    a_boss : "Boss",

    //UI element names
    ui_catalog : "catalog",
    ui_gallery : "gallery",
    ui_play : "play",
    ui_setting : "setting",
    ui_credit : "credit",

    //setting options:
    //TODO : finish this when Setting is done
    ui_s_language : "language",
    ui_s_mods : "mods",

    //helps
    h_activate: "<green>[Click to activate]</>",

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
    key_desc_void: "<void/> - Voided cards are removed from play until the deck is RELOADED.",
    key_desc_suspend: "<suspend/> - Delay the target, but does not make the target immune to further delays.",
    key_desc_decompile: "<decompile/> - Send the card to the trash without destroying it. Does not claim loot on the target.",
    key_desc_exposed: "<exposed/> - Card has no other card in front of it.",
    key_desc_covered: "<cover/> - Card has another card in front of it.",
    key_desc_automate: "<automate/> - Card acts on its own.",
    key_desc_decaybuff: "<specialbuff>DECAY BUFF</> - Buff is reduced at the end of each turn.",
    key_desc_singlebuff: "<specialbuff>SINGLE ATTACK BUFF</> - Buff is removed after attacking.",
    key_desc_aligned: "<aligned/> - In the same column as this card.",
    key_desc_pathed: "<pathed/> - There exists a continuous line of cards between two of your cards (excluding diagonals).",
    key_desc_exec: "<exec/> - Activates when the card is executed, after the attack and before being sent to the grave",
    
    key_void: "vOID",
    key_suspend: "SUSPEND",
    key_decompile: "COMPILE",
    key_exposed: "EXPOSED",
    key_covered: "COVER",
    key_automate: "AUTOMATE",
    key_aligned: "ALIGNED",
    key_pathed: "PATHED",
    key_exec: "EXECUTE",

    key_decaybuff: "DECAY BUFF",
    key_singlebuff: "SINGLE ATTACK BUFF",

    
    //effect type/subtype name
    //TODO : add more later once coded
    e_t_none : "NO TYPE",
    e_t_none_desc : "",

    e_t_lock : "LOCK",
    e_t_lock_desc : "You must do something in order to play this card from your hand manually.",

    e_t_counter : "COUNTER",
    e_t_counter_desc : "Dont do much, just a resource for other effects",

    e_t_manual : "MANUAL",
    e_t_manual_desc : "Click to activate. this card cannot attack afterwards.",

    e_t_trigger : "TRIGGER",
    e_t_trigger_desc : "Activates automatically when something specific happens. Does not take a turn.",

    e_t_passive : "PASSIVE",
    e_t_passive_desc : "Happens automatically, does not activate.",

    e_t_status : "STATUS EFFECT",
    e_t_status_desc : "Status effects are temporary effects.",

    e_t_init : "INITIALIZE",
    e_t_init_desc : "Activates when this card is played to the field.",

    // effectTypeExec,"EXECUTE"
    // effectTypeExec_desc,"Activates when this card is EXECUTED."
    // effectTypeDestruction,"DESTRUCTION"
    // effectTypeDestruction_desc,"Activates when this card is destroyed (DECOMPILE and EXECUTE do not count as destruction)."
    // effectTypeVolatile,"VOLATILE"
    // effectTypeVolatile_desc,"VOID thsis card when it leaves the field."
    // effectTypeDefense,"DEFENSE"
    // effectTypeDefense_desc,"This card cannot take more than a certain amount of damage at once."
    // effectTypeDragoon,"DRAGOON'S LINK"
    // effectTypeDragoon_desc,"Programs created from the same Dragoon are linked."
    // effectTypeSingle,"CONSUMABLE"
    // effectTypeSingle_desc,"After this card uses its effect, remove it from the game and your decklist."
    // effectTypeArtifact,"PRELOAD"
    // effectTypeArtifact_desc,"This card starts in your hand."
    // effectTypeStorage,"CACHED"
    // effectTypeStorage_desc,"This effect applies while this card is in Storage."
    // effectFlagBonded,"BONDED"
    // effectFlagBonded_desc,"This effect cannot be removed."

    e_st_chained : "CHAINED",
    e_st_chained_desc : "This effect chains directly to the event that triggered it.",

    e_st_delayed : "DELAYED",
    e_st_delayed_desc : "This effects chains to the event that triggers it, but activates after that event resolves.",

    e_st_unique : "UNIQUE",
    e_st_unique_desc : "This effect can only activate once per copy of this card in a turn.",

    e_st_hardUnique : "HARD_UNIQUE",
    e_st_hardUnique_desc : "This effect can only activate once across all copies of this card in a turn.",

    e_st_instant : "INSTANT",
    e_st_instant_desc : "This effect does not take a turn to activate.",

    e_st_once : "ONCE",
    e_st_once_desc : "This effect can only be activated once.",

    e_st_fieldLock : "FIELD_LOCK",
    e_st_fieldLock_desc : "This card has to be on the field to activate this effect.",

    e_st_handOrFieldLock : "FIELD_OR_HAND_LOCK",
    e_st_handOrFieldLock_desc : "This card has to be on the field or in hand to activate this effect.",

    e_st_graveLock : "GRAVE_LOCK",
    e_st_graveLock_desc : "This card has to be on the grave to activate this effect.",

    //card extension
    //TODO : fill this in,
    ex_fruit : "fruit",
    ex_legion : "legion",
    ex_nova : "nova",
    ex_generic : "generic",
    

    //cardID -> cardName, except the extension part
    //TODO : fill this in, only simple fruits for now
    c_blank : "Blank",

    c_knife : "Knife",
    c_quantum_sigil : "QuantumSigil",
    c_sentry : "Sentry",
    c_stagemarker : "StageMarker",
    c_security : "Security",
    c_objective_data : "Data",
    c_active : "ACTIVE",
    c_dummy : "Dummy",
    c_loot_dummy : "Dummy",
    c_lock_core : "Core",
    c_machine_block : "MachineBlock",
    c_machine_coin : "MachineCoin",
    c_brain_queen : "Brain",
    c_story_oxygen : "O",
    c_story_hydrogen : "H",
    c_story_backdoor : "Backdoor",
    c_flower_hologram : "Hologram",
    c_stagemark : "Stagemark",
    c_firewall : "Firewall",
    c_target : "Target",
    c_curse : "Curse", 

    c_dark_power : "DarkPower",
    c_zira_defeat : "Zira",
    c_legion_token : "Clone",

    c_bug_passive : "Bug",
    c_strong_bug : "Bug",

    c_nova_protean : "Protean",
    c_test : "Debug",

    c_after_burner : "Afterburner",
    c_battery : "Battery",
    c_flash_bang : "Flashbang",
    c_cinder : "Cinder",
    c_ember : "Ember",
    c_capacitor : "DamageCapacitor",

    c_apple : "Apple",
    c_banana : "Banana",
    c_cherry : "Cherry",
    c_lemon : "Lemon",
    c_pomegranate : "Pomegranate",
    c_pumpkin : "Pumpkin",
    c_pollinate : "Pollinate",
    c_greenhouse : "Greenhouse",
    c_growth : "Growth",
    c_spring : "Spring",
    c_summer : "Summer",
    c_autumn : "Autumn",
    c_winter : "Winter",
    c_demeter : "Demeter",
    c_persephone : "Persephone",


    //effectID -> display XML
    e_apple : `Add <uadd>"up to"</><numeric>a</> card<uadd>s</> with the same name as this card from your deck to your hand`,
    e_lemon : "Attack with all cards on your field with the same name as this card.",
    e_pomegranate : `If this card is sent to the trash, deal <numeric> a </> damage to all <expose/> enemies and <numeric> b </> damage to all <cover/> enemies`,
    e_banana : `Target 1 level 1 [.fruit] card in your trash (except cards whose name are the same as this card's). Play it to the field.`,
    e_pumpkin : `Increase the health of all cards on your field with the same name as this card by <numeric> b </>.`,
    e_quick : "This card does not take a turn to play to the field.",
    e_draw : `Draw <numeric> a </> cards, this is <string> c == 0 ? "NOT" : "" </> treated as a Turn draw.`,
    e_attack : `Attack <numeric> a </> times.`,
    e_fragile : `If this card attacks, destroy it afterwards.`,
    

    //zone names
    z_deck : "Deck",
    z_field : "Field",
    z_grave : "GY",
    z_hand : "Hand",
    z_void : "Void",
    z_ability : "Ability card zone",
    z_system : "System",
    z_storage : "Storage",
    z_drop : "Drop zone",

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
    d_null_deck : "Not a deck",

    d_all_lemons : "Oops, all lemon!",
    d_all_apples : "Oops, all apples!",
    d_natural : "All Natural",

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