import type queenSystem from "./queenSystem"
import type Card from "../types/abstract/gameComponents/card"
import Position from "../types/abstract/generics/position"
import { zoneRegistry } from "../data/zoneRegistry"
import { posChange } from "../types/actions_old"

const testSuite : Record<string, ((s : queenSystem) => void)> = {
    test1 : (s : queenSystem) => {
        //draw 1 card to hand
        s.zoneHandler.deck.forceCardArrContent([
            s.cardHander.getCard("c_blank") as Card,
            s.cardHander.getCard("c_blank") as Card,
            s.cardHander.getCard("c_blank") as Card,
        ])
        s.restartTurn()

        console.log("deck before drawing: ", s.zoneHandler.deck.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before drawing: ", s.zoneHandler.hand.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))

        let a = s.zoneHandler.deck.getAction_draw(true, false, s.zoneHandler.hand.lastPos)
        s.processTurn(a);

        console.log("deck after drawing: ", s.zoneHandler.deck.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after drawing: ", s.zoneHandler.hand.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
    },

    test2 : (s : queenSystem) => {
        let target = s.cardHander.getCard("c_apple") as Card
        s.zoneHandler.hand.forceCardArrContent([
            target,
        ])
        s.zoneHandler.deck.forceCardArrContent([
            s.cardHander.getCard("c_apple") as Card,
            s.cardHander.getCard("c_apple") as Card,
        ])
        s.restartTurn()

        console.log("deck before: ", s.zoneHandler.deck.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand before: ", s.zoneHandler.hand.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field before: ", s.zoneHandler.playerField.cardArr.map(i => i ? i.dataID : ""))

        let a = new posChange(
            target.id,
            true, 
            target.pos,
            s.zoneHandler.playerField.getRandomEmptyPos()
        )
        s.processTurn(a);

        console.log("deck after: ", s.zoneHandler.deck.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("hand after: ", s.zoneHandler.hand.cardArr.map(i => i ? i.dataID : undefined).filter(i => i !== undefined))
        console.log("field after: ", s.zoneHandler.playerField.cardArr.map(i => i ? i.dataID : ""))
    },
}

export default testSuite