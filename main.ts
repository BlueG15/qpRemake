import queenSystem from "./_queenSystem/queenSystem";
import { defaultSetting } from "./types/abstract/gameComponents/settings";
import testSuite from "./_queenSystem/testSuite";
import globalLoader from "./global";
globalLoader.load()

import fs from "fs"
import Processor from "./_queenSystem/handler/oldDataProcessor";
import effectDataRegistry from "./data/effectRegistry";

async function main(){
    let s = new defaultSetting();
    let sys = new queenSystem(s);
    await sys.load();

    // testSuite.test7(sys);
    fs.writeFileSync("./data_processed_eff.csv", Processor.Effects())
    fs.writeFileSync("./data_processed_cards.csv", Processor.Cards())
    fs.writeFileSync("./zeroEffCardData.json", Processor.get0EffectCardsInCurrentFormat())
    fs.writeFileSync("./generics.json", Processor.getGeneric())

    console.log(effectDataRegistry.e_apple)

    testSuite.progressCheck(sys)
}

main()
