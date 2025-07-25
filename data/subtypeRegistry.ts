enum subtypeRegistry {
    e_chained = 0,
    e_delayed,
    e_fieldLock,
    e_handOrFieldLock,
    e_graveLock,
    e_unique,
    e_hardUnique,
    e_instant,
    e_once,
}

type subtypeName = keyof typeof subtypeRegistry
type subtypeID = (typeof subtypeRegistry)[subtypeName]

export default subtypeRegistry 
export type {subtypeName, subtypeID}

