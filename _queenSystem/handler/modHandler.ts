import GameModule from "../../types/mods/gameModule"
import modLoader from "../loader/loader_mod"
import type registryHandler from "./registryHandler";
import type { Setting } from "../../types/abstract/gameComponents/settings"

export default class modHandler {
    private loader : modLoader<GameModule>
    private regs : registryHandler
    private loaded : boolean = false

    constructor(s : Setting, regs : registryHandler){
        this.loader = new modLoader<GameModule>(s);
        this.regs = regs
    }

    async load() : Promise<void> {
        this.loaded = false
        await this.loader.load();
        this.loader.getAll().forEach(i => {
            i.load(this.regs)
        })
        this.loaded = true;
    }

    get isLoaded(){
        return this.loaded
    }
}