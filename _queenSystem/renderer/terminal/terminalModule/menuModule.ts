import chalk from "chalk";
import { ChalkFormatKeys, I_Terminal, TerminalModule } from "../terminal/utils";
import stripAnsi from "strip-ansi";
import { ANSI_String } from "../terminal/ansi";
import type { TerminalSignals } from "../terminal";

export class TerminalMenuModule extends TerminalModule {
  protected choices : ANSI_String[]
  protected chosenStr : ANSI_String
  protected pre? : ANSI_String
  protected post? : ANSI_String

  protected x_offset = 0

  protected readonly x_scroll_delay = 10;
  protected x_scroll_speed_counter = 0;

  protected ___i = 0
  get currChoice() { return this.___i }
  set currChoice(n: number) {
    if (this.choices.length === 0) {
      this.___i = 0;
      return;
    }
    this.___i = ((n % this.choices.length) + this.choices.length) % this.choices.length;
  }

  constructor(
    choices : (string | ANSI_String)[],
    protected branchToTargets : (undefined | string | TerminalSignals)[] = [],
    chosenStr : string | ANSI_String = "=>",
    protected chosenStrFormat : ChalkFormatKeys[] = ["green"],
    pre? : string | ANSI_String,
    post? : string | ANSI_String,
    protected frame = 20
  ){
    super()
    this.choices = choices.map(c => new ANSI_String(c))
    this.chosenStr = new ANSI_String(chosenStr)
    if(pre) this.pre = new ANSI_String(pre);
    if(post) this.post = new ANSI_String(post);
  }

  protected formatStr(str : ANSI_String){
    return this.chosenStr.full + " " + this.chosenStrFormat.reduce((prev, cur) => chalk[cur](prev), str.full)
  }

  protected log(){
    if(!this.terminalPtr) return
    this.terminalPtr.clear()

    
    const halfFrame = Math.floor(this.frame / 2)

    let beginIndex : number
    let endIndex : number

    if(this.choices.length <= this.frame){
      beginIndex = 0
      endIndex = this.choices.length
    } else {
      beginIndex = Math.max(this.currChoice - halfFrame, 0)
      endIndex = Math.min(beginIndex + this.frame, this.choices.length)
      if(endIndex - beginIndex < this.frame) beginIndex = endIndex - this.frame
    }
    const checkChoice = this.currChoice - beginIndex

    if(this.pre) this.terminalPtr.log(this.pre);

    this.choices.slice(beginIndex, endIndex).forEach((text, index) => {
      let str : ANSI_String
      const frame = Math.floor(this.terminalPtr!.width / 2)
      const possibleOffsets = text.length - frame - 2
      
      
      if(possibleOffsets <= 0){
        str = text;
      } else {
        const x = this.x_offset % possibleOffsets
        beginIndex = index === this.currChoice ? x : 0
        str = text.slice(beginIndex)
      }

      this.terminalPtr!.log(index === checkChoice ? this.formatStr(str) : str)
    })

    if(this.post) this.terminalPtr.log(this.post)
  }

  protected updateChoice(data : number){
    if(!this.terminalPtr) return
    this.x_scroll_speed_counter = 0
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
    if(this.branchToTargets[this.currChoice] === undefined){
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

  protected scrollX(){
    this.x_scroll_speed_counter++;
    if(this.x_scroll_speed_counter >= this.x_scroll_delay){
      this.x_scroll_speed_counter = 0;
      this.x_offset++
      return this.log()
    }
  }

  override start(): void {
    this.log()
    this.listen("arrows", this.updateChoice.bind(this))
    this.listen("enter", this.branch.bind(this))
    // this.listen("update", this.scrollX.bind(this))
  }
}