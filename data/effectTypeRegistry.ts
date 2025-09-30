enum effectTypeRegistry {
    e_t_none = -1,
    e_t_manual = 0,
    e_t_passive,
    e_t_trigger,
    e_t_init,
    e_t_lock,
    e_t_counter,
    e_t_status,
}

type effectTypeName = keyof typeof effectTypeRegistry
type effectTypeID = (typeof effectTypeRegistry)[effectTypeName]

export default effectTypeRegistry 
export type {effectTypeName, effectTypeID}