import type Card from "../../../../types/abstract/gameComponents/card";
import type queenSystem from "../../../queenSystem";
import type { component } from "../../../../types/abstract/parser";
import type { Localized_system } from "../../../../types/abstract/serializedGameComponents/Localized";

import { playerTypeID, zoneRegistry } from "../../../../data/zoneRegistry";
import { TerminalMenuModule } from "./menuModule";
import chalk from "chalk";

//NOT WORK
export class qpFieldModule extends TerminalMenuModule {
    public tiles : string[][] = []
    public commands = [
        "View player info"
    ]
    constructor(
        public s : queenSystem
    ){
        super([])
        this.choices = this.commands
    }

    public currX = 0
    public currY = 0
    public currFieldIndex = 0

    private stringifyLocalizedString(str : component[]){
        return str.map(s => s.is("text") ? "[" + s.sectionIDs.join("_") + "] " + s.str : s.raw).join("")
    }

    override log(){
        if(!this.terminalPtr) return
        this.terminalPtr.clear()

        let currentCard : Card | undefined
        let currentTile : string = ""
        let currentChoices : string[] = []

        //draw the field
        const players = this.s.player_stat
        players.forEach((p) => {
            const zones = this.s.getAllZonesOfPlayer(p.playerIndex)

            let field = zones[zoneRegistry.z_field] ?? []
            let deck = zones[zoneRegistry.z_deck] ?? []
            let grave = zones[zoneRegistry.z_grave] ?? []

            let totalFieldHeight = 0

            if(p.playerType === playerTypeID.enemy){
                field = field.reverse()
            }

            this.tiles = []
            field.forEach(f => {
                const dim0 = f.shape[0]
                const dim1 = f.shape[1]

                if(dim0 <= 0 || dim1 <= 0) return;

                const specificTiles : string[][] = []
                for(let y = 0; y < dim1 ; y++){

                    const res : string[] = ["[>]", " ", " "]
                    const beginLen = res.length
                    
                    const checkX = this.currX - beginLen
                    const checkY = this.currY - totalFieldHeight

                    for(let x = 0; x < dim0; x++){
                        const temp_c = f.cardArr[Utils.positionToIndex([x, y], f.shape)] 
                        let temp = temp_c ? "[c]" : "[ ]"

                        if(x === checkX && y === checkY){
                            currentCard = f.cardArr[x] as any
                            temp = chalk.green(temp);
                        }
                        res. push(temp)
                        res.push(" ")
                    }
                    if(y === 0){
                        const addedDecks = new Array(deck.length).fill("[d]").join(" ")
                        res.push(" ")
                        res.push(addedDecks)
                    }
                    if((y === 1 && dim1 > 1) || (y === 0 && dim1 <= 1)){
                        const addedGraves = new Array(grave.length).fill("[g]").join(" ")
                        res.push(" ")
                        res.push(addedGraves)
                    }
                    p.playerType === playerTypeID.enemy ? 
                    specificTiles.unshift(res) : 
                    specificTiles.push(res)
                }
                this.tiles.concat(specificTiles)

                totalFieldHeight += dim1
            })

            this.tiles.forEach(line => {
                this.terminalPtr!.log(...line)
            })
        })

        try{
            currentTile = this.tiles[this.currY][this.currX][1]
        }catch(e){}

        //draw the card Info
        if(currentCard){
            const localizedCard = this.s.localizer.localizeCard(currentCard)
            if(localizedCard){
                this.terminalPtr.log(
                    this.stringifyLocalizedString(localizedCard.name) + "." +
                    localizedCard.extensions.map(ex => this.stringifyLocalizedString(ex)).join('.')
                )
                this.terminalPtr.log("atk:", localizedCard.atk, "/", localizedCard.maxAtk)
                this.terminalPtr.log("hp:", localizedCard.hp, "/", localizedCard.maxHp)
                this.terminalPtr.log("level:", localizedCard.level)
                this.terminalPtr.log("rarity:", this.stringifyLocalizedString(localizedCard.rarity))
                localizedCard.effects.forEach(e => 
                    this.terminalPtr!.log(
                        "[" + this.stringifyLocalizedString(e.type) + "]" +
                        "[" + e.subtypes.map(st => this.stringifyLocalizedString(st)).join(", ") + "]" +
                        this.stringifyLocalizedString(e.text)
                    )
                )
                if(localizedCard.statusEffects) localizedCard.statusEffects.forEach(e => 
                    this.terminalPtr!.log(
                        "[" + this.stringifyLocalizedString(e.type) + "]" +
                        "[" + e.subtypes.map(st => this.stringifyLocalizedString(st)).join(", ") + "]" +
                        this.stringifyLocalizedString(e.text)
                    )
                ); else this.terminalPtr.log("<No status effects>")
            } else this.terminalPtr.log("<No card selected>")
        }

        //draw the tiles's stuff
        switch(currentTile){
            case "g" : {
                currentChoices.push("View detailed GY's content")
                break;
            }
            case ">" : {
                currentChoices.push("Execute this row")
                break;
            }
        }

        //draw choices
        this.choices = currentChoices.concat(this.commands)
        this.branchToTargets = this.choices //wont work but this hack prints what choice is selected

        if( (this.terminalPtr as any).ignoreClear ) (this.terminalPtr as any).ignoreClear()
        super.log()
    }

    protected override updateChoice(data: number): void {
        switch(data){
            case 0 : {
                if(this.currChoice === 0){
                    this.currY--
                    this.___i = -1
                    if(this.currY < 0) this.currY = 0;
                } else {
                    this.currChoice--
                }
                break;
            }
            case 1 : {
                if(this.___i === -1){
                    this.currX--;
                    if(this.currX < 0) this.currX = 0;
                }
                break;
            }
            case 2 : {
                this.currY++
                if(this.tiles[this.currY + 1] === undefined){
                    this.currChoice++;
                }
                break;
            }
            case 3 : {
                if(this.___i === -1){
                    this.currX++;
                    if(this.currX >= 5) this.currX = 0
                }
                break;
            }
        }
    }
}