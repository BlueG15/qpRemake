import type { dry_card, dry_effect } from "../../../data/systemRegistry"

//TODO : integrate cardData and effectData into this

export enum parseMode {
    "gameplay" = 0,
    "catalog",
    "reprogram",
    "info",
    "debug"
}

class parseOptions {

    //whether or not to flatten the tree
    //flatten here means recursively parse through the tree, collects only modules into a new array
    flat_parse : boolean 

    mode : parseMode

    //cardInfo, empty-able in case we parsing s.th other than effects
    cardData? : dry_card

    //inputs
    inputNumber : number[]
    inputString : string[]

    constructor(
        mode : parseMode, 
        input : (number | string)[],
        flat_parse : boolean = false,
        
        card? : dry_card,
    ){
        this.flat_parse = flat_parse
        this.mode = mode;
        this.cardData = card
        this.inputNumber = []
        this.inputString = []

        input.forEach(i => {
            if(typeof i == "string") this.inputString.push(i);
            else this.inputNumber.push(i)
        })
    }
}

class loadOptions {
    modulesInUse : string[]
    modulePath : string

    constructor(modulePath : string, modules : string[] = []){
        this.modulePath = modulePath
        this.modulesInUse = modules
    }
}

const lib_parse_option = {
        preserveComments : false,
        preserveXmlDeclaration : false,
        preserveDocumentType: false,
        ignoreUndefinedEntities: false,
        includeOffsets: true,
        sortAttributes: false,
        preserveCdata: false,
    }

export {parseOptions, loadOptions, lib_parse_option}