import type registryAPI from "../abstract/gameComponents/API";

export default class gameModule {
    constructor(){}
    
    //should override, call upon load
    load(API : registryAPI) : void {}
}