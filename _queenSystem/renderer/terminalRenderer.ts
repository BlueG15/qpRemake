import type { Localized_system, Localized_zone } from "../../types/abstract/serializedGameComponents/Localized";
import { Action_class, type Action } from "../handler/actionGenrator";
import type { qpFieldModule } from "./terminal/terminalModule/fieldModule";
import queenSystem from "../queenSystem";
import type { qpRenderer } from "./rendererInterface";

import { TurnPhase, inputType, inputDataSpecific } from "../../data/systemRegistry";
import testSuite from "../testSuite";
import { Terminal, TerminalModule } from "./terminal";
import chalk from "chalk"
import { TerminalSignals } from "./terminal/terminal";
import Zone from "../../types/abstract/gameComponents/zone";
import Card from "../../types/abstract/gameComponents/card";
import Effect from "../../types/abstract/gameComponents/effect";

export class qpTerminalRenderer extends Terminal implements qpRenderer {    
    private post = chalk.yellow('Press "b" to go back, "q" to quit, "Enter" to select')
    constructor(debugMode = false){
        super("qpRemake", debugMode)
        this.addCommonCommands()

        this.addCustomFormattingRule(Action_class, (a) => {
            return {
                id : a.id,
                cause : a.cause,
                targets : a.targets,
            }
        })

        this.addCustomFormattingRule(queenSystem, (_) => "[QueenSystem]")

        this.addCustomFormattingRule(Zone, (z) => z.toString(4, true))

        this.addCustomFormattingRule(Card, (c) => c.toString(4, true))

        this.addCustomFormattingRule(Effect, (e) => e.toString(4))

        this.registerModule(
            "mainMenu", 
            new TerminalModule.menu(
                [
                    chalk.bold("Play"),
                    "live test localization",
                    "progress check",
                    "run tests",
                    "setting",
                    "credit",
                    "exit"
                ], [
                    "chooseDeck",
                    "testLocalization",
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

    override branchToModule(k: string | TerminalSignals, obj? : any): void {
        if(!this.___s) return;
        if(typeof k === "number") return super.branchToModule(k);
        if(k.startsWith("___")) {
            if(this.isValidModule(this.currModuleKey)) this.history.push(this.currModuleKey)
            this.stopModule()
            this.currModuleKey = k
            // this.internallog("From inside branch", k, this.history.join(" _ "))
            //signal
            const sig = k.slice(3)
            switch(sig){
                case "progress_check": {
                    return this.___run_test("progressCheck")
                }
                case "setting": {
                    this.clear();
                    this.logdebug(this.___s.setting)
                    this.logdebug(this.post)
                    return
                }
                case "credit": {
                    this.clear();
                    this.logdebug("Source code: ", chalk.cyan("Blu")),
                    this.logdebug("Terminal renderer source code: ", chalk.hex("1dea79")("December")),
                    this.logdebug("Quantum protocol: ", "Jkong")
                    this.logdebug(this.post)
                    return
                }
                default : {
                    return this.___run_test(sig)
                }
            }
        } else return super.branchToModule(k, obj)
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
                [TerminalSignals.back], 
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
            this.log(chalk.red("[ERROR]"), e)
        }
        globalThis.console = console //revert console
        
        this.logdebug(`Finished running test ${k}`)

        const list = this.retrieveLog()
        const temp = new TerminalModule.menu(
            list.length === 0 ? [`No logs for ${k}, enter to go back`] : list.reverse(), 
            list.length === 0 ? [TerminalSignals.back] : [], 
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
        this.logdebug(...p)
    }

    ___s? : queenSystem
    bind(s : queenSystem){
        this.___s = s
        this.registerModule(
            "field",
            new TerminalModule.field(s)
        )
        this.registerModule(
            "chooseDeck",
            new TerminalModule.chooseDeck(s)
        )
        this.registerModule(
            "testLocalization",
            new TerminalModule.testLocalize(s)
        )
    }

    turnStart(s: Localized_system, callback: (a?: Action) => any): void {
        this.logdebug("Turn started")
        callback();
    }
    update(phase: TurnPhase, s: Localized_system, a: Action, callback: () => any): void {
        // if(phase === TurnPhase.complete) 
            this.logdebug("Phase:", TurnPhase[phase], `Action performed: ${a.type}`);
        callback();
    }
    requestInput<T extends inputType>(inputSet: inputDataSpecific<T>[], phase: TurnPhase, s: Localized_system, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        //we need to print the inputs here?
        if(!inputSet.length) return callback(inputSet[0]);
        this.logdebug(`Select a/an ${inputSet[0].type}:`)
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
        this.logdebug("Game started!")
        // this.branchButDoNotRecord("field")
        callback()
    }
}