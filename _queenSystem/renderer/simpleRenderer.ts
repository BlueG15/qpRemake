import type { Action } from "../handler/actionGenrator";
import type { inputRequester } from "../handler/actionInputGenerator";
import { gameState_stat, TurnPhase, dry_system, dry_zone, inputDataSpecific, inputType, validSetFormat } from "../../data/systemRegistry";
import type { qpRenderer } from "./rendererInterface";
import { playerTypeID } from "../../data/zoneRegistry";

export class simpleRenderer implements qpRenderer {

    formater_zone(z : dry_zone){
        ///okii, render 
        //[ ][ ][ ] ...
        //for zone shape
        if(z.shape.length === 1) 
            return `----${z.dataID}---- : ` +  ((z.cardArr_filtered.length === 0) ? "<Empty>" : z.cardArr.map((c) => c === undefined ? "[ ]" : "[c]").join(""))
        if(z.shape.length >= 2){
            const x = Number.isInteger(z.shape[0]) ? z.shape[0] : 3
            const y = Number.isInteger(z.shape[1]) ? z.shape[1] : 3

            const res : string[] = []
            for(let i = 0; i < y; i++){
                const arr = new Array(y)
                for(let j = 0; j < x; j++){
                    const index = Utils.positionToIndex([j, i], z.shape)
                    arr[j] = z.cardArr[index] === undefined ? "[ ]" : '[c]'
                }
                z.playerType === playerTypeID.enemy ? res.unshift(arr.join("")) : res.push(arr.join(""))
            }
            return `----${z.dataID}:[${[x, y]}]----\n` + res.join("\n")
        }
        return ""
    }

    init(s: dry_system, callback: () => any): void {
        //render only fields and hand, hide the rest
        const texts = s.map(0, z => this.formater_zone(z)).reverse().join("\n")
        console.log(texts)
        callback()
    }

    startTurn(s: dry_system, callback: (a? : Action) => any): void {
        callback()
    }
    update(phase: TurnPhase, s: dry_system, a: Action, callback: () => any): void {
        if(phase === TurnPhase.complete) console.log(`Action performed: ${a.type}`)
        callback()
    }
    requestInput<T extends inputType>(inputSet: validSetFormat<T>, phase: TurnPhase, s: dry_system, a: Action, callback: (input: inputDataSpecific<T>) => any): void {
        console.log("input requested: ", inputSet)
        console.log("Attempting to continue with the first input")
        callback(inputSet[1]![0])
    }

}
