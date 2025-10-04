import chalk from "chalk";
import { ChalkFormatKeys, I_Terminal, TerminalModule } from "../terminal/utils";

export class TerminalMenuModule extends TerminalModule {
  protected ___i = 0
  get currChoice() {return this.___i}
  set currChoice(n : number){
    this.___i = n % this.choices.length
    if(this.___i < 0) this.___i = this.choices.length - this.___i - 1
  }

  constructor(
    protected choices : string[],
    protected branchToTargets : (undefined | string)[] = [],
    protected chosenStr : string = "=>",
    protected chosenStrFormat : ChalkFormatKeys[] = ["green"],
    protected pre? : string,
    protected post? : string,
  ){
    super()
  }

  protected formatStr(str : string){
    return this.chosenStr + " " + this.chosenStrFormat.reduce((prev, cur) => chalk[cur](prev), str)
  }

  protected log(){
    if(!this.terminalPtr) return
    this.terminalPtr.clear()
    if(this.pre) this.terminalPtr.log(this.pre)
    this.choices.forEach((str, index) => {
      this.terminalPtr!.log(index === this.currChoice ? this.formatStr(str) : str)
    })
    if(this.post) this.terminalPtr.log(this.post)
  }

  protected updateChoice(data : number){
    if(!this.terminalPtr) return
    switch(data){
      case 0: {
        this.currChoice--;
        return this.log()
      }
      case 2: {
        this.currChoice++;
        return this.log()
      }
    }
  }

  protected branch(){
    if(!this.terminalPtr) return;
    if(typeof this.branchToTargets[this.currChoice] !== "string" || !this.branchToTargets[this.currChoice]?.length){
      this.log()
      this.terminalPtr.log(`No branch target set, current choice: ${this.currChoice}`)
      return
    } else {
      if(!this.terminalPtr.branchToModule){
        this.log()
        this.terminalPtr.log(`Terminal provided cannot switch module, current choice: ${this.currChoice}`)
        return
      }
      return this.terminalPtr.branchToModule(this.branchToTargets[this.currChoice]!)
    }
  }

  override start(): void {
    this.log()
    this.listen("arrows", this.updateChoice.bind(this))
    this.listen("input", this.branch.bind(this))
  }
}