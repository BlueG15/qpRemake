//technically an enum
enum actionRegistry {
    //special
    "error" = -1,
    "a_null" = 0,
    
    //0xx = system signal actions
    "a_turn_start" = 1,
    "a_turn_end",
    "a_turn_reset",
    "a_activate_effect_internal",
    "a_increase_turn_count",
    "a_set_threat_level",
    "a_do_threat_burn",
    "a_force_end_game",

    //1xx = API related actions
    "a_activate_effect" = 100,
    "a_pos_change",
    "a_draw",
    "a_shuffle",
    "a_execute", //not implemented
    "a_reprogram_start", //not implemented
    "a_reprogram_end", //not implemented

    "a_add_status_effect", //is implementng, unfinished
    "a_remove_status_effect", //is implementing, unfinished
    "a_reset_card",
    
    "a_activate_effect_subtype",
    "a_modify_action" //is implementing, unfinished
}

type actionName = keyof typeof actionRegistry
type actionID = (typeof actionRegistry)[actionName]

export default actionRegistry
export type {actionName, actionID}




