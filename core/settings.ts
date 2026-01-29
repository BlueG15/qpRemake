const enum LanguageID {
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

interface Setting {
    //load settings
    languageID : LanguageID
    
    //id generation setting
    dynamic_id_len : number
    id_style : id_style
    id_separator : string
    max_id_count : number
    
    //dynamic load settings
    mods : string[]
    modFolder_game : string
    modFolder_parser : string

    //load error handling
    ignore_undefined_subtype : boolean
    ignore_undefined_effect  : boolean

    //gameplay
    show_negative_stat : boolean

    //input handling
    auto_input : auto_input_option

    //gameplay error handling

    //parser setting
    parser_modules : string[]

    //optimization setting
    singleton_effect_subtype : boolean
    singleton_effect_type : boolean

    //game setting
}


//TODO : move this into a static method over on system
class defaultSetting implements Setting {
    languageID = LanguageID.en
    mods = [] //no mods
    dynamic_id_len = 5
    id_style = id_style.MINIMAL
    id_separator = ''
    max_id_count = 65536
    modFolder_game = "../_mods/gameModules"
    modFolder_parser = "../_mods/parserModules"
    ignore_undefined_subtype = true
    ignore_undefined_effect  = true
    show_negative_stat = true
    parser_modules = ["qpOriginal"]
    singleton_effect_subtype = true
    singleton_effect_type = true
    auto_input = auto_input_option.default
} 

const SettingDefault = new defaultSetting()

export {
    Setting,
    SettingDefault,
    LanguageID,
    auto_input_option,
    id_style,
}