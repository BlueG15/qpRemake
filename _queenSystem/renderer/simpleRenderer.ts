import type { Action } from "../handler/actionGenrator";
import type { inputRequester } from "../handler/actionInputGenerator";
import { gameState_stat, TurnPhase, dry_system, dry_zone, inputDataSpecific, inputType, validSetFormat } from "../../data/systemRegistry";
import type { qpRenderer } from "./rendererInterface";
import { playerTypeID } from "../../data/zoneRegistry";
import { Localized_system, Localized_zone } from "../../types/abstract/serializedGameComponents/Localized";

export class simpleRenderer implements qpRenderer {

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

    init(s: Localized_system, callback: () => any): void {
        //render only fields and hand, hide the rest
        const texts = s.zones.map(z => this.formater_zone(z)).reverse().join("\n")
        console.log(texts)
        callback()
    }

    startTurn(s: any, callback: (a? : Action) => any): void {
        callback()
    }
    update(phase: TurnPhase, s: any, a: Action, callback: () => any): void {
        if(phase === TurnPhase.complete) console.log(`Action performed: ${a.type}`)
        callback()
    }
    requestInput<T extends inputType>(inputSet: validSetFormat<T>, phase: TurnPhase, s: any, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        console.log("input requested: ", inputSet)
        console.log("Attempting to continue with the first input")
        callback(inputSet[1]![0])
    }

}
