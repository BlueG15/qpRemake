import type effectSubtype from "../baseClass/effectSubtype";

class dry_effectSubType {
    readonly type : string
    readonly id : string
    readonly isDisabled : boolean

    constructor(subtype : effectSubtype){
        this.type = subtype.type
        this.id = subtype.id
        this.isDisabled = subtype.isDisabled
    }
}

export default dry_effectSubType