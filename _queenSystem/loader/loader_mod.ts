import type { Setting } from "../../types/abstract/gameComponents/settings";

//mods have empty constructor
export default class modLoader<T> {
    private objectCache = new Map<string, T>()
    private setting : Setting

    constructor(s : Setting){ 
        this.setting = s
    }

    private async loadSingle(path : string, name : string) : Promise<void> {
        this.objectCache.set(
            name, 
            (await import(path + name)).default()
        )
    }

    async load() : Promise<void>{
        let s = this.setting.modFolder;
        if(!s.endsWith("/")) s += "/";

        let promiseArr = this.setting.mods.map(i => this.loadSingle(s, i));
        await Promise.all(promiseArr);
    }

    getMod(name : string) : T | undefined{
        return this.objectCache.get(name);
    }

    getAll() : T[]{
        return Array.from(this.objectCache.values())
    }
}