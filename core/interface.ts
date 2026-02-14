import { DeckData } from "./cardData"
import type { safeSimpleTypes } from "./misc"
import type { OperatorID, DeckID, ZoneTypeID, PlayerTypeID, EffectControlCode, ActionName, ArchtypeID, EffectTypeID, EffectSubtypeID, CardDataID, EffectDataID, CardName, ZoneTypeName, EffectName } from "./registry"
import type { Action } from "./registry/action"
import type { Setting } from "./settings"
import { Target } from "./target-type"

export interface IdAble {
    id : string | number
}

export interface hasIdentity {
    readonly identity : Target
}

export interface PlayerSpecific {
    playerIndex : number
    playerType : PlayerTypeID
}

export interface PlayerStat {
    playerType : PlayerTypeID
    playerIndex : number
    heart : number
    maxHeart : number
    deck : DeckID
}

export interface PositionDry extends hasIdentity {
    readonly x : number,
    readonly y : number,
    readonly zoneID : number,
    readonly length : number,

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

export interface EffectDry extends IdAble, hasIdentity {
    readonly id: string
    readonly dataID : EffectDataID
    readonly name : EffectName,
    readonly canAct: boolean
    readonly attr : {
        get(key : string) : number | undefined,
        number(key : string) : number,
        bool(key : string) : boolean,
    }
    is(obj : IdAble) : boolean
}

export interface EffectModifierDry {
    readonly dataID : number
}

export abstract class EffectModifier implements EffectModifierDry {
    isDisabled : boolean = false;
    constructor(public id : safeSimpleTypes, public dataID : EffectTypeID | EffectSubtypeID){}
    abstract canRespondAndActivate(eff : EffectDry, c : CardDry, system : SystemDry, a : Action) : EffectControlCode
    abstract overrideActivateResults(eff : EffectDry, c : CardDry, system : SystemDry, res : Action[]) : Action[]
}

export interface CardDry extends IdAble, hasIdentity {
    readonly id : string
    readonly dataID : CardDataID
    readonly name : CardName,
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

    toString(spaces? : number, simplify? : boolean) : string

    is(c : IdAble) : boolean;
    is(archtype : ArchtypeID) : boolean;
    is(archtypeArr : ReadonlyArray<ArchtypeID>) : boolean;

    has(extension : string) : boolean;
    has(extensionArr : ReadonlyArray<string>) : boolean;

    isFrom(s : SystemDry, z : ZoneTypeID) : boolean;
}

export interface ZoneLayoutDry {
    localToGlobal(p : PositionLike) : PositionLike
    getOppositeZoneID(z : ZoneDry) : number | undefined
    isOpposite(c1 : Positionable, c2 : Positionable) : boolean;
    distance(c1 : Positionable, c2 : Positionable) : number;
}

export interface ZoneDry extends IdAble, PlayerSpecific, hasIdentity {
    //identifiers
    readonly id : number
    readonly dataID : number
    readonly classID : number
    readonly name : ZoneTypeName

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
    isC2Behind(c1 : Positionable, c2 : Positionable) : boolean
    isC2Infront(c1 : Positionable, c2 : Positionable): boolean

    //card API
    getCardByPosition(p : PositionLike) : CardDry | undefined
    cardArr : ReadonlyArray<CardDry | undefined>
    cardArrFiltered : ReadonlyArray<CardDry>

    is(type : ZoneTypeID) : boolean;
    is(obj : IdAble | undefined) : boolean;

    of(pid : number) : boolean;
    of(obj : PlayerSpecific | undefined) : boolean;

    has(obj : Positionable) : boolean;
}

export interface SystemDry {
    //properties
    readonly threatLevel : number
    readonly maxThreatLevel : number
    readonly turnCount : number
    readonly waveCount : number
    readonly setting : Readonly<Setting>
    readonly playerData : ReadonlyArray<Readonly<PlayerStat>>
    readonly NULLPOS : PositionDry
    readonly NULLCARD : CardDry

    //log API
    hasEffectActivated(e : EffectDry) : boolean
    hasCardActivated(c : CardDry) : boolean
    getActivatedEffectIDs() : string[]

    //action APIs
    getRootAction() : Action<"a_turn_end">
    generateSignature(a? : Target) : string
    getResolveOrigin<T extends ActionName>(a : Action, n : T) : undefined | Action<T>
    readonly isInTriggerPhase : boolean
    readonly isInChainPhase : boolean
    readonly turnAction : Readonly<Action> | undefined

    //zone
    readonly zoneArr : ReadonlyArray<ZoneDry>
    readonly layout : ZoneLayoutDry | undefined

    //player
    getPlayerWithID(pid : number) : PlayerStat | undefined
    getPIDof(c : Positionable) : number

    //zone & card query APIs 
    getAllZonesOfPlayer(pid : number) : Record<number, ZoneDry[]>
    getCardWithDataID(cid : string) : CardDry[]
    getWouldBeAttackTargets(c : CardDry) : CardDry[] | undefined
    is(c : Positionable, type : ZoneTypeID) : boolean

    getZoneOf(c : Positionable) : ZoneDry | undefined
    getZoneWithID(id : ZoneDry["id"]) : ZoneDry | undefined

    //iteration APIs 
    forEach(depth : 0, f : (z : ZoneDry, index : number) => any) : void
    forEach(depth : 1, f : (c : CardDry, z : ZoneDry, cindex : number, zindex : number) => any) : void
    forEach(depth : 2, f : (e : EffectDry, c : CardDry, z : ZoneDry, eindex : number, cindex : number, zindex : number) => any) : void

    map<T>(depth : 0, f : (z : ZoneDry, index : number) => T) : T[]
    map<T>(depth : 1, f : (c : CardDry, z : ZoneDry, cindex : number, zindex : number) => T) : T[]
    map<T>(depth : 2, f : (e : EffectDry, c : CardDry, z : ZoneDry, eindex : number, cindex : number, zindex : number) => T) : T[]

    filter(depth : 0, f : (z : ZoneDry, index : number) => boolean) : ZoneDry[]
    filter(depth : 1, f : (c : CardDry, z : ZoneDry, cindex : number, zindex : number) => boolean) : CardDry[]
    filter(depth : 2, f : (e : EffectDry, c : CardDry, z : ZoneDry, eindex : number, cindex : number, zindex : number) => boolean) : EffectDry[]
}