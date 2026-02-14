import type { Setting } from "../../core/settings";

const PathFromThisFileToRoot = "../../"

//mods have empty constructor
export default class ModLoader<T = void> {
    private objectCache = new Map<string, T>()
    private setting : Setting

    constructor(s : Setting){ 
        this.setting = s
    }

    private async loadSingle(path : string, name : string) : Promise<void> {
        const mod = await import(PathFromThisFileToRoot + path + name) // just import is enough
        this.objectCache.set(
            name, mod
        )
    }

    async load() : Promise<void>{
        let s = this.setting.modFolder_game;
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