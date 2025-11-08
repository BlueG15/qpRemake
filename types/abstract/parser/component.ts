//specifies the general textComponent

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
    "bonded" = 100, //cannot be deleted, duplicated or moved
    "cached",
    "chain",
    "consumable", 
    "death", //on death trigger
    "defense", //reduce or prevent damage
    "dragoonLink",
    "effect_condition", //lock    
    "exclusive", //unused
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
    "crash" = 1000, //image thats shows when player die, kinda bad ngl
    "loot", //the icon of the loot, show for cards that can gain you loots or check for them
    "player_health", //a simple heart icon
}

export enum componentID {
    error = -1,
    number = 1,
    text,
    image,
    reference,
    symbol,
}

export type specificComponent<T extends keyof typeof componentID> = {
    error : component,
    number : numberComponent,
    text : textComponent,
    image : imageComponent,
    reference : referenceComponent,
    symbol : symbolComponent,
}[T]

export class component{
    id : componentID

    errorFlag : boolean;
    errorMsg : string;

    sectionIDs : string[] = []
    fromCmd : string
    raw : string

    constructor(
        id : componentID = componentID.error, 
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        this.id = id;
        if(this.id == componentID.error || errMsg){
            this.errorFlag = true;
            this.errorMsg = errMsg ?  errMsg : "Unknown component";
        } else {
            this.errorFlag = false;
            this.errorMsg = "";
        }
        this.fromCmd = (fromCmd) ? fromCmd : ""
        this.raw = (raw) ? raw : ""
    }

    addSectionID(newID : string | string[]){
        if(typeof newID == "string") this.sectionIDs.push(newID); 
        else this.sectionIDs.push(...newID);
        return this;
    }

    is<T extends keyof typeof componentID>(id : T) : this is specificComponent<T> {
        return this.id === componentID[id]
    }
}

export class textComponent extends component{
    str : string
    private num = -100
    constructor(
        str : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(componentID.text, errMsg, fromCmd, raw)
        this.str = str;
        const num = Number(str)
        if(!isNaN(num) && str.trim().length){
            this.id = componentID.number
            this.num = Number(str)
        }
    }
}

export class numberComponent extends component{
    num : number
    constructor(
        num : number,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(componentID.number, errMsg, fromCmd, raw);
        this.num = num;
    }
}

export class imageComponent extends component{
    url : string
    constructor(
        url : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(componentID.image, errMsg, fromCmd, raw)
        this.url = url;
    }
} 

export class iconComponent extends imageComponent{
    iconID : iconID
    constructor(
        id : iconID,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(
            `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/icons/${iconID[id]}.png`,
            errMsg,
            fromCmd,
            raw
        );
        this.iconID = id;
    }
}

export class referenceComponent extends component {
    readonly ref : any
    constructor(
        ref : any,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(componentID.reference, errMsg, fromCmd, raw);
        this.ref = ref;
    }
}

export class symbolComponent extends component {
    readonly symbolID : string
    constructor(
        id : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(componentID.symbol, errMsg, fromCmd, raw);
        this.symbolID = id;
    }
}




