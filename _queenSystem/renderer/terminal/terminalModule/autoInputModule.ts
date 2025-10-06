import { TerminalModule } from "../terminal/utils";

export class TerminalAutoInput extends TerminalModule {
    constructor(
        public cmd : string,
        public count = 1
    ){super()}

    override start(): void {
        if(!this.terminalPtr) return;
        for(let i = 0; i < this.count; i++) this.terminalPtr.event.emit("input", this.cmd)
    }
}