//load globals #IMPORTANT, DO NOT REMOVE
import globalLoader from "./global"
globalLoader.load()

export * from "./core"

export * from "./queen-system"

export * from "./game-components/effects"
export * from "./game-components/cards"
export * from "./game-components/positions"
export * from "./game-components/zones"

export { ModdingAPI } from "./system-components/modding"

export * from "./system-components/inputs"
export * from "./system-components/renderer"
export * from "./system-components/inputs"

export * from "./system-components/localization/xml-text-parser"
export * from "./system-components/localization/localizer"

export * from "./system-components/test"