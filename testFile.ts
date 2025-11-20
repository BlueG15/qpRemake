import queenSystem from "./_queenSystem/queenSystem";
import { defaultSetting } from "./types/abstract/gameComponents/settings";
import testSuite from "./_queenSystem/testSuite";
import globalLoader from "./global";
import type Card from "./types/abstract/gameComponents/card";
globalLoader.load()

import fs from "fs"
import Processor from "./_queenSystem/handler/oldDataProcessor";
import { simpleRenderer } from "./_queenSystem/renderer/sampleRenderers/simpleRenderer";
import { operatorRegistry } from "./data/operatorRegistry";
import { qpTerminalRenderer } from "./_queenSystem/renderer/sampleRenderers/terminalRenderer";

async function main(){
    let setting = new defaultSetting();
    let renderer = new qpTerminalRenderer()
    let s = new queenSystem(setting, renderer);
    renderer.bind(s)
    s.addPlayers("player", operatorRegistry.o_esper)
    s.addPlayers("enemy", operatorRegistry.o_null)
    await s.load();

    renderer.start();
}

main()
