import type queenSystem from "./queenSystem"
import type Card from "../types/abstract/gameComponents/card"
import type Zone from "../types/abstract/gameComponents/zone"
import { actionConstructorRegistry, actionFormRegistry } from "./handler/actionGenrator"
import { auto_input_option } from "../types/abstract/gameComponents/settings"
import { inputFormRegistry, inputRequester, inputRequester_multiple } from "./handler/actionInputGenerator"
import { inputType } from "../data/systemRegistry"
import {get_effect_require_number_input} from "../specificEffects/e_test"
import { quickEffect } from "../data/effectRegistry"
import actionRegistry from "../data/actionRegistry"

const testSuite : Record<string, ((s : queenSystem) => void)> = {

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
        console.log("Effects check:")

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

        console.log("Cards check:")
        
        const CardDataArr = s.registryFile.cardLoader.datakeys

        console.log(`Loaded ${CardDataArr.length} data entries`)

        console.log("Action check")

        const PossibleActionsKeys = Object.keys(actionConstructorRegistry);
        
        //ok, potentially cursed shit here
        const unhandledActionList : string[] = []
        PossibleActionsKeys.forEach(k => {
            if( !s.___testAction(actionRegistry[k as any] as any) ) unhandledActionList.push(k)
        })

        console.log(`${unhandledActionList.length} / ${PossibleActionsKeys.length} actions unhandled`, unhandledActionList)

        console.log("Localization check")
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
                if(symbol === undefined) console.log(`Card ${k} doesnt map to a localized symbol`)

                const testCard = s.cardHandler.getCard(k)
                if(testCard){
                    const archtype = testCard.originalData.belongTo
                    const ex = testCard.originalData.extensionArr

                    archtype.forEach(k => {
                        if(!archTypeSet.has(k)){
                            archTypeSet.add(k);
                            const s = "a_" + k
                            const symbol = Localizer.getLocalizedSymbol(s)
                            if(symbol === undefined) console.log(`Archtype ${s} of card ${testCard.dataID} doesnt map to a localized symbol`)
                        }
                    })

                    ex.forEach(k => {
                        if(!extensionSet.has(k)){
                            extensionSet.add(k);
                            const s = "ex_" + k
                            const symbol = Localizer.getLocalizedSymbol(s)
                            if(symbol === undefined) console.log(`Extension ${s} of card ${testCard.dataID} doesnt map to a localized symbol`)
                        }
                    })
                } else {
                    console.log(`Card ${k} unsuccessfully loads`)
                }
            })
        }
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
        console.dir(a, {depth : 2})
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

        let target = s.cardHandler.getCard("c_test");
        target.effects = [s.registryFile.effectLoader.getEffect("e_add_to_hand", s.setting)]
        s.zoneHandler.graves[0].forceCardArrContent([
            target
        ]);
        s.restartTurn();

        console.log("grave before: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))

        const pidArr = target.getAllPartitions(0)
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

        const c = s.cardHandler.getCard("c_test");
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

        const c = s.cardHandler.getCard("c_test");
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

        const c = s.registryFile.cardLoader.getDirect("c_test", s.setting, e1, e2)!

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
    }
}

export default testSuite