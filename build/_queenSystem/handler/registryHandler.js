"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//importing loaders
const loader_card_1 = __importDefault(require("../loader/loader_card"));
const loader_effect_1 = __importDefault(require("../loader/loader_effect"));
const loader_operator_1 = __importDefault(require("../loader/loader_operator"));
const loader_rarity_1 = __importDefault(require("../loader/loader_rarity"));
const loader_subtype_1 = __importDefault(require("../loader/loader_subtype"));
const loader_type_1 = __importDefault(require("../loader/loader_type"));
const loader_zone_1 = __importDefault(require("../loader/loader_zone"));
const loader_handler_1 = __importDefault(require("../loader/loader_handler"));
const loader_localization_1 = __importDefault(require("../loader/loader_localization"));
const effectRegistry_1 = __importDefault(require("../../data/effectRegistry"));
class registryHandler {
    constructor(s) {
        this.subTypeLoader = new loader_subtype_1.default();
        this.rarityLoader = new loader_rarity_1.default();
        this.zoneLoader = new loader_zone_1.default();
        this.operatorLoader = new loader_operator_1.default();
        this.customActionLoader = new loader_handler_1.default();
        this.localizationLoader = new loader_localization_1.default(s);
        this.typeLoader = new loader_type_1.default();
        this.effectLoader = new loader_effect_1.default(effectRegistry_1.default, this.subTypeLoader, this.typeLoader);
        this.cardLoader = new loader_card_1.default(this.effectLoader);
    }
    registry_edit_card(key, value) {
        this.cardLoader.load(key, value);
    }
    registry_edit_custom_action_handler(actionIDs, handlerFunc) {
        actionIDs.forEach(i => this.customActionLoader.load(i, handlerFunc));
    }
    registry_edit_effect_data(key, val) {
        this.effectLoader.add(key, val);
    }
    registry_edit_effect_class(key, constructor) {
        this.effectLoader.add(key, constructor);
    }
    registry_edit_effect(key, data, constructor) {
        this.effectLoader.add(key, data);
        this.effectLoader.add(key, constructor);
    }
    registry_edit_effect_subtype(key, constructor) {
        this.subTypeLoader.load(key, constructor);
    }
    registry_edit_localization(language, key, val) {
        this.localizationLoader.add(language, key, val);
    }
    registry_edit_rarity(key, data) {
        this.rarityLoader.load(key, data);
    }
    registry_edit_zone_data(key, data) {
        this.zoneLoader.load(key, data);
    }
    registry_edit_zone_class(key, constructor) {
        this.zoneLoader.load(key, undefined, constructor);
    }
    registry_edit_zone(key, data, constructor) {
        this.zoneLoader.load(key, data, constructor);
    }
}
exports.default = registryHandler;
