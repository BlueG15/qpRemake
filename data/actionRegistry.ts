enum actionRegistry {
    //special
    "error" = -1,
    "a_null" = 0,
    
    //0xx = system signal actions
    "a_turn_start" = 1,
    "a_turn_end",
    "a_turn_reset",
    "a_activate_effect_internal", //partition
    "a_increase_turn_count",
    "a_set_threat_level",
    "a_do_threat_burn",
    "a_force_end_game",  
    "a_enable_card",
    "a_disable_card",
    "a_reset_card",
    "a_reset_effect", //effect
    "a_pos_change_force",
    "a_deal_damage_internal",
    "a_get_input",

    //control flow redirection
    "a_negate_action", //only resolves in the chain phase,  go straight to complete step
    "a_replace_action", //only resolves in the chain phase, only attach the replaced action and go straight to complete step

    //1xx = API related actions
    "a_activate_effect" = 100, //partition
    "a_zone_interact",
    "a_pos_change",
    "a_draw",
    "a_shuffle",
    "a_execute", //not implemented
    "a_reprogram_start", //not implemented
    "a_reprogram_end", //not implemented

    "a_add_status_effect", //effect
    "a_add_effect", //effect

    "a_remove_all_effects", //card
    "a_duplicate_effect", //partition
    "a_remove_effect", //partition

    "a_remove_status_effect", 
    "a_clear_all_status_effect",
    "a_clear_all_counters",
    
    "a_activate_effect_subtype", //effect
    "a_reset_all_once",
    "a_modify_action",

    "a_attack",
    "a_deal_damage_ahead",
    "a_deal_damage_card",
    "a_deal_damage_position",
    "a_deal_heart_damage",
    
    "a_destroy",
    "a_decompile",
    "a_void",

    "a_add_top",
    "a_duplicate_card",

    "a_declare_activation",
    "a_delay",
}

type actionName = keyof typeof actionRegistry
type actionID = (typeof actionRegistry)[actionName]

export default actionRegistry
export type {actionName, actionID}


