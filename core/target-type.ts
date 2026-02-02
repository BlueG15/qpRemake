import { EffectModifier } from "./interface"
import { PositionDry, EffectDry, CardDry, ZoneDry } from "./interface"

//TODO : refactor this file, this is probably bad code imo
// not high priority tho

export const enum TargetTypeID {
    none = -1,

    zone,
    card,
    effect,
    effectType,
    effectSubtype,
    position,
    player,

    action,
    gameRule,
    system,
    
    string,
    boolean,
    number
}

export const Target = {
    none(){
        return {
            type : TargetTypeID.none,
            data : undefined
        } as const
    },

    action(a : any){
        return {
            type : TargetTypeID.action,
            data : a,
        } as const
    },

    gameRule(){
        return {
            type : TargetTypeID.gameRule,
            data : undefined
        } as const
    },

    system(){
        return {
            type : TargetTypeID.system,
            data : undefined
        } as const
    },

    zone(z : ZoneDry){
        return {
            type : TargetTypeID.zone, 
            data : z, 
        } as const
    },
    card(c : CardDry){
        return {
            type : TargetTypeID.card, 
            data : c,
        } as const
    },
    effect(e : EffectDry){
        return {
            type : TargetTypeID.effect, 
            data : e,
        } as const
    },
    effectType(t : EffectModifier){
        return {
            type : TargetTypeID.effectType,
            data : t
        } as const
    },
    effectSubType(st : EffectModifier){
        return {
            type : TargetTypeID.effectSubtype,
            data : st
        } as const
    },
    player(pid : number){
        return {
            type : TargetTypeID.player, 
            data : pid,
        } as const
    },
    pos(pos : PositionDry){
        return {
            type : TargetTypeID.position, 
            data : pos,
        } as const
    },

    num(num : number){return {type : TargetTypeID.number, data : num} as const},
    str(str : string){return {type : TargetTypeID.string, data : str} as const},
    bool(bool : boolean){return {type : TargetTypeID.boolean, data : bool} as const},
} as const

export type TargetNull           =  ReturnType<typeof Target["none"]>
export type TargetAction         =  ReturnType<typeof Target["action"]>
export type TargetSystem         =  ReturnType<typeof Target["system"]>
export type TargetGameRule       =  ReturnType<typeof Target["gameRule"]>
export type TargetStr            =  ReturnType<typeof Target["str"]>
export type TargetBool           =  ReturnType<typeof Target["bool"]>
export type TargetNumber         =  ReturnType<typeof Target["num"]>
export type TargetPos            =  ReturnType<typeof Target["pos"]>
export type TargetZone           =  ReturnType<typeof Target["zone"]>
export type TargetCard           =  ReturnType<typeof Target["card"]>
export type TargetEffect         =  ReturnType<typeof Target["effect"]>
export type TargetEffectType     =  ReturnType<typeof Target["effectType"]>
export type TargetEffectSubType  =  ReturnType<typeof Target["effectSubType"]>
export type TargetPlayer         =  ReturnType<typeof Target["player"]>

export type Target = (
    TargetNull           |
    TargetAction         |
    TargetSystem         |
    TargetGameRule       |
    TargetStr            |
    TargetBool           |
    TargetNumber         |
    TargetPos            |
    TargetZone           |
    TargetCard           |
    TargetEffect         |
    TargetEffectType     |
    TargetEffectSubType  |
    TargetPlayer         
)

export type TargetSpecific<T extends TargetTypeID> =
    T extends TargetTypeID.none ? TargetNull : 
    T extends TargetTypeID.action ? TargetAction :
    T extends TargetTypeID.system ? TargetSystem :
    T extends TargetTypeID.gameRule ? TargetGameRule :
    T extends TargetTypeID.effectType ? TargetEffectType :
    T extends TargetTypeID.effectSubtype ? TargetEffectSubType :
    T extends TargetTypeID.number ? TargetNumber :
    T extends TargetTypeID.string ? TargetStr :
    T extends TargetTypeID.boolean ? TargetBool :
    T extends TargetTypeID.player ? TargetPlayer :
    T extends TargetTypeID.position ? TargetPos :
    T extends TargetTypeID.zone ? TargetZone : 
    T extends TargetTypeID.card ? TargetCard :
    T extends TargetTypeID.effect ? TargetEffect : 
    Target