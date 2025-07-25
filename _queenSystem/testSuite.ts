import type queenSystem from "./queenSystem"
import type Card from "../types/abstract/gameComponents/card"
import type Zone from "../types/abstract/gameComponents/zone"
import { actionConstructorRegistry, actionFormRegistry } from "./handler/actionGenrator"
import utils from "../utils"
import { auto_input_option } from "../types/abstract/gameComponents/settings"

const testSuite : Record<string, ((s : queenSystem) => void)> = {
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