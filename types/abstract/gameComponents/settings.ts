import { partitionActivationBehavior } from "../../../data/cardRegistry"

export enum partitionSetting {
    "manual_mapping_no_ghost" = 0,
    "manual_mapping_with_ghost", //ghosts are gathered into a partition
    "manual_mapping_with_ghost_spread", //ghosts are gathered one to one into multiple partition
    "auto_mapping_types", //gather like-typed effects into a partition, no care ab subtype, sorted in enum order
    "auto_mapping_subtypes", //gather like-subtyped and like-typed effects into a partition, sorted in type enum -> then sutype enum  
    "auto_mapping_one_to_one", //one to one map
    "auto_mapping_ygo" //maps all effects to one partition (gonna be hella fun)
}

export type partitionSetting_manual = partitionSetting.manual_mapping_no_ghost | partitionSetting.manual_mapping_with_ghost | partitionSetting.manual_mapping_with_ghost_spread
export type partitionSetting_auto = partitionSetting.auto_mapping_one_to_one | partitionSetting.auto_mapping_subtypes | partitionSetting.auto_mapping_types | partitionSetting.auto_mapping_ygo

enum supporttedLanguages {
    "English" = 0,
    "Japanese",
    "testLang"
}

enum id_style {
    "MINIMAL" = 0, //absolute bare minimum for everything to function (randID + count)
    "REDUCED", // dataID + minimal
    "FULL", //dataID + minimal + additional info (subtypeID, effectID, etc)
}

enum auto_input_option {
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

    //partition setting override
    abstract global_partition_setting : partitionSetting
    abstract default_partition_behavior : partitionActivationBehavior

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
    languageID = supporttedLanguages.English
    mods = [] //no mods
    dynamic_id_len = 5
    id_style = id_style.MINIMAL
    id_separator = ''
    max_id_count = 65536
    effectFolder = "../../specificEffects"
    effectFiles = [
        "e_test",
        "e_status", 
        "e_generic", 
        "e_fruit", 
    ];
    modFolder_game = "../_mods/gameModules"
    modFolder_parser = "../_mods/parserModules"
    localizationFolder = "../../_localizationFiles"
    ignore_undefined_subtype = true
    ignore_undefined_effect  = true
    show_negative_stat = true
    ignore_invalid_partition_mapping = false
    global_partition_setting = partitionSetting.manual_mapping_no_ghost
    default_partition_behavior = partitionActivationBehavior.strict
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