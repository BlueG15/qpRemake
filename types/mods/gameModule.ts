import type registryAPI from "../abstract/gameComponents/API";

export default class GameModule {
    constructor(){}
    
    //should override, call upon load
    load(API : registryAPI) : void {}
}