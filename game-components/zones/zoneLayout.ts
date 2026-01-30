import { Zone } from "./zone"
import { Position } from "../positions"
import { PlayerTypeID } from "../../core"
import { SerializedTransform, SerializedLayout } from "../../core/serialized"
import { ZoneDry, PositionDry, ZoneLayoutDry } from "../../core"

class TransformInfo {
    constructor(
        public boundZone : Zone,
        public originX : TransformInfo | number = 0, // assume if Zone -> place to the right
        public originY : TransformInfo | number = 0, // assume if Zone -> place to the bottom
        public flipHoz: boolean = false,
        public rotation: 0 | 90 | 180 | 270 = 0,
    ) {}

    protected get origin() : [number, number]{
        let x = this.originX
        if(x instanceof TransformInfo){
            x = (x.rotation === 90 || x.rotation === 270) ? x.boundZone.boundY : x.boundZone.boundX
        }
        let y = this.originY
        if(y instanceof TransformInfo){
            y = (y.rotation === 90 || y.rotation === 270) ? y.boundZone.boundX : y.boundZone.boundY
        }
        return [x, y] as any
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
export abstract class ZoneLayout implements ZoneLayoutDry {
    protected zoneMap = new Map<Zone["id"], TransformInfo>()
    protected oppositeZones : number[][] = []

    abstract load(Fields : Zone[]) : void

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

        return new Position(zid, ...T.transformPoint(p.x, p.y))
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

export class EmptyLayout extends ZoneLayout {
    override load(): void {}
}

export class DefaultLayout extends ZoneLayout {
    protected override statckVertically(z1: Zone | TransformInfo, z2: Zone | TransformInfo): void {
        this.setAsOpposite(z1, z2)
        return super.statckVertically(z1, z2)
    }
    override load(Fields: Zone[]): void {
        const playerField = Fields.find(f => f.of(PlayerTypeID.player))
        const enemyField = Fields.find(f => f.of(PlayerTypeID.enemy))
        if(!playerField || !enemyField) return;
        this.statckVertically(this.transform(enemyField).flipVertically(), playerField)
    }
}