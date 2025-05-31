import queenSystem from "./_queenSystem/main";
import zoneHandler from "./_queenSystem/zoneHandler";

import blankCard from "./specificCard/blank";

import zoneRegistry from "./types/data/zoneRegistry";

async function main(){
    let z = new zoneHandler()
    await z.init(zoneRegistry)
    let s = new queenSystem(z)

    s.initializeTestGame([new blankCard(0), new blankCard(1)])
    console.log("hand-before:\n", z.hand.toDry().toString(2, true))
    console.log("deck-before:\n", z.deck.toDry().toString(2, true))

    console.log("deck len before: ", z.deck.cardArr.length)

    s.processTurn()
    console.log("hand-after:\n", z.hand.toDry().toString(2, true))
    console.log("deck-after:\n", z.deck.toDry().toString(2, true))

    console.log("deck len after: ", z.deck.cardArr.length)
}

main()
