"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.id_style = exports.auto_input_option = exports.supporttedLanguages = exports.defaultSetting = exports.partitionSetting = void 0;
const cardRegistry_1 = require("../../../data/cardRegistry");
var partitionSetting;
(function (partitionSetting) {
    partitionSetting[partitionSetting["manual_mapping_no_ghost"] = 0] = "manual_mapping_no_ghost";
    partitionSetting[partitionSetting["manual_mapping_with_ghost"] = 1] = "manual_mapping_with_ghost";
    partitionSetting[partitionSetting["manual_mapping_with_ghost_spread"] = 2] = "manual_mapping_with_ghost_spread";
    partitionSetting[partitionSetting["auto_mapping_types"] = 3] = "auto_mapping_types";
    partitionSetting[partitionSetting["auto_mapping_subtypes"] = 4] = "auto_mapping_subtypes";
    partitionSetting[partitionSetting["auto_mapping_one_to_one"] = 5] = "auto_mapping_one_to_one";
    partitionSetting[partitionSetting["auto_mapping_ygo"] = 6] = "auto_mapping_ygo"; //maps all effects to one partition (gonna be hella fun)
})(partitionSetting || (exports.partitionSetting = partitionSetting = {}));
var supporttedLanguages;
(function (supporttedLanguages) {
    supporttedLanguages[supporttedLanguages["English"] = 0] = "English";
    supporttedLanguages[supporttedLanguages["Japanese"] = 1] = "Japanese";
    supporttedLanguages[supporttedLanguages["testLang"] = 2] = "testLang";
})(supporttedLanguages || (exports.supporttedLanguages = supporttedLanguages = {}));
var id_style;
(function (id_style) {
    id_style[id_style["MINIMAL"] = 0] = "MINIMAL";
    id_style[id_style["REDUCED"] = 1] = "REDUCED";
    id_style[id_style["FULL"] = 2] = "FULL";
})(id_style || (exports.id_style = id_style = {}));
var auto_input_option;
(function (auto_input_option) {
    auto_input_option[auto_input_option["none"] = 0] = "none";
    auto_input_option[auto_input_option["default"] = 1] = "default";
    //the below skips all input prompting
    auto_input_option[auto_input_option["first"] = 2] = "first";
    auto_input_option[auto_input_option["last"] = 3] = "last";
    auto_input_option[auto_input_option["random"] = 4] = "random";
})(auto_input_option || (exports.auto_input_option = auto_input_option = {}));
class defaultSetting {
    constructor() {
        this.languageID = supporttedLanguages.English;
        this.mods = []; //no mods
        this.dynamic_id_len = 5;
        this.id_style = id_style.MINIMAL;
        this.id_separator = '';
        this.max_id_count = 65536;
        this.effectFolder = "../../specificEffects";
        this.effectFiles = [
            "e_test",
            "e_status",
            "e_generic",
            "e_fruit",
        ];
        this.modFolder_game = "../_mods/gameModules";
        this.modFolder_parser = "../_mods/parserModules";
        this.localizationFolder = "../../_localizationFiles";
        this.ignore_undefined_subtype = true;
        this.ignore_undefined_effect = true;
        this.show_negative_stat = true;
        this.ignore_invalid_partition_mapping = false;
        this.global_partition_setting = partitionSetting.manual_mapping_no_ghost;
        this.default_partition_behavior = cardRegistry_1.partitionActivationBehavior.strict;
        this.parser_modules = ["qpOriginal"];
        this.singleton_effect_subtype = true;
        this.singleton_effect_type = true;
        this.spawn_instanced_zones_per_player = false;
        this.auto_input = auto_input_option.default;
    }
}
exports.defaultSetting = defaultSetting;
exports.default = new defaultSetting();
