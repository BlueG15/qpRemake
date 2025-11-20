import English from "../../../../../_localizationFiles/English";
import type queenSystem from "../../../../queenSystem";
import { TerminalModule } from "../terminal/utils";

export class qpTestLocalizer extends TerminalModule {

    constructor(
        public s : queenSystem
    ){
        super()
    }
    c = 0;

    private input = new Map<string, number | string>()

    log(str : string, start = false){
        if(!this.terminalPtr) return
        this.terminalPtr.log("-".repeat(20))
        this.terminalPtr.log("")

        if(str.startsWith("i.") || start){
            if(start){
                this.terminalPtr.log("Initializing the input array with random values:")
                const nums = Utils.rngArr(5, 25, 0, true)
                const strings = Utils.rngArrChoice(5, ["Cat", "Dog", "Horse", "Fish", "Zebra", "Cow", "Donkey"])
                nums.forEach((val, i) => {
                    let char = String.fromCharCode("a".charCodeAt(0) + i)
                    this.input.set(char, val)
                }) 
                strings.forEach((val, i) => {
                    let char = String.fromCharCode("A".charCodeAt(0) + i)
                    this.input.set(char, val)
                }) 
            }
            str = str.slice(2).trim()
            const commandArr = str.split(",")
            commandArr.forEach(cmd => {
                const cmdParts = cmd.split("=").map(i => i.trim())
                if(cmdParts.length === 2){
                    if(cmdParts[0].length === 1 && cmdParts[0] <= "z" && cmdParts[0] >= "a"){
                        const num = Number(cmdParts[1])
                        if(!isNaN(num)){
                            this.input.set(cmdParts[0], num)
                            this.terminalPtr!.log(`Set ${cmdParts[0]} -> ${cmdParts[1]} (number)`)
                        }
                    }
                    if(cmdParts[0].length === 1 && cmdParts[0] <= "Z" && cmdParts[0] >= "A"){
                        this.input.set(cmdParts[0], cmdParts[1])
                        this.terminalPtr!.log(`Set ${cmdParts[0]} -> ${cmdParts[1]} (string)`)
                    }
                }
            })
            this.terminalPtr!.log("")
            this.terminalPtr!.log("Input obj = {")
            this.input.forEach((val, key) => {
                this.terminalPtr!.log(`    ${key} = ${val}`)
            })
            this.terminalPtr!.log("}")

            return
        }

        const inputArr = Array.from(this.input.values())

        if(str.startsWith("l.")){
            //log localized entry
            str = str.slice(2).trim()
            
            const line : string | undefined = English[str]
            if(line === undefined){
                //log helps
                this.terminalPtr.log(`"${str}" is not a recognizable key in the localization file.`)
                
                const splitted = str.split("_")
                if(splitted.length <= 1){
                    this.terminalPtr.log("You are missing a prefix perhaps, heres a list of prefixes:")
                    const prefix = {
                        o : "Operator name",
                        o_real : "Operator real name",
                        o_desc : "Operator description",

                        c : "Card name",
                        ex : "Card extension",
                        a : "Archtype name",
                        r : "Card rarity",

                        ui : "UI element name",
                        ui_s : "Setting option name",

                        h : "Help text",
                        
                        key : "Key word",
                        key_desc : "Key word description",

                        e : "Effect text",
                        e_t : "Effect type",
                        e_st : "Effect subtype",
                        
                        z : "Zone name",
                        d : "Deck name",
                        
                        l : "Logged action",
                        err : "Error",
                    }
                    Object.entries(prefix).forEach(([key, val]) => {
                        this.terminalPtr!.log(`${key} : ${val}`)
                    })
                } else {
                    const cmd = splitted.at(-1)!
                    const prefix = str.slice(0, -1 * cmd.length)

                    this.terminalPtr.log(`Heres all the matches for prefix : ${prefix}`)
                    this.terminalPtr.log("[")
                    Object.keys(English).forEach((key) => {
                        if(!key.startsWith(prefix)) return;
                        this.terminalPtr!.log(`    ${key},`)
                    })
                    this.terminalPtr.log("]")
                }
            } else {
                this.terminalPtr.log(`Key : ${str}`)
                this.terminalPtr.log(`Original : ${line}`)
                const localized = this.s.localizer.localizeStandaloneString(line, inputArr)
                if(localized){
                    this.terminalPtr.log(localized.map(c => {
                        if(c.is("number")) return `[num].${c.num}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                        if(c.is("text")) return `[text].${c.str}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                        if(c.is("symbol")) return `[symbol].{${c.symbolID}}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                        if(c.is("image")) return `[image].${c.url}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                        if(c.is("reference")) return `[ref].${c.raw}.{${c.fromCmd}}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                        if(c.is("error")) return `[err].${c.raw}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                    }))
                }
            }

            return
        }

        if(this.c === 0){
            this.c = 1;
            return;
        }
        
        const localized = this.s.localizer.localizeStandaloneString(str, inputArr)
        if(localized){
            this.terminalPtr.log("Parse from str: ", str)
            this.terminalPtr.log("Input arr: [", inputArr.join(","), "]")
            this.terminalPtr.log(localized.map(c => {
                if(c.is("number")) return `[num].${c.num}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                if(c.is("text")) return `[text].${c.str}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                if(c.is("symbol")) return `[symbol].{${c.symbolID}}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                if(c.is("image")) return `[image].${c.url}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                if(c.is("reference")) return `[ref].${c.raw}.{${c.fromCmd}}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
                if(c.is("error")) return `[err].${c.raw}` + (c.errorFlag ? `.err{${c.errorMsg}}`: "")
            }))
        }
        
    }

    

    override start(data?: any): void {
        if(this.terminalPtr){
            this.terminalPtr.clear()
            this.terminalPtr.log("Usage:")
            this.terminalPtr.log("[i.<var>=<value>,...] to assign values, ex: i.a=1,b=2")
            this.terminalPtr.log("[l.<key>            ] to read and test parse localization entries, ex : l.c_apple")
            this.terminalPtr.log("Or type an expression to parse it immidiately. ex : = 1 + 2 * a + A;")
        }
        this.log("", true)
        this.listen("input", this.log.bind(this))
    }
}