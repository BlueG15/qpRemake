interface cardData {
    importURL : string

    //more to come, i am lazy
    //realID = key_<creation index> 

    //TO DO : translate old cardData to this
    codeName : string
    displayName : string
    extension: 
}

let cardRegistry : Record<string, cardData> = {
    "blank" : {
        importURL : "../specificCard/blank.ts"
    }
}

export default cardRegistry
