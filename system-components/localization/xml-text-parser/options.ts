import type { CardDry } from "../../../core"

//TODO : integrate cardData and effectData into this

export const enum ParseMode {
    gameplay = 0,
    catalog,
    reprogram,
    help, //special mode to display help strings instead of normal string
    debug
}

export class ParseOptions {
    // flat parse is on, always, its off doesnt make much sense

    mode : ParseMode

    //cardInfo, empty-able in case we parsing s.th other than effects
    cardData? : CardDry

    //inputs
    inputNumber : number[]
    inputString : string[]
    input : (string | number)[]

    constructor(
        mode : ParseMode, 
        input : (number | string)[],
        card? : CardDry,
    ){
        this.mode = mode;
        this.cardData = card
        this.input = input
        this.inputNumber = [] //input.filter(i => typeof i === "number")
        this.inputString = [] //input.filter(i => typeof i === "string")

        input.forEach(i => {
            if(typeof i == "string") this.inputString.push(i);
            else this.inputNumber.push(i)
        })
    }
}

export class LoadOptions {
    modulesInUse : string[]
    modulePath : string

    constructor(modulePath : string, modules : string[] = []){
        this.modulePath = modulePath
        this.modulesInUse = modules
    }
}