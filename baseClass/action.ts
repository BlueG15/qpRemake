// action always involve a card...i think?
// yeah, even damage event has to come from a card
// damages cant come form nothing?
import type dry_position from "../dryData/dry_position";
import type dry_card from "../dryData/dry_card";
import actionRegistry from "../data/actionRegistry";

class Action {
  type: string;
  causeCardID?: string; //the cause of the action
  targetCardID?: string; //the target of the action
  targetActionID?: number; // the target of the action, type action
  isChain: boolean;
  canBeChainedTo: boolean;
  inputTypeArr: ("position" | "card" | "number" | "boolean")[];

  protected attr: Map<string, any> = new Map();

  modifiedSinceLastAccessed: boolean = false;

  constructor(
    type: string = "null",
    isChain: boolean,
    fromID?: string,
    toID?: string,
    targetActionID?: number,

    canBeChainedTo: boolean = true,

    inputTypeArr: ("position" | "card" | "number" | "boolean")[] = []
  ) {
    this.type = type;
    this.causeCardID = fromID;
    this.targetCardID = toID;
    this.targetActionID = targetActionID;
    this.isChain = isChain; //true -> atatched this as child node
    this.canBeChainedTo = canBeChainedTo;
    this.inputTypeArr = inputTypeArr;
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
  get fromPlayer() {
    return this.hasCause;
  }
  get fromCard() {
    return !this.hasCause;
  }
  get typeID() {
    return actionRegistry[this.type];
  }
  get requireInput() {
    return this.inputTypeArr.length === 0
  }

  modifyAttr(key: string, newVal: any) {
    if (newVal === this.attr.get(key)) return;
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

  //do?() : action // action may modifies an actions

  //resolve<T extends action | card>(a : T) : T{return a}
  applyUserInput(input: dry_position | string | dry_card | number): void {}
}

export default Action;
