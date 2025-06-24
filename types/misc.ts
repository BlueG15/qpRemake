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


export type lambda_number = [] | [lambda_number] 
export type precursor<T extends lambda_number> = T extends [] ? never : T[0]
export type successor<T extends lambda_number> = [T]

export type lambda_number_monster = [[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]

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

export type Tuple_any<T, len extends lambda_number, maxRecurLevel extends lambda_number = lambda_number_monster> = 
  len extends [] ? [] :
  len extends [[]] ? [T] :
  len extends maxRecurLevel ? [] :
  [T, ...Tuple_any<T, precursor<len>>]

export type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>
}[keyof T];

export type LenInLambda<T extends any[], maxRecurLevel extends lambda_number = lambda_number_monster> = 
  T extends Tuple_any<any, maxRecurLevel> ? maxRecurLevel : 
  maxRecurLevel extends [] ? never :
  LenInLambda<T, precursor<maxRecurLevel>>

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

export type FunctionalKeys<T extends Object> = FilterKeys<T, Fn<any, any>>
export type UnFunctionalKeys<T extends Object> = Exclude<keyof T, FunctionalKeys<T>>

export type Readonly_recur_Record<K extends keyof any, V> = Readonly<Record<K, Readonly_recur<V>>>;

export type isUnion<T, U = T> = T extends any ? [U] extends [T] ? false : true : never;

