import type effectSubtype from "../../types/abstract/gameComponents/effectSubtype";

class dry_effectSubType {
    readonly dataID : string
    readonly isDisabled : boolean

    constructor(subtype : effectSubtype){
        this.dataID = subtype.dataID
        this.isDisabled = subtype.isDisabled
    }
}

export default dry_effectSubType