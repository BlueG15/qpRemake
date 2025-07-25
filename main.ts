import queenSystem from "./_queenSystem/queenSystem";
import { defaultSetting } from "./types/abstract/gameComponents/settings";
import testSuite from "./_queenSystem/testSuite";

async function main(){
    let s = new defaultSetting();
    let sys = new queenSystem(s);
    await sys.load();

    testSuite.test7(sys);
}

main()
