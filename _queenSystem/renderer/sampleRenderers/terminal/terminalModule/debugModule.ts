import chalk from "chalk";
import { ChalkFormatKeys, I_Terminal, TerminalModule } from "../terminal/utils";
import { ANSI_String } from "../terminal/ansi";

export class TerminalDebugModule extends TerminalModule {
  pre : ANSI_String
  constructor(
    public format : ChalkFormatKeys[] = ["white"],
    pre : string | ANSI_String = ""
  ){
    super()
    this.pre = new ANSI_String(pre)
  }

  protected formatStr(str : string){
    return this.format.reduce((prev, cur) => chalk[cur](prev), str)
  }

  protected log(data : Buffer){
    if(!this.terminalPtr) return

    const d = data.toString("hex");
    const codes = d.split("").map(c => c.charCodeAt(0))
    const guessNumber = Number.parseInt(d, 16)
    const guessCharacter = String.fromCharCode(guessNumber)
    const str = `l = ${d.length}, d = ${d}, codes = [${codes}], guess = ${guessCharacter}`;
    this.terminalPtr.log(this.pre + "  " + this.formatStr(str))
  }

  override start(): void {
    this.terminalPtr?.log("Log everything is live!")
    this.listen("keyboard", this.log.bind(this))
  }
}