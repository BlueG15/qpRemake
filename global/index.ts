import utils from "../utils"

declare global {
    var Utils : typeof utils
}

const globalLoader = {
    load(){
        globalThis.Utils = utils
    }
}

export default globalLoader