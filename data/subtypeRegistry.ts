enum subtypeRegistry {
    e_st_chained = 0,
    e_st_delayed,
    e_st_fieldLock,
    e_st_handOrFieldLock,
    e_st_graveLock,
    e_st_unique,
    e_st_hardUnique,
    e_st_instant,
    e_st_once,
}

type subtypeName = keyof typeof subtypeRegistry
type subtypeID = (typeof subtypeRegistry)[subtypeName]

export default subtypeRegistry 
export type {subtypeName, subtypeID}

