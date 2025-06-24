import type { dry_card, dry_effect } from "../../../data/systemRegistry"

//TODO : integrate cardData and effectData into this

export enum mode {
    "gameplay" = 0,
    "info",
    "debug"
}

class parseOptions {

    //whether or not to flatten the tree
    //flatten here means recursively parse through the tree, collects only modules into a new array
    flat_parse : boolean 

    mode : mode

    //cardInfo
    cardData : dry_card
    effectData : dry_effect

    //inputs
    inputNumber : number[]
    inputString : string[]

    constructor(
        mode : mode, 
        card : dry_card,
        eff : dry_effect,
        input : (number | string)[],
        flat_parse : boolean = false
    ){
        this.flat_parse = flat_parse
        this.mode = mode;
        this.cardData = card
        this.effectData = eff
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

    constructor(modulePath : string, modules = []){
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