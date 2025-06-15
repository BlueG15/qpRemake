enum effectTypeRegistry {
    e_manual = 0,
    e_passive,
    e_trigger,
    e_init,
    e_status,
}

type effectTypeName = keyof typeof effectTypeRegistry
type effectTypeID = (typeof effectTypeRegistry)[effectTypeName]

export default effectTypeRegistry 
export type {effectTypeName, effectTypeID}