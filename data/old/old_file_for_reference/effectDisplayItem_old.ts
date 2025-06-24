
//display data
export enum effectText_sectionID {
    "error" = -1,
    "other" = 0, //should not be used but here just in case
    "effect" = 1,
    "cost" = 2,
    "condition" = 3,
}
  
export enum effectText_tokenID {
    "error" = -1,
    "text" = 0,
    "action",
    "target",
    "timing",

//more later
}

export enum iconID  {

    //arrows
    "arrowUp" = 0,
    "arrowDown",
    "arrowLeft",
    "arrowRight",
    //double arrows
    "doubleArrowDown" = 10,
    "doubleArrowUp",
    "doubleArrowLeft",
    "doubleArrowRight",

    //effect icon
    "bonded" = 100, //cannot be deleted
    "cached",
    "chain",
    "consumable", 
    "death", //on death trigger
    "defense", //reduce or prevent damage
    "dragoonLink",
    "effect_condition", //lock    
    "exclusive", //unused, no clue what the fuck this does
    "execute",
    "hardUnique",
    "init",
    "instant",
    "lock",
    "manual",
    "once",
    "passive",
    "preload", 
    //^ after reprogram or start game, auto draw into hand, 
    // dont count towards the draw limit
    "trigger",
    "unique",
    "void", //void this card on some condition
    
    //damage type
    "dmg_magic" = 200,
    "dmg_phys",
    
    //misc
    "crash" = 1000, //image thats hows when player die, kinda bad ngl
    "loot", //the icon of the loot, show for cards that can gain you loots or chekc for them
    "player_health", //a simple heart icon
}

export class effectDisplayItem_text {
    str: string
    sectionID: effectText_sectionID
    tokenID : effectText_tokenID
    constructor(str : string, sectionID: effectText_sectionID, tokenID: effectText_tokenID){
        this.str = str,
        this.sectionID = sectionID,
        this.tokenID = tokenID
    }
}

export class effectDisplayItem_icon {
    iconID : iconID
    constructor(id : iconID){this.iconID = id}
    get url() {
        return `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/icons/${this.iconID}.png`
    }
}

//unused but supported
export class effectDisplayItem_image {
    url : string
    constructor(url : string){
        this.url = url
    }
}

export type effectDisplayItem = effectDisplayItem_text | effectDisplayItem_icon | effectDisplayItem_image

