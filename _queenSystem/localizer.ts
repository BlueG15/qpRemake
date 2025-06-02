import type { Setting } from "../types/abstract/gameComponents/settings";
import { supporttedLanguages } from "../types/abstract/gameComponents/settings";

type localizationFile = Record<string, string>

class Localizer {
    private readonly symbolMap : Map<string, string> = new Map()
    private loaded = false
    languageID : supporttedLanguages = supporttedLanguages.English
    languageStr : keyof typeof supporttedLanguages = "English"
    

    constructor(){}

    async load(setting? : Setting) : Promise<void> {
        this.loaded = false
        if(setting) {
            this.languageID = setting.languageID
            this.languageStr = setting.languageStr
        }

        this.symbolMap.clear()
        let t = await import( "../_localizationFiles/" + this.languageStr) as localizationFile
        Object.keys(t).forEach(i => {
            this.symbolMap.set(i, t[i])
        })
        this.loaded = true
    }

    getLocalizedSymbol(s : string) : string | undefined{
        if(!this.loaded) return undefined;
        return this.symbolMap.get(s);
    }

    get isLoaded(){
        return this.loaded
    }
}

export default Localizer