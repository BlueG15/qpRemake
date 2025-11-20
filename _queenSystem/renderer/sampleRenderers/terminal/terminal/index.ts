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

import { ANSI_CODES, ANSI_String, isANSI } from "./ansi";
import { TerminalMenuModule } from "../terminalModule/menuModule";

export const enum TerminalSignals {
  exit,
  back,
  clear,
}

export class Terminal implements I_Terminal {
  name: string;

  doAddTimestamp = false
  get timestampLen() {return format(new Date(), "[kk:mm:ss]").length} 

  inputBuffer: string[] = [];
  outputBuffer: ANSI_String[] = [];
  debugOutputBuffer : ANSI_String[] = []

  settings = new TerminalSettings();

  readonly event = new TerminalEventEmitter();

  constructor(name = "Unnamed Terminal", private debugMode = false) {
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

  static addToBuffer(buffer : ANSI_String[], ...c : ANSI_String[]){
    const log = ANSI_String.from(c, " ")
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
        // this.internalog("New input:", this.inputBufferStr);
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
    let lines: string[] = this.debugOutputBuffer.concat(this.outputBuffer).map(i => i.full);

    // Wrap each outputBuffer line to fit terminal width
    // this.outputBuffer.forEach(lineRaw => {
    //   if(!lineRaw === undefined){ //somehow this is possible
    //     if(lineRaw.length === 0) {
    //       lines.push("") //check for specifically empty print
    //     } else {
    //       lines.push(lineRaw.slice(0, W).full)
    //     }
    //   }
    // })

    // Only display up to H - 2 lines
    for (let i = 0; i < H - 2; i++) {
      const line = lines[i] ?? "";
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
    this.counter = 0
    // process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
    
    if(this.debugMode){
      const whoCallThis = utils.getCallSites(3).reverse().map(i => i.functionName).join(" -> ")
      this.logdebug("Who calls clear: " + whoCallThis)
      if(this.debugOutputBuffer.length > 10){
        this.debugOutputBuffer.splice(11)
      }
      this.log("-".repeat(Terminal.width >> 1))
    } else {
      if(this.clearFlag) {
        this.debugOutputBuffer = []
        this.outputBuffer = []
      }
      else this.clearFlag = true
    }

  }

  setupShutdownHandlers() {
    const stop = this.stop.bind(this);

    if (typeof process !== "undefined" && process.release?.name === "node") {
      const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
      for (const sig of signals) {
        process.on(sig, stop);
      }
      process.on("exit", stop);
      return;
      
    }
  }

  start() {
    this.print(ANSI_CODES.HIDE_CURSOR);

    try{
      process.stdin.setRawMode(true);
      process.stdin.on("data", this.handleInput.bind(this));
      process.stdout.on("resize", this.renderFrame.bind(this));
    }catch(e){

    }

    try{
      this.setupShutdownHandlers()
    }catch(e){

    }

    this.println(ANSI_CODES.CLEAR_SCREEN);
    this.renderFrame();

    this.int = setInterval(this.renderFrame.bind(this), 15);
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

  protected customFormatRules_str = new Map<string, (a : any) => any>()
  protected customFormatRules_obj : [Function, ((a : any) => any)][] = []

  protected formatObj(obj : any, depth = 0){
    if(depth > 5) return `[${typeof obj}]`
    let rule = this.customFormatRules_str.get(typeof obj)
    if(!rule && typeof obj === "object") {
      for(const key of Object.keys(obj)){
        obj[key] = this.formatObj(obj[key], depth + 1)
      }
      
      for(let i = 0; i < this.customFormatRules_obj.length; i++){
        if(obj instanceof this.customFormatRules_obj[i][0]){
          rule = this.customFormatRules_obj[i][1]
          break;
        }
      }
    }
    return rule ? rule(obj) : obj
  }

  protected ___log(doAddTimestamp : boolean, res : ANSI_String[], ...args : any[]){
    // Terminal.addToBuffer(res, String(args.length))
    const stamp = doAddTimestamp ? format(new Date(), "[kk:mm:ss]") + " " : "";
    let latestLine : ANSI_String[] = [new ANSI_String(stamp)]
    args.forEach(obj => {
      const a = this.formatObj(obj)
      if (typeof a !== "object") {
        latestLine.push(new ANSI_String(String(a)));
      } else if (a instanceof ANSI_String) {
        latestLine.push(a);
      } else {
        const formatted = utils.formatWithOptions({ colors: true, depth: 5, compact: false }, "%O", a).split("\n");
        const [first, ...rest] = formatted;
        if (first !== undefined) {
          const forPrint = ANSI_String.from([...latestLine, first], " ");
          Terminal.addToBuffer(res, forPrint);
          rest.forEach(line => Terminal.addToBuffer(res, new ANSI_String(line)));
          latestLine = [];
        }
      }
    });
    if(latestLine.length){
      const forPrint = ANSI_String.from(latestLine, " ")
      Terminal.addToBuffer(res, forPrint)
    }
    return res
  }

  addCustomFormattingRule(type : "string" | "number", rule : (a : any) => any) : void;
  addCustomFormattingRule<T>(constructor : new (...a : any) => T, rule : (a : T) => any) : void;
  addCustomFormattingRule(a : "string" | "number" | Function, rule : (a : any) => any){
    if(typeof a === "function") this.customFormatRules_obj.push([a, rule]);
    else this.customFormatRules_str.set(a, rule)
  }

  logged : ANSI_String[] = []
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

  private counter = 0
  protected logdebug(...args : any[]){
    args.unshift("(" + this.counter + ")")
    this.counter++
    this.___log(
      this.doAddTimestamp,
      this.___ignoreLog ? this.logged : this.debugOutputBuffer, 
      "", 
      ...args
    )
  }

  log(...args: any[]): void {

    let str
    try{
      str = "Who calls log: " + utils.getCallSites(4).map(i => i.functionName).join(" -> ")
    }catch(e){
      str = ""
    }

    this.___log(
      this.doAddTimestamp,
      this.___ignoreLog ? this.logged : this.outputBuffer, 
      this.___ignoreLog ? str : "", 
      ...args
    )
  }

  protected back(){
    if(this.isInModule()) {
      let index = this.history.length - 1
      let target : string | undefined = index >= 0 ? this.history[index] : undefined
      while( (!this.isValidModule(target) || target === this.currModuleKey) && this.history.length > 0){
        index--;
        if(index < 0){
          target = undefined
          break;
        }
        target = this.history[index]
      }
      if(target){
        this.history.splice(index)
        this.logdebug(`[b] Back triggered, backing from ${this.currModuleKey}->${target}`)
        const f = this.storedModules.get(target)
        if(f instanceof TerminalModule) {
          this.stopModule()
          this.currModuleKey = target
          this.logdebug("History after: ")
          this.debugPrintHistory()
          return f.start()
        }
      } else {
        this.logdebug("[b] Back triggered, no back target found")
        this.debugPrintHistory()
      }
    } else process.exit(0);
  }

  addCommonCommands(){
    this.currModuleKey = "quitConfirm"
    this.registerModule("quitConfirm", new TerminalMenuModule(["yes", "no"], [TerminalSignals.exit, TerminalSignals.back], undefined, ["red", "italic"], chalk.bold(chalk.yellow("Are you sure you want to quit?"))))

    this.event.on("input", (data) => {
      data = data.trim()
      const [cmd, ...args] = data.split(" ");
      // this.internalog("input gotten!", cmd)

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
          return this.back()
        }

        case "echo": {
          const text = args.join(" ");
          this.logdebug("Echo:", text);
          break;
        }

        default : {
          // if(cmd.length) this.logdebug("Invalid command: ", cmd)
          break;
        }
      }
    })
  }

  protected storedModules = new Map<string, TerminalModule>()
  protected history : string[] = []
  protected currModuleKey : string = ""
  protected get currModule() : TerminalModule | undefined {return this.storedModules.get(this.currModuleKey)}

  debugPrintHistory(who : string = ""){
    // who = utils.getCallSites(3).reverse().map(i => `${i.functionName}(${i.scriptName.split("\\").at(-1)!.split(".")[0]})`).join("->")
    // this.logdebug("Who: " + who)
    this.logdebug("| -> History: [" + this.history.join(", ") +  "] Curr: " + this.currModuleKey)
  }

  isValidModule(k? : string){return k && this.storedModules.has(k)}

  isInModule(){return this.currModuleKey.length !== 0}

  registerModule(k : string, m : TerminalModule){
    m.bind(this)
    this.storedModules.set(k, m)
    // this.internalog(`Loaded module ${k}`)
  }

  stopModule(){
    if(this.currModule){
      this.currModule.stop()
      this.currModuleKey = ""
    }
  }

  branchToModule(k : string | TerminalSignals, obj? : any) : void{
    if(typeof k === "number"){
      switch(k){
        case TerminalSignals.exit : {
          process.exit(0)
        }
        case TerminalSignals.back : {
          return this.back()
        }
        case TerminalSignals.clear : {
          return this.clear()
        }
      }
      return
    }
    this.debugPrintHistory("branch")
    this.logdebug(`Branching from ${this.currModuleKey} -> ${k}`)
    if(!k) return
    //avoid duplicated branch
    if(k === this.currModuleKey) {
      this.logdebug("Duplicated branch!")
      return
    }
    const f = this.storedModules.get(k)
    if(f instanceof TerminalModule) {
      if(this.isValidModule(this.currModuleKey)) this.history.push(this.currModuleKey);
      this.stopModule()
      this.currModuleKey = k
      return f.start(obj)
    }
    this.logdebug(`No module named ${k} registered`);
  }
}
