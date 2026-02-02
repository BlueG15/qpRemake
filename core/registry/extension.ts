import type { BrandedNumber, BrandedString } from "../misc"
import { IDRegistry, Registry } from "./base"

const DefaultExtensions = [
    "generic",
    "debug",
    "nknwn",
    "enm",
    "sys"
] as const

type Extensions = typeof DefaultExtensions
type ExtensionID = BrandedNumber<Extensions>
type ExtensionName = BrandedString<Extensions>

const ExtensionRegistry = IDRegistry.from<ExtensionID, ExtensionName, Extensions>(DefaultExtensions)

export {
    ExtensionID,
    ExtensionName,
    ExtensionRegistry
}