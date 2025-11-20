import type { Action } from "../handler/actionGenrator";
import type { inputRequester } from "../handler/actionInputGenerator";
import { gameState_stat, TurnPhase, dry_system, dry_zone, inputDataSpecific, inputType, validSetFormat } from "../../data/systemRegistry";
import type { qpRenderer } from "./rendererInterface";
import { playerTypeID } from "../../data/zoneRegistry";
import { LocalizedSystem, LocalizedZone } from "../../types/abstract/serializedGameComponents/Localized";

export class simpleRenderer implements qpRenderer {

    scene0Index = 0

    startMenu(index : number = 0){
        switch(index){
            case 0 : return this.scene0()
        }

        process.stdin.setRawMode(true);

        process.stdin.on("data", function(this : simpleRenderer, buffer : Array<any>){
            console.log(buffer)
            this.scene0Index++
            this.scene0()
        }.bind(this))

        process.on("SIGKILL", () => process.stdin.setRawMode(false));
        process.on("exit", () => process.stdin.setRawMode(false));
    }

    scene0(){
        this.scene0Index %= 3
        console.log("Welcome to qpRemake, a passion project of Blu insipired by the hit game Quamtum Protocol")
        console.log("What do you like to run today?")
        const k = [
            "Run a test",
            "Progress check",
            "Quit"
        ]
        k[this.scene0Index] = "=> " + k[this.scene0Index]
        k.forEach(line => console.log(line))
    }

    formater_zone(z : LocalizedZone){
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

    gameStart(s: LocalizedSystem, callback: () => any): void {
        //render only fields and hand, hide the rest
        const texts = s.zones.map(z => this.formater_zone(z)).reverse().join("\n")
        console.log(texts)
        callback()
    }

    turnStart(s: any, callback: (a? : Action) => any): void {
        callback()
    }
    update(phase: TurnPhase, s: any, a: Action, callback: () => any): void {
        if(phase === TurnPhase.complete) console.log(`Action performed: ${a.type}`)
        callback()
    }
    requestInput<T extends inputType>(inputSet: inputDataSpecific<T>[], phase: TurnPhase, s: any, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        console.log("input requested: ", inputSet)
        console.log("Attempting to continue with the first input")
        callback(inputSet[0])
    }

}
