import { hexString3, hexString4, hexString6 } from "../types/misc"

enum rarityRegistry {
    r_white = 0,
    r_blue,
    r_green,
    r_red,
    r_ability,
    r_algo
}

type rarityID = rarityRegistry
type rarityName = keyof typeof rarityRegistry

type back_url_data = {
    base : string,
    upgrade_1 : string,
    [key : string] : string
}

type rarityData_fixxed = {
    hex : hexString3 | hexString4 | hexString6, 
    drop_weight : number, //the more possitive, the more likely, not possitive means undroppable, Inf means guaranteed
    //technically back url depends on the variant, screw this shit
    backURL : back_url_data, //variantName, backURL
}

type rarityData_variable = {
    [key : string] : string | number | boolean
}

type rarityData = rarityData_fixxed | (rarityData_fixxed & rarityData_variable)

const rarityDataRegistry : Record<rarityName, rarityData> = {
    r_white : {
        hex : "#FFF", 
        drop_weight : 10,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/white.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/1/white.png"
        }
    },
    r_blue : {
        hex : "#00F",
        drop_weight : 7,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/blue.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/1/blue.png"
        }
    },
    r_green : {
        hex : "#0F0",
        drop_weight : 4,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/green.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/1/green.png"
        }
    },
    r_red : {
        hex : "#F00",
        drop_weight : 1,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/red.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/1/red.png"
        }
    },
    r_ability : {
        hex : "#FF0",
        drop_weight : -1,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/yellow.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/1/yellow.png"
        }
    },
    r_algo : {
        hex : "#9F00A7",
        drop_weight : -1,
        backURL : {
            base : "https://qpproject.github.io/cardbg/0/purple.png",
            upgrade_1 : "https://qpproject.github.io/cardbg/0/purple.png"
        }
    }
}

export default rarityDataRegistry
export {
    rarityRegistry,
    rarityID,
    rarityName,
    rarityData
}
