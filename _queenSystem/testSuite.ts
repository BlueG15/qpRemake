import type queenSystem from "./queenSystem"
import type Card from "../types/abstract/gameComponents/card"
import type Zone from "../types/abstract/gameComponents/zone"
import { actionConstructorRegistry, actionFormRegistry } from "./handler/actionGenrator"
import { auto_input_option } from "../types/abstract/gameComponents/settings"
import { inputFormRegistry, inputRequester, inputRequester_multiple } from "./handler/actionInputGenerator"
import { inputType } from "../data/systemRegistry"

const testSuite : Record<string, ((s : queenSystem) => void)> = {

    progressCheck(s : queenSystem){
        console.log("Effects check:")

        const dataArr = s.registryFile.effectLoader.datakeys
        const classArr = s.registryFile.effectLoader.classkeys

        console.log(`Loaded ${dataArr.length} data entries`)
        console.log(`Loaded ${classArr.length} class entries`)

        const set1 = new Set(classArr)
        dataArr.forEach(i => {
            set1.delete(i)
        })

        const set2 = new Set(dataArr)
        classArr.forEach(i => {
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
        
        const dataArr2 = s.registryFile.cardLoader.datakeys

        console.log(`Loaded ${dataArr2.length} data entries`)
    },

    testInput(s : queenSystem){
        console.log("Test overriding")
        const requester = new inputRequester(inputType.number, [1, 2, 3].map(n => inputFormRegistry.num(n)));
        console.log("Intial: ", requester.next())
        requester.extend(s, (s, prev) => {
            return [100, 101, 102, 501].map(n => inputFormRegistry.num(n))
        })
        requester.extendOverride(s, (s, n) => n.data % 2 === 1)
        const k = requester.next()

        requester.apply(s, k[1]![0])

        console.log("After extending and applying once: ", requester.next())
        //expected: [101, 501]

        console.log("Test overridding inputRequest_multiple")
        const requester2 = new inputRequester_multiple(2, inputType.number, [1, 2, 3].map(n => inputFormRegistry.num(n)));
        console.log("Intial: ", requester2.next(), requester2.__multiple_len)
        requester2.extend(s, (s, prev) => {
            // console.log("prev called: ", prev)
            return [100, 101, 102, 501].map(n => inputFormRegistry.num(n))
        })

        console.log("After extending once: ", requester2.next(), requester2.__multiple_len)

        requester2.extendOverride(s, (s, n) => n.data % 2 === 1)
        const k2 = requester2.next()

        console.log("After extending and applying none: ", k2, requester2.__multiple_len)

        requester2.apply(s, k2[1]![0])
        console.log("After extending and applying once: ", requester2.next(), requester2.__multiple_len)
        
        requester2.apply(s, k2[1]![0])
        console.log("After extending and applying twice: ", requester2.next(), requester2.__multiple_len)
        //expected: [101, 501]
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

    test6(s : queenSystem){
        //test inputs

        let target = s.cardHandler.getCard("c_blank");
        target.effects = [s.registryFile.effectLoader.getEffect("e_addToHand", s.setting)]
        s.zoneHandler.graves[0].forceCardArrContent([
            target
        ]);
        s.restartTurn();

        console.log("grave before: ", s.zoneHandler.graves[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hands[0].cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))

        const a = actionConstructorRegistry.a_activate_effect_internal(s, target, target.effects[0])(actionFormRegistry.system());
        
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
    }
}

export default testSuite