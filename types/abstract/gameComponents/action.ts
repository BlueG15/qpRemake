// action always involve a card...i think?
// yeah, even damage event has to come from a card
// damages cant come form nothing?
import type dry_position from "../../data/dry/dry_position";
import type dry_card from "../../data/dry/dry_card";
import actionRegistry, {actionID, actionName} from "../../data/actionRegistry";

class Action {
    id: number = NaN;
    type: actionName;
    causeCardID?: string; //the cause of the action
    targetCardID?: string; //the target of the action
    targetActionID?: number; // the target of the action, type action
    isChain: boolean;
    canBeChainedTo: boolean;
    canBeTriggeredTo: boolean;
    inputTypeArr: ("position" | "card" | "number" | "boolean")[];
    isDisabled : boolean = false

    protected attr: Map<string, any> = new Map();

    modifiedSinceLastAccessed: boolean = false;

    constructor(
        type: actionName = "a_null",
        isChain: boolean,
        fromID?: string,
        toID?: string,
        targetActionID?: number,

        canBeChainedTo: boolean = true,
        canBeTriggeredTo: boolean = true,
        inputTypeArr: ("position" | "card" | "number" | "boolean")[] = []
    ) {
        this.type = type;
        this.causeCardID = fromID;
        this.targetCardID = toID;
        this.targetActionID = targetActionID;
        this.isChain = isChain; //true -> atatched this as child node
        this.canBeChainedTo = canBeChainedTo;
        this.canBeTriggeredTo = canBeTriggeredTo
        this.inputTypeArr = inputTypeArr;
    }

    assignID(n : number){
        this.id = n
    }

    get hasCardTarget() {
        return this.targetCardID !== undefined;
    }
    get hasActionTarget() {
        return this.targetActionID !== undefined;
    }
    get hasCause() {
        return this.causeCardID !== undefined;
    } //dont have cause -> cause is from playerAction
    // get fromPlayer() {
    //     return this.hasCause;
    // }
    get fromCard() {
        return !this.hasCause;
    }
    get typeID() : actionID {
        return actionRegistry[this.type]
    }
    get requireInput() {
        return this.inputTypeArr.length !== 0
    }

    protected verifyNewValue(key: string, newVal: any){
        //should override this
        //but call super at the end
        if(key === "targetCardID" && typeof newVal === "string") return true
        if(key === "targetActionID" && typeof newVal === "number") return true
        return false
    }

    modifyAttr(key: string, newVal: any){
        if (newVal === this.attr.get(key)) return;
        //check type
        if(!this.verifyNewValue(key, newVal)) return;
        if (key == "targetCardID") return this.changeTarget(String(newVal));
        if (key == "targetActionID")
            return this.changeTarget(Number.parseInt(newVal));
        this.modifiedSinceLastAccessed = true;
        this.attr.set(key, newVal);
    }

    changeTarget(newTarget?: string | number) {
        if (typeof newTarget == "string") {
            if (this.targetCardID == newTarget) return;
            this.targetCardID = newTarget;
        } else {
            if (this.targetActionID == newTarget) return;
            this.targetActionID = newTarget;
        }
        this.modifiedSinceLastAccessed = true;
    }

    //TODO : make more classes that extend from this and override this
    applyUserInput(input: dry_position | string | dry_card | number): void {}

    disable(){
        this.isDisabled = true
    }

    enable() {
            this.isDisabled = false
    }
}

export default Action;
