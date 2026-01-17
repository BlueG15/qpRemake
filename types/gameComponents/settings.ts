enum supporttedLanguages {
    "en", //English
    "fr", //France
    "ja", //Japanese
    "ko", //Korean
    "zh-Hans", //Simplified Chinese
    "zh-Hant", //Traditional Chinese
}

const enum id_style {
    "MINIMAL" = 0, //absolute bare minimum for everything to function (randID + count)
    "REDUCED", // dataID + minimal
    "FULL", //dataID + minimal + additional info (subtypeID, effectID, etc)
}

const enum auto_input_option {
    none, //no assumtion, prompt input even if valid choices is only one
    default, //if valid choices is one, skip that input

    //the below skips all input prompting
    first, //auto chooses the first option available
    last, //auto chooses the last option
    random, //randomly pick one
}

abstract class Setting {
    //load settings
    abstract languageID : supporttedLanguages
    
    //id generation setting
    abstract dynamic_id_len : number
    abstract id_style : id_style
    abstract id_separator : string
    abstract max_id_count : number
    
    //dynamic load settings
    abstract effectFolder : string
    abstract effectFiles : string[]
    abstract mods : string[]
    abstract modFolder_game : string
    abstract modFolder_parser : string
    abstract localizationFolder : string

    //load error handling
    abstract ignore_undefined_subtype : boolean
    abstract ignore_undefined_effect  : boolean

    //gameplay
    abstract show_negative_stat : boolean

    //input handling
    abstract auto_input : auto_input_option

    //gameplay error handling
    abstract ignore_invalid_partition_mapping : boolean

    //parser setting
    abstract parser_modules : string[]

    //optimization setting
    abstract singleton_effect_subtype : boolean
    abstract singleton_effect_type : boolean

    //game setting
    abstract spawn_instanced_zones_per_player : boolean //enable this for multiplayer shenanigans
    //this array dictates the order in which player plays / zone responses
    //enemies turn are skipped
}

class defaultSetting extends Setting {
    languageID = supporttedLanguages.en
    mods = [] //no mods
    dynamic_id_len = 5
    id_style = id_style.MINIMAL
    id_separator = ''
    max_id_count = 65536
    effectFolder = "../../defaultImplementation/effects"
    effectFiles = [
        "e_status", 
        "e_generic",
        "e_defense", 
    ];
    modFolder_game = "../_mods/gameModules"
    modFolder_parser = "../_mods/parserModules"
    localizationFolder = "../../_localizationFiles"
    ignore_undefined_subtype = true
    ignore_undefined_effect  = true
    show_negative_stat = true
    ignore_invalid_partition_mapping = false
    parser_modules = ["qpOriginal"]
    singleton_effect_subtype = true
    singleton_effect_type = true
    spawn_instanced_zones_per_player = false;
    auto_input = auto_input_option.default
} 

export default new defaultSetting()

export {
    Setting,
    defaultSetting,
    supporttedLanguages,
    auto_input_option,
    id_style,
}