import type Card from "../types/abstract/gameComponents/card";

export default class cardHandler {

    //Cards have 2 parts

    //Data and Code
    //For gameplay purposes, Data needs to be all loaded into memory
    //gameplay purposes:
    //  knowing what cards belong to which cardSet (archtypes), including custom set, for handling drops
    //  knowing what cards are available
    //  

    //so because of this, I decided, we load the code too, why not
    //

    //TODO: finish this file
    dataCache : Map<string, number> = new Map()
    classCache : Map<string, typeof Card> = new Map()

    cardHandler(){}
    async load(cardID : string) : Promise<void> {}
    getCard(cardID : string) : Card | undefined {return undefined}
    getAllCards() : Card[] {return []}
    getAllCardSet() : string[] {return []}
}