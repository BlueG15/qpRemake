type cardData = {
    importURL : string
    //realID = key_<creation index> 

    //TO DO : translate old cardData to this

    //stuff for code purposes
    id : string
    isUpgradable : true
    level : number
    rarityNumber : number
    archtype : string
    
    //normal version
    extensionArr_normal: string[]
    atk_normal : number //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp_normal : number
    effectID_normal : string[] //note to self: make an effect registry yayyyy
    
    //upgraded version
    extensionArr_upgrade: string[]
    atk_upgrade : number //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp_upgrade : number
    effectID_upgrade : string[]
    
    //stuff for display purposes
    //DO NOT CHECK THIS FOR FUNCTIONALITY
    name : string
    imgURL : string
    rarityStr : string
    rarityHex : string
    rarityBGURL : string

    //note : these exist because the displayed effects are not the actual activated effects of the card
    //weird i know
    effectStr_normal : string[]
    effectStr_upgrade : string[]
} | {
    //i separate these two out to enforce isUpgradable = true --> has to have the upgrade properties
    importURL : string
    id : string
    isUpgradable : false
    level : number
    rarityNumber : number
    archtype : string
    
    //normal version
    extensionArr_normal: string[]
    atk_normal : number //starting stat, think of these 2 as starting_maxAtk and starting_maxHp instead
    hp_normal : number
    effectID_normal : string[] //note to self: make an effect registry yayyyy
    
    //stuff for display purposes
    name : string
    imgURL : string
    rarityStr : string
    rarityHex : string
    rarityBGURL : string
    effectStr_normal : string[]
}

let cardRegistry : Record<string, cardData> = {
    "blank" : {
        importURL : "../specificCard/blank.ts",

    }
}

export default cardRegistry
