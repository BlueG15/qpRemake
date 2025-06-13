import type { Setting } from "../../types/abstract/gameComponents/settings";
import type { rarityData } from "../../types/data/rarityRegistry";

export default class rarityLoader {

    private dataCache = new Map<string, rarityData>()

    load(key : string, o : rarityData){
        this.dataCache.set(key, o);
    };

    getRarity(key : string, s : Setting){
        return this.dataCache.get(key)
    }
}