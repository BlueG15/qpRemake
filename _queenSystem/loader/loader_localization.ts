import { supporttedLanguages, type Setting } from "../../types/gameComponents/settings";

export default class localizationLoader {
    private setting : Setting
    private localizationMap = new Map<string, Record<string, string>>()

    constructor(s : Setting){
        this.setting = s
    }

    async load() : Promise<void> {
        let p = this.setting.localizationFolder
        if(!p.endsWith("/")) p += "/";
        let map = (await import(p + this.currentLanguageStr)).default as Record<string, string>;
        this.localizationMap.set(this.currentLanguageStr, map);
    }

    add(lang : string, key : string, val : string){
        if(!this.localizationMap.has(lang)) return;
        (this.localizationMap.get(lang) as Record<string, string>)[key] = val;
    }

    get currentLanguageID() {return this.setting.languageID}
    get currentLanguageStr() {return supporttedLanguages[this.currentLanguageID] ?? "English"}

    getSymbolMap(lang : string = this.currentLanguageStr){
        if(!this.localizationMap.has(lang)) return;
        return (this.localizationMap.get(lang) as Record<string, string>);
    }
}