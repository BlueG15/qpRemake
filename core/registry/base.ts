//PRIVATE CLASS TO THIS FOLDER, DO NOT EXPOSE
import type { BrandedNumber, BrandedString } from "../misc";

export class Registry<
    T_ID extends BrandedNumber<any>, 
    T_Key extends BrandedString<any>,
    T_Data,
> {
    protected constructor(protected storage : [T_Key, T_Data][]){}
    static from<
        T_ID  extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>, 
        T_Data, 
        T_Record extends Record<string, T_Data>,
    >(o : T_Record){
        const R = new Registry<T_ID, T_Key, T_Data>(Object.entries(o) as any)
        R.storage.forEach((val, index) => {
            Object.defineProperty(R, val[0], {
                value : index,
                writable : false
            })
        })
        return R as typeof R & Readonly<{
            [K in keyof T_Record] :  T_ID
        }>
    }

    static twoViews<
        T_ID extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>,
        T_Record extends Record<string, any>,
    >(o : T_Record){
        const R = new Registry<T_ID, T_Key, any>(Object.entries(o) as any)
        R.storage.forEach((val, index) => {
            Object.defineProperty(R, val[0], {
                value : index,
                writable : false
            })
        })
        const dataView = new Proxy(R, {
            get(target, key, receiver, dataTarget = o){
                if (o.hasOwnProperty(key)) return Reflect.get(dataTarget, key, receiver);
                return Reflect.get(target, key, receiver)
            }
        })
        return [R, dataView] as [
            typeof R & Readonly<{
                [K in keyof T_Record] :  T_ID
            }>,
            typeof R & Readonly<{
                [K in keyof T_Record] :  T_Record[K]
            }>,
        ]
    }

    add(key : string, data : T_Data){
        const n = this.storage.length
        this.storage.push([key, data] as any)
        return n as T_ID
    }
    
    //since id is branded, these only be able to get/set already existing ID
    get(id : T_ID){
        return this.getData(id)
    }
    
    getKey(id : T_ID){
        return this.storage[id][0]
    }

    getData(id : T_ID){
        return this.storage[id][1]
    }

    set(id : T_ID, key? : string, data? : T_Data){
        const obj = this.storage[id]
        if(key) obj[0] = key as T_Key;
        if(data) obj[1] = data;
    }
}

export class IDRegistry<
    T_ID extends BrandedNumber<any>, 
    T_Key extends BrandedString<any>,
> {
    protected keyMap : T_Key[] = []

    protected constructor(){}
    static from<
        T_ID  extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>, 
        T_Record extends ReadonlyArray<string>,
    >(o : T_Record){
        const R = new this<T_ID, T_Key>()
        for(const key of Object.keys(o)){
            const ID = R.add(key)
            Object.defineProperty(R, key, {
                value : ID,
                writable : false
            })
        }
        return R as typeof R & Readonly<{
            [K in T_Record[number]] :  T_ID
        }>
    }

    add(key : string){
        const n = this.keyMap.length
        this.keyMap.push(key as T_Key)
        return n as T_ID
    }
    
    //since id is branded, these only be able to get/set already existing ID
    get(id : T_ID){
        return this.keyMap[id]
    }

    getKey(id : T_ID){return this.get(id)}
    getData(id : T_ID){return this.get(id)}

    set(id : T_ID, key : string){
        this.keyMap[id] = key as T_Key;
    }
}

export class StaticRegistry {
    protected constructor(){}

}
