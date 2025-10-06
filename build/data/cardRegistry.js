"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cardDataRegistry = exports.type_and_or_subtype_inference_method = exports.partitionActivationBehavior = void 0;
exports.defaultPartition = defaultPartition;
exports.oldImgURL = oldImgURL;
//update 1.2.9: changed the definitions of these
//If changed in future to no longer be activating the entire partition if activate
//change activatePartition in card
var partitionActivationBehavior;
(function (partitionActivationBehavior) {
    partitionActivationBehavior[partitionActivationBehavior["strict"] = 0] = "strict";
    partitionActivationBehavior[partitionActivationBehavior["first"] = 1] = "first";
    partitionActivationBehavior[partitionActivationBehavior["last"] = 2] = "last";
})(partitionActivationBehavior || (exports.partitionActivationBehavior = partitionActivationBehavior = {}));
var type_and_or_subtype_inference_method;
(function (type_and_or_subtype_inference_method) {
    type_and_or_subtype_inference_method[type_and_or_subtype_inference_method["first"] = 0] = "first";
    type_and_or_subtype_inference_method[type_and_or_subtype_inference_method["most"] = 1] = "most";
    type_and_or_subtype_inference_method[type_and_or_subtype_inference_method["all"] = 2] = "all";
})(type_and_or_subtype_inference_method || (exports.type_and_or_subtype_inference_method = type_and_or_subtype_inference_method = {}));
const rarityRegistry_1 = require("./rarityRegistry");
function defaultPartition(id, num = 0) {
    num = Array.isArray(num) ? num : [num];
    return {
        behaviorID: partitionActivationBehavior.first,
        mapping: num,
        displayID: id,
        typeID: type_and_or_subtype_inference_method.first,
        subTypeID: type_and_or_subtype_inference_method.all
    };
}
function oldImgURL(oldID) {
    return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/cards/${oldID}.png`;
}
//Welp am creating another system for this stuff
class quickCardData extends Function {
    constructor() {
        super();
        this.data = {
            variantData: {
                base: {
                    level: 1,
                    rarityID: rarityRegistry_1.rarityRegistry.r_white,
                    extensionArr: [],
                    belongTo: [],
                    atk: 0,
                    hp: 1,
                    effects: {},
                    imgURL: "",
                    partition: [],
                }
            }
        };
        this.T_this = 0;
    }
    //Adding belong to others if belongTo is empty
    fin() {
        if (this.data.variantData.base.belongTo.length === 0)
            this.data.variantData.base.belongTo = ["other"];
        return this.data;
    }
    //effects are added to the last partition
    rarity(rarity) {
        this.data.variantData.base.rarityID = rarity;
        return this;
    }
    img(oldCardName) {
        this.data.variantData.base.imgURL = oldImgURL(oldCardName);
        return this;
    }
    archtype(archtype) {
        this.data.variantData.base.belongTo.push(archtype);
        this.data.variantData.base.extensionArr.push(archtype);
        return this;
    }
    extension(ex) {
        this.data.variantData.base.extensionArr.push(ex);
        return this;
    }
    belongTo(ex) {
        this.data.variantData.base.belongTo.push(ex);
        return this;
    }
    enemy() {
        return this.belongTo("enemy");
    }
    atk(atk) {
        this.data.variantData.base.atk = atk;
        return this;
    }
    hp(hp) {
        this.data.variantData.base.hp = hp;
        return this;
    }
    level(level) {
        this.data.variantData.base.level = level;
        return this;
    }
    variant(key, data) {
        this.data.variantData[key] = data;
        return this;
    }
    upgrade(data) {
        return this.variant("upgrade_1", data);
    }
    effect(data) {
        this.data.variantData.base.effects = data.effects;
        this.data.variantData.base.partition = data.partition;
        return this;
    }
    //quickhand stat, tailwind inspired
    static get def() { return new quickCardData().toFunc(); }
    static get green() { return new quickCardData().rarity(rarityRegistry_1.rarityRegistry.r_green).toFunc(); }
    static get blue() { return new quickCardData().rarity(rarityRegistry_1.rarityRegistry.r_blue).toFunc(); }
    static get red() { return new quickCardData().rarity(rarityRegistry_1.rarityRegistry.r_red).toFunc(); }
    static get algo() { return new quickCardData().rarity(rarityRegistry_1.rarityRegistry.r_algo).toFunc(); }
    static get ability() { return new quickCardData().rarity(rarityRegistry_1.rarityRegistry.r_ability).toFunc(); }
    get l0() { return this.level(0); }
    get l2() { return this.level(2); }
    get l3() { return this.level(3); }
    static get l0() { return new quickCardData().l0.toFunc(); }
    static get l2() { return new quickCardData().l2.toFunc(); }
    static get l3() { return new quickCardData().l3.toFunc(); }
    get atk1() { return this.atk(1); }
    get atk2() { return this.atk(2); }
    get atk3() { return this.atk(3); }
    get atk4() { return this.atk(4); }
    get atk5() { return this.atk(5); }
    get hp2() { return this.hp(2); }
    get hp3() { return this.hp(3); }
    get hp4() { return this.hp(4); }
    get hp5() { return this.hp(5); }
    get hp6() { return this.hp(6); }
    get hp7() { return this.hp(7); }
    get hp8() { return this.hp(8); }
    get hp9() { return this.hp(9); }
    get hp10() { return this.hp(10); }
    stat(stat0, stat1) {
        return this.atk(stat0).hp(stat1);
    }
    static stat(stat0, stat1) {
        return new quickCardData().atk(stat0).hp(stat1).toFunc();
    }
    toFunc() {
        return new Proxy(this, {
            apply(target) {
                return target.fin();
            }
        });
    }
}
class quickEffectInfo extends Function {
    constructor() {
        super();
        this.data = {
            effects: {},
            partition: []
        };
        this.effCountArr = 0;
        this.currPartition = 0;
        this.T_this = 0;
    }
    p_start(id) {
        this.data.partition[this.currPartition] = defaultPartition(id);
        return this;
    }
    p(id) {
        this.currPartition++;
        this.data.partition[this.currPartition] = defaultPartition(id, this.effCountArr);
        return this;
    }
    e(key, obj) {
        this.data.effects[key] = obj;
        this.data.partition[this.currPartition].mapping.push(this.effCountArr);
        this.data.partition[this.currPartition].mapping = Array.from(new Set(this.data.partition[this.currPartition].mapping));
        this.effCountArr++;
        return this;
    }
    displayID(id) {
        this.data.partition[this.currPartition].displayID = id;
        return this;
    }
    behavior(be) {
        this.data.partition[this.currPartition].behaviorID = be;
        return this;
    }
    static def(displayID) {
        return new quickEffectInfo().p_start(displayID).toFunc();
    }
    fin() {
        return this.data;
    }
    toFunc() {
        return new Proxy(this, {
            apply(target) {
                return target.fin();
            }
        });
    }
}
//TODO : change to const later
const cardDataRegistry = {
    //zero eff stuff
    //removed the 2 unused nova card that wont work anyway
    c_blank: quickCardData.def.img("puzzleBlank")(),
    c_knife: quickCardData.def.extension(".hck").stat(3, 5).img("quantumKnifeTutorial")(),
    c_quantum_sigil: quickCardData.def.img("quantumSigil")(),
    c_sentry: quickCardData.def.extension("sc").enemy().stat(1, 2).img("enemySentry")(),
    c_stagemarker: quickCardData.def.img("stageMarker")(),
    c_security: quickCardData.def.extension("x").img("securityLock")(),
    c_objective_data: quickCardData.def.extension("txt").img("objectiveData1")(),
    c_active: quickCardData.green.img("openingDungeonMark")(),
    c_dummy: quickCardData.def.img("puzzleDummy")(),
    c_loot_dummy: quickCardData.def.img("lootDummy")(),
    c_lock_core: quickCardData.red.img("queenLockCore")(),
    c_machine_block: quickCardData.def.stat(0, 2).img("machineBlock").variant("2", { hp: 3, imgURL: oldImgURL("machineBlock2") })(),
    c_machine_coin: quickCardData.def.img("machineCoin")(),
    c_brain_queen: quickCardData.def.img("brainQueen")(),
    c_story_oxygen: quickCardData.def.img("storyOxygen")(),
    c_story_hydrogen: quickCardData.def.img("storyHydrogen")(),
    c_story_backdoor: quickCardData.def.img("storyBackdoor")(),
    c_flower_hologram: quickCardData.def.img("flowerHologram")(),
    c_dark_power: quickCardData.stat(2, 2).img("bossB10MinionSpawn")(),
    c_zira_defeat: quickCardData.red.l3.belongTo("boss").extension("z").img("bossCometDefeat")(),
    c_bug_passive: quickCardData.stat(0, 4).enemy().extension("mw").img("enemyPassiveBug")(),
    c_stagemark: quickCardData.def.enemy().img("enemyStageTarget")(),
    c_strong_bug: quickCardData.stat(2, 3).enemy().extension("mw").img("enemyStrongBug").upgrade({ atk: 3, hp: 5 })(),
    c_firewall: quickCardData.stat(0, 3).enemy().extension("sc").img("enemyWeakWall")(),
    c_target: quickCardData.def.enemy().img("enemyWeakTarget")(),
    c_curse: quickCardData.def.extension("x").belongTo("boss").img("miniboss1")(),
    c_legion_token: quickCardData.stat(1, 1).archtype("legion").img("vampGen2_minion").upgrade({ atk: 2 } //check syka for stat info
    )(),
    c_nova_protean: quickCardData.stat(2, 2).archtype("nova").img("novaStandard").upgrade({ atk: 3, hp: 3 })(),
    //generics
    //white
    c_after_burner: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def()
        .e("e_draw_until", { count: 2 })
        .p()
        .e("e_quick", {})()).upgrade({
        effects: quickEffectInfo
            .def()
            .e("e_draw_until", { count: 3 })
            .e("e_quick", {})().effects
    })(),
    c_battery: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def("e_turn_draw")
        .e("e_draw", { doTurnDraw: 1 })()).upgrade(quickEffectInfo
        .def("e_turn_draw")
        .e("e_draw", { doTurnDraw: 1 })
        .p()
        .e("e_quick", {})())(),
    c_flash_bang: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def()
        .e("e_delay_all", { delayCount: 3 })
        .p()
        .e("e_quick", {})()).upgrade({
        effects: quickEffectInfo
            .def()
            .e("e_delay_all", { delayCount: 4 })
            .p()
            .e("e_quick", {})().effects
    })(),
    c_cinder: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def()
        .e("e_delay_all", { delayCount: 2 })
        .e("e_quick", {})()).upgrade({
        effects: quickEffectInfo
            .def()
            .e("e_delay_all", { delayCount: 3 })
            .e("e_quick", {})().effects
    })(),
    c_ember: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def()
        .e("e_draw", { count: 1 })()).upgrade({
        effects: quickEffectInfo
            .def()
            .e("e_draw", { count: 1 })().effects
    })(),
    //green
    c_capacitor: quickCardData.def.archtype("generic").effect(quickEffectInfo
        .def()
        .e("e_capacitor_1", { maxCount: 3 })
        .p()
        .e("e_capacitor_2", {})
        .p()
        .e("e_reset_all_once_this", {})()).upgrade({
        effects: quickEffectInfo
            .def()
            .e("e_capacitor_1", { maxCount: 5 })
            .p()
            .e("e_capacitor_2", {})
            .p()
            .e("e_reset_all_once_this", {})().effects
    })(),
    //blue
    //fruits 
    //white
    c_apple: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 2,
                hp: 2,
                effects: {
                    e_apple: {
                        count: 1
                    }
                },
                imgURL: oldImgURL("naturalApple"),
                partition: [defaultPartition("c_apple")],
            },
            upgrade_1: {
                atk: 3,
                hp: 3,
                effects: {
                    e_apple: {
                        count: 2,
                    }
                }
            }
        }
    },
    c_banana: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 1,
                effects: {
                    e_banana: {
                        doArchtypeCheck: 1
                    }
                },
                imgURL: oldImgURL("naturalBanana"),
                partition: [defaultPartition()]
            },
            upgrade_1: {
                effects: {
                    e_banana: {
                        doArchtypeCheck: 0
                    }
                }
            },
        }
    },
    c_cherry: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 1,
                effects: {
                    e_draw: {
                        count: 1
                    }
                },
                imgURL: oldImgURL("naturalCherry"),
                partition: [defaultPartition()]
            },
            upgrade_1: {
                effects: {
                    e_draw: {
                        count: 2
                    }
                }
            },
        }
    },
    c_lemon: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 1,
                hp: 2,
                effects: {
                    e_lemon: {}
                },
                imgURL: oldImgURL("naturalLemon"),
                partition: [defaultPartition()]
            },
            upgrade_1: {
                atk: 2
            },
        }
    },
    c_pomegranate: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 1,
                effects: {
                    e_pomegranate: {
                        exposedDmg: 1,
                        coveredDmg: 1,
                    }
                },
                imgURL: oldImgURL("naturalPomegranate"),
                partition: [defaultPartition()]
            },
            upgrade_1: {
                effects: {
                    e_pomegranate: {
                        exposedDmg: 2,
                        coveredDmg: 1,
                    }
                }
            },
        }
    },
    c_pumpkin: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_white,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 3,
                hp: 2,
                imgURL: oldImgURL("naturalPumpkin"),
                partition: [
                    defaultPartition("c_pumpkin"),
                    defaultPartition("c_pumpkin", 1)
                ],
                effects: {
                    e_pumpkin: {
                        maxHp: 1,
                    },
                    e_fragile: {}
                }
            },
            upgrade_1: {
                effects: {
                    e_pumpkin: {
                        maxHp: 2,
                    },
                    e_fragile: {}
                }
            }
        }
    },
    //green
    c_pollinate: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_green,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 1,
                imgURL: oldImgURL("naturalPollination"),
                partition: [
                    defaultPartition("c_pollinate")
                ],
                effects: {
                    e_pollinate: {
                        doArchtypeCheck: 1
                    },
                }
            },
            upgrade_1: {
                effects: {
                    e_pollinate: {
                        doArchtypeCheck: 0
                    }
                }
            }
        }
    },
    c_greenhouse: {
        variantData: {
            base: {
                level: 2,
                rarityID: rarityRegistry_1.rarityRegistry.r_green,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 2,
                imgURL: oldImgURL("naturalGreenhouse"),
                partition: [
                    defaultPartition("c_greenhouse")
                ],
                effects: {
                    e_greenhouse: {
                        checkLevel: 1
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_greenhouse: {
                        checkLevel: 2
                    }
                }
            }
        }
    },
    //blue
    c_growth: {
        variantData: {
            base: {
                level: 1,
                rarityID: rarityRegistry_1.rarityRegistry.r_blue,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 1,
                imgURL: oldImgURL("naturalGrowth"),
                partition: [
                    defaultPartition("c_growth")
                ],
                effects: {
                    e_growth: {
                        doArchtypeCheck: 1
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_growth: {
                        doArchtypeCheck: 0
                    }
                }
            }
        }
    },
    c_spring: {
        variantData: {
            base: {
                level: 2,
                rarityID: rarityRegistry_1.rarityRegistry.r_blue,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 1,
                hp: 2,
                imgURL: oldImgURL("naturalSpring"),
                partition: [
                    defaultPartition("c_spring")
                ],
                effects: {
                    e_spring: {
                        checkLevel: 1
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_spring: {
                        checkLevel: 2
                    }
                }
            }
        }
    },
    c_summer: {
        variantData: {
            base: {
                level: 2,
                rarityID: rarityRegistry_1.rarityRegistry.r_blue,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 1,
                hp: 2,
                imgURL: oldImgURL("naturalSummer"),
                partition: [
                    defaultPartition("c_summer")
                ],
                effects: {
                    e_summer: {
                        checkLevel: 1
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_summer: {
                        checkLevel: 3
                    }
                }
            }
        }
    },
    c_autumn: {
        variantData: {
            base: {
                level: 2,
                rarityID: rarityRegistry_1.rarityRegistry.r_blue,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 1,
                hp: 2,
                imgURL: oldImgURL("naturalFall"),
                partition: [
                    defaultPartition("c_autumn")
                ],
                effects: {
                    e_autumn: {
                    // doIncAtk : 0
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_autumn: {
                    // doIncAtk : 1
                    }
                }
            }
        }
    },
    c_winter: {
        variantData: {
            base: {
                level: 2,
                rarityID: rarityRegistry_1.rarityRegistry.r_blue,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 1,
                hp: 2,
                imgURL: oldImgURL("naturalWinter"),
                partition: [
                    defaultPartition("c_winter", [0, 1]),
                    defaultPartition("c_winter", 2)
                ],
                effects: {
                    e_winter_1: {
                        mult: 1
                    },
                    e_winter_2: {},
                    e_dmg_reduction: {
                        reductionAmmount: Infinity,
                        minDmg: 1,
                    }
                }
            },
            upgrade_1: {
                effects: {
                    e_winter_1: {
                        mult: 2
                    },
                    e_winter_2: {},
                    e_dmg_reduction: {
                        reductionAmmount: Infinity,
                        minDmg: 1,
                    }
                }
            }
        }
    },
    //red
    c_persephone: {
        variantData: {
            base: {
                level: 3,
                rarityID: rarityRegistry_1.rarityRegistry.r_red,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 0,
                hp: 5,
                imgURL: oldImgURL("naturalPersephone"),
                partition: [
                    defaultPartition("c_persephone"),
                    defaultPartition("c_persephone", 1),
                    defaultPartition("c_persephone", 2),
                ],
                effects: {
                    e_persephone_1: {},
                    e_persephone_2: {},
                    e_persephone_3: {},
                }
            }
        }
    },
    c_demeter: {
        variantData: {
            base: {
                level: 3,
                rarityID: rarityRegistry_1.rarityRegistry.r_red,
                extensionArr: ["fruit"],
                belongTo: ["fruit"],
                atk: 2,
                hp: 8,
                imgURL: oldImgURL("naturalDemeter"),
                partition: [
                    defaultPartition("c_demeter"),
                    defaultPartition("c_demeter", 1),
                    defaultPartition("c_demeter", 2),
                ],
                effects: {
                    e_demeter_1: {},
                    e_demeter_2: {},
                    e_demeter_3: {},
                }
            }
        }
    },
};
exports.cardDataRegistry = cardDataRegistry;
