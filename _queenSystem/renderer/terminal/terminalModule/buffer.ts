import type { DisplayComponent } from "../../../../types/abstract/parser";
import type { dry_zone } from "../../../../data/systemRegistry";
import type queenSystem from "../../../queenSystem";
import { LocalizedSystem, LocalizedEffect, LocalizedCard, LocalizedPlayer, LocalizedZone, LocalizedAction } from "../../../../types/abstract/serializedGameComponents/Localized";

import chalk from "chalk";
import { ChalkFormatKeys, I_Terminal, TerminalModule } from "../terminal/utils";
import Card from "../../../../types/abstract/gameComponents/card";
import Zone from "../../../../types/abstract/gameComponents/zone";
import { rarityRegistry } from "../../../../data/rarityRegistry";
import { DeckData, deckRegistry } from "../../../../data/deckRegistry";
import { operatorRegistry } from "../../../../data/operatorRegistry";
import stripAnsi from "strip-ansi";
import { ANSI_String, isANSI } from "../terminal/ansi";

class BufferElement {
    str : string[]
    constructor(
        str : string | string[], //string[] is vertical
        public selectable : boolean,
        public type? : "zone" | "card" | "effect" | "other" | "execute" | "deckData" | "pos" | "pad",
        public obj? : Object
    ){
        if(typeof str === "string") this.str = [str];
        else this.str = str
    }
};

export class execute_cell {
    constructor(
        public line : number,
        public zone : dry_zone
    ){}
}

export class empty_pos_cell {
    constructor(
        public pos : number[],
        public zone : dry_zone
    ){}
}

class Buffer {
    selected_pos : [number, number][] = []

    __selection_limit = 3
    get selection_limit() {return this.__selection_limit}
    set selection_limit(a : number){
        this.__selection_limit = a

        //collapse selected pos
        if(this.selected_pos.length > a){
            let diff = this.selected_pos.length - a
            this.selected_pos.splice(0, diff)
        }
    }

    private savedSignal : 0 | 1 | 2 | 3 | -1 = -1

    private hx = -1 //h for highlight
    private hy = -1 //h for highlight

    private mx = 0 //m for max
    get my(){return this.length} //m for max

    private lines : (BufferElement | undefined)[][] = []

    get length() {
        return this.lines.length
    }

    calcPrintHeight(){
        let h = 0
        this.lines.forEach(elemArr => {
            const first = elemArr.find((a => a instanceof BufferElement))
            if(first){
                h += first.str.length
            }
        })
        return h
    }

    //for highlighting
    private isInBound(...p : number[]){
        return p[0] >= 0 && p[1] >= 0 && p[0] < this.mx && p[1] < this.my
    }


    private isHighlightable(...p : number[]){
        try{
            return this.lines[p[1]]![p[0]]!.selectable === true
        }catch(e){
            return false
        }
    }

    updateSignal(signal : any){
        this.mx = 0
        
        if(typeof signal === "number" && signal <= 3 && signal >= 0){
            this.savedSignal = signal as any
            return
        }
        if(signal === "enter" && this.hx >= 0 && this.hy >= 0){
            const indexIfFound = this.selected_pos.findIndex(a => a[0] === this.hx && a[1] === this.hy)
            if(indexIfFound >= 0){
                //highlighting a selected
                this.selected_pos.splice(indexIfFound, 1)
            } else {
                //highlighting an unselected

                //enforce limit
                if(this.selected_pos.length === this.selection_limit){
                    this.selected_pos.splice(0, 1)
                }
                this.selected_pos.push([this.hx, this.hy])
            }
            return
        }
    }

    protected highlightNext(){
        let direction = this.savedSignal

        if(direction < 0){
            if(this.hx < 0 || this.hy < 0){
                direction = 2 //go down
            }
            else return [this.hx, this.hy]
        }


        let pos : [number, number] = [this.hx, this.hy]
        const sub_axis = direction % 2
        const main_axis = 1 - sub_axis

        function _resetPos(this : Buffer){
            pos = [this.hx, this.hy]
        }
        const reset = _resetPos.bind(this)

        function advance(){
            pos[main_axis] += (direction & 2) - 1 //move in the direction by 1 unit
        }

        function copy(offset_main = 0, offset_sub = 0) : typeof pos{
            const res = pos.slice()
            res[main_axis] += offset_main
            res[sub_axis] += offset_sub
            return res as any
        }

        // simplest solution: direct march until collision

        let limit = 0;
        while(this.isInBound(...pos) && limit < 1000){
            advance()
            if(this.isHighlightable(...pos)) return pos;
            limit++
        }
        limit = 0

        // // the user is off, but deny movement is bad
        // // so we correct the jajectory a bit

        const window = 3
        reset()
        while(this.isInBound(...pos) && limit < 1000){
            advance()
            for(let i = 1; i <= window; i++){
                const temp1 = copy(0, -i)
                if(this.isHighlightable(...temp1)) return temp1;

                const temp2 = copy(0, i)
                if(this.isHighlightable(...temp2)) return temp2;
            }
            limit++
        }

        //failed, return default

        return [this.hx, this.hy]
    }

    protected formatCells(
        pos : [number, number][],
        color : ChalkFormatKeys = "green", 
    ){
        pos.forEach(p => {
            let cell = undefined
            try{
                cell = this.lines[p[1]][p[0]]
            }catch(e){}
            if(cell){
                cell.str = cell.str.map(s => chalk[color](s))
            }
        })
    }

    protected formatLocalizedComponent(c : DisplayComponent){
        if(c.is("text")) return c.str;
        if(c.is("image")) return chalk.blue(`[${c.fromCmd}].{${c.raw}}`);
        if(c.is("number")) return chalk.yellow(`${c.num}`);
        if(c.is("symbol")) return chalk.magenta(`[${c.fromCmd}].{${c.symbolID}}`);
        return c.raw
    }

    formatLocalizedString(c : DisplayComponent[]){
        return c.map(k => this.formatLocalizedComponent(k)).join("")
    }

    protected removeVowel(str : string){
        const vowels = ["a", "e", "i", "o", "u"]
        return str.split("").filter(char => !vowels.includes(char)).join("")
    }

    pushDivider(){
        this.markEndLine()
        this.pushCell("-", undefined, undefined, undefined, "pad")
        this.markEndLine()
    }

    private createCell(obj : any, dim : [number, number], forcedSelectable = false, forcedType : BufferElement["type"] = "other") : BufferElement {
        const type = typeof obj
        let str : string = ""

        if(type === "object"){
            const border_top = "┌" + "─".repeat(dim[0] - 2) + "┐"
            const border_bottom = "└" + "─".repeat(dim[0] - 2) + "┘"

            if(obj instanceof Card && this.s){
                return this.createCell(this.s.localizer.localizeCard(obj), dim)
            }

            if(obj instanceof Zone && this.s){
                return this.createCell(this.s.localizer.localizeZone(obj), dim)
            }

            if(obj instanceof empty_pos_cell){
                const res : string[] = []
                const str = "│" + " ".repeat(dim[0] - 2) + "│"

                while(res.length < dim[1] - 2){
                    res.push(str)
                }
                return new BufferElement([
                    border_top,
                    ...res,
                    border_bottom
                ], true, "pos", obj)
            }
            
            if(obj instanceof LocalizedCard){
                if(dim[1] === 1) return new BufferElement(`[c]`, true, "card", obj)
                let name = this.formatLocalizedString(obj.name)
                if(stripAnsi(name).length >= dim[0] - 2) name = this.removeVowel(name).slice(0, dim[0] - 2)
                
                let color : ChalkFormatKeys
                const mapping : Record<rarityRegistry, ChalkFormatKeys> = {} as any
                mapping[rarityRegistry.r_red] = "red"
                mapping[rarityRegistry.r_white] = "white"
                mapping[rarityRegistry.r_green] = "green"
                mapping[rarityRegistry.r_blue] = "blue"
                mapping[rarityRegistry.r_ability] = "yellow"
                mapping[rarityRegistry.r_algo] = "magenta"
                
                color = mapping[obj.rarity]
                name = chalk[color](name)
                
                name = "│" + name + " ".repeat(Math.max(dim[0] - stripAnsi(name).length - 2, 0)) + "│"

                const extension = obj.extensions.map(ex => {
                    const temp = this.removeVowel(this.formatLocalizedString(ex)).slice(0, dim[0] - 3)
                    return "│." + temp + " ".repeat(dim[0] - 3 - stripAnsi(temp).length) + "│"
                })

                while(extension.length < dim[1] - 4){
                    extension.push("│" + " ".repeat(dim[0] - 2) + "│")
                }

                let stat1 = `${obj.atk}`
                let a = stat1.length
                stat1 = chalk.red(stat1)

                let stat2 = `${obj.hp}`
                let b = stat2.length
                stat2 = chalk.blue(stat2)

                const stat = "│" + stat1 + " ".repeat(Math.max(dim[0] - a - b - 2, 0)) + stat2 + "│"

                return new BufferElement([
                    border_top,
                    name,
                    ...extension.slice(0, dim[1] - 4),
                    stat,
                    border_bottom
                ], true, "card", obj)  
            }

            if(obj instanceof LocalizedZone){
                let name = this.formatLocalizedString(obj.name)
                name = this.removeVowel(name)
                if(dim[1] === 1) return new BufferElement(`[${name}]`, true, "zone", obj)
                name = "│" + name.slice(0, dim[0] - 3)
                name += " ".repeat(Math.max(dim[0] - stripAnsi(name).length - 2, 0) + 1)
                name += "│"
                let info = `(${obj.cards.length})`
                const remainingSpaces = dim[0] - info.length - 2
                if(remainingSpaces > 0){
                    const half = remainingSpaces >> 1
                    const other_half = remainingSpaces - half
                    info = "│" + " ".repeat(half) + info + " ".repeat(other_half) + "│"
                }

                const k = [
                    name,
                    info,
                ]

                while(k.length < dim[1] - 2){
                    k.push("│" + " ".repeat(dim[0] - 2) + "│")
                }

                return new BufferElement([
                    border_top,
                    ...k,
                    border_bottom
                ], true, "zone", obj)
            }

            if(obj instanceof execute_cell){
                let name = "=>"
                if(dim[1] === 1) return new BufferElement(`[${name}]`, true, "execute", obj)

                let remainingSpaces = dim[0] - name.length - 2
                if(remainingSpaces > 0){
                    const half = remainingSpaces >> 1
                    const other_half = remainingSpaces - half
                    name = "│" + " ".repeat(half) + name + " ".repeat(other_half) + "│"
                }

                const k = [
                    name,
                ]

                remainingSpaces = (dim[1] - 3)
                if(remainingSpaces > 0){
                    let half = remainingSpaces >> 1
                    let other_half = remainingSpaces - half
                    while(half--) k.unshift("│" + " ".repeat(dim[0] - 2) + "│");
                    while(other_half--) k.push("│" + " ".repeat(dim[0] - 2) + "│");
                }

                return new BufferElement([
                    border_top,
                    ...k,
                    border_bottom
                ], true, "execute", obj)
            }

            if(obj instanceof DeckData){
                const name = deckRegistry[obj.deckID]
                if(!this.s) return new BufferElement(chalk.red("<Unknown deck>"), forcedSelectable, "deckData", obj);

                const localized_name = this.s.localizer.getAndParseLocalizedSymbol(name)
                if(!localized_name) return new BufferElement(chalk.red(`<Unknown translation, key = ${name}>`), false, "deckData", obj);
                const str = this.formatLocalizedString(localized_name)

                return new BufferElement(str, true, "deckData", obj)
            }

            // const parsed = utils.format(obj).split("\n")
            // return new BufferElement(parsed, false, "other")
            str = `[obj]`
        } else {
            if(obj !== undefined) str = String(obj);
        }

        if(dim[1] === 1) return new BufferElement(str.padEnd(dim[0], " "), forcedSelectable, forcedType);

        str = str.slice(0, dim[0])

        const remainingSpaces = dim[0] - stripAnsi(str).length - 2
        if(remainingSpaces > 0){
            const half = remainingSpaces >> 1
            const other_half = remainingSpaces - half
            str = " ".repeat(half) + str + " ".repeat(other_half)
        }
        const k = [str]

        let half = (dim[1] - 1) >> 1
        let other_half = (dim[1] - 1) - half

        while(half--) k.unshift(" ".repeat(dim[0]));
        while(other_half--) k.push(" ".repeat(dim[0]));

        return new BufferElement(k, forcedSelectable, forcedType)
    }

    private getDetailedEffect(e : LocalizedEffect, helperText : Set<string>) : string[]{
        const type = chalk.hex("#FF7700")(`[${this.formatLocalizedString(e.type)}]`)
        const subtypes = e.subtypes.map(st => this.formatLocalizedString(st))

        let subtypes_str = ""
        if(subtypes.length !== 0) subtypes_str = chalk.hex("#00777B")(`[${subtypes.join(".")}]`);

        const text = this.formatLocalizedString(e.text)

        if(e.typeDesc){
            helperText.add(type + ": " + this.formatLocalizedString(e.typeDesc))
        }

        if(e.subtypesDesc){
            e.subtypesDesc.forEach((st_text, index) => {
                if(st_text){
                    const st_name = chalk.hex("#00777B")(`[${subtypes[index]}]`)
                    helperText.add(st_name + ": " + this.formatLocalizedString(st_text))
                }
            })
        }

        return [
            type + subtypes_str,
            text
        ]
    }

    private getDetailedObj(obj : any, helperText : Set<string>) : string[]{
        if(obj instanceof LocalizedCard){
            let name = this.formatLocalizedString(obj.name)
            const extension = obj.extensions.map(ex => this.formatLocalizedString(ex)).join(".")
            if(extension) name += "." + extension
            name += "▪".repeat(Math.max(obj.level, 0))

            let color : ChalkFormatKeys
            const mapping : Record<rarityRegistry, ChalkFormatKeys> = {} as any
            mapping[rarityRegistry.r_red] = "red"
            mapping[rarityRegistry.r_white] = "white"
            mapping[rarityRegistry.r_green] = "green"
            mapping[rarityRegistry.r_blue] = "blue"
            mapping[rarityRegistry.r_ability] = "yellow"
            mapping[rarityRegistry.r_algo] = "magenta"

            color = mapping[obj.rarity]
            name = chalk[color](name)


            const stat1 = chalk.red(`atk.${obj.atk} / ${obj.maxAtk}`)
            const stat2 = chalk.blue(`hp.${obj.hp} / ${obj.maxHp}`)

            const effects = obj.effects.flatMap(e => this.getDetailedEffect(e, helperText))
            const status = obj.statusEffects.flatMap(e => this.getDetailedEffect(e, helperText))
            if(effects.length) effects.unshift(chalk.yellow("> Effects"));
            if(status.length) status.unshift(chalk.yellow("> Status effects"));


            return [
                name,
                chalk.yellow("> Stat"),
                stat1,
                stat2,
                ...effects,
                ...status,
            ]
        }
        if(obj instanceof DeckData && this.s){
            const cards = obj.cards.map(c => this.s!.localizer.getAndParseLocalizedSymbol(c))
            const formattedCards = cards.map(c => c ? this.formatLocalizedString(c) : `Unknown translation, key = ${c}`)
            
            const cardCounter = new Map<string, number>()
            formattedCards.forEach((c) => {
                let count = cardCounter.get(c) ?? 0
                cardCounter.set(c, count + 1)
            })

            const condensedCards = Array.from(cardCounter.entries()).map(i => `${i[0]} x${i[1]}`)

            const operator = this.s.localizer.getAndParseLocalizedSymbol(operatorRegistry[obj.operator])
            let formattedOperator = operator ? this.formatLocalizedString(operator) : chalk.red(`Unknown translation, key = ${operatorRegistry[obj.operator]}`)
            formattedOperator = "Operator: " + formattedOperator
            return [formattedOperator].concat(condensedCards)
        }
        return []
    }
    
    pushCell(obj : any, cellWidth = 20, lineSize = 1, forcedSelectable = false, forcedType? : BufferElement["type"]){
        const currentLineSize = this.lines.at(-1)?.at(0)?.str.length
        const cell = this.createCell(obj, [cellWidth, lineSize], forcedSelectable, forcedType)
        if(currentLineSize === lineSize && lineSize !== 1){
            this.lines.at(-1)!.push(cell)
            this.mx = Math.max(this.lines.at(-1)!.length, this.mx)
            if((this.hx === -1 || this.hy === -1) && cell.selectable){
                this.hy = this.lines.length - 1
                this.hx = this.lines.at(-1)!.length - 1
            }
        } else {
            this.lines.push([cell])
            this.mx = Math.max(this.mx, 1)
            if((this.hx === -1 || this.hy === -1) && cell.selectable){
                this.hy = this.lines.length - 1
                this.hx = 0
            }
        }
    }

    markEndLine(){
        this.lines.push([])
    }

    pushEmptyCell(width = 0, height = 0){
        return this.pushCell(" ".repeat(width), width, height)
    }

    wordWrap(lines : (string | undefined)[], desire_width : number){
        for(let i = 0; i < lines.length; i++){
            const currLine = lines[i]
            if(currLine === undefined) continue;
            if(stripAnsi(currLine).length <= desire_width) continue;

            let split_index = 0
            let part1, part2
            if(!currLine.includes(" ")){
                split_index = -1
                for(let x = 0; x < currLine.length; x++){
                    if(!isANSI(currLine[x])){
                        split_index = x + 1;
                        break;
                    }
                }
                if(split_index === -1) continue;

                part1 = currLine.slice(0, split_index)
                part2 = currLine.slice(split_index)
            } else {
                while(true){
                    let temp_index = currLine.indexOf(" ", split_index + 1)
                    if(temp_index === -1) break;
                    if(temp_index > desire_width) break;
                    split_index = temp_index
                }
                part1 = currLine.slice(0, split_index)
                part2 = currLine.slice(split_index + 1)
            }

            lines[i] = part1
            if(lines[i + 1] === undefined){
                lines[i + 1] = part2
            } else lines.splice(i + 1, 0, part2)
        }
        return lines
    }

    print(term : I_Terminal){
        const [newx, newy] = this.highlightNext() 
        //signal only updates upon print is called
        //to ensure finalized coors

        this.hx = newx
        this.hy = newy

        this.formatCells([[this.hx, this.hy]], "green")
        this.formatCells(this.selected_pos, "yellow")
        // try{
        //     const lines = this.lines[this.hy][this.hx]!.str
        //     const half = lines.length >> 1
        //     lines[half] = "> " + lines[half]
        // }catch(e){}
    
        // this.savedSignal = -1

        const forPrint : string[] = []
        const dividerLineIndices = [] as number[]

        this.lines.forEach(lines => {
            if(lines.length === 0) return;

            if(lines.every(b => !b || b.type === "pad")){
                dividerLineIndices.push(forPrint.length)
                forPrint.push("")
                return
            }

            let dim = [lines.length, 0]
            let cellLen = 0

            lines.some(cell => {
                if(cell) {
                    dim[1] = cell.str.length
                    cellLen = cell.str[0].length
                    return true
                }
            })


            for(let x = 0; x < dim[1]; x++){
                let str = ""
                for(let y = 0; y < dim[0]; y++){
                    str += lines[y] ? lines[y]!.str[x] : " ".repeat(cellLen)
                }
                forPrint.push(str)
            }
        })


        const maxForPrintLen = forPrint.reduce((prev, cur) => Math.max(stripAnsi(cur).length, prev), 0)
        const sideBarWidth = (term.width - maxForPrintLen - 10)

        const sideBarDivider = "━".repeat(sideBarWidth)
        const dividerString = "━".repeat(maxForPrintLen)

        dividerLineIndices.forEach(i => forPrint[i] = dividerString)

        const selectedStrings = this.getSelectedCells()

        let highlightObj = undefined
        try{
            highlightObj = this.lines[this.hy][this.hx]?.obj
        }catch(e){}

        const helperText = new Set<string>()

        const highlight_lines = this.getDetailedObj(highlightObj, helperText)

        const selected_lines : string[] = []
        const dim = [selectedStrings.length, selectedStrings.reduce((prev, cur) => Math.max(prev, cur.length), 0)]
        for(let x = 0; x < dim[1]; x++){
            let str = ""
            for(let y = 0; y < dim[0]; y++){
                str += selectedStrings[y] ? selectedStrings[y][x] : " "
            }
            selected_lines.push(str.slice(0, sideBarWidth))
        }

        if(highlight_lines.length) highlight_lines.unshift(chalk.green(`Highlighted :`));
        if(selected_lines.length) selected_lines.unshift(chalk.yellow(`Selected :`));
        let totalInfo : (string | undefined)[] = highlight_lines.concat(selected_lines)

        totalInfo.unshift(sideBarDivider)

        const m = Math.max(totalInfo.length, forPrint.length)
        
        if(helperText.size){
            let count = 1
            totalInfo[m - 11] = sideBarDivider
            totalInfo[m - 10] = chalk.hex("00FFBF")("> Help texts")
            helperText.forEach(text => {
                if(count < 10){
                    totalInfo[m - 10 + count] = text
                    count++
                }
            })
        }

        totalInfo = this.wordWrap(totalInfo, sideBarWidth)

        for(let i = 0; i < m; i++){
            let line = forPrint[i] ?? ""
            const ansiLen = line.length - stripAnsi(line).length
            line = line.padEnd(maxForPrintLen + ansiLen) + "  │  " + (totalInfo[i] ?? "")
            term.log(line)
        }

        // term.log(`Highlighted: (${this.hx}, ${this.hy})`)
        // term.log(`Selected: [${this.selected_pos.map(p => "(" + p.join(",") + ")").join("; ")}]`)
        // term.log(`bounds: (${this.mx},${this.my}), ${this.savedSignal}`)
    }

    clear(){
        this.lines = []
    }

    private s? : queenSystem
    bind(s : queenSystem){
        this.s = s
    }

    getSelectedCells(){
        return this.selected_pos.map(
            pos => {
                try{
                    return this.lines[pos[1]][pos[0]]?.str
                }catch(e){}
            }
        ).filter(c => c !== undefined) as string[][]
    }

    getSelectedObjects(){
        return this.selected_pos.map(
            pos => {
                try{
                    return this.lines[pos[1]][pos[0]]?.obj
                }catch(e){}
            }
        ).filter(c => c !== undefined) as Object[]
    }
}

//arrows to move to highlight stuff
//then enter to lock them, it then jumps the cursor to that section
export class TerminalBufferModule extends TerminalModule {
    constructor(
        public w = 5, 
        public h = 20,
    ){
        super()
    }

    printInfo = {
        buffer : new Buffer(),
    }
    get buffer(){return this.printInfo.buffer}

    protected resetPrintInfo(){
        this.printInfo.buffer.clear()
    }

    /** 
     * Convert [x, y] to valid highlightable targets by infering inputs to be counts 
     * Ex : x = 0 is the 0th valid x
    */
    // protected lookForward(
    //     highlight_x : number, highlight_y : number,
    //     startx = 0, starty = 0,
    // ){
    //     const buffer = this.printInfo.buffer

    //     let count_y = 0;
    //     let last_valid_x = -1;
    //     let last_valid_y = -1;

    //     for (let y = starty; y < buffer.length; y++) {
    //         let highlighted_something = false;
    //         let count_x = 0;
    //         let last_x_in_row = -1;

    //         for (let x = startx; x < buffer[y].length; x++) {
    //             if (this.isHighlightable(x, y)) {
    //                 last_x_in_row = x;
    //                 if (x === highlight_x && y === highlight_y) {
    //                     return [x, y]
    //                 }
    //                 count_x++;
    //                 highlighted_something = true;
    //             }
    //         }

    //         if (highlighted_something) {
    //             last_valid_x = last_x_in_row;
    //             last_valid_y = y;
    //             count_y++;
    //         }
    //         //cap x
    //         if (count_y - 1 === highlight_y && highlight_x >= count_x && count_x > 0) {
    //             return [count_x - 1, y];
    //         }
    //     }
    //     //cap to last valid highlightable spot (-1 if not found)
    //     return [last_valid_x, last_valid_y];
    // }

    protected hash(y : number, x : number) : string;
    protected hash(...p : number[]){
        return p.join("_")
    }    


    log(signal? : "enter" | 0 | 1 | 2 | 3){
        if(!this.terminalPtr) return;
        this.terminalPtr.clear()
        this.resetPrintInfo()

        if(signal !== undefined){
            this.buffer.updateSignal(signal)
        }
    }

    updateDirection(k : 0 | 1 | 2 | 3){
        this.log(k)
    }

    enter(){
        return this.log("enter")
    }

    override stop(): void {
        super.stop()
        this.buffer.selected_pos = []
    }

    override start(): void {
        this.log()
        this.listen("arrows", this.updateDirection.bind(this))
        this.listen("enter", this.enter.bind(this))
    }
}