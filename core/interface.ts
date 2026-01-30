import type { OperatorID, DeckID, ZoneTypeID, PlayerTypeID, EffectControlCode, ActionName, ArchtypeID, EffectTypeID, EffectSubtypeID, CardDataID, EffectDataID } from "./registry"
import type { Action } from "./registry/action"
import type { TargetEffect, Target, TargetCard, TargetPos, TargetZone } from "./target-type"

export interface IdAble {
    id : string | number
}

export interface PlayerSpecific {
    playerIndex : number
    playerType : PlayerTypeID
}

export interface StatPlayer {
    playerType : PlayerTypeID
    playerIndex : number
    heart : number
    maxHeart : number
    operator : OperatorID
    deck? : DeckID
    loadCardsInfo : {
        dataID : string
        variant : string[]
        count : number
    }[]
}

export interface PositionDry {
    readonly x : number,
    readonly y : number,
    readonly zoneID : number,
    readonly length : number,
    readonly identity : TargetPos

    //safe methods
    flat() : ReadonlyArray<number>,
    toString() : string,
    is(p : PositionLike) : boolean,
}

export interface PositionLike {
    readonly x : number,
    readonly y : number,
    readonly zoneID : number,
} 

export interface Positionable {
    pos : PositionDry
}

export interface EffectDry extends IdAble {
    readonly id: string
    readonly dataID : EffectDataID
    readonly canAct: boolean
    readonly identity : TargetEffect
    readonly attr : {
        get(key : string) : number | undefined,
        number(key : string) : number,
        bool(key : string) : boolean,
    }
}

export interface EffectModifierDry {
    readonly dataID : number
}

export abstract class EffectModifier implements EffectModifierDry {
    isDisabled : boolean = false;
    constructor(public dataID : EffectTypeID | EffectSubtypeID){}
    abstract canRespondAndActivate(eff : EffectDry, c : CardDry, system : SystemDry, a : Action) : EffectControlCode
    abstract overrideActivateResults(eff : EffectDry, c : CardDry, system : SystemDry, res : Action[]) : Action[]
}

export interface CardDry extends IdAble {
    readonly id : string
    readonly dataID : CardDataID
    readonly variants : ReadonlyArray<string>

    readonly level : number
    readonly rarityID : number
    readonly atk : number
    readonly hp : number
    readonly maxAtk : number
    readonly maxHp : number
    readonly extensionArr : ReadonlyArray<string>
    readonly archtype : ReadonlyArray<ArchtypeID>

    readonly displayAtk : number
    readonly displayHp : number

    readonly totalEffects : ReadonlyArray<EffectDry>
    readonly effects : ReadonlyArray<EffectDry>
    readonly counters : ReadonlyArray<EffectDry>
    readonly statusEffects : ReadonlyArray<EffectDry>

    readonly pos : PositionDry

    readonly isDead : boolean
    readonly canAct : boolean

    readonly identity : TargetCard

    toString(spaces? : number, simplify? : boolean) : string

    is(c : IdAble) : boolean;
    is(archtype : ArchtypeID) : boolean;
    is(archtypeArr : ReadonlyArray<ArchtypeID>) : boolean;

    has(extension : string) : boolean;
    has(extensionArr : ReadonlyArray<string>) : boolean;

    isFrom(s : SystemDry, z : ZoneTypeID) : boolean;
}

export interface ZoneLayoutDry {
    localToGlobal(p : PositionDry) : PositionDry
    getOppositeZoneID(z : ZoneDry) : number | undefined
}

export interface ZoneDry extends IdAble, PlayerSpecific {
    //identifiers
    readonly id : number
    readonly dataID : number
    readonly classID : number
    readonly name : string

    readonly identity : TargetZone

    //player identifier
    readonly playerIndex : number
    readonly playerType : PlayerTypeID
    
    //attr (full)
    readonly types : ReadonlyArray<number>
    readonly attr : ReadonlyMap<string, any>

    //data
    readonly boundX             : number
    readonly boundY             : number
    readonly priority           : number
    readonly canReorderSelf     : boolean
    readonly canMoveTo          : boolean
    readonly canMoveFrom        : boolean
    readonly moveToNeedPosition : boolean
    readonly minCapacity        : number

    //state
    readonly isFull : boolean
    readonly valid : boolean

    //pos APIs
    readonly lastPos  : PositionDry
    readonly firstPos : PositionDry
    readonly top      : PositionDry
    readonly bottom   : PositionDry

    //funcs
    findIndex(cid? : string) : number
    validatePosition(p : PositionLike) : boolean
    isPositionInBounds(p : PositionLike) : boolean
    isPositionOccupied(p?: PositionLike): [number, boolean]
    
    //get action APIs
    getAddAction(s : SystemDry, c: CardDry,  p?: PositionDry, cause? : Target) : Action
    
    //positional APIs
    getBackPos(c : Positionable) : PositionDry
    getFrontPos(c : Positionable) : PositionDry
    isExposed(c : Positionable) : boolean
    isOccupied(p : PositionLike) : boolean
    getAllPos() : PositionDry[]

    //card API
    getCardByPosition(p : PositionLike) : CardDry | undefined
    cardArr : ReadonlyArray<CardDry | undefined>
    cardArrFiltered : ReadonlyArray<CardDry>

    is(type : ZoneTypeID) : boolean;
    is(obj : IdAble | undefined) : boolean;

    of(pid : number) : boolean;
    of(obj : PlayerSpecific | undefined) : boolean;
}

export interface SystemDry {
    //propeerties
    readonly threatLevel : number
    readonly maxThreatLevel : number

    //log API
    hasEffectActivated(e : EffectDry) : boolean
    hasCardActivated(c : CardDry) : boolean

    //action APIs
    getRootAction() : Action<"a_turn_end">
    generateSignature(a? : Target) : string
    getResolveOrigin<T extends ActionName>(a : Action, n : T) : undefined | Action<T>
    readonly isInTriggerPhase : boolean
    readonly isInChainPhase : boolean
    readonly turnAction : Readonly<Action> | undefined

    //zone APIs
    zoneArr : ReadonlyArray<ZoneDry>
    getZoneOf(c : Positionable) : ZoneDry
    getZoneWithID(id : number) : ZoneDry
    getLayout() : ZoneLayoutDry
}
