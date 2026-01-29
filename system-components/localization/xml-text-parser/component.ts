//specifies the general textComponent

//this cannot be const since we convert back from id => string for imgURL
export enum IconID  {
    //arrows
    arrowUp = 0,
    arrowDown,
    arrowLeft,
    arrowRight,
    //double arrows
    doubleArrowDown = 10,
    doubleArrowUp,
    doubleArrowLeft,
    doubleArrowRight,

    //effect icon
    bonded = 100, //cannot be deleted, duplicated or moved
    cached,
    chain,
    consumable, 
    death, //on death trigger
    defense, //reduce or prevent damage
    dragoonLink,
    effect_condition, //lock    
    exclusive, //unused
    execute,
    hardUnique,
    init,
    instant,
    lock,
    manual,
    once,
    passive,
    preload, 
    //^ after reprogram or start game, auto draw into hand, 
    // dont count towards the draw limit
    trigger,
    unique,
    void, //void this card on some condition
    
    //damage type
    dmg_magic = 200,
    dmg_phys,
    
    //misc
    crash = 1000, //image thats shows when player die, kinda bad ngl
    loot, //the icon of the loot, show for cards that can gain you loots or check for them
    player_health, //a simple heart icon
}

export const enum ComponentID {
    error = 0,
    number,
    text,
    image,
    reference,
    symbol,
}

export type ComponentSpecific<T extends ComponentID> = {
    0 : DisplayComponent,
    1 : NumberComponent,
    2 : TextComponent,
    3 : ImageComponent,
    4 : ReferenceComponent,
    5 : SymbolComponent,
}[T]

export class DisplayComponent{
    id : ComponentID

    errorFlag : boolean;
    errorMsg : string;

    sectionIDs : string[] = []
    fromCmd : string
    raw : string

    constructor(
        id : ComponentID = ComponentID.error, 
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        this.id = id;
        if(this.id == ComponentID.error || errMsg){
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

    is<T extends ComponentID>(id : T) : this is ComponentSpecific<T> {
        return this.id === id
    }
}

export class TextComponent extends DisplayComponent{
    str : string
    private num = -100 // ?? IDK what this is for and is kind scared to delete it, TODO : find out what this is doing
    constructor(
        str : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(ComponentID.text, errMsg, fromCmd, raw)
        this.str = str;
        const num = Number(str)
        if(!isNaN(num) && str.trim().length){
            this.id = ComponentID.number
            this.num = Number(str)
        }
    }
}

export class NumberComponent extends DisplayComponent{
    num : number
    constructor(
        num : number,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(ComponentID.number, errMsg, fromCmd, raw);
        this.num = num;
    }
}

export class ImageComponent extends DisplayComponent{
    url : string
    constructor(
        url : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(ComponentID.image, errMsg, fromCmd, raw)
        this.url = url;
    }
} 

export class IconComponent extends ImageComponent{
    iconID : IconID
    constructor(
        id : IconID,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(
            `https://raw.githubusercontent.com/qpProject/qpProject.github.io/refs/heads/main/icons/${IconID[id]}.png`,
            errMsg,
            fromCmd,
            raw
        );
        this.iconID = id;
    }
}

export class ReferenceComponent extends DisplayComponent {
    readonly ref : any
    constructor(
        ref : any,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(ComponentID.reference, errMsg, fromCmd, raw);
        this.ref = ref;
    }
}

export class SymbolComponent extends DisplayComponent {
    readonly symbolID : string
    constructor(
        id : string,
        errMsg? : string,
        fromCmd? : string,
        raw? : string
    ){
        super(ComponentID.symbol, errMsg, fromCmd, raw);
        this.symbolID = id;
    }
}




