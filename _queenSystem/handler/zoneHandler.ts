//zones handler is handler of all the zones
//and importantly, converter from action to zone func calls

import Zone, { Zone_T } from "../../types/gameComponents/zone";
import Effect from "../../types/gameComponents/effect";
import Card from "../../types/gameComponents/card";
import type EffectSubtype from "../../types/gameComponents/effectSubtype";

import System from "../../defaultImplementation/zones/system";
import res from "../../types/generics/universalResponse";
import Deck from "../../defaultImplementation/zones/deck";
import Storage from "../../defaultImplementation/zones/storage";
import Grave from "../../defaultImplementation/zones/grave";
import Hand from "../../defaultImplementation/zones/hand";
import Field from "../../defaultImplementation/zones/field";
import Ability from "../../defaultImplementation/zones/ability";
import Void from "../../defaultImplementation/zones/void";
// import type dry_card from "../dryData/dry_card";
import zoneLoader from "../loader/loader_zone";
import type { Setting } from "../../types/gameComponents/settings";

import zoneDataRegistry, { playerTypeID, zoneData } from "../../data/zoneRegistry";
import { zoneRegistry, zoneName, zoneID } from "../../data/zoneRegistry";

import { StatusEffect_base } from "../../defaultImplementation/effects/e_status";

import { cannotLoad, cardNotExist, effectNotExist, incorrectActiontype, zoneAttrConflict, zoneNotExist } from "../../defaultImplementation/errors";
import type registryHandler from "./registryHandler";
import Position from "../../types/generics/position";
import { Action, Action_class, actionAttrType, actionConstructorRegistry, actionFormRegistry, TargetType } from "./actionGenrator";
import { type identificationInfo_card, type identificationInfo, type identificationInfo_effect, type identificationInfo_subtype, identificationType } from "../../data/systemRegistry";
import type error from "../../defaultImplementation/errors/error";
import type HandlerLoader from "../loader/loader_action";
import { damageType } from "../../data/systemRegistry";
import type { dry_system, dry_card, dry_zone, inputData, player_stat, logInfoResolve, logInfoHasResponse } from "../../data/systemRegistry";
import { inputApplicator, InputRequester } from "./actionInputGenerator";
import type QueenSystem from "../queenSystem";
import Drop from "../../defaultImplementation/zones/drop";
import { SerializedLayout, SerializedTransform } from "../../types/serializedGameComponents/Gamestate";

type ZoneContructor = new (...p : ConstructorParameters<typeof Zone>) => Zone_T

class TransformInfo {
    constructor(
        public boundZone : Zone,
        public originX : TransformInfo | number = 0, // assume if Zone -> place to the right
        public originY : TransformInfo | number = 0, // assume if Zone -> place to the bottom
        public flipHoz: boolean = false,
        public rotation: 0 | 90 | 180 | 270 = 0,
    ) {}

    protected get origin(){
        let x = this.originX
        if(x instanceof TransformInfo){
            x = (x.rotation === 90 || x.rotation === 270) ? x.boundZone.boundY : x.boundZone.boundX
        }
        let y = this.originY
        if(y instanceof TransformInfo){
            y = (y.rotation === 90 || y.rotation === 270) ? y.boundZone.boundX : y.boundZone.boundY
        }
        return [x, y]
    }

    flipHorizontally(): this {
        this.flipHoz = !this.flipHoz;
        return this;
    }

    flipVertically(): this {
        // Vertical flip = Horizontal flip + 180° rotation
        this.flipHoz = !this.flipHoz;
        this.rotation = ((this.rotation + 180) % 360) as this["rotation"];
        return this;
    }

    rotate(degree: this["rotation"], isClockwise = true): this {
        const delta = isClockwise ? degree : -degree;
        this.rotation = ((this.rotation + delta + 360) % 360) as this["rotation"];
        return this;
    }

    translate(x : number, y : number) : this {
        this.originX = x
        this.originY = y
        return this
    }

    transformPoint(x: number, y: number): [number, number] {
        let tx = x;
        let ty = y;

        const width = this.boundZone.boundX
        const height = this.boundZone.boundY
        
        // Apply horizontal flip
        if (this.flipHoz) {
            tx = width - tx;
        }
        
        // Apply rotation (clockwise around top-left origin)
        switch (this.rotation) {
            case 90:
                [tx, ty] = [ty, width - tx];
                break;
            case 180:
                [tx, ty] = [width - tx, height - ty];
                break;
            case 270:
                [tx, ty] = [height - ty, tx];
                break;
        }
        
        // Apply translation
        const [ox, oy] = this.origin
        tx += ox;
        ty += oy;
        
        return [tx, ty];
    }

    toSerialized() : SerializedTransform {
        return new SerializedTransform(
            this.originX instanceof TransformInfo ? {
                type : "transform",
                id : this.originX.boundZone.id
            } : {
                type : "number",
                num : this.originX
            },
            this.originY instanceof TransformInfo ? {
                type : "transform",
                id : this.originY.boundZone.id
            } : {
                type : "number",
                num : this.originY
            },
            this.flipHoz,
            this.rotation
        )
    }
}

//anything inside the layout is not convertable from internal position -> layout/global position
export abstract class Layout {
    protected zoneMap = new Map<Zone["id"], TransformInfo>()
    protected oppositeZones : number[][] = []

    abstract load(Fields : Field[]) : void

    private getTransform(z : Zone | TransformInfo){
        if(z instanceof Zone){
            const T = this.zoneMap.get(z.id)
            if(T) return T;
            return this.transform(z);
        } else return z
    }

    protected transform(z : Zone){
        const T = new TransformInfo(z)
        this.zoneMap.set(z.id, T)
        return T
    }

    protected setAsOpposite(z1 : TransformInfo | Zone, z2 : TransformInfo | Zone) : void {
        if(z1 instanceof TransformInfo) z1 = z1.boundZone;
        if(z2 instanceof TransformInfo) z2 = z2.boundZone;

        let i1 = this.oppositeZones.findIndex(s => s.includes(z1.id))
        let i2 = this.oppositeZones.findIndex(s => s.includes(z2.id))
        if(i1 < 0 && i2 < 0){
            this.oppositeZones.push([z1.id, z2.id])
            return
        }
        if(i1 >= 0 && i2 >= 0 && i1 !== i2){
            const z2 = this.oppositeZones[i2]
            const z1 = this.oppositeZones[i1]
            const z3 = [...new Set([...z1, ...z2])]
            this.oppositeZones[i1] = z3
            this.oppositeZones.splice(i2, 1)
            return
        }
        const group = this.oppositeZones[i1 < 0 ? i2 : i1]
        if(!group.includes(z1.id)) group.push(z1.id)
        if(!group.includes(z2.id)) group.push(z2.id)
    }

    protected statckVertically(z1 : Zone | TransformInfo, z2 : Zone | TransformInfo){
        if(z1 instanceof Zone) z1 = this.getTransform(z1);
        if(z2 instanceof Zone) z2 = this.getTransform(z2);
        z1.originY = z2
    }

    protected statckHorizontally(z1 : Zone | TransformInfo, z2 : Zone | TransformInfo){
        if(z1 instanceof Zone) z1 = this.getTransform(z1);
        if(z2 instanceof Zone) z2 = this.getTransform(z2);
        z1.originX = z2
    }

    getOppositeZoneID(z : Zone) : number | undefined {
        return this.oppositeZones.find(s => s.includes(z.id))?.find(id => id !== z.id)
    }

    localToGlobal(p : Position) : Position {
        const zid = p.zoneID
        const T = this.zoneMap.get(zid)
        if(!T) return p;

        return new Position(zid, p.zoneName, ...T.transformPoint(p.x, p.y))
    }

    toSerialized(){
        return new SerializedLayout(
            Object.fromEntries([...this.zoneMap.entries()].map(([n, T]) => [n, T.toSerialized()])),
            this.oppositeZones
        )
    }

    static fromSerialized(zoneArr : readonly Zone[], oppositeZones : number[][], transforms : Record<number, SerializedTransform>){
        const layout = new EmptyLayout()
        layout.oppositeZones = oppositeZones
        const zoneMap = new Map(Object.entries(transforms).map(([n, v]) => [Number(n), new TransformInfo(zoneArr[Number(n)], 0, 0, v.flipHoz, v.rotation)] as const))
        for(const K of zoneMap.keys()){
            const T = transforms[K]
            if(T.originX.type === "number"){
                zoneMap.get(K)!.originX = T.originX.num 
            } else {
                zoneMap.get(K)!.originX = zoneMap.get(T.originX.id)!
            }

            if(T.originY.type === "number"){
                zoneMap.get(K)!.originY = T.originY.num 
            } else {
                zoneMap.get(K)!.originY = zoneMap.get(T.originY.id)!
            }
        }
        layout.zoneMap = zoneMap
        return layout
    }
}


class EmptyLayout extends Layout {
    override load(): void {}
}

export class DefaultLayout extends Layout {
    protected override statckVertically(z1: Zone | TransformInfo, z2: Zone | TransformInfo): void {
        this.setAsOpposite(z1, z2)
        return super.statckVertically(z1, z2)
    }
    override load(Fields: Field[]): void {
        const playerField = Fields.find(f => f.of(playerTypeID.player))
        const enemyField = Fields.find(f => f.of(playerTypeID.enemy))
        if(!playerField || !enemyField) return;
        this.statckVertically(this.transform(enemyField).flipVertically(), playerField)
    }
}

class zoneHandler {
    zoneArr : ReadonlyArray<Zone> = []
    layout? : Layout
    private loader : zoneLoader
    constructor(regs : registryHandler){this.loader = regs.zoneLoader}
    
    loadEffects(s : Setting, players : player_stat[]){
        //load zones
        this.loader.load(zoneRegistry.z_system,  zoneDataRegistry[zoneRegistry.z_system],   System);
        this.loader.load(zoneRegistry.z_drop,    zoneDataRegistry[zoneRegistry.z_drop],     Drop)
        this.loader.load(zoneRegistry.z_void,    zoneDataRegistry[zoneRegistry.z_void],     Void);
        this.loader.load(zoneRegistry.z_deck,    zoneDataRegistry[zoneRegistry.z_deck],     Deck);
        this.loader.load(zoneRegistry.z_hand,    zoneDataRegistry[zoneRegistry.z_hand],     Hand);
        this.loader.load(zoneRegistry.z_storage, zoneDataRegistry[zoneRegistry.z_storage],  Storage);
        this.loader.load(zoneRegistry.z_field,   zoneDataRegistry[zoneRegistry.z_field],    Field);
        this.loader.load(zoneRegistry.z_grave,   zoneDataRegistry[zoneRegistry.z_grave],    Grave);
        this.loader.load(zoneRegistry.z_ability, zoneDataRegistry[zoneRegistry.z_ability],  Ability);

        // this.maxPlayerIndex = s.players.length

        Object.entries(zoneDataRegistry).forEach(([zkey, zdata], index) => {
            if(!zdata.instancedFor.length){
                let  zinstance = (this.loader.getZone(Number(zkey), s) as Zone)
                Utils.insertionSort(
                    this.zoneArr as Zone[], 
                    zinstance,
                    this.sortFunc
                )
            } else {
                players.forEach((p, pindex) => {
                    let zinstance = (this.loader.getZone(Number(zkey), s, p.playerType, pindex) as Zone)
                    if(zdata.instancedFor.includes(p.playerType)){
                        Utils.insertionSort(
                            this.zoneArr as Zone[],
                            zinstance,
                            this.sortFunc
                        )
                    }
                })
            }
        })

        this.correctID()
    }

    loadActionHandlers(s : HandlerLoader){
        //effect
        s.load("a_internal_try_activate", this.handleInternalActivate.bind(this))
        s.load("a_activate_effect", this.handleEffectActivation.bind(this))
        s.load("a_reset_effect", this.handleEffectReset.bind(this))

        //zone
        s.load("a_shuffle", this.handleShuffle.bind(this))
        s.load("a_draw", this.handleDraw.bind(this))
        s.load("a_zone_interact", this.handleZoneInteract.bind(this))

        //card
        s.load("a_attack", this.handleAttack.bind(this))
        s.load("a_move", this.handleMove.bind(this))
        s.load("a_destroy", this.handleSendToTop_grave.bind(this))
        s.load("a_decompile", this.handleSendToTop_grave.bind(this))
        s.load("a_void", this.handleSendToTop_void.bind(this))

        s.load("a_deal_damage_card", this.handleDealDamageCard.bind(this))
        s.load("a_deal_damage_ahead", this.handleAttack.bind(this))
        s.load("a_execute", this.handleExecute.bind(this))
        s.load("a_add_status_effect", this.handleAddStatusEffect.bind(this))
        s.load("a_remove_status_effect", this.handleRemoveStatusEffect.bind(this))
        s.load("a_clear_all_status_effect", this.handleRemoveAllStatusEffect.bind(this))
        s.load("a_remove_all_effects", this.handleRemoveAllEffects.bind(this))
        s.load("a_reset_card", this.handleCardReset.bind(this))

        //misc
        s.load("a_turn_reset", this.handleTurnReset.bind(this))
    }

    applySerializedLayout(oppositeZones : number[][], transforms : Record<number, SerializedTransform>){
        this.layout = Layout.fromSerialized(this.zoneArr, oppositeZones, transforms)
    }
    
    applyLayout(L : Layout){
        L.load(this.fields)
        this.layout = L
    }

    toGlobal(pos : Position){
        if(!this.layout) return pos;
        return this.layout.localToGlobal(pos);
    }

    private sortFunc(a : zoneData | Zone, b : zoneData | Zone) : number{
        const x = a.priority, y = b.priority;
        if(Object.is(x, y)) return 0;
        const rank = (a : number) => isNaN(a) ? 0 : a === -Infinity ? 1 : a === +Infinity ? 3 : 2;
        const ra = rank(x), rb = rank(y);
        return (ra !== rb) ? rb - ra : y - x;
    }

    private correctID(){
        for(let i = 0; i < this.zoneArr.length; i++) this.zoneArr[i].id = i;
    }

    add(zclassID : number, s : Setting, ptype? : playerTypeID | -1, pid? : number, zDataID? : number){
        let instance = this.loader.getZone(zclassID, s, ptype, pid, zDataID);
        if(!instance) throw new Error(`Fail to create instance of zone ${zclassID}`);
        Utils.insertionSort(this.zoneArr as Zone[], instance, this.sortFunc);
        this.correctID()
    }

    load_and_add_noPlayer(key : number, s : Setting, data : zoneData, c : ZoneContructor) : void; //add both
    load_and_add_noPlayer(key : number, s : Setting, _class : ZoneContructor, dataID? : number) : void; //add class only, no ID use key
    load_and_add_noPlayer(key : number, s : Setting, data : zoneData, classID? : number) : void; //add data only, no ID use key
    load_and_add_noPlayer(key : number, s : Setting, param3 : zoneData | ZoneContructor, param4? : ZoneContructor | number){
        //case 1, add both
        if(typeof param3 === "object" && typeof param4 === "function"){
            this.loader.load(key, param3, param4);
            this.add(key, s, -1, -1, key);
            return;
        } 
        if(!param4) param4 = key;
        //case 2, add class only
        if(typeof param3 === "function"){
            this.loader.load(key, undefined, param3);
            this.add(key, s, -1, -1, param4 as number)
            return;
        }
        //case 3, add data only
        if(typeof param3 === "object"){
            this.loader.load(key, param3);
            this.add(key, s, -1, -1, param4 as number)
            return;
        }
        //technically unreachable code
        throw new Error("Undefined behavior: load_and_add, zoneHandler");
    }

    addNewPlayerInstancedZones(s : Setting, ptype : playerTypeID, pid : number = -1){
        let insertNew : Zone[] = []
        this.zoneArr.forEach(i => {
            let data = this.loader.getData(i.dataID)
            if(data && data.instancedFor.includes(ptype)){
                let z = this.loader.getZone(i.classID, s, ptype, pid, i.dataID)
                if(z) insertNew.push(z)
            }
        })

        insertNew.forEach(i => Utils.insertionSort(this.zoneArr as Zone[], i, this.sortFunc))
        this.correctID()
    }

    //operations

    private genericHandler_card<
        M extends [identificationInfo_card | identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card] {
        let target = a.targets[0]
        let c : dry_card | Card | undefined = target.card
        if(!(c instanceof Card)) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }
        return [false, c as Card];
    }

    private genericHandler_effect<
        M extends [identificationInfo_effect | identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card, Effect] {
        let target = a.targets[0]
        let c : Card | undefined = target.card as any
        if(!(c instanceof Card)) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }
        c = c as Card

        let eff : Effect | undefined
        let eindex = c.findEffectIndex(target.eff.id)
        if( eindex < 0 ) {
            eff = this.getEffectWithID(target.eff.id);
            if(!eff) return [true, [new effectNotExist(target.eff.id, c.id)]]
        } else {
            eff = c.totalEffects[eindex]
        }
        return [false, c, eff]
    }

    private genericHandler_subtype<
        M extends [identificationInfo_subtype, ...identificationInfo[]]
    >(s : dry_system, a : Action_class<M>) : [true, error[]] | [false, Card, Effect, number] {
        let target = a.targets[0]
        let c = target.card as Card | undefined
        if(!c) {
            const z = this.zoneArr[target.card.pos.zoneID]
            c = z.getCardByPosition(target.card.pos as Position);
            if (!c) return [true, [new cardNotExist()]];
        }

        let eff : Effect | undefined
        let eindex = c.findEffectIndex(target.eff.id)
        if( eindex < 0 ) {
            eff = this.getEffectWithID(target.eff.id);
            if(!eff) return [true, [new effectNotExist(target.eff.id, c.id)]]
        } else {
            eff = c.totalEffects[eindex]
        }

        let st = eff.getSubtypeidx(target.subtype.dataID)
        if(st < 0) return [true, [new effectNotExist(target.eff.id, c.id).add("zoneHandler", "handleActivateEffectSubtypeFunc", 326)]]

        return [false, c, eff, st]
    }

    //**Pushes if effect says it can activate, pushes a_activate_effect onto stack, ask again on resolution of a_activate_effect*/
    handleInternalActivate(s : dry_system, a : Action<"a_internal_try_activate">) : Action[] {
        const log = a.getAttr("log")
        const targetPos = a.targets[0].pos
        const z = this.zoneArr[targetPos.zoneID]
        if(!z) return [];
        const c = z.getCardByPosition(targetPos as Position)
        if(!c) return [];
        return c.totalEffects.flatMap(e => {
            if(Effect.checkCanActivate(e, c, s, a)){
                log.responses[c.id].push(e.id)
                return [actionConstructorRegistry.a_activate_effect(s, c, e)(actionFormRegistry.system())]
            } 
            return []
        })
    }

    handleActivateEffect(s : dry_system, a : Action<"a_activate_effect">){
        return Effect.tryActivate(a.targets[0].eff as Effect, a.targets[0].card, s, a)
    }

    /**
     * 
     * @param a : a pos change action, with 2 targets, a card target and a position target in index 0 and 1
     * @returns 
     */
    handleMove(s : dry_system, a : Action<"a_move">) : Action[]{
        let k1 = a.targets[0];
        let k2 = a.targets[1];

        let res : Action[] = []
        
        const pos = k2.pos as Position
        const c = k1.card as Card

        // const zFrom = this.zoneArr[c.pos.zoneID]
        // if(!zFrom || !zFrom.validatePosition(c.pos)) return [];

        const zTo = this.zoneArr[pos.zoneID]

        let temp : res

        if(pos && zTo.validatePosition(pos) && pos.zoneID === c.pos.zoneID){
            console.log("move is triggered")
            let idxTo = pos.zoneID
            temp = this.zoneArr[idxTo].move(c, pos)
            //move is prioritized
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])
        } else {
            temp = this.zoneArr[c.pos.zoneID].remove(c)
            
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])

            temp = this.zoneArr[pos.zoneID].add(c, pos)
                
            if(temp[0]) res.push(temp[0]);
            else res.push(...temp[1])
        }

        return res
    }

    handleDraw(s : dry_system, a : Action<"a_draw">) : Action[]{
        let zone = this.zoneArr[a.targets[0].zone.id]
        if(!zone || !(zone as any).draw) return [
            new zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
        ]

        let deck = zone as any as Deck;

        let playerindex = deck.playerIndex
        let hand = this.hands.filter(i => i.playerIndex === playerindex);

        if(hand.length !== 1) return [
            new zoneNotExist(-1).add("zoneHandler", "handleDraw", 222)
        ]

        let res = deck.draw(s, a, hand[0])
        console.log("2", a, res)
        if(res[0]) return [res[0]];
        else return res[1];
    }   

    handleShuffle(s : dry_system, a : Action<"a_shuffle">) : Action[]{
        let z = this.zoneArr[a.targets[0].zone.id]
        if(!z || !(z as any).draw) return [
            new zoneNotExist(a.targets[0].zone.id).add("zoneHandler", "handleDraw", 213)
        ]
        let temp = z.shuffle(a.flatAttr().shuffleMap)
        if(temp[0]) return [temp[0]]
        return temp[1]
    }

    handleTurnReset(s : dry_system, a : Action<"a_turn_reset">) : Action[]{
        //only do field refresh
        let res : Action[] = []
        this.zoneArr.forEach(i => res.push(...i.turnReset(a)))
        return res;
    }

    handleCardReset(s : dry_system, a : Action<"a_reset_card">) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        return res[1].reset()
    }

    handleEffectReset(s : dry_system, a : Action<"a_reset_effect">) : Action[]{ 
        let res = this.genericHandler_effect(s, a);
        if(res[0]) return res[1];
        return res[2].reset()
    }

    handleEffectActivation(s : QueenSystem, a : Action<"a_activate_effect">) : Action[]{
        const {card, eff} = a.targets[0]
        const input = Effect.tryActivate(eff as Effect, card, s, a)

        if(!input) return [];
        if(!input[0]) return input[1]();
    
        return [
            actionConstructorRegistry.a_get_input(a.cause, {
                requester : input[0],
                applicator : new inputApplicator(input[1], [], eff)
            })
        ];
    }

    handleAddStatusEffect(s : dry_system, a : Action<"a_add_status_effect">) : Action[]{
        let statusString = (a as Action<"a_add_status_effect">).flatAttr().typeID
        let eff = (s as any).registryFile.effectLoader.getEffect(s, s.setting);
        if(!eff || !(eff instanceof StatusEffect_base)) return [
            new cannotLoad(statusString, "statusEffect")
        ];

        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].addStatusEffect(eff);
        return [];
    }

    handleRemoveAllStatusEffect(s : dry_system, a : Action<"a_clear_all_status_effect">) : Action[] {
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].clearAllStatus();
        return []
    }

    handleRemoveStatusEffect(s : dry_system, a : Action<"a_remove_status_effect">) : Action[]{
        let res = this.genericHandler_effect(s, a);
        if(res[0]) return res[1];
        res[1].removeStatusEffect(res[2].id)
        return []
    }

    handleRemoveAllEffects(s : dry_system, a : Action<"a_remove_all_effects">) : Action[] {
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].effects = [];
        return []
    }

    handleCardStatus(s : dry_system, a : Action<"a_enable_card"> | Action<"a_disable_card">) : Action[]{
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];
        res[1].canAct = (a.is("a_enable_card"))
        return []
    }

    getWouldBeAttackTarget(s : dry_system, c : dry_card) : [Zone, Card[]] | undefined {
        if(!this.layout) return;

        const zoneOFC = this.zoneArr[c.pos.zoneID]
        if(!zoneOFC) return;

        const globalP = this.layout.localToGlobal(c.pos as Position)
        const oppositeZoneID = this.layout.getOppositeZoneID(zoneOFC)
        if(oppositeZoneID === undefined) return;

        const oppositeZone = this.zoneArr[oppositeZoneID]
        return [oppositeZone, oppositeZone.cardArr_filtered.filter(c1 => this.layout!.localToGlobal(c1.pos as Position).x === globalP.x) as any]
    }

    handleAttack(s : dry_system, a : Action<"a_attack"> | Action<"a_deal_damage_ahead">) : Action[] {
        let attr = a.flatAttr()
        if(a.cause.type !== identificationType.card) return [];
        let c = a.cause.card as dry_card
        if(!c) return []

        let targets = this.getWouldBeAttackTarget(s, c);
        if(!targets) return []
        
        if(!targets[1].length){
            return [
                actionConstructorRegistry.a_deal_heart_damage(s, targets[0].playerIndex)(a.cause, {
                    dmg : c.attr.get("atk") ?? 0
                })
            ]
        }

        return [
            actionConstructorRegistry.a_deal_damage_card(s, targets[1][0])(a.cause, {
                dmg : (attr.dmg === undefined) ? c.attr.get("atk") ?? 0 : attr.dmg,
                dmgType : (attr.dmgType === undefined) ? damageType.physical : attr.dmgType
            })
        ]
    }

    handleDealDamageCard(s : dry_system, a : Action<"a_deal_damage_card">){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        let attr = a.flatAttr();
        res[1].hp -= attr.dmg;

        if(res[1].hp === 0){
            return [
                actionConstructorRegistry.a_destroy(s, res[1])(actionFormRegistry.system())
            ]
        }
        return []
    }

    handleExecute(s : dry_system, a : Action<"a_execute">){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        //unpacks to an attack and a send to grave

        let zoneid = res[1].pos.zoneID
        let z = this.zoneArr[zoneid]
        if(!z) return [
            new zoneNotExist(zoneid)
        ]

        let pid = z.playerIndex

        let g = this.getPlayerZone(pid, zoneRegistry.z_grave);
        if(!g || !g.length) return [
            new zoneNotExist(pid)
        ]

        return [
            actionConstructorRegistry.a_attack(s, a.targets[0].card)(a.cause, {
                dmg : res[1].atk,
                dmgType : damageType.physical
            }),
            actionConstructorRegistry.a_move_force(s, res[1])(g[0].top)(actionFormRegistry.system()).dontchain()
        ]
    }

    handleSendToTop_grave(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_grave)
    }

    handleSendToTop_void(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_void)
    }

    handleSendToTop_deck(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile">){
        return this.handleSendToTop(s, a, zoneRegistry.z_deck)
    }

    handleSendToTop(s : dry_system, a : Action<"a_destroy"> | Action<"a_decompile"> | Action<"a_void">, zid : number){
        let res = this.genericHandler_card(s, a);
        if(res[0]) return res[1];

        let zoneid = res[1].pos.zoneID
        let z = this.zoneArr[zoneid]
        if(!z) return [
            new zoneNotExist(zoneid)
        ]

        let pid = z.playerIndex

        let targetZone = this.getPlayerZone(pid, zid);
        if(!targetZone) return [
            new zoneNotExist(pid)
        ]

        return [
            actionConstructorRegistry.a_move_force(s, res[1])(targetZone[0].top)(actionFormRegistry.system())
        ]
    }

    getZoneRespond(z : Zone, s : dry_system, a : Action) : Action[] {
        const gen = z.getInput_ZoneRespond(a, s);
        if(gen === undefined) return z.getZoneRespond(a, s, undefined as any);

        return [
            actionConstructorRegistry.a_get_input(actionFormRegistry.system(), {
                requester : gen as any,
                applicator : new inputApplicator(z.getZoneRespond as any, [a, s], z)
            })
        ]
    }

    handleZoneInteract(s : dry_system, a : Action<"a_zone_interact">) : Action[] {
        const z = a.targets[0].zone as Zone
        const gen = z.getInput_interact(s, a.cause);
        if(gen === undefined) return z.interact(s, a.cause, undefined);

        return [
            actionConstructorRegistry.a_get_input(actionFormRegistry.system(), {
                requester : gen as any,
                applicator : new inputApplicator(z.interact as any, [s, a.cause], z)
            })
        ]
    }

    respond(system : dry_system, a : Action, zoneResponsesOnly : boolean = false, log : logInfoHasResponse) : Action[]{
        let arr : Action[] = []
        // let infoLog : Map<string, string[]> = new Map() //cardID, effectIDs[]
        this.zoneArr.forEach(i => {
            arr.push(...this.getZoneRespond(i, system, a))
        })
        if(zoneResponsesOnly) return arr;
        this.zoneArr.forEach(z => {
            arr.push(...z.getAllPos().map(p => actionConstructorRegistry.a_internal_try_activate(system, p)(actionFormRegistry.system(), {
                log
            })))
        })
        return arr
    }

    forEach(depth : 0, callback : ((z : Zone, zid : number) => void)) : void;
    forEach(depth : 1, callback : ((c : Card, zid : number, cid : number) => void)) : void;
    forEach(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => void)) : void;
    forEach(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => void)) : void;
    forEach(depth : number, callback : ((z : any, ...index : number[]) => void)) : void{
        switch(depth){
            case 0: 
                return this.zoneArr.forEach((z : Zone, zid : number) => callback(z, zid));
            case 1: 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach((c, cid) => {
                        if(c) callback(c, zid, cid)
                    })
                );
            case 2: 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach(
                        (c, cid) => {
                            if(c) c.totalEffects.forEach((e, eid) => callback(e, zid, cid, eid))
                        }
                    )
                )
            case 3 : 
                return this.zoneArr.forEach(
                    (z : Zone, zid : number) => z.cardArr.forEach(
                        (c, cid) => {
                            if(c) c.totalEffects.forEach(
                                (e, eid) => e.subTypes.forEach((st, stid) => callback(st, zid, cid, eid, stid))
                            )
                        }
                    )
                )
            
            default : return;
        }
    }

    map<T>(depth : 0, callback : ((z : Zone, zid : number) => T)) : T[];
    map<T>(depth : 1, callback : ((c : Card, zid : number, cid : number) => T)) : T[];
    map<T>(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => T)) : T[];
    map<T>(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => T)) : T[];
    map<T>(depth : number, callback : ((z : any, ...index : number[]) => T)) : T[]{
        let final : T[] = [];
        this.forEach(depth as any, (c, ...index : number[]) => {
            final.push(callback(c, ...index));
        })
        return final;
    }

    filter(depth : 0, callback : ((z : Zone, zid : number) => boolean)) : Zone[];
    filter(depth : 1, callback : ((c : Card, zid : number, cid : number) => boolean)) : Card[];
    filter(depth : 2, callback : ((e : Effect, zid : number, cid : number, eid : number) => boolean)) : Effect[];
    filter(depth : 3, callback : ((st : EffectSubtype, zid : number, cid : number, eid : number, stid : number) => boolean)) : EffectSubtype[];
    filter(depth : number, callback : ((z : any, ...index : number[]) => boolean)) : any[]{
        let final : any[] = [];
        this.forEach(depth as any, (c, ...index : number[]) => {
            if(callback(c, ...index)) final.push(c);
        })
        return final;
    }

    getEffectWithID(eid : string) : Effect | undefined{
        for(let i = 0; i < this.zoneArr.length; i++){
            for(let j = 0; j < this.zoneArr[i].cardArr.length; j++){
                let c = this.zoneArr[i].cardArr[j]
                if(!c) continue;
                let x = c.findEffectIndex(eid);
                if(x < 0) continue;
                return c.effects[x]
            }
        }
        return undefined;
    }

    getZoneWithType(type : number){
        return this.zoneArr.filter(i => i.types.includes(type))
    }

    forceCardIntoZone(zoneIdx : number, cardArr : Card[]){
        this.zoneArr[zoneIdx].forceCardArrContent(cardArr)
    }

    getZoneWithDataID(dataID : number) : Zone[] {
        return this.zoneArr.filter(i => i.dataID === dataID)
    }

    getZoneWithClassID(classID : number) : Zone[] {
        return this.zoneArr.filter(i => i.classID === classID)
    }

    getZoneWithName(zoneName : string){
        return this.zoneArr.find(a => a.name == zoneName)
    }

    getZoneWithID(id : number) : Zone | undefined{
        return this.zoneArr[id];
    }

    getCardWithID(cardID : string){
        for(let i = 0; i < this.zoneArr.length; i++){
            let index = this.zoneArr[i].cardArr.findIndex(i => i && i.id === cardID)
            if(index < 0) continue;
            return this.zoneArr[i].cardArr[index];
        }
        return undefined
    }

    getCardWithPosition(pos : Position){
        let z = this.zoneArr[pos.zoneID]
        if(!z) return undefined

        return z.getCardByPosition(pos)
    }

    //get stuff
    get system() {return this.getZoneWithType(zoneRegistry.z_system) as System[]}
    get void() {return this.getZoneWithType(zoneRegistry.z_void) as Void[]}
    get decks() {return this.getZoneWithType(zoneRegistry.z_deck) as any as Deck[]}
    get storages() {return this.getZoneWithType(zoneRegistry.z_storage) as Storage[]}
    get hands() {return this.getZoneWithType(zoneRegistry.z_hand) as Hand[]}
    get abilityZones() {return this.getZoneWithType(zoneRegistry.z_ability) as Ability[]}
    get graves() {return this.getZoneWithType(zoneRegistry.z_grave) as Grave[]}
    get fields() {return this.getZoneWithType(zoneRegistry.z_field) as Field[]}
    get drops() {return this.getZoneWithType(zoneRegistry.z_drop) as Drop[]}

    getPlayerZone(pid : number, type : number) : Zone[]{
        return this.zoneArr.filter(i => i.playerIndex === pid && i.types.includes(type))
    }
}

export default zoneHandler