import chalk from "chalk";
import utils from "util"

import { format } from "date-fns";

import {
  realLen,
  TerminalEventEmitter,
  TerminalModule,
  TerminalSettings,
  type I_Terminal,
} from "./utils";
import stripAnsi from "strip-ansi";

import { ANSI_CODES, isANSI } from "./ansi";
import { TerminalMenuModule } from "../terminalModule/menuModule";
import { TerminalExitModule } from "../terminalModule/exitModule";
import { TerminalAutoInput } from "../terminalModule/autoInputModule";

export class Terminal implements I_Terminal {
  name: string;

  doAddTimestamp = true
  get timestampLen() {return format(new Date(), "[kk:mm:ss]").length} 

  inputBuffer: string[] = [];
  outputBuffer: string[] = [];

  settings = new TerminalSettings();

  readonly event = new TerminalEventEmitter();

  constructor(name = "Unnamed Terminal") {
    this.name = name;
  }

  //* Public property

  static get width() {
    return process.stdout.columns;
  }

  static get height() {
    return process.stdout.rows;
  }

  get width() {
    return Terminal.width;
  }

  get height() {
    return Terminal.height;
  }

  get inputBufferStr() {
    return this.inputBuffer.join("");
  }

  //TODO: Not sure "so-so" access, seperate them if possible - will be public for now!

  clearInputBuffer() {
    this.inputBuffer = [];
  }

  //* Private methods / handlers

  private println(...content: string[]) {
    process.stdout.write(content.join(" ") + "\n");
  }

  private print(...content: string[]) {
    process.stdout.write(content.join(" "));
  }

  static addToBuffer(buffer : string[], ...c : string[]){
    const log = c.join(" ")
    buffer.unshift(log);
    return buffer
  }

  // private addToOutputBuffer(...c: string[]) {
  //   Terminal.addToBuffer(this.outputBuffer, ...c)
  // }

  private addToInputBuffer(c: string) {
    switch (c) {
      case "\r": {
        // case "\n":
        // this.log("New input:", this.inputBufferStr);
        this.event.emit("input", this.inputBufferStr);
        this.clearInputBuffer();
        break;
      }

      case "\b": {
        this.inputBuffer.pop();
        break;
      }

      default: {
        if (isANSI(c)) return;
        this.inputBuffer.push(c);
        break;
      }
    }

    //? Re-render input
    // this.drawInput();
  }

  private renderFrame() {
    this.drawLog();
    this.drawInput();
    this.event.emit("update")
  }

  private fireArrowEvent(key : "arrows" | "wasd", index : number){
    if(index >= 0 && index < 4){
      this.event.emit(key, index as 0 | 1 | 2 | 3)
    }
  }

  private handleInput(d: Buffer) {
    const char = d.toString();
    const hex = d.toString("hex")

    this.event.emit("keyboard", d);

    this.fireArrowEvent("wasd", "wasd".indexOf(char))
    
    this.fireArrowEvent("arrows", [
      '1b5b41', //up
      '1b5b44', //left
      '1b5b42', //down
      '1b5b43'  //right
    ].indexOf(hex))

    if(hex === "0d" && this.inputBuffer.length === 0) this.event.emit("enter");
    this.addToInputBuffer(char);
  }

  private drawLog() {
    const H = Terminal.height;
    const W = Terminal.width;
    // let lines: string[] = [];

    // // Wrap each outputBuffer line to fit terminal width
    // this.outputBuffer.forEach(lineRaw => {
    //   if(stripAnsi(lineRaw).length === 0) {
    //     lines.push("") //check for specifically empty print
    //   } else {
    //     // let temp : string[] = []
    //     let current = "";
    //     let visible = 0;
    //     for (let i = 0; i < lineRaw.length; i++) {
    //       const char = lineRaw[i];
    //       current += char;
    //       if (!isANSI(char)) visible++;
    //       if (visible >= W) break;
    //     }
    //     lines.push(current)
    //   }
    // })

    // Only display up to H - 2 lines
    for (let i = 0; i < H - 2; i++) {
      const line = this.outputBuffer[i] ?? "";
      this.println(
        ANSI_CODES.CURSOR_TO(H - i - 2, 0),
        ANSI_CODES.CLEAR_LINE,
        line
      );
    }
  }

  private drawInput() {
    const H = Terminal.height;
    const W = Terminal.width;

    this.println(ANSI_CODES.CURSOR_TO(H - 2, 0));
    this.println("─".repeat(W));

    const HSS = chalk.hex("#0a7424")("\ue0b6");
    const STATUS = chalk.bgHex("#0a7424").bold("\uebb1 READY ");
    const MODE = chalk.bgHex("#055adb")(" \udb81\udfb7 Mode: INPUT  ");
    const AUTH = chalk.bgHex("#000000ff")(" \uf2bd USER ");
    const TIME = chalk.bgHex("#ed7b24").hex("#000")(
      format(new Date(), " EEE, MMM dd, yyyy ")
    );

    const P = `${HSS}${STATUS}${TIME}${MODE}${AUTH} \ueb70 `;
    const PLC = chalk.gray("Enter a command line . . .");
    const I = this.inputBuffer.join("");

    const CARAT = this.settings.get("caretChar");
    const C = P + (I ? I + "|" : "|" + PLC);

    this.print(C.padEnd(W + C.length - realLen(C), " "));

    // this.print(ANSI_CODES.SAVE_CURSOR);
  }

  //* Public method

  private int: any;

  private clearFlag = true
  ignoreClear(){this.clearFlag = false}

  clear() {
    // process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
    if(this.clearFlag) this.outputBuffer = [];
    else this.clearFlag = true
    // const whoCallThis = utils.getCallSites(2)[1]
    // this.log(whoCallThis)
    // this.log("-".repeat(Terminal.width - 2))
  }

  start() {
    this.print(ANSI_CODES.HIDE_CURSOR);

    process.stdin.setRawMode(true);
    process.stdin.on("data", this.handleInput.bind(this));
    process.stdout.on("resize", this.renderFrame.bind(this));

    //removed process.on("exit", ...) due to problems on Mac and Linux

    this.println(ANSI_CODES.CLEAR_SCREEN);
    this.renderFrame();

    this.int = setInterval(this.renderFrame.bind(this), 30);
  }

  stop() {
    process.stdin.setRawMode(false);
    process.stdout.off("resize", this.renderFrame.bind(this));
    process.stdin.off("data", this.handleInput.bind(this));

    this.println(ANSI_CODES.CLEAR_SCREEN);
    this.print(ANSI_CODES.SHOW_CURSOR);
    console.log("HALTED! Process killed");

    clearInterval(this.int);
  }

  static log(doAddTimestamp : boolean, res : string[], ...args : any[]){
    // Terminal.addToBuffer(res, String(args.length))
    const stamp = doAddTimestamp ? format(new Date(), "[kk:mm:ss]") + " " : "";
    const formatted = args.map(a => {
      return typeof a === "string" ? a : utils.formatWithOptions({colors : true, depth : 5, compact : false}, "%O", a)
    })
    const str = chalk.cyan(stamp) + formatted.join(" ")
    const forPrint = str.split("\n")
    forPrint.forEach(p => Terminal.addToBuffer(res, p))
    return res
  }

  logged : string[] = []
  private ___ignoreLog = false
  ignoreLog(){
    this.___ignoreLog = true
  }
  retrieveLog(){
    this.___ignoreLog = false
    const k = this.logged
    this.logged = []
    return k
  }
  log(...args: any[]): void {
    Terminal.log(
      this.doAddTimestamp,
      this.___ignoreLog ? this.logged : this.outputBuffer, 
      this.___ignoreLog ? utils.getCallSites(2)[1].functionName ? chalk.hex("#d95e29")("[" + utils.getCallSites(2)[1].functionName + "]") : "" : "", 
      ...args
    )
  }

  addCommonCommands(){

    this.registerModule("quitConfirm", new TerminalMenuModule(["yes", "no"], ["exit", "back"], undefined, ["red", "italic"], chalk.bold(chalk.yellow("Are you sure you want to quit?"))))
    this.registerModule("exit", new TerminalExitModule())
    this.registerModule("back", new TerminalAutoInput("b", 2))

    this.event.on("input", (data) => {
      data = data.trim()
      const [cmd, ...args] = data.split(" ");
      // this.log("input gotten!", cmd)

      switch (cmd) {
        case "qq" : {
          return process.exit(0)
        }

        case "q":
        case "exit":
        case "quit": {
          if(this.currModuleKey === "quitConfirm") process.exit(0);
          else return this.branchToModule("quitConfirm");
        }

        // case "cls":
        // case "clear": {
        //   this.clear();
        //   break;
        // }

        case "b":
        case "back": 
        case "ret":
        case "return": {
          if(this.isInModule()) {
            let target = this.history.pop()
            while(target && !this.isValidModule(target) && this.history.length > 0 && target === this.currModuleKey){
              target = this.history.pop()
            }
            this.log("back trigger Target: " + target + " History: " + this.history.join("_") + " Curr: " + this.currModuleKey)
            this.stopModule();
            if(target){
              return this.branchToModule(target)
            }
          } else return this.branchToModule("quitConfirm");
        }

        case "echo": {
          const text = args.join(" ");
          this.log("Echo:", text);
          break;
        }

        default : {
          if(cmd.length) this.log("Invalid command: ", cmd)
          break;
        }
      }
    })
  }

  protected storedModules = new Map<string, TerminalModule>()
  protected history : string[] = []
  protected currModuleKey : string = ""
  protected get currModule() : TerminalModule | undefined {return this.storedModules.get(this.currModuleKey)}

  isValidModule(k : string){return this.storedModules.has(k)}

  isInModule(){return this.currModuleKey.length !== 0}

  registerModule(k : string, m : TerminalModule){
    m.bind(this)
    this.storedModules.set(k, m)
    // this.log(`Loaded module ${k}`)
  }

  stopModule(){
    if(this.currModule){
      this.currModule.stop()
      this.currModuleKey = ""
    }
  }

  branchToModule(k : string){
    if(!k) return
    if(k === this.currModuleKey) return; //avoid duplicayted branch
    const f = this.storedModules.get(k)
    if(f instanceof TerminalModule) {
      if(this.isValidModule(this.currModuleKey)) this.history.push(this.currModuleKey)
      this.stopModule()
      this.currModuleKey = k
      return f.start()
    }
    // this.log(`No module named ${k} registered`);
  }

  branchButDoNotRecord(k : string){
    if(!k) return
    if(k === this.currModuleKey) return; //avoid duplicated branch
    const f = this.storedModules.get(k)
    if(f instanceof TerminalModule) {
      // if(this.isValidModule(this.currModuleKey)) this.history.push(this.currModuleKey)
      this.stopModule()
      // this.currModuleKey = k
      return f.start()
    }
  }
}
