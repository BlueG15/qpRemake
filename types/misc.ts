import type { playerTypeID } from "../data/zoneRegistry"

export type hexChars = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type hexChars2 = `${hexChars}${hexChars}`
export type hexString3 = `#${hexChars}${hexChars2}`
export type hexString4 = `#${hexChars2}${hexChars2}`
export type hexString6 = string //5 is the limit

export enum damageType {
    "physical" = 0,
    "magic",
}

export type typeSigatureSimple = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"
export type typeSigatureArray = `${typeSigatureSimple}[]` | "any[]" | "empty[]"
export type typeSignature = typeSigatureSimple | typeSigatureArray

export type singleTypedArray<T> = T[]

export type safeSimpleTypes = number | string | boolean

export type Fn<Args extends any[], Ret> = (...args: Args) => Ret;
export type Fn_2<Args1 extends any[], Args2 extends any[], Ret> = (...args1 : Args1) => (...args2 : Args2) => Ret
export type Fn_3<Args1 extends any[], Args2 extends any[], Args3 extends any[], Ret> = (...args1 : Args1) => (...args2 : Args2) => (...args3 : Args3) => Ret
export type Fn_4<Args1 extends any[], Args2 extends any[], Args3 extends any[], Args4 extends any[], Ret> = (...a1 : Args1) => (...a2 : Args2) => (...a3 : Args3) => (...a4 : Args4) => Ret
export type Fn_5<Args1 extends any[], Args2 extends any[], Args3 extends any[], Args4 extends any[], Args5 extends any[], Ret> = (...a1 : Args1) => (...a2 : Args2) => (...a3 : Args3) => (...a4 : Args4) => (...a5 : Args5) => Ret


export type lambda_number = Array<0>
export type precursor<T extends lambda_number> = T extends [0, ...infer Tail] ? Tail : never
export type successor<T extends lambda_number> = [0, ...T]

//supports up to 999, 1000 yields a depth error
//update : limit bypassable by breaking up the type into smaller steps
export type lambda_number_monster = NumToLambda<50>
export type lambda_number_monster_num = LambdaToNum<lambda_number_monster>

export type Fn_any<Ret, recurLevel extends lambda_number> = (...args : any) => 
  recurLevel extends [] ? Ret : Fn_any<Ret, precursor<recurLevel>>

export type ExtractReturn_any<
  T extends Fn<any, any>, 
  maxRecurLevel extends lambda_number = lambda_number_monster, 
> = T extends Fn_any<infer A, maxRecurLevel> ? A : 
    maxRecurLevel extends [] ? never : 
    ExtractReturn_any<T, precursor<maxRecurLevel>>

export type ExtractArgs<T> = T extends Fn<infer A, any> ? A : never;
export type ExtractReturn<T> = T extends Fn<any, infer R> ? R : never;

export type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>
}[keyof T];

export type Tuple_any<T, len extends number = lambda_number_monster_num, cull extends T[] = [], len_lambda extends lambda_number = NumToLambda<len>> = 
  number extends len ? T[] :
  len_lambda extends [] ? cull : Tuple_any<T, len, [T, ...cull], precursor<len_lambda>>

export type LenInLambda<T extends any[]> = NumToLambda<T["length"]>

export type lambdaArr<
  End extends lambda_number = lambda_number_monster, 
  Start extends lambda_number = [],
  cull extends lambda_number[] = [],
> = End extends Start ? [Start, ...cull] : lambdaArr<precursor<End>, Start, [End, ...cull]>

export type Add<A extends lambda_number, B extends lambda_number> = [...A, ...B]
export type Sub<A extends lambda_number, B extends lambda_number> = A extends [...B, ...infer K] ? K : []

export type Mul<A extends lambda_number, B extends lambda_number> = 
  A extends [] ? [] :
  B extends [] ? [] :
  [...Mul< precursor<A>, B >, ...B]

export type Div<A extends lambda_number, B extends lambda_number, C extends lambda_number = []> = 
  B extends 0 ? never :
  A extends [] ? [] :
  isLtr<A, B, C, Div<Sub<A, B>, B, [0, ...C]>>

export type Mod<A extends lambda_number, B extends lambda_number> = 
  B extends 0 ? never :
  A extends [] ? [] :
  isLtr<A, B, A, Mod<Sub<A, B>, B>>

export type Sum<
  T extends lambda_number[], 
  cull extends lambda_number = [],
  T_head extends lambda_number = T extends [infer Head, ...any[]] ? Head : [],
  T_tail extends lambda_number[]= T extends [any, ...infer Tail] ? Tail : [],
> =
  T extends [] ? cull :
  Sum<T_tail, Add<cull, T_head>>

//greater
export type isGtr<A extends lambda_number, B extends lambda_number, resTrue = true, resFalse = false> = isLtr<B, A, resTrue, resFalse>

//lesser
export type isLtr<A extends lambda_number, B extends lambda_number, resTrue = true, resFalse = false> =
  Sub<A, B> extends never ? resTrue : resFalse

//lesser or equal
export type isLeq<A extends lambda_number, B extends lambda_number, resTrue = true, resFalse = false> = 
  A extends B ? resTrue : 
  isLtr<A, B, resTrue, resFalse>

//greater or equal
export type isGeq<A extends lambda_number, B extends lambda_number, resTrue = true, resFalse = false> = 
  A extends B ? resTrue : 
  isGtr<A, B, resTrue, resFalse>

export type NumToLambda<T extends number, cull extends lambda_number = []> = LambdaToNum<cull> extends T ? cull : NumToLambda<T, [0, ...cull]>
export type LambdaToNum<T extends lambda_number> = T["length"]

export type sliceHead<T extends Array<any>, Head extends Array<any>> = T extends [...Head, ...infer Tail] ? Tail : never

export type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

export type OnlyWritableProps<T> = Pick<T, WritableKeys<T>>;

export type Position_like = {
  readonly x : number 
  readonly y : number
  readonly zoneID : number
  flat() : ReadonlyArray<number>
}

export type Player_specific = {
  playerIndex : number
  playerType : playerTypeID
}

export type HasTypesArr = {
  types : ReadonlyArray<number> 
}

export type id_able = {
  id : string | number
}

export type Positionable = {
  pos : Position_like
}

export type Readonly_recur<T> =
  T extends Fn<any, any> ? T :
  T extends (infer R)[] ? ReadonlyArray<Readonly_recur<R>> :
  T extends Map<infer K, infer V> ? ReadonlyMap<K, Readonly_recur<V>> :
  T extends Set<infer K> ? ReadonlySet<Readonly_recur<K>> :
  T extends ReadonlyArray<any> ? T :
  T extends ReadonlyMap<any, any> ? T :
  T extends ReadonlySet<any> ? T :
  T extends object ? { 
    readonly [
      K in keyof T as T[K] extends Fn<any, any> ? never : K
    ]: Readonly_recur<T[K]>
  } :
  T;

export type Transplant<T extends Object, K extends keyof T, newType> = {
  [K2 in keyof T as newType extends never ? never : K2] : K2 extends K ? newType : T[K2]
}

export type FilterKeys<T extends Object, ConditionType> = keyof {
   [K in keyof T as T[K] extends ConditionType ? K : never] : true
}

//[Last, rest]
export type lastInfo<T extends any[], saved extends any[] = []> = 
  [] extends T ? never : 
  T extends [any] ? [T, saved] :
  T extends [infer Head, ...infer Tails] ? lastInfo<Tails, [...saved, Head]> : [T, saved]

export type FunctionalKeys<T extends Object> = FilterKeys<T, Fn<any, any>>
export type UnFunctionalKeys<T extends Object> = Exclude<keyof T, FunctionalKeys<T>>

export type Readonly_recur_Record<K extends keyof any, V> = Readonly<Record<K, Readonly_recur<V>>>;

export type isUnion<T, U = T> = T extends any ? [U] extends [T] ? false : true : never;

export type notFull<T extends any[], R extends any[] = []> = T extends [infer Head, ...infer Tail] ? R | notFull<Tail, [...R, Head]> : R;

//Note to dum dum me
//Y is the yield type, the type the generator spits out after a yield statement
//R is Y but for return statement, after a return, the done flag is set
//N is the type received by yield inside the generator, inputted into next()
export interface StrictGenerator<Y, R, N> extends Generator<Y, R, N> {
  next(value: N): IteratorResult<Y, R>;
}

export type nestedTree<T> = T[] | nestedTree<T>[]

export type Last<
  T extends any[], 
  K extends any[] = []
> = T extends K ? T[ sliceHead<K, [any]>["length"] ] : Last<T, [any, ...K]>

