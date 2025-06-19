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

export type ExtractArgs<T> = T extends Fn<infer A, any> ? A : never;
export type ExtractReturn<T> = T extends Fn<any, infer R> ? R : never;

export type WritableKeys<T> = {
  [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>
}[keyof T];

export type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

export type OnlyWritableProps<T> = Pick<T, WritableKeys<T>>;