export type hexChars = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type hexChars2 = `${hexChars}${hexChars}`
export type hexString3 = `#${hexChars}${hexChars2}`
export type hexString4 = `#${hexChars2}${hexChars2}`

export type hexString6 = string //5 is the limit