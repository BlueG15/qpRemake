
import { QueenSystem, operatorRegistry, defaultSetting, sampleRenderer, playerTypeID } from "./index";
import testSuite from "./queen-system/testSuite";

async function main(){
    let setting = new defaultSetting();
    let renderer = new sampleRenderer()
    let s = new QueenSystem(setting, renderer);
    s.addPlayers(playerTypeID.player, operatorRegistry.o_esper)
    s.addPlayers(playerTypeID.enemy, operatorRegistry.o_null)
    await s.load();

    //test stuff
    Object.entries(testSuite).forEach(([key, val]) => {
        console.log("Runng test", key)
        val(s)
    })
}

main()
