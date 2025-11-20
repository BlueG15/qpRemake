import type queenSystem from "./queenSystem"
import type Card from "../types/abstract/gameComponents/card"
import type Zone from "../types/abstract/gameComponents/zone"
import { actionConstructorRegistry, actionFormRegistry } from "./handler/actionGenrator"
import { auto_input_option } from "../types/abstract/gameComponents/settings"
import { inputFormRegistry, inputRequester, inputRequester_multiple } from "./handler/actionInputGenerator"
import { dry_card, inputType, TurnPhase } from "../data/systemRegistry"
import {get_effect_require_number_input} from "../specificEffects/e_test"
import { quickEffect } from "../data/effectRegistry"
import actionRegistry from "../data/actionRegistry"
import type fs from "fs"
import effectTypeRegistry from "../data/effectTypeRegistry"
import subtypeRegistry from "../data/subtypeRegistry"
import { playerTypeID, zoneRegistry } from "../data/zoneRegistry"
import type { LocalizedCard, LocalizedEffect } from "../types/abstract/serializedGameComponents/Localized"
import type { DisplayComponent } from "../types/abstract/parser"

import chalk from "chalk"
import { ChalkFormatKeys } from "./renderer/terminal/terminal/utils"
import { rarityRegistry } from "../data/rarityRegistry"
const testSuite : Record<string, ((s : queenSystem, file? : typeof fs) => void)> = {

    //NOT WORK
    //due to system need to reset each time
    //and i dont have a reset yet
    testAll(s){

        const fails : string[] = []
        const succeed : string[] = []

        const keys = Object.keys(testSuite).slice(1)

        for(const key of keys){
            console.log(`===================\n\n`) 
            console.log(`Calling t = ${key}`)
            try{
                testSuite[key](s)
                succeed.push(key)
            }catch(e){
                console.log(e)
                fails.push(key)
            }
            console.log(`===================`) 
        }

        console.log(`\n\n\n~~~~~~~~~~~~~~~~~~~~~~~~~`) 

        console.log(`Succeeded ${succeed.length}/${fails.length + succeed.length} tests`)
        console.log(`Failed : ${fails.length}/${fails.length + succeed.length} tests: `, fails);
    },

    progressCheck(s : queenSystem){
        console.log("====Effects check====")

        const EffectDataArr = s.registryFile.effectLoader.datakeys
        const EffectClassArr = s.registryFile.effectLoader.classkeys

        console.log(`Loaded ${EffectDataArr.length} data entries`)
        console.log(`Loaded ${EffectClassArr.length} class entries`)

        const set1 = new Set(EffectClassArr)
        EffectDataArr.forEach(i => {
            set1.delete(i)
        })

        const set2 = new Set(EffectDataArr)
        EffectClassArr.forEach(i => {
            set2.delete(i)
        })

        if(set1.size !== 0){
            const k = Array.from(set1)
            console.warn(`There are classes NOT in the data `, k)
        }

        if(set2.size !== 0){
            const k = Array.from(set2)
            console.warn(`There are data NOT a class `, k)
        }

        console.log("")
        console.log("====Cards check====")
        
        const CardDataArr = s.registryFile.cardLoader.datakeys

        console.log(`Loaded ${CardDataArr.length} data entries`)

        console.log("")
        console.log("====Action check====")

        const PossibleActionsKeys = Object.keys(actionConstructorRegistry);
        
        //ok, potentially cursed shit here
        const unhandledActionList : string[] = []
        PossibleActionsKeys.forEach(k => {
            if( !s.___testAction(actionRegistry[k as any] as any) ) unhandledActionList.push(k)
        })

        console.log(`${unhandledActionList.length} / ${PossibleActionsKeys.length} actions unhandled`, unhandledActionList)

        console.log("")
        console.log("====Localization check====")
        const Localizer = s.localizer
        if(!Localizer.isLoaded) console.log("Localizer isnt loaded"); 
        else {
            EffectDataArr.forEach(k => {
                const symbol = Localizer.getLocalizedSymbol(k)
                if(symbol === undefined) console.log(`Effect ${k} doesnt map to a localized symbol`)
            })

            const archTypeSet = new Set<string>()
            const extensionSet = new Set<string>()

            CardDataArr.forEach(k => {
                const symbol = Localizer.getLocalizedSymbol(k)
                if(symbol === undefined) console.log(`-Card ${k} doesnt map to a localized symbol`)

                const testCard = s.cardHandler.getCard(k)
                if(testCard){
                    const archtype = testCard.originalData.belongTo
                    const ex = testCard.originalData.extensionArr

                    archtype.forEach(k => {
                        if(!archTypeSet.has(k)){
                            archTypeSet.add(k);
                            const s = "a_" + k
                            const symbol = Localizer.getLocalizedSymbol(s)
                            if(symbol === undefined) console.log(`--Archtype ${s} of card ${testCard.dataID} doesnt map to a localized symbol`)
                        }
                    })

                    ex.forEach(k => {
                        if(!extensionSet.has(k)){
                            extensionSet.add(k);
                            const s = "ex_" + k
                            const symbol = Localizer.getLocalizedSymbol(s)
                            if(symbol === undefined) console.log(`---Extension ${s} of card ${testCard.dataID} doesnt map to a localized symbol`)
                        }
                    })
                } else {
                    console.log(`-Card ${k} unsuccessfully loads`)
                }
            })
        }

        Object.keys(effectTypeRegistry).filter(k => Number.isNaN( Number(k) ) ).forEach(k => {
            let symbol = Localizer.getLocalizedSymbol(k)
            if(symbol === undefined) console.log(`effect type ${k} doesnt map to a localized symbol`)
        })

        Object.keys(subtypeRegistry).filter(k => Number.isNaN( Number(k) ) ).forEach(k => {
            let symbol = Localizer.getLocalizedSymbol(k)
            if(symbol === undefined) console.log(`effect type ${k} doesnt map to a localized symbol`)
        })
    },

    testConsole(){
        console.log("Oki, console can print text")
    },

    testInput1(s : queenSystem){
        console.log("Testing inputs multiple chaining to multiple, autofilled = true")

        let re = new inputRequester_multiple(2, inputType.number, Utils.range(10, 7).map(i => inputFormRegistry.num(i)))
        const re2 = new inputRequester_multiple(5, inputType.number, Utils.range(10).map(i => inputFormRegistry.num(i)))
        re.merge_with_signature(re2)

        console.log("Begin applying first to multiple len = 5");
        console.log("Expected : 7 8 0 1 2 exactly")

        let x = 0
        const applied : number[] = []
        while(!re.isFinalized()){
            x++
            const n = re.next()
            const apply = n[1]![0]
            console.log(`applying input number ${x} : `, apply.data)
            applied.push(apply.data)
            re = re.apply(s, apply) as any
        }

        Utils.assert([7, 8, 0, 1, 2], applied)
    },

    testInput2(s : queenSystem){
        console.log("Testing inputs normal chaining to multiple, autofilled = true")

        let re : any = new inputRequester(inputType.number, [7].map(i => inputFormRegistry.num(i)))
        re.extend(s, () => [8].map(i => inputFormRegistry.num(i)) )

        const re2 = new inputRequester_multiple(5, inputType.number, Utils.range(10).map(i => inputFormRegistry.num(i)))
        re.merge_with_signature(re2)

        console.log("Begin applying first to multiple len = 5");
        console.log("Expected : 7 8 0 1 2 exactly")

        let x = 0
        const applied : number[] = []
        while(!re.isFinalized()){
            x++
            const n = re.next()
            const apply = n[1]![0]
            console.log(`applying input number ${x} : `, apply.data)
            applied.push(apply.data)
            re = re.apply(s, apply)
        }

        Utils.assert([7, 8, 0, 1, 2], applied)
    },

    testInput3(s : queenSystem){
        console.log("Testing inputs normal chaining to normal, autofilled = true")

        let re = new inputRequester(inputType.number, [7].map(i => inputFormRegistry.num(i)))
        re.extend(s, () => [8].map(i => inputFormRegistry.num(i)) )

        const re2 = new inputRequester(inputType.number, Utils.range(10).map(i => inputFormRegistry.num(i)))
        re.merge_with_signature(re2)

        console.log("Expected : 7 8")

        let x = 0
        const applied : number[] = []
        while(!re.isFinalized()){
            x++
            const n = re.next()
            const apply = n[1]![0]
            console.log(`applying input number ${x} : `, apply.data)
            applied.push(apply.data)
            re = re.apply(s, apply) as any
        }

        Utils.assert([7, 8], applied)
    },

    test1(s : queenSystem){
        //draw 1 card to hand
        s.zoneHandler.decks[0].forceCardArrContent([
            s.cardHandler.getCard("c_blank") as Card,
            s.cardHandler.getCard("c_blank") as Card,
            s.cardHandler.getCard("c_blank") as Card,
        ])
        s.restartTurn()

        console.log("deck before drawing: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before drawing: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))

        let a = s.zoneHandler.decks[0].getAction_draw(s, s.zoneHandler.hands[0], actionFormRegistry.player(s, 0), false)
        s.processTurn(a);

        console.log(TurnPhase[s.phaseIdx])
        console.log("deck after drawing: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after drawing: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
    },

    test2(s : queenSystem){
        let target = s.cardHandler.getCard("c_apple") as Card
        s.zoneHandler.hands[0].forceCardArrContent([
            target,
        ])
        s.zoneHandler.decks[0].forceCardArrContent([
            s.cardHandler.getCard("c_apple") as Card,
            s.cardHandler.getCard("c_apple") as Card,
        ])
        s.restartTurn()
        const ds = s

        console.log("deck before: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field before: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""))

        let a = actionConstructorRegistry.a_pos_change(
            ds, 
            target
        )(
            s.zoneHandler.fields[0].getRandomEmptyPos()
        )(
            actionFormRegistry.player(ds, 0)
        )
        s.processTurn(a);

        console.log("deck after: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field after: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""))
    },

    test3(s : queenSystem){
        let a = s.zoneHandler.decks[0].getAction_draw(s, s.zoneHandler.hands[0], actionFormRegistry.system(), true)
        console.log(a)
    },

    test4(s : queenSystem){
        console.log("zoneData: ", s.zoneHandler.map(0, (z : Zone) => `${z.dataID}, pid_${z.playerIndex}`))
    },

    test5(s : queenSystem){
        let target = s.cardHandler.getCard("c_lemon") as Card
        s.zoneHandler.fields[0].forceCardArrContent([
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
        ])
        s.zoneHandler.fields[1].forceCardArrContent([
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
            s.cardHandler.getCard("c_lemon") as Card,
        ])
        s.zoneHandler.hands[0].forceCardArrContent([
            target
        ])
        s.restartTurn()
        const ds = s

        console.log("deck before: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field before: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""))

        Utils.assert(s.zoneHandler.hands[0].cardArr.length, 1)
        Utils.assert(s.zoneHandler.fields[0].cardArr.length, 0)

        let a = actionConstructorRegistry.a_pos_change(
            ds, 
            target
        )(
            s.zoneHandler.fields[0].getRandomEmptyPos()
        )(
            actionFormRegistry.player(ds, 0)
        )
        s.processTurn(a);

        console.log("deck after: ", s.zoneHandler.decks[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field after: ", s.zoneHandler.fields[0].cardArr.map(i => i ? i.dataID : ""))

        Utils.assert(s.zoneHandler.hands[0].cardArr.length, 0)
        Utils.assert(s.zoneHandler.fields[0].cardArr.length, 1)
    },

    test6(s : queenSystem){
        //test inputs

        let target = s.cardHandler.getCard("c_test")!;
        target.effects = [s.registryFile.effectLoader.getEffect("e_add_to_hand", s.setting)]
        s.zoneHandler.graves[0].forceCardArrContent([
            target
        ]);
        s.restartTurn();

        console.log("grave before: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))

        const pidArr = target.getAllPartitionsIDs(0)
        if(pidArr.length === 0) throw new Error("pid arr len = 0 for some reason???")
        const a = actionConstructorRegistry.a_activate_effect_internal(s, target)(pidArr[0])(actionFormRegistry.system());
        
        s.processTurn(a)

        console.log("grave after: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
    },

    test7(s : queenSystem){
        //test prefilling inputs of a partition
        const k = s.setting.auto_input
        s.setting.auto_input = auto_input_option.random

        const c = s.cardHandler.getCard("c_test")!;
        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ])

        console.log("Playing c_test to field\n")

        const a = actionConstructorRegistry.a_pos_change(
            s, c
        )(
            s.zoneHandler.fields[0].getRandomEmptyPos()
        )(
            actionFormRegistry.player(s, 0)
        )
        
        s.processTurn(a)

        s.setting.auto_input = k
    },

    test8(s : queenSystem){
        //test prefilling inputs of a partition with multiple effects
        const k = s.setting.auto_input
        s.setting.auto_input = auto_input_option.first

        const c = s.cardHandler.getCard("c_test")!;
        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ])

        console.log("Playing c_test to field\n")

        const a = actionConstructorRegistry.a_pos_change(
            s, c
        )(
            s.zoneHandler.fields[0].getRandomEmptyPos()
        )(
            actionFormRegistry.player(s, 0)
        )
        
        s.processTurn(a)

        s.setting.auto_input = k
    },

    test9(s){
        const k = s.setting.auto_input
        s.setting.auto_input = auto_input_option.first

        const ec1 = get_effect_require_number_input(2, [7, 8, 9]) //expects 7 8 9
        const ec2 = get_effect_require_number_input(5, Utils.range(10)) //expects 0 -> 10 exclusive

        const e1 = s.registryFile.effectLoader.getDirect("e_num_2", s.setting, ec1, quickEffect.init())!
        const e2 = s.registryFile.effectLoader.getDirect("e_num_5", s.setting, ec2, quickEffect.def)!

        const c = s.registryFile.cardLoader.getDirect("c_apple", s.setting, e1, e2)
        if(!c){
            console.log("Some how get apple is not found")
            return
        }

        console.log(c.partitionInfo)

        s.zoneHandler.hands[0].forceCardArrContent([
            c
        ])

        console.log("Playing c_test to field\n")

        const a = actionConstructorRegistry.a_pos_change(
            s, c
        )(
            s.zoneHandler.fields[0].getRandomEmptyPos()
        )(
            actionFormRegistry.player(s, 0)
        )

        s.processTurn(a)
        s.setting.auto_input = k
    },
    test10(s, file){
        const lemon = s.registryFile.cardLoader.getCard("c_pomegranate", s.setting)
        if(!lemon) throw Error("Somehow pom is not available")
        const localize_lemon = s.localizer.localizeCard(lemon)
        console.log(localize_lemon, {depth : 5})
        if(file)
            file.writeFileSync("./localized_test.json", JSON.stringify(localize_lemon, null, 4));
    },
    test11(s){
        console.log(zoneRegistry)
        const zones = s.getAllZonesOfPlayer(0)
        console.log(zones)
    },
    test12(s){
        //Szudzik's pairing function
        //see http://szudzik.com/ElegantPairing.pdf
        function hash(a : number, b : number){
            return `${a}_${b}`
            //return a >= b ? a * a + a + b : b * b + a;
        }
        
        const lemon = s.registryFile.cardLoader.getCard("c_lemon", s.setting)!
        s.zoneHandler.fields[1].forceCardArrContent([
            undefined!, lemon, lemon, lemon, lemon, lemon
        ])
        s.zoneHandler.fields[0].forceCardArrContent([
            lemon, lemon, lemon, lemon, lemon
        ])
        s.zoneHandler.hands[0].forceCardArrContent([
            lemon, lemon, lemon, lemon, lemon
        ])
        
        let global_x = Utils.rng(10, 0, true);
        let global_y = Utils.rng(10, 0, true);
        
        type bufferElement = {
            str : string,
            type : "card" | "ability" | "deck" | "grave" | "execute" | "keyword" | "menu" | "pad" | "player" | "debug" | "desc"
            obj? : any
        };
        const buffer : bufferElement[][] = []
        const isNOTHighLightableSet = new Set<string>()
        const dividerLines : number[] = []

        function pushToBuffer(highlightable : boolean, ...lines : bufferElement[]){
            const y = buffer.length;
            buffer.push(lines)
            if(!highlightable){
                lines.forEach((_, x) => {
                    isNOTHighLightableSet.add( hash(y, x) );
                })
            }
        }
        function addToLatestBufferLine(highlightable : boolean, ...lines : bufferElement[]){
            const y = buffer.length - 1
            const _x = buffer[y].length
            buffer[y].push(...lines)
            if(!highlightable){
                lines.forEach((_, x) => {
                    isNOTHighLightableSet.add( hash(y, x + _x) );
                })
            }
        }
        function addDivider(){
            dividerLines.push(buffer.length)
            pushToBuffer(false, {
                "str" : dividerChar,
                "type" : "pad"
            })
        }
        function isHighlightable(x : number, y : number) : 0 | 1 | 2 {
            try{
                const obj = buffer[y][x]
                const str = obj.str
                if(!str) return 0
                if(obj.type === "pad") return 0;
                if(str.trim().length === 0) return 0;
                return isNOTHighLightableSet.has(hash(y, x)) ? 0 : 1
            }catch(e : any){
                pushToBuffer(false, {
                    str : e.toString(),
                    type : "debug"
                })
                return 0
            }
        }
        
        let helpstr = new Map<string, string[]>()

        console.log(`Original highlight target: [${global_x},${global_y}]`)
        let padding = 0;

        const players = s.player_stat
        const enemy = players.filter(p => p.playerType === playerTypeID.enemy)
        const player = players.filter(p => p.playerType === playerTypeID.player)

        const playerCount = new Map<number, number>()
        const dividerChar = "-"

        enemy.concat(player).forEach(p => {

            addDivider()

            let count : number
            count = playerCount.get(p.playerType)!
            if(count === undefined) count = 0;
            else count++;
            playerCount.set(p.playerType, count)

            let playerStr = `${playerTypeID[p.playerType]} ${count === 0 ? "" : "(" + count + ")"}`
            switch(p.playerType){
                case playerTypeID.enemy : {
                    playerStr = chalk.redBright(playerStr)
                    break;
                }
                case playerTypeID.player : {
                    playerStr = chalk.greenBright(playerStr)
                    break;
                }
                default : {
                    playerStr = chalk.grey(playerStr)
                }
            }
            pushToBuffer(false, {
                str : playerStr,
                type : "player",
                obj : p
            })

            addDivider()

            const zones = s.getAllZonesOfPlayer(p.playerIndex)

            const fields = zones[zoneRegistry.z_field] ?? []
            const decks = zones[zoneRegistry.z_deck] ?? []
            const graves = zones[zoneRegistry.z_grave] ?? []
            const ability = zones[zoneRegistry.z_ability] ?? []
            const hand = zones[zoneRegistry.z_hand] ?? []
            
            let cards = fields.map(f => f.cardArr.map(c => c ? "[c]" : "[_]"))
            
            const deckStr : string[] = new Array(decks.length).fill("[D]")
            const graveStr : string[] = new Array(graves.length).fill("[GY]")
            let abilityStr : string[] = new Array(ability.length).fill("[A]")
            if(!abilityStr.length) abilityStr = ["   "]// 3 spaces
            
            const pad = {
                            str : " ".repeat(padding + 2),
                            type : "pad" as const,
                        }

            cards.forEach((carr, index) => {
                const shape = fields[index].shape

                for(let _y = 0; _y < shape[1]; _y++){
                    const y = p.playerType === playerTypeID.enemy ? shape[1] - _y - 1 : _y

                    if(y === 1) pushToBuffer(true, ...abilityStr.map(a => {
                        return {
                            str : a,
                            type : "ability" as const
                        }
                    }));
                    else pushToBuffer(false, ...abilityStr.map(a => {
                        const pad = " ".repeat(a.length)
                        return {
                            str : pad,
                            type : "pad" as const,
                        }
                    }));


                    addToLatestBufferLine(
                        true, 
                        pad, 
                        {
                            str : "[>]",
                            type : "execute",
                        }, 
                        pad
                    )

                    for(let x = 0; x < shape[0] + 1; x++){
                        if(x === shape[0]){
                            switch(y){
                                case 0 : {
                                    addToLatestBufferLine(false, pad)
                                    addToLatestBufferLine(true, ...graveStr.map((g, i) => {
                                        return {
                                            str : g,
                                            type : "grave" as const,
                                            obj : graves[i]
                                        }
                                    }));
                                    break;
                                }
                                case 1 : {
                                    addToLatestBufferLine(false, pad)
                                    addToLatestBufferLine(true, ...deckStr.map((d, i) => {
                                        return {
                                            str : d,
                                            type : "deck" as const,
                                            obj : decks[i]
                                        }
                                    }));
                                    break;
                                }
                            }
                        }
                        else addToLatestBufferLine(true, {
                            str : carr[y * shape[0] + x],
                            type : "card",
                            obj : fields[index].cardArr[y * shape[0] + x]
                        })
                    }
                }
            })

            
            if(hand.length) hand.forEach(h => {
                addDivider()
                const cards = new Array(7).fill(undefined).map((_, i) => h.cardArr[i] ? "[c]" : "[_]")
                pushToBuffer(true, ...cards.map((c, i) => {
                    return {
                        str : c,
                        type : "card" as const,
                        obj : h.cardArr[i]
                    }
                }));
            }); 
        })

        addDivider()

        function formatLocalizedComponent(c : DisplayComponent){
            if(c.is("text")) return c.str;
            if(c.is("image")) return chalk.blue(`[${c.fromCmd}].{${c.raw}}`);
            if(c.is("number")) return chalk.yellow(`${c.num}`);
            if(c.is("symbol")) return chalk.magenta(`[${c.fromCmd}].{${c.symbolID}}`);
            return c.raw
        }

        function formatLocalizedString(c : DisplayComponent[]){
            return c.map(k => formatLocalizedComponent(k)).join("")
        }

        function styleEffect(
            e : LocalizedEffect, 
            color : ChalkFormatKeys = "green",
        ) : string[][] {
            let type = formatLocalizedString(e.type)
            let subtypes = e.subtypes.map(st => formatLocalizedString(st))
            let text = formatLocalizedString(e.text)

            let typeDesc = e.typeDesc ? [
                `[${chalk.hex("#eb7a34")(chalk.bold(chalk.italic(type)))}]`, `_`, 
                `{`, `${chalk.italic(chalk.green(e.typeDesc))}`, `}`
            ] : []

            let typeStr = `[${chalk.bold(type)}]`
            helpstr.set(typeStr, typeDesc)
            let subTypeStr = subtypes.map((st, i) => {
                const res = st + ", "
                const subtypeDesc = formatLocalizedString(e.subtypesDesc ? (e.subtypesDesc[i] ?? []) : [])
                const finalDesc = [
                    `[${chalk.hex("#eb7a34")(chalk.bold(chalk.italic(st)))}]`, `_`, 
                    `{`, `${chalk.italic(chalk.green(subtypeDesc))}`, `}`
                ]
                helpstr.set(res, finalDesc)
                return res
            })

            return [
                [
                    typeStr,
                    ...subTypeStr,
                ],
                [
                    `_{`,
                    `${chalk.italic(chalk[color](text))}`,
                    `}`
                ],
            ]
            
        }

        function styleCard(c? : LocalizedCard){
            if(!c) return []
            let name = c.name.filter(k => k.is("text")).map(k => k.str).join("")
            const ex = c.extensions.map(ex => ex.filter(k => k.is("text")).map(k => k.str).join("")).join(".")
            name += "." + ex;
            const level = "▪".repeat(c.level)

            let color : ChalkFormatKeys = "whiteBright"
            switch (c.rarity){
                case rarityRegistry.r_red : {
                    color = "red";
                    break;
                }
                case rarityRegistry.r_blue : {
                    color = "cyan";
                    break;
                }
                case rarityRegistry.r_green : {
                    color = "greenBright";
                    break;
                }
                case rarityRegistry.r_ability : {
                    color = "yellow";
                    break;
                }
                case rarityRegistry.r_algo : {
                    color = "magenta";
                    break;
                }
            }

            const effectsStr = c.effects.map(e => styleEffect(e, color))
            const statusEffStr = c.statusEffects.map(e => styleEffect(e, color))
            
            const cardDesc = [
                    `${chalk[color](name)}${level}`,
                    `[`,
                    `${chalk.redBright("atk." + c.atk)}`,
                    `, `,
                    `${chalk.blueBright("hp." + c.hp)}`,
                    `]`,
                ]

            //res would be return here, but we edit buffer instead
            pushToBuffer(false, ...cardDesc.map(c => {
                return {
                    str : c,
                    type : "desc" as const
                }
            }))
            effectsStr.forEach(e => {
                pushToBuffer(true, ...e[0].map(e => {
                    return {
                        str : e,
                        type : "keyword" as const,
                    }
                })); 
                addToLatestBufferLine(false, ...e[1].map(e => {
                    return {
                        str : e,
                        type : "desc" as const,
                    }
                }))
            })
            statusEffStr.forEach(e => {
                pushToBuffer(true, ...e[0].map(e => {
                    return {
                        str : e,
                        type : "keyword" as const,
                    }
                })); 
                addToLatestBufferLine(false, ...e[1].map(e => {
                    return {
                        str : e,
                        type : "desc" as const,
                    }
                }))
            })
        }

        //highlight buffer
        let highlight_x = global_x //the xth valid index of the yth row
        let highlight_y = global_y //the yth row
        //indexing starts at 0

        function lookForward(): void {
            let count_y = 0;
            let last_valid_x = -1;
            let last_valid_y = -1;
            for (let y = 0; y < buffer.length; y++) {
                let highlighted_something = false;
                let count_x = 0;
                let last_x_in_row = -1;
                for (let x = 0; x < buffer[y].length; x++) {
                    if (isHighlightable(x, y)) {
                        last_x_in_row = x;
                        if (count_x === highlight_x && count_y === highlight_y) {
                            highlight_x = x;
                            highlight_y = y;
                            return;
                        }
                        count_x++;
                        highlighted_something = true;
                    }
                }

                if (highlighted_something) {
                    last_valid_x = last_x_in_row;
                    last_valid_y = y;
                    count_y++;
                }
                //cap x
                if (count_y - 1 === highlight_y && highlight_x >= count_x && count_x > 0) {
                    highlight_x = count_x - 1;
                    highlight_y = y;
                    return;
                }
            }
            //cap to last valid highlightable spot (-1 if not found)
            highlight_x = last_valid_x;
            highlight_y = last_valid_y;
            return;
        }
        
        let currentCell : bufferElement | undefined = undefined;

        //highlight
        lookForward()
        try{
        if(
            highlight_x >= 0 && 
            highlight_y >= 0 && 
            buffer !== undefined &&
            buffer[highlight_y] !== undefined && 
            buffer[highlight_y][highlight_x] !== undefined
        ){
            buffer[highlight_y][highlight_x].str = chalk.green(buffer[highlight_y][highlight_x].str)
            currentCell = buffer[highlight_y][highlight_x]

            pushToBuffer(false, {
                str : `Highlighting [${highlight_x}, ${highlight_y}]`,
                type : "debug",
            })

            pushToBuffer(false, {
                str : chalk.green(`Highlighted: ${buffer[highlight_y][highlight_x].str}`),
                type : "debug"
            })
        }
        }catch(e : any){
            pushToBuffer(false, {
                str : e.toString(),
                type : "debug"
            })
        }

        //print card info
        if(currentCell && currentCell.type === "card"){
            const highlightCard = currentCell.obj as Card
            addDivider()
            const localized = s.localizer.localizeCard(highlightCard)
            styleCard(localized)
        }

        if(currentCell && currentCell.type === "keyword"){
            //currenly effect text only appears when sellecting a card
            //thus the keyword current cell cannot...appear
            const helpDesc = helpstr.get(currentCell.str)
            if(helpDesc){
                addDivider()
                pushToBuffer(false, ...helpDesc.map(h =>{
                    return {
                        str : h,
                        type : "desc" as const
                    }
                }))
            }
        }   

        //uniform-ize dividers length
        dividerLines.forEach(index => {
            if(buffer[index] !== undefined){
                buffer[index] = [{
                    str : dividerChar.repeat(20),
                    type : "pad"
                }]
            }
        })

        buffer.forEach(line => console.log(line.map(line => line.str).join(" ".repeat(padding))) )

        //debug
        for(let y = 0; y < buffer.length; y++){
            for(let x = 0; x < buffer[y].length; x++){
                buffer[y][x].str = `[${
                    isHighlightable(x, y) ? chalk.green("+") : chalk.red("-")
                } ${x},${y}]`
            }
        }

        buffer.forEach(line => console.log(line.map(line => line.str).join(" ".repeat(padding))) )
    }
}

export default testSuite
