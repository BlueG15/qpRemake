import queenSystem from "./_queenSystem/queenSystem";
import { defaultSetting } from "./types/abstract/gameComponents/settings";
import testSuite from "./_queenSystem/testSuite";
import globalLoader from "./global";
globalLoader.load()

import fs from "fs"
import Processor from "./_queenSystem/handler/oldDataProcessor";
import { simpleRenderer } from "./_queenSystem/renderer/simpleRenderer";
import { operatorRegistry } from "./data/operatorRegistry";
import { qpTerminalRenderer } from "./_queenSystem/renderer/terminalRenderer";

async function main(){
    let s = new defaultSetting();
    let renderer = new qpTerminalRenderer()
    let sys = new queenSystem(s, renderer);
    renderer.bind(sys)
    sys.addPlayers("player", operatorRegistry.o_esper)
    sys.addPlayers("enemy", operatorRegistry.o_null)
    await sys.load();

    // testSuite.test7(sys);
    // fs.writeFileSync("./data_processed_eff.csv", Processor.Effects())
    // fs.writeFileSync("./data_processed_cards.csv", Processor.Cards())
    // fs.writeFileSync("./zeroEffCardData.json", Processor.get0EffectCardsInCurrentFormat())
    // fs.writeFileSync("./generics.json", Processor.getGeneric())

    // testSuite.progressCheck(sys)
    // testSuite.test10(sys, fs)
    renderer.start();
}

main()
