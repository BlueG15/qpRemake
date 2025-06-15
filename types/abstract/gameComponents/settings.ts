import { partitionActivationBehavior } from "../../data/cardRegistry"
import { loadOptions, parseOptions } from "../parser"

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

interface Setting {
    //load settings
    languageID : supporttedLanguages
    mods : string[],

    //id generation setting
    dynamic_id_len : number
    id_style : id_style
    id_separator : string
    max_id_count : number

    //dynamic load settings
    effectFolder : string
    modFolder : string
    localizationFolder : string

    //load error handling
    ignore_undefined_subtype : boolean
    ignore_undefined_effect  : boolean

    //gameplay
    show_negative_stat : boolean

    //gameplay error handling
    ignore_invalid_partition_mapping : boolean

    //partition setting override
    global_partition_setting : partitionSetting
    default_partition_behavior : partitionActivationBehavior

    //parser setting
    parser_modules : string[]
}

class defaultSetting implements Setting {
    languageID = supporttedLanguages.English;
    mods = []; //no mods
    dynamic_id_len = 5;
    id_style = id_style.MINIMAL;
    id_separator = '_';
    max_id_count = 65536
    effectFolder = "../../specificEffects";
    modFolder = "../../_mods";
    localizationFolder = "../../_localizationFiles";
    ignore_undefined_subtype = true
    ignore_undefined_effect  = true
    show_negative_stat = true
    ignore_invalid_partition_mapping = false;
    global_partition_setting = partitionSetting.manual_mapping_no_ghost
    default_partition_behavior = partitionActivationBehavior.strict
    parser_modules = ["qpOriginal"];
} 

export default new defaultSetting()

export {
    Setting,
    defaultSetting,
    supporttedLanguages,
    id_style,
}