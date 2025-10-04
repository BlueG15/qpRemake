import { TurnPhase, inputType, inputDataSpecific } from "../../data/systemRegistry";
import type { Localized_system, Localized_zone } from "../../types/abstract/serializedGameComponents/Localized";
import type { Action } from "../handler/actionGenrator";
import type queenSystem from "../queenSystem";
import testSuite from "../testSuite";
import type { qpRenderer } from "./rendererInterface";
import { Terminal, TerminalModule } from "./terminal";
import chalk from "chalk"

export class qpTerminalRenderer extends Terminal implements qpRenderer {    
    private post = chalk.yellow('Press "b" to go back, "q" to quit, "Enter" to select')
    constructor(){
        super("qpRemake")
        this.addCommonCommands()
        this.registerModule(
            "mainMenu", 
            new TerminalModule.menu(
                [
                    "progress check",
                    "run tests",
                    "setting",
                    "credit",
                    "exit"
                ], [
                    "___progress_check",
                    "test",
                    "___setting",
                    "___credit",
                    "exit"
                ], 
                undefined, undefined, 
                chalk.yellow("Welcome to qpRemake!, a passion project of Blu, with terminal code provided by Decembber"), 
                this.post
            )
        )
        this.registerModule("exit", new TerminalModule.exit())
        this.registerModule(
            "test", 
            new TerminalModule.menu(
                Object.keys(testSuite).slice(2), 
                Object.keys(testSuite).slice(2).map(k => "___" + k),
                "=> run ", undefined,
                chalk.yellow("Select a test to run:"),
                this.post
            )
        )
    }

    override branchToModule(k: string): void {
        if(!this.___s) return
        if(k.startsWith("___")) {
            this.history.push(this.currModuleKey)
            this.stopModule()
            this.currModuleKey = k
            //signal
            const sig = k.slice(3)
            switch(sig){
                case "progress_check": {
                    return this.___run_test("progressCheck")
                }
                case "setting": {
                    this.clear();
                    Object.entries(this.___s.setting).forEach(val => this.log(...val.map(v => v.toString())))
                    this.log(this.post)
                    return
                }
                case "credit": {
                    this.clear();
                    this.log("Source code: ", chalk.cyan("Blu")),
                    this.log("Terminal renderer source code: ", "December"),
                    this.log("Quantum protocol: ", "Jkong")
                    this.log(this.post)
                    return
                }
                default : {
                    return this.___run_test(sig)
                }
            }
        }
        return super.branchToModule(k)
    }

    override start(){
        super.start()
        this.branchToModule("mainMenu")
    }

    private ___run_test(k : string){
        this.clear()
        const test = testSuite[k]
        if(!test) return;
        if(!this.___s) return;
        const console = globalThis.console
        globalThis.console = this as any
        test(this.___s)
        globalThis.console = console //revert console
    }

    warn(...p : any){
        this.log(...p)
    }

    ___s? : queenSystem
    bind(s : queenSystem){
        this.___s = s
    }

    turnStart(s: Localized_system, callback: (a?: Action) => any): void {
        this.log("Turn started")
        callback();
    }
    update(phase: TurnPhase, s: Localized_system, a: Action, callback: () => any): void {
        if(phase === TurnPhase.complete) this.log(`Action performed: ${a.type}`)
        callback();
    }
    requestInput<T extends inputType>(inputSet: inputDataSpecific<T>[], phase: TurnPhase, s: Localized_system, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        this.log("Input requested, continue with the first input")
        callback(inputSet[0]);
    }
    gameStart(s: Localized_system, callback: () => any): void {
        const texts = s.zones.map(z => this.formater_zone(z)).reverse().join("\n")
        this.log(texts)
        callback()
    }

    formater_zone(z : Localized_zone){
            ///okii, render 
            //[ ][ ][ ] ...
            //for zone shape
            if(z.shape.length === 1) 
                return `----${z.name}---- : ` +  ((z.cards.length === 0) ? "<Empty>" : z.cards.map((c) => c === undefined ? "[ ]" : "[c]").join(""))
            if(z.shape.length >= 2){
                const x = Number.isInteger(z.shape[0]) ? z.shape[0] : 3
                const y = Number.isInteger(z.shape[1]) ? z.shape[1] : 3
    
                const res : string[] = []
                for(let i = 0; i < y; i++){
                    const arr = new Array(y)
                    for(let j = 0; j < x; j++){
                        const index = Utils.positionToIndex([j, i], z.shape)
                        arr[j] = z.cards[index] === undefined ? "[ ]" : '[c]'
                    }
                }
                return `----${z.name[0]}:[${[x, y]}]----\n` + res.join("\n")
            }
            return ""
        }

    
}