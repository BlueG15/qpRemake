"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subtypeRegistry_1 = __importDefault(require("../../data/subtypeRegistry"));
const subtype_chained_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_chained"));
const subtype_fieldLock_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_fieldLock"));
const subtype_hardUnique_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_hardUnique"));
const subtype_instant_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_instant"));
const subtype_once_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_once"));
const subtype_unique_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_unique"));
const subtype_hand_or_fieldLock_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_hand_or_fieldLock"));
const subtype_graveLock_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_graveLock"));
const subtype_delayed_1 = __importDefault(require("../../types/effects/effectSubtypes/subtype_delayed"));
const effectTypeRegistry_1 = __importDefault(require("../../data/effectTypeRegistry"));
const effectType_1 = __importDefault(require("../../types/abstract/gameComponents/effectType"));
const initEffect_1 = __importDefault(require("../../types/effects/effectTypes/initEffect"));
const manualEffect_1 = __importDefault(require("../../types/effects/effectTypes/manualEffect"));
const passiveEffect_1 = __importDefault(require("../../types/effects/effectTypes/passiveEffect"));
const triggerEffect_1 = __importDefault(require("../../types/effects/effectTypes/triggerEffect"));
const lockEffect_1 = __importDefault(require("../../types/effects/effectTypes/lockEffect"));
const rarityRegistry_1 = require("../../data/rarityRegistry");
const rarityRegistry_2 = __importDefault(require("../../data/rarityRegistry"));
const cardRegistry_1 = require("../../data/cardRegistry");
class cardHandler {
    constructor(s, regs) {
        this.cloader = regs.cardLoader;
        this.effloader = regs.effectLoader;
        this.subtypeloader = regs.subTypeLoader;
        this.typeLoader = regs.typeLoader;
        this.rarityLoader = regs.rarityLoader;
        this.setting = s;
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_chained], subtype_chained_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_fieldLock], subtype_fieldLock_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_hardUnique], subtype_hardUnique_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_instant], subtype_instant_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_once], subtype_once_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_unique], subtype_unique_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_handOrFieldLock], subtype_hand_or_fieldLock_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_graveLock], subtype_graveLock_1.default);
        this.subtypeloader.load(subtypeRegistry_1.default[subtypeRegistry_1.default.e_st_delayed], subtype_delayed_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_none], effectType_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_counter], effectType_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_init], initEffect_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_manual], manualEffect_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_passive], passiveEffect_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_trigger], triggerEffect_1.default);
        this.typeLoader.load(effectTypeRegistry_1.default[effectTypeRegistry_1.default.e_t_lock], lockEffect_1.default);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_white], rarityRegistry_2.default.r_white);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_green], rarityRegistry_2.default.r_green);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_blue], rarityRegistry_2.default.r_blue);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_red], rarityRegistry_2.default.r_red);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_ability], rarityRegistry_2.default.r_ability);
        this.rarityLoader.load(rarityRegistry_1.rarityRegistry[rarityRegistry_1.rarityRegistry.r_algo], rarityRegistry_2.default.r_algo);
        Object.entries(cardRegistry_1.cardDataRegistry).forEach(([key, val]) => {
            this.cloader.load(key, Object.assign({ id: key }, val));
        });
    }
    getCard(cid, variantID) {
        return this.cloader.getCard(cid, this.setting, variantID);
    }
}
exports.default = cardHandler;
