import type { Localized_system, Localized_zone } from "../../types/abstract/serializedGameComponents/Localized";
import type { Action } from "../handler/actionGenrator";
import type { qpFieldModule } from "./terminal/terminalModule/fieldModule";
import type queenSystem from "../queenSystem";
import type { qpRenderer } from "./rendererInterface";

import { TurnPhase, inputType, inputDataSpecific } from "../../data/systemRegistry";
import testSuite from "../testSuite";
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
                    chalk.bold("Play"),
                    "progress check",
                    "run tests",
                    "setting",
                    "credit",
                    "exit"
                ], [
                    "Play",
                    "___progress_check",
                    "test",
                    "___setting",
                    "___credit",
                    "quitConfirm"
                ], 
                undefined, undefined, 
                chalk.yellow("Welcome to qpRemake!, a passion project of Blu, with terminal code provided by Decembber"), 
                this.post
            )
        )
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
            // this.log("From inside branch", k, this.history.join(" _ "))
            //signal
            const sig = k.slice(3)
            switch(sig){
                case "progress_check": {
                    return this.___run_test("progressCheck")
                }
                case "setting": {
                    this.clear();
                    this.log(this.___s.setting)
                    this.log(this.post)
                    return
                }
                case "credit": {
                    this.clear();
                    this.log("Source code: ", chalk.cyan("Blu")),
                    this.log("Terminal renderer source code: ", chalk.hex("1dea79")("December")),
                    this.log("Quantum protocol: ", "Jkong")
                    this.log(this.post)
                    return
                }
                default : {
                    return this.___run_test(sig)
                }
            }
        } else return super.branchToModule(k)
    }

    override start(){
        super.start()
        this.branchToModule("mainMenu")
    }

    private ___run_test(k : string){
        const test = testSuite[k]
        if(!test) {
            //impossible situation
            const temp = new TerminalModule.menu(
                [`Test ${k} does not exist somehow, enter to go back`], 
                ["back"], 
                ">", 
                ["yellow"], 
                chalk.yellowBright("Test logs:")
            )
            this.registerModule("temp", temp);
            return super.branchToModule("temp")
        };
        if(!this.___s) return;
        this.ignoreLog()
        this.doAddTimestamp = false;

        const console = globalThis.console
        globalThis.console = this as any
        try{
            test(this.___s)
        }catch(e){
            // fakeConsole.log(e)
        }
        globalThis.console = console //revert console
        
        this.log(`Finished running test ${k}`)

        const list = this.retrieveLog()
        const temp = new TerminalModule.menu(
            list.length === 0 ? [`No logs for ${k}, enter to go back`] : list.reverse(), 
            list.length === 0 ? ["back"] : [], 
            ">", 
            ["yellow"], 
            chalk.yellowBright("Test logs:")
        )
        this.registerModule("temp", temp);

        this.doAddTimestamp = true
        super.branchToModule("temp")
    }

    get field() {return this.storedModules.get("field") as qpFieldModule}

    warn(...p : any){
        this.log(...p)
    }

    ___s? : queenSystem
    bind(s : queenSystem){
        this.___s = s
        this.registerModule(
            "field",
            new TerminalModule.field(s)
        )
    }

    turnStart(s: Localized_system, callback: (a?: Action) => any): void {
        this.log("Turn started")
        callback();
    }
    update(phase: TurnPhase, s: Localized_system, a: Action, callback: () => any): void {
        // if(phase === TurnPhase.complete) 
            this.log("Phase:", TurnPhase[phase], `Action performed: ${a.type}`);
        callback();
    }
    requestInput<T extends inputType>(inputSet: inputDataSpecific<T>[], phase: TurnPhase, s: Localized_system, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        //we need to print the inputs here?
        if(!inputSet.length) return callback(inputSet[0]);
        this.log(`Select a/an ${inputSet[0].type}:`)
        // const field = this.field
        // inputSet.forEach(input => {
        //     switch (input.type) {
        //         case inputType.card: {
        //             input.data.card
        //         }
        //     }
        // })
        callback(inputSet[0]);
    }
    gameStart(s: Localized_system, callback: () => any): void {
        this.log("Game started!")
        // this.branchButDoNotRecord("field")
        callback()
    }
}