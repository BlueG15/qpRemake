enum effectTypeRegistry {
    e_none = -1,
    e_manual = 0,
    e_passive,
    e_trigger,
    e_init,
    e_lock,
    e_counter,
    e_status,
}

type effectTypeName = keyof typeof effectTypeRegistry
type effectTypeID = (typeof effectTypeRegistry)[effectTypeName]

export default effectTypeRegistry 
export type {effectTypeName, effectTypeID}