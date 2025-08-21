import utils from "../utils"

declare global {
    var Utils : typeof utils
}

globalThis.Utils = utils

export {}