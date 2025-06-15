// import type { Setting } from "../../types/abstract/gameComponents/settings";
import type localizationLoader from "../loader/loader_localization";
import type registryHandler from "./registryHandler";
// import { supporttedLanguages } from "../../types/abstract/gameComponents/settings";

// type localizationFile = Record<string, string>

export default class Localizer {
    private loader : localizationLoader
    private loaded = false
    get languageID() {return this.loader.currentLanguageID}
    get languageStr() {return this.loader.currentLanguageStr}
    get currLanguageData() {return this.loader.getSymbolMap()}
    
    constructor(regs : registryHandler){
        this.loader = regs.localizationLoader
    }

    async load() : Promise<void> {
        this.loaded = false
        await this.loader.load();
        this.loaded = true
    }

    getLocalizedSymbol(s : string) : string | undefined{
        if(!this.loaded) return undefined;
        if(!this.currLanguageData) return undefined;
        return this.currLanguageData[s];
    }

    get isLoaded(){
        return this.loaded
    }
}
