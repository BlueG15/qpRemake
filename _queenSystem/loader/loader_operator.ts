import type { Setting } from "../../types/abstract/gameComponents/settings";
import type { oparatorData } from "../../data/operatorRegistry";

export default class operatorLoader {

    private dataCache = new Map<string, oparatorData>()

    load(key : string, o : oparatorData){
        this.dataCache.set(key, o);
    };

    getOperator(key : string, s : Setting){
        return this.dataCache.get(key)
    }
}