"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("./handler/actionGenrator");
const settings_1 = require("../types/abstract/gameComponents/settings");
const actionInputGenerator_1 = require("./handler/actionInputGenerator");
const systemRegistry_1 = require("../data/systemRegistry");
const e_test_1 = require("../specificEffects/e_test");
const effectRegistry_1 = require("../data/effectRegistry");
const actionRegistry_1 = __importDefault(require("../data/actionRegistry"));
const effectTypeRegistry_1 = __importDefault(require("../data/effectTypeRegistry"));
const subtypeRegistry_1 = __importDefault(require("../data/subtypeRegistry"));
const testSuite = {
    //NOT WORK
    //due to system need to reset each time
    //and i dont have a reset yet
    testAll(s) {
        const fails = [];
        const succeed = [];
        const keys = Object.keys(testSuite).slice(1);
        for (const key of keys) {
            console.log(`===================\n\n`);
            console.log(`Calling t = ${key}`);
            try {
                testSuite[key](s);
                succeed.push(key);
            }
            catch (e) {
                console.log(e);
                fails.push(key);
            }
            console.log(`===================`);
        }
        console.log(`\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~`);
        console.log(`Succeeded ${succeed.length}/${fails.length + succeed.length} tests`);
        console.log(`Failed : ${fails.length}/${fails.length + succeed.length} tests: `, fails);
    },
    progressCheck(s) {
        console.log("====Effects check====");
        const EffectDataArr = s.registryFile.effectLoader.datakeys;
        const EffectClassArr = s.registryFile.effectLoader.classkeys;
        console.log(`Loaded ${EffectDataArr.length} data entries`);
        console.log(`Loaded ${EffectClassArr.length} class entries`);
        const set1 = new Set(EffectClassArr);
        EffectDataArr.forEach(i => {
            set1.delete(i);
        });
        const set2 = new Set(EffectDataArr);
        EffectClassArr.forEach(i => {
            set2.delete(i);
        });
        if (set1.size !== 0) {
            const k = Array.from(set1);
            console.warn(`There are classes NOT in the data `, k);
        }
        if (set2.size !== 0) {
            const k = Array.from(set2);
            console.warn(`There are data NOT a class `, k);
        }
        console.log("");
        console.log("====Cards check====");
        const CardDataArr = s.registryFile.cardLoader.datakeys;
        console.log(`Loaded ${CardDataArr.length} data entries`);
        console.log("");
        console.log("====Action check====");
        const PossibleActionsKeys = Object.keys(actionGenrator_1.actionConstructorRegistry);
        //ok, potentially cursed shit here
        const unhandledActionList = [];
        PossibleActionsKeys.forEach(k => {
            if (!s.___testAction(actionRegistry_1.default[k]))
                unhandledActionList.push(k);
        });
        console.log(`${unhandledActionList.length} / ${PossibleActionsKeys.length} actions unhandled`, unhandledActionList);
        console.log("");
        console.log("====Localization check====");
        const Localizer = s.localizer;
        if (!Localizer.isLoaded)
            console.log("Localizer isnt loaded");
        else {
            EffectDataArr.forEach(k => {
                const symbol = Localizer.getLocalizedSymbol(k);
                if (symbol === undefined)
                    console.log(`Effect ${k} doesnt map to a localized symbol`);
            });
            const archTypeSet = new Set();
            const extensionSet = new Set();
            CardDataArr.forEach(k => {
                const symbol = Localizer.getLocalizedSymbol(k);
                if (symbol === undefined)
                    console.log(`-Card ${k} doesnt map to a localized symbol`);
                const testCard = s.cardHandler.getCard(k);
                if (testCard) {
                    const archtype = testCard.originalData.belongTo;
                    const ex = testCard.originalData.extensionArr;
                    archtype.forEach(k => {
                        if (!archTypeSet.has(k)) {
                            archTypeSet.add(k);
                            const s = "a_" + k;
                            const symbol = Localizer.getLocalizedSymbol(s);
                            if (symbol === undefined)
                                console.log(`--Archtype ${s} of card ${testCard.dataID} doesnt map to a localized symbol`);
                        }
                    });
                    ex.forEach(k => {
                        if (!extensionSet.has(k)) {
                            extensionSet.add(k);
                            const s = "ex_" + k;
                            const symbol = Localizer.getLocalizedSymbol(s);
                            if (symbol === undefined)
                                console.log(`---Extension ${s} of card ${testCard.dataID} doesnt map to a localized symbol`);
                        }
                    });
                }
                else {
                    console.log(`-Card ${k} unsuccessfully loads`);
                }
            });
        }
        Object.keys(effectTypeRegistry_1.default).filter(k => Number.isNaN(Number(k))).forEach(k => {
            let symbol = Localizer.getLocalizedSymbol(k);
            if (symbol === undefined)
                console.log(`effect type ${k} doesnt map to a localized symbol`);
        });
        Object.keys(subtypeRegistry_1.default).filter(k => Number.isNaN(Number(k))).forEach(k => {
            let symbol = Localizer.getLocalizedSymbol(k);
            if (symbol === undefined)
                console.log(`effect type ${k} doesnt map to a localized symbol`);
        });
    },
    testConsole() {
        console.log("Oki, console can print text");
    },
    testInput1(s) {
        console.log("Testing inputs multiple chaining to multiple, autofilled = true");
        let re = new actionInputGenerator_1.inputRequester_multiple(2, systemRegistry_1.inputType.number, Utils.range(10, 7).map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        const re2 = new actionInputGenerator_1.inputRequester_multiple(5, systemRegistry_1.inputType.number, Utils.range(10).map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        re.merge_with_signature(re2);
        console.log("Begin applying first to multiple len = 5");
        console.log("Expected : 7 8 0 1 2 exactly");
        let x = 0;
        const applied = [];
        while (!re.isFinalized()) {
            x++;
            const n = re.next();
            const apply = n[1][0];
            console.log(`applying input number ${x} : `, apply.data);
            applied.push(apply.data);
            re = re.apply(s, apply);
        }
        Utils.assert([7, 8, 0, 1, 2], applied);
    },
    testInput2(s) {
        console.log("Testing inputs normal chaining to multiple, autofilled = true");
        let re = new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.number, [7].map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        re.extend(s, () => [8].map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        const re2 = new actionInputGenerator_1.inputRequester_multiple(5, systemRegistry_1.inputType.number, Utils.range(10).map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        re.merge_with_signature(re2);
        console.log("Begin applying first to multiple len = 5");
        console.log("Expected : 7 8 0 1 2 exactly");
        let x = 0;
        const applied = [];
        while (!re.isFinalized()) {
            x++;
            const n = re.next();
            const apply = n[1][0];
            console.log(`applying input number ${x} : `, apply.data);
            applied.push(apply.data);
            re = re.apply(s, apply);
        }
        Utils.assert([7, 8, 0, 1, 2], applied);
    },
    testInput3(s) {
        console.log("Testing inputs normal chaining to normal, autofilled = true");
        let re = new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.number, [7].map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        re.extend(s, () => [8].map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        const re2 = new actionInputGenerator_1.inputRequester(systemRegistry_1.inputType.number, Utils.range(10).map(i => actionInputGenerator_1.inputFormRegistry.num(i)));
        re.merge_with_signature(re2);
        console.log("Expected : 7 8");
        let x = 0;
        const applied = [];
        while (!re.isFinalized()) {
            x++;
            const n = re.next();
            const apply = n[1][0];
            console.log(`applying input number ${x} : `, apply.data);
            applied.push(apply.data);
            re = re.apply(s, apply);
        }
        Utils.assert([7, 8], applied);
    },
    test1(s) {
        //draw 1 card to hand
        s.zoneHandler.decks[0].forceCardArrContent([
            s.cardHandler.getCard("c_blank"),
            s.cardHandler.getCard("c_blank"),
            s.cardHandler.getCard("c_blank"),
        ]);
        s.restartTurn();
        console.log("deck before drawing: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand before drawing: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        let a = s.zoneHandler.decks[0].getAction_draw(s, s.zoneHandler.hands[0], actionGenrator_1.actionFormRegistry.player(s, 0), false);
        s.processTurn(a);
        console.log(systemRegistry_1.TurnPhase[s.phaseIdx]);
        console.log("deck after drawing: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand after drawing: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
    },
    test2(s) {
        let target = s.cardHandler.getCard("c_apple");
        s.zoneHandler.hands[0].forceCardArrContent([
            target,
        ]);
        s.zoneHandler.decks[0].forceCardArrContent([
            s.cardHandler.getCard("c_apple"),
            s.cardHandler.getCard("c_apple"),
        ]);
        s.restartTurn();
        const ds = s;
        console.log("deck before: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("field before: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""));
        let a = actionGenrator_1.actionConstructorRegistry.a_pos_change(ds, target)(s.zoneHandler.fields[0].getRandomEmptyPos())(actionGenrator_1.actionFormRegistry.player(ds, 0));
        s.processTurn(a);
        console.log("deck after: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("field after: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""));
    },
    test3(s) {
        let a = s.zoneHandler.decks[0].getAction_draw(s, s.zoneHandler.hands[0], actionGenrator_1.actionFormRegistry.system(), true);
        console.log(a);
    },
    test4(s) {
        console.log("zoneData: ", s.zoneHandler.map(0, (z) => `${z.dataID}, pid_${z.playerIndex}`));
    },
    test5(s) {
        let target = s.cardHandler.getCard("c_lemon");
        s.zoneHandler.fields[0].forceCardArrContent([
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
        ]);
        s.zoneHandler.fields[1].forceCardArrContent([
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
            s.cardHandler.getCard("c_lemon"),
        ]);
        s.zoneHandler.hands[0].forceCardArrContent([
            target
        ]);
        s.restartTurn();
        const ds = s;
        console.log("deck before: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("field before: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""));
        Utils.assert(s.zoneHandler.hands[0].cardArr.length, 1);
        Utils.assert(s.zoneHandler.fields[0].cardArr.length, 0);
        let a = actionGenrator_1.actionConstructorRegistry.a_pos_change(ds, target)(s.zoneHandler.fields[0].getRandomEmptyPos())(actionGenrator_1.actionFormRegistry.player(ds, 0));
        s.processTurn(a);
        console.log("deck after: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("field after: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""));
        Utils.assert(s.zoneHandler.hands[0].cardArr.length, 0);
        Utils.assert(s.zoneHandler.fields[0].cardArr.length, 1);
    },
    test6(s) {
        //test inputs
        let target = s.cardHandler.getCard("c_test");
        target.effects = [s.registryFile.effectLoader.getEffect("e_add_to_hand", s.setting)];
        s.zoneHandler.graves[0].forceCardArrContent([
            target
        ]);
        s.restartTurn();
        console.log("grave before: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        const pidArr = target.getAllPartitionsIDs(0);
        if (pidArr.length === 0)
            throw new Error("pid arr len = 0 for some reason???");
        const a = actionGenrator_1.actionConstructorRegistry.a_activate_effect_internal(s, target)(pidArr[0])(actionGenrator_1.actionFormRegistry.system());
        s.processTurn(a);
        console.log("grave after: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined));
    },
    test7(s) {
        //test prefilling inputs of a partition
        const k = s.setting.auto_input;
        s.setting.auto_input = settings_1.auto_input_option.random;
        const c = s.cardHandler.getCard("c_test");
        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ]);
        console.log("Playing c_test to field\n");
        const a = actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(s.zoneHandler.fields[0].getRandomEmptyPos())(actionGenrator_1.actionFormRegistry.player(s, 0));
        s.processTurn(a);
        s.setting.auto_input = k;
    },
    test8(s) {
        //test prefilling inputs of a partition with multiple effects
        const k = s.setting.auto_input;
        s.setting.auto_input = settings_1.auto_input_option.first;
        const c = s.cardHandler.getCard("c_test");
        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ]);
        console.log("Playing c_test to field\n");
        const a = actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(s.zoneHandler.fields[0].getRandomEmptyPos())(actionGenrator_1.actionFormRegistry.player(s, 0));
        s.processTurn(a);
        s.setting.auto_input = k;
    },
    test9(s) {
        const k = s.setting.auto_input;
        s.setting.auto_input = settings_1.auto_input_option.first;
        const ec1 = (0, e_test_1.get_effect_require_number_input)(2, [7, 8, 9]); //expects 7 8 9
        const ec2 = (0, e_test_1.get_effect_require_number_input)(5, Utils.range(10)); //expects 0 -> 10 exclusive
        const e1 = s.registryFile.effectLoader.getDirect("e_num_2", s.setting, ec1, effectRegistry_1.quickEffect.init());
        const e2 = s.registryFile.effectLoader.getDirect("e_num_5", s.setting, ec2, effectRegistry_1.quickEffect.def);
        const c = s.registryFile.cardLoader.getDirect("c_apple", s.setting, e1, e2);
        if (!c) {
            console.log("Some how get apple is not found");
            return;
        }
        console.log(c.partitionInfo);
        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ]);
        console.log("Playing c_test to field\n");
        const a = actionGenrator_1.actionConstructorRegistry.a_pos_change(s, c)(s.zoneHandler.fields[0].getRandomEmptyPos())(actionGenrator_1.actionFormRegistry.player(s, 0));
        s.processTurn(a);
        s.setting.auto_input = k;
    },
    test10(s, file) {
        const lemon = s.registryFile.cardLoader.getCard("c_pomegranate", s.setting);
        if (!lemon)
            throw Error("Somehow pom is not available");
        const localize_lemon = s.localizer.localizeCard(lemon);
        console.log(localize_lemon, { depth: 5 });
        if (file)
            file.writeFileSync("./localized_test.json", JSON.stringify(localize_lemon, null, 4));
    }
};
exports.default = testSuite;
