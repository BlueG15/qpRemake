export class Valueable<T> {
    get value() : T {
        throw new Error("Not Implemented")
    }

    extends<R>(f : (p : T) => R, thisParam?: any): Valueable<R> {
        throw new Error("not Implemented")
    }
}

export class Volatile<
    ParamType extends any[],
    resultType extends any
> extends Valueable<resultType> {
    private __f : (...p : ParamType) => resultType
    constructor(
        f : (...p : ParamType) => resultType, 
        private __params : ParamType, 
        ThisParam? : any,
    ){
        super()
        this.__f = f.bind(ThisParam)
    }

    override get value() : resultType {
        return this.__f(...this.__params)
    }

    override extends<R extends unknown>(f: (p: resultType) => R, thisParam?: any): Valueable<R> {
        //Magic wizardry shit
        //replace a funtion with a new function that calls the old one
        
        function f2(oldf : (...p : ParamType) => resultType){
            return (...params : ParamType) => f.bind(thisParam)( oldf(...params) )
        }
        this.__f = f2(this.__f) as any
        return this as any
    }
}

export class Lazy<
    ParamType extends any[],
    resultType extends any
> extends Valueable<resultType> {
    private __f : (...p : ParamType) => resultType
    private __cache : resultType | undefined
    private __resolved : boolean = false
    get resolved() : boolean {return this.__resolved}
    constructor(f : (...p : ParamType) => resultType, private __params : ParamType, ThisParam? : any){
        super()
        this.__f = f.bind(ThisParam)
    }

    override get value() : resultType {
        if(this.__resolved) return this.__cache!
        this.__cache = this.__f(...this.__params)
        this.__resolved = true
        return this.__cache
    }

    override extends<R extends unknown>(f: (p: resultType) => R, thisParam?: any): Valueable<R> {
        function f2(oldf : (...p : ParamType) => resultType){
            return (...params : ParamType) => f.bind(thisParam)( oldf(...params) )
        }
        this.__f = f2(this.__f) as any
        return this as any
    }
}