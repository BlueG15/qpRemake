import type queenSystem from "../../../queenSystem";
import { DeckData, deckDataRegistry, deckRegistry } from "../../../../data/deckRegistry";
import { TerminalBufferModule } from "./buffer";
import { operatorRegistry } from "../../../../data/operatorRegistry";
import chalk from "chalk";
import stripAnsi from "strip-ansi";
// import { parseMode } from "../../../../types/abstract/parser";

const val = Object.values(deckDataRegistry)

export class qpDeckChoser extends TerminalBufferModule {
    constructor(
        public s : queenSystem,
        w? : number, h? : number
    ){
        super(w, h)
        this.buffer.bind(s)
    }

    override log(signal?: "enter" | 0 | 1 | 2 | 3): void {
        if(!this.terminalPtr) return;
        const prev = this.buffer.selected_pos.length
        this.terminalPtr.clear()
        this.resetPrintInfo()

        this.buffer.updateSignal(signal)
        
        this.buffer.pushDivider()    
        this.buffer.pushCell("Choose a deck:")
        
        val.forEach((val) => {
            this.buffer.pushCell(val)
        })

        if(this.buffer.selected_pos.length > 0){
            this.buffer.pushCell(chalk.bold("Confirm"), undefined, undefined, true)
        }

        if(signal === "enter" && this.buffer.selected_pos.length > prev){
            const sel = this.buffer.getSelectedCells()
            const newInSelected = sel.at(-1)!
            if(
                stripAnsi(newInSelected.join("")).trim() === "Confirm"
            ){
                this.buffer.pushCell(`Confirm received!, deck selected = ${sel[0]}`)
                const obj = this.buffer.getSelectedObjects()[0]
                if(this.terminalPtr.branchToModule) {
                    return this.terminalPtr.branchToModule("field", obj)
                }
            }
        }

        if(this.buffer.selected_pos.length > 1)
            this.buffer.selected_pos = [this.buffer.selected_pos.at(-1)!];

        return this.buffer.print(this.terminalPtr)
    }
}