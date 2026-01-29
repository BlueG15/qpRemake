const enum errorID {
    err_unknown = -1,
   
    err_targetNotExist,  //on resolve found empty target, card, effect, position, or whatever
    err_zoneNotAllow,   //zone returns error on resolve (return directly this)

    err_cannotLoad, // on load, error

    err_effectCannotActivate_notEnoughInput,     //getInnput -> empty input
    err_effectCannotActivate_requirementsNotMet, //canActivate -> false
    err_effectCannotActivate_typePrevents,       // type forced canActivate -> false
    err_effectCannotActivate_subtypePrevents,    // subtype forced canActivate -> false

    err_cannotDoAction_gameRulePrevents,   // gameRule forced canActivate -> false
    err_cannotDoAction_negated, //system only return this if turnAction is negated

    //these 2 are for move action only
    err_zoneFull,
    err_invalidPosition,  //pos out of bounds

    err_invalidShuffleInput, //just for zone.shuffle
}

type errorName = keyof typeof errorID
type errorIDSpecific<T extends errorID> = (typeof errorID)[T]

export {errorID, errorName, errorIDSpecific}