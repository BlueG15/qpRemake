import type queenSystem from "../../../queenSystem";

import { playerTypeID, zoneRegistry } from "../../../../data/zoneRegistry";
import chalk from "chalk";
import Zone from "../../../../types/abstract/gameComponents/zone";

import { empty_pos_cell, execute_cell, TerminalBufferModule } from "./buffer";
import { deckRegistry, type DeckData } from "../../../../data/deckRegistry";

//arrows to move to highlight stuff
//then enter to lock them, it then jumps the cursor to that section
export class qpFieldModule extends TerminalBufferModule {
    constructor(
        public s : queenSystem,
        w = 5, h = 20
    ){
        super(w, h)
        this.buffer.bind(s)
    }

    data? : any
    currentDeck? : DeckData

    override log(signal? : "enter" | 0 | 1 | 2 | 3){     
        if(!this.terminalPtr) return
        this.terminalPtr.clear()
        this.resetPrintInfo()
        
        const cellDims = [7, 5] as const
        this.buffer.updateSignal(signal)

        try{
            const obj = this.data as DeckData | undefined
            if(!obj) throw new Error("No deck")
            const cards = obj.cards.map(c => this.s.cardHandler.getCard(c))
            const pid = this.s.player_stat.findIndex(p => p.playerType === playerTypeID.player)
            if(pid >= 0){
                const hands = this.s.getAllZonesOfPlayer(pid)[zoneRegistry.z_hand]
                if(hands[0] instanceof Zone){
                    hands[0].forceCardArrContent(cards.filter(c => c !== undefined), true)
                }
            }
            this.currentDeck = this.data
            delete this.data
        }catch(e){}
        
        const s = this.s

        if(this.currentDeck){
            const parsedName = s.localizer.getAndParseLocalizedSymbol(deckRegistry[this.currentDeck.deckID])
            if(parsedName) this.terminalPtr.log(`Playing deck : ${chalk.bold(this.buffer.formatLocalizedString(parsedName))}`)
        }


        const players = s.player_stat
        const enemy = players.filter(p => p.playerType === playerTypeID.enemy)
        const player = players.filter(p => p.playerType === playerTypeID.player)

        // const playerCount = new Map<number, number>()

        const pArr = enemy.concat(player)

        const maxAbilityCount = pArr.reduce((prev, cur) => Math.max(prev, s.getAllZonesOfPlayer(cur.playerIndex)[zoneRegistry.z_ability]?.length ?? 0), 0)

        enemy.concat(player).forEach(p => {

            // let count : number
            // count = playerCount.get(p.playerType)!
            // if(count === undefined) count = 0;
            // else count++;
            // playerCount.set(p.playerType, count)

            // let playerStr = `${playerTypeID[p.playerType]} ${count === 0 ? "" : "(" + count + ")"}`
            // switch(p.playerType){
            //     case playerTypeID.enemy : {
            //         playerStr = chalk.redBright(playerStr)
            //         break;
            //     }
            //     case playerTypeID.player : {
            //         playerStr = chalk.greenBright(playerStr)
            //         break;
            //     }
            //     default : {
            //         playerStr = chalk.grey(playerStr)
            //     }
            // }
            // this.buffer.pushCell(playerStr)

            this.buffer.pushDivider()

            const zones = s.getAllZonesOfPlayer(p.playerIndex)

            const fields = zones[zoneRegistry.z_field] ?? []
            const decks = zones[zoneRegistry.z_deck] ?? []
            const graves = zones[zoneRegistry.z_grave] ?? []
            const ability = zones[zoneRegistry.z_ability] ?? []
            const hand = zones[zoneRegistry.z_hand] ?? []
            
            let cards = fields.map(f => f.cardArr)

            cards.forEach((card, index) => {
                const shape = fields[index].shape

                for(let _y = 0; _y < shape[1]; _y++){
                    const y = p.playerType === playerTypeID.enemy ? shape[1] - _y - 1 : _y

                    if(y === 1) {
                        for(let i = 0; i < maxAbilityCount; i++){
                            if(ability[i]) this.buffer.pushCell(ability[i], ...cellDims);
                            else this.buffer.pushEmptyCell(...cellDims)
                        }
                    } else {
                        for(let i = 0; i < maxAbilityCount; i++){
                            this.buffer.pushEmptyCell(...cellDims)
                        }
                    }

                    this.buffer.pushCell(new execute_cell(y, fields[index]), ...cellDims)

                    for(let x = 0; x < shape[0] + 1; x++){
                        if(x === shape[0]){
                            switch(y){
                                case 0 : {
                                    this.buffer.pushEmptyCell(...cellDims)
                                    graves.forEach(g => this.buffer.pushCell(g, ...cellDims));
                                    break;
                                }
                                case 1 : {
                                    this.buffer.pushEmptyCell(...cellDims)
                                    decks.forEach(d => this.buffer.pushCell(d, ...cellDims));
                                    break;
                                }
                            }
                        }
                        else this.buffer.pushCell(card[y * shape[0] + x] ?? new empty_pos_cell([x, y], fields[index]), ...cellDims)
                    }
                    this.buffer.markEndLine()
                }
            })

            
            if(hand.length) hand.forEach(h => {
                this.buffer.pushDivider()
                if(h.cardArr.length) {
                    const limit = Math.min(8, h.cardArr.length)
                    for(let i = 0; i < limit; i++){
                        this.buffer.pushCell(h.cardArr[i], ...cellDims)
                    }
                } else this.buffer.pushCell("<Hand empty>")
            });
        })

        
        return this.buffer.print(this.terminalPtr)
    }

    override start(obj? : any): void {
        this.data = obj
        return super.start()
    }
}