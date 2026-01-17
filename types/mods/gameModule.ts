import type registryAPI from "../gameComponents/API";

export default abstract class GameModule {
    constructor(){}
    
    //should override, call upon load
    abstract load(API : registryAPI) : void
}