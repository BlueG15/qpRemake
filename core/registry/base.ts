//PRIVATE CLASS TO THIS FOLDER, DO NOT EXPOSE
import type { BrandedNumber, BrandedString } from "../misc";

export class Registry<
    T_ID extends BrandedNumber<any>, 
    T_Key extends BrandedString<any>,
    T_Data,
> {
    //Known bug caught previously : some keys named "storage" is added in "from"
    // causing the default storage to be redefined
    // aka error
    // solution rn is to name storage differently
    #___storage___ : [T_Key, T_Data][]
    #___inverseMap___ : Record<string, T_ID> = {}
    protected constructor(o : [T_Key, T_Data][]){this.#___storage___ = o}
    static from<
        T_ID  extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>, 
        T_Data, 
        T_Record extends Record<string, T_Data>,
    >(o : T_Record){
        const R = new Registry<T_ID, T_Key, T_Data>(Object.entries(o) as any)
        R.#___storage___.forEach((val, index) => {
            Object.defineProperty(R, val[0], {
                value : index,
                writable : false
            })
            R.#___inverseMap___[val[0]] = index as T_ID
        })
        return R as typeof R & Readonly<{
            [K in keyof T_Record] :  T_ID
        }>
    }

    //TwoViews is bugged, idk why tbh, probably skill issue
    // static twoViews<
    //     T_ID extends BrandedNumber<any>, 
    //     T_Key extends BrandedString<any>,
    //     T_Record extends Record<string, any>,
    // >(o : T_Record){
    //     const R = new Registry<T_ID, T_Key, any>(Object.entries(o) as any)
    //     R.#___storage___.forEach((val, index) => {
    //         Object.defineProperty(R, val[0], {
    //             value : index,
    //             writable : false
    //         })
    //         R.#___inverseMap___[val[0]] = index as T_ID
    //     })
    //     const dataView = new Proxy(R, {
    //         get(target, key, receiver, dataTarget = o){
    //             if (o.hasOwnProperty(key)) return Reflect.get(dataTarget, key, receiver);
    //             return Reflect.get(target, key, receiver)
    //         }
    //     })
    //     return [R, dataView] as [
    //         typeof R & Readonly<{
    //             [K in keyof T_Record] :  T_ID
    //         }>,
    //         typeof R & Readonly<{
    //             [K in keyof T_Record] :  T_Record[K]
    //         }>,
    //     ]
    // }

    private add(key : string, data : T_Data){
        if(Object.hasOwn(this.#___inverseMap___, key)){
            return this.#___inverseMap___[key]
        }
        const n = this.#___storage___.length
        this.#___storage___.push([key, data] as any)
        this.#___inverseMap___[key] = n as T_ID
        return n as T_ID
    }
    
    static add<T_ID extends BrandedNumber<any>, T_Data>(
        r : Registry<T_ID, any, T_Data>, key : string, data : T_Data
    ){
        return r.add(key, data)
    }

    //since id is branded, these only be able to get/set already existing ID
    get(id : T_ID){
        return this.getData(id)
    }
    
    getKey(id : T_ID){
        return this.#___storage___[id][0]
    }

    getID(key : string) : T_ID | undefined {
        return this.#___inverseMap___[key]
    }

    getData(id : T_ID){
        if(!this.#___storage___[id]) {
            console.error("WTF????, registry accessed using unknown key, dumping storage :")
            console.log("Dumping storage:", this.#___storage___)
            console.log("Dumping inversemap:", this.#___inverseMap___)
            console.log("Input ID:", id)
            throw new Error("Invalid ID acccess")
        }
        return this.#___storage___[id][1]
    }

    getAllRegisteredKeys(){
        return Object.keys(this.#___inverseMap___) as T_Key[]
    }

    getAllRegisteredIDs(){
        return Object.values(this.#___inverseMap___)
    }
}

export class IDRegistry<
    T_ID extends BrandedNumber<any>, 
    T_Key extends BrandedString<any>,
> {
    //TODO : find a more memory efficient solution
    #___keyMap___ : T_Key[] = []
    #___inverseMap___ : Record<string, T_ID> = {} as any

    protected constructor(){}
    static from<
        T_ID  extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>, 
        T_Arr extends ReadonlyArray<string>,
    >(o : T_Arr){
        const R = new this<T_ID, T_Key>()
        for(const key of o){
            const ID = R.add(key)
            Object.defineProperty(R, key, {
                value : ID,
                writable : false
            })
        }
        return R as typeof R & Readonly<{
            [K in T_Arr[number]] :  T_ID
        }>
    }

    private add(key : string){
        if(Object.hasOwn(this.#___inverseMap___, key)){
            return this.#___inverseMap___[key]
        }

        const n = this.#___keyMap___.length
        this.#___keyMap___.push(key as T_Key)
        this.#___inverseMap___[key] = n as T_ID
        return n as T_ID
    }

    static add<T_ID extends BrandedNumber<any>>(r : IDRegistry<T_ID, any>, key : string){
        return r.add(key)
    }
    
    //since id is branded, these only be able to get/set already existing ID
    get(id : T_ID){
        return this.#___keyMap___[id]
    }

    getKey(id : T_ID){return this.get(id)}
    getData(id : T_ID){return this.get(id)}
    getID(key : string) : T_ID | undefined {
        return this.#___inverseMap___[key]
    }

    getAllRegisteredKeys(){
        return Object.keys(this.#___inverseMap___) as T_Key[]
    }

    getAllRegisteredIDs(){
        return Object.values(this.#___inverseMap___)
    }
}

export class DoubleKeyRegistry<
    T_ID extends BrandedNumber<any>, 
    T_Key extends BrandedString<any>,
    T_Data_Full, T_Data_Partial = Partial<T_Data_Full>,
> {
    #___inverseMap___ : Record<string, T_ID> = {}
    #___storage___ : [T_Key, Record<string, T_Data_Partial>][] = []
    #___baseKey___ : string
    getBaseKey() : BrandedString<typeof this> {return this.#___baseKey___ as any}
    protected constructor(s : string){this.#___baseKey___ = s}
    static from<
        T_ID  extends BrandedNumber<any>, 
        T_Key extends BrandedString<any>, 
        T_Data_Full, T_Data_Partial extends Partial<T_Data_Full>,
        T_Record extends Record<string, T_Data_Full>,
        T_staticKeys extends string[],
    >(o : T_Record, defaultKey2 : string, ...staticKeys : T_staticKeys){
        const R = new DoubleKeyRegistry<T_ID, T_Key, T_Data_Full, T_Data_Partial>(defaultKey2)
        Object.entries(o).forEach(([key, data], index) => {
            const m : Record<string, T_Data_Partial> = {}
            m[defaultKey2] = data as any
            R.#___storage___.push([key as T_Key, m])
            R.#___inverseMap___[key] = index as T_ID
            Object.defineProperty(R, key, {
                value : index,
                writable : false
            })
        })
        for(const k of staticKeys){
            Object.defineProperty(R, k, {
                value : k,
                writable : false
            })
        }
        return R as typeof R & Readonly<{
            [K in keyof T_Record] :  T_ID
        } & {
            [K in T_staticKeys[number]] : string
        }>
    }

    private addExisting(id : T_ID, key2 : string, data : T_Data_Partial){
        const m = this.#___storage___[id]
        if(!m) return;
        m[1][key2] = data
    }

    private addNew(key1 : string, data : T_Data_Full, m : Record<string, T_Data_Partial> = {}){
        if(Object.hasOwn(this.#___inverseMap___, key1)){
            return this.#___inverseMap___[key1]
        }

        const n = this.#___storage___.length as T_ID
        m[this.#___baseKey___] = data as any
        this.#___storage___.push([key1 as any, m])
        this.#___inverseMap___[key1] = n
        return n
    }
    
    isBaseKey(key : string) : key is BrandedString<typeof this> {
        return key === this.#___baseKey___
    }
 
    static addNew<T_ID extends BrandedNumber<any>, T_Data_Full>(
        r : DoubleKeyRegistry<T_ID, any, T_Data_Full, any>, key : string, data : T_Data_Full
    ){
        return r.addNew(key, data)
    }

    static addBulk<T_ID extends BrandedNumber<any>, T_Data_Full, T_Data_Partial>(
        r : DoubleKeyRegistry<T_ID, any, T_Data_Full, T_Data_Partial>,
        key : string,
        data : ReturnType<DoubleKeyRegistry<T_ID, any, T_Data_Full, T_Data_Partial>["getAllData"]>
    ){
        return r.addNew(key, data[r.getBaseKey()], data)
    }

    static addExisting<T_ID extends BrandedNumber<any>, T_Data_Partial>(
        r : DoubleKeyRegistry<T_ID, any, any, T_Data_Partial>, id : T_ID, key : string, data : T_Data_Partial
    ){
        return r.addExisting(id, key, data)
    }

    //since id is branded, these only be able to get/set already existing ID
    get(id : T_ID, key : BrandedString<typeof this>) : T_Data_Full;
    get(id : T_ID, key : string) : T_Data_Partial ;
    get(id : T_ID, key : string){
        return this.getData(id, key) as any
    }
    
    getKey(id : T_ID){
        return this.#___storage___[id][0]
    }

    getID(key : string) : T_ID | undefined {
        return this.#___inverseMap___[key]
    }

    getData(id : T_ID, key : BrandedString<typeof this>) : T_Data_Full;
    getData(id : T_ID, key : string) : T_Data_Partial ;
    getData(id : T_ID, key : string){
        return this.#___storage___[id][1][key] as any
    }

    getAllData(id : T_ID) : {
        [Key in BrandedString<typeof this>] : T_Data_Full
    } & {
        [Key in string] : T_Data_Partial
    }{
        return this.#___storage___[id][1] as any
    }

    getAllRegisteredKeys(){
        return Object.keys(this.#___inverseMap___) as T_Key[]
    }

    getAllRegisteredIDs(){
        return Object.values(this.#___inverseMap___)
    }
}